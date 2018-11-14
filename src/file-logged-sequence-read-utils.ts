/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Either = require('./either');
import Error = require('./error');
import File = require('./file');
import FileReader = require('./file-reader');
import LazySequence = require('./lazy-sequence');
import Logging = require('./logging');
import LoggingSequenceUtils = require('./logged-sequence-utils');
import ParallelProcessQueue = require('./parallel-process-queue');
import Promise = require('./promise');

export interface UnparsedObjectCreationRequest {
  path: File.AbsoluteFilePath;
  fileContents: File.Contents;
}

function performanceLog<T>(
  name: string,
  startTime: Date,
  stopTime: Date,
  value: T,
) {
  return Logging.Performance(
    10,
    name + ': ' + (stopTime.getTime() - startTime.getTime()),
    value,
  );
}

function findFilesSequence(
  directoryToScan: File.AbsoluteFilePath,
  fileExtension: string,
): LazySequence.Sequence<
  Promise.Future<Logging.Context<File.AbsoluteFilePath>>
> {
  var lastTime = new Date();
  return ParallelProcessQueue.findFiles(directoryToScan, fileExtension).map(
    function(path: File.AbsoluteFilePath) {
      const thisTime = new Date();
      const loggedValue = performanceLog(
        'findFilesSequence',
        lastTime,
        thisTime,
        path,
      );
      lastTime = thisTime;
      return Promise.munit(loggedValue);
    },
  );
}

function readFileForFoundObjectSpec(
  path: File.AbsoluteFilePath,
): Promise.Future<
  Logging.Context<Either.Either<Error.Error[], UnparsedObjectCreationRequest>>
> {
  return FileReader.read(path).map(function(
    either: Either.Either<Error.Error[], File.Contents>,
  ) {
    return Logging.munit(
      Either.map(function(contents: File.Contents) {
        return {path: path, fileContents: contents};
      }, either),
    );
  });
}

export function loggedSequenceThatReadsFiles(
  requestedPath: File.AbsoluteFilePath,
  suffix: string,
): LazySequence.Sequence<
  Promise.Future<
    Logging.Context<Either.Either<Error.Error[], UnparsedObjectCreationRequest>>
  >
> {
  return LoggingSequenceUtils.mapLoggedSequence(
    findFilesSequence(requestedPath, suffix),
    readFileForFoundObjectSpec,
  );
}
