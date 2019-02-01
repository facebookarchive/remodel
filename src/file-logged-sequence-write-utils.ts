/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='./type-defs/cli-color.d.ts'/>

import * as colors from 'cli-color';
import * as CommandLine from './commandline';
import * as Either from './either';
import * as Error from './error';
import * as FileWriter from './file-writer';
import * as FunctionUtils from './function-utils';
import * as List from './list';
import * as Logging from './logging';
import * as LoggingSequenceUtils from './logged-sequence-utils';
import * as LazySequence from './lazy-sequence';
import * as Maybe from './maybe';
import * as Promise from './promise';

export interface ObjectGenerationSuccess {
  name: string;
}

export interface ConsoleOutputResults {
  errorCount: number;
  successCount: number;
}

function trackConsoleOutput(
  soFar: Promise.Future<Logging.Context<ConsoleOutputResults>>,
  thisOutput: Promise.Future<
    Logging.Context<Either.Either<Error.Error[], ObjectGenerationSuccess>>
  >,
): Promise.Future<Logging.Context<ConsoleOutputResults>> {
  return Promise.mbind(function(
    lcResults: Logging.Context<ConsoleOutputResults>,
  ) {
    return Promise.map(function(
      output: Logging.Context<
        Either.Either<Error.Error[], ObjectGenerationSuccess>
      >,
    ) {
      return Logging.mbind(function(results: ConsoleOutputResults) {
        return Logging.map(function(
          either: Either.Either<Error.Error[], ObjectGenerationSuccess>,
        ) {
          return Either.match(
            function(errors: Error.Error[]): ConsoleOutputResults {
              return {
                errorCount: results.errorCount + 1,
                successCount: results.successCount,
              };
            },
            function(success: ObjectGenerationSuccess): ConsoleOutputResults {
              return {
                errorCount: results.errorCount,
                successCount: results.successCount + 1,
              };
            },
            either,
          );
        },
        output);
      }, lcResults);
    },
    thisOutput);
  },
  soFar);
}

function loggerForParsedArgs(
  parsedArgs: CommandLine.Arguments,
): Logging.Logger {
  return {
    interestedLoggingTypes: parsedArgs.interestedLoggingTypes,
    minimalLevel: parsedArgs.minimalLevel,
    processLog: function(
      loggingType: Logging.LoggingType,
      time: Date,
      info: string,
    ) {
      const infoStr = displayInfo(loggingType, time, info);
      console.log(infoStr);
    },
  };
}

function performanceDisplayInfo(time: Date, info: string): string {
  return colors.yellow('[perf][' + time + '] ' + info);
}

function errorDisplayInfo(time: Date, info: string): string {
  return colors.red('[error][' + time + '] ' + info);
}

function displayInfo(
  loggingType: Logging.LoggingType,
  time: Date,
  info: string,
): string {
  switch (loggingType) {
    case Logging.LoggingType.performance:
      return performanceDisplayInfo(time, info);
    case Logging.LoggingType.error:
      return errorDisplayInfo(time, info);
    default:
      return info;
  }
}

function propagateGenerationSuccessError(
  errors: Error.Error[],
): Promise.Future<
  Logging.Context<Either.Either<Error.Error[], ObjectGenerationSuccess>>
> {
  return Promise.munit(
    Logging.munit(Either.Left<Error.Error[], ObjectGenerationSuccess>(errors)),
  );
}

function failOnError(
  soFar: Either.Either<Error.Error[], ObjectGenerationSuccess>,
  thisOne: Maybe.Maybe<Error.Error>,
): Either.Either<Error.Error[], ObjectGenerationSuccess> {
  return Either.mbind(function(success: ObjectGenerationSuccess) {
    return Maybe.match(
      function(errors: Error.Error) {
        return Either.Left<Error.Error[], ObjectGenerationSuccess>([errors]);
      },
      function() {
        return soFar;
      },
      thisOne,
    );
  }, soFar);
}

function generateOutput(
  either: Either.Either<Error.Error[], ObjectGenerationSuccess>,
): Promise.Future<
  Logging.Context<Either.Either<Error.Error[], ObjectGenerationSuccess>>
> {
  return Promise.munit(
    Either.match(
      function(errors: Error.Error[]) {
        const message: string = errors.map(Error.getReason).join('\n');
        return Logging.Error(10, message, either);
      },
      function(success: ObjectGenerationSuccess) {
        return Logging.Info(10, success.name + ' Generated', either);
      },
      either,
    ),
  );
}

function writeRequestToEitherErrorOrGenerationSuccess(
  fileWriter: (
    request: FileWriter.Request,
  ) => Promise.Future<Maybe.Maybe<Error.Error>>,
  request: FileWriter.FileWriteRequest,
): Promise.Future<
  Logging.Context<Either.Either<Error.Error[], ObjectGenerationSuccess>>
> {
  const promiseForAllWriteRequestsFinished = Promise.all(
    List.map(fileWriter, request.requests),
  );
  return Promise.map(function(results: List.List<Maybe.Maybe<Error.Error>>) {
    const success = Either.Right<Error.Error[], ObjectGenerationSuccess>({
      name: request.name,
    });
    return Logging.munit(List.foldl(failOnError, success, results));
  }, promiseForAllWriteRequestsFinished);
}

function writeFiles(
  fileWriter: (
    request: FileWriter.Request,
  ) => Promise.Future<Maybe.Maybe<Error.Error>>,
  either: Either.Either<Error.Error[], FileWriter.FileWriteRequest>,
): Promise.Future<
  Logging.Context<Either.Either<Error.Error[], ObjectGenerationSuccess>>
> {
  return Either.match(
    propagateGenerationSuccessError,
    request =>
      writeRequestToEitherErrorOrGenerationSuccess(fileWriter, request),
    either,
  );
}

function writeFileForDryRun(
  request: FileWriter.Request,
): Promise.Future<Maybe.Maybe<Error.Error>> {
  const promise = Promise.pending<Maybe.Maybe<Error.Error>>();
  promise.setValue(Maybe.Nothing<Error.Error>());
  return promise.getFuture();
}

function writeAndLogSequence(
  parsedArgs: CommandLine.Arguments,
  evaluatedSequence: LazySequence.Sequence<
    Promise.Future<
      Logging.Context<Either.Either<Error.Error[], ObjectGenerationSuccess>>
    >
  >,
): Promise.Future<ConsoleOutputResults> {
  const outputResults: Promise.Future<
    Promise.Future<Logging.Context<ConsoleOutputResults>>
  > = LazySequence.foldl(
    trackConsoleOutput,
    Promise.resolved(
      Logging.munit<ConsoleOutputResults>({errorCount: 0, successCount: 0}),
    ).getFuture(),
    evaluatedSequence,
  );
  const resultingLoggingContext: Promise.Future<
    ConsoleOutputResults
  > = Promise.mbind(function(
    future: Promise.Future<Logging.Context<ConsoleOutputResults>>,
  ) {
    return Promise.map(function(
      lcResults: Logging.Context<ConsoleOutputResults>,
    ) {
      return lcResults.value;
    },
    future);
  },
  outputResults);

  return resultingLoggingContext;
}

export function evaluateObjectFileWriteRequestSequence(
  parsedArgs: CommandLine.Arguments,
  writeRequestSequence: LazySequence.Sequence<
    Promise.Future<
      Logging.Context<Either.Either<Error.Error[], FileWriter.FileWriteRequest>>
    >
  >,
): Promise.Future<ConsoleOutputResults> {
  const fileWriter = parsedArgs.dryRun ? writeFileForDryRun : FileWriter.write;

  const writtenFileSequence = LoggingSequenceUtils.mapLoggedSequence3(
    writeRequestSequence,
    request => writeFiles(fileWriter, request),
    generateOutput,
  );

  const evaluatedSequence = LoggingSequenceUtils.evaluatedLoggedSequence(
    loggerForParsedArgs(parsedArgs),
    writtenFileSequence,
  );

  return writeAndLogSequence(parsedArgs, evaluatedSequence);
}
