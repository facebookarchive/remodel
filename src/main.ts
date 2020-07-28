/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as colors from 'cli-color';
import * as commandline from './commandline';
import * as List from './list';
import * as Maybe from './maybe';
import * as ObjectSpecs from './object-specs';
import * as ParallelProcessQueue from './parallel-process-queue';
import * as Promise from './promise';
import * as ValueObjectDefaultConfig from './value-object-default-config';
import * as ObjectSpecDefaultConfig from './object-spec-default-config';
import * as AlgebraicTypes from './algebraic-types';
import {ConsoleOutputResults} from './file-logged-sequence-write-utils';

function flattenResults(
  results: List.List<ConsoleOutputResults>,
): ConsoleOutputResults {
  return List.foldl(
    function(currentValue, result) {
      return {
        errorCount: currentValue.errorCount + result.errorCount,
        successCount: currentValue.successCount + result.successCount,
      };
    },
    {errorCount: 0, successCount: 0},
    results,
  );
}

function aggregateResults(
  results: List.List<List.List<ConsoleOutputResults>>,
): ConsoleOutputResults {
  const flattenedOnce = List.map(flattenResults, results);
  return flattenResults(flattenedOnce);
}

export function main(
  parsedArgs: commandline.Arguments | null,
  testEnv?: boolean,
): Promise.Future<List.List<List.List<ConsoleOutputResults>>> | undefined {
  return Maybe.match(
    function(args) {
      const valueObjectsFuture = ObjectSpecs.generate(
        process.cwd(),
        'value',
        '.valueObjectConfig',
        args.valueObjectConfigPath,
        ValueObjectDefaultConfig.VALUE_OBJECT_DEFAULT_CONFIG,
        args,
      );
      const objectsFuture = ObjectSpecs.generate(
        process.cwd(),
        'object',
        '.objectConfig',
        args.objectConfigPath,
        ObjectSpecDefaultConfig.OBJECT_SPEC_DEFAULT_CONFIG,
        args,
      );
      const algebraicTypesFuture = AlgebraicTypes.generate(
        process.cwd(),
        args.adtConfigPath,
        args,
      );

      const promise = Promise.all(
        List.of(valueObjectsFuture, objectsFuture, algebraicTypesFuture),
      );

      Promise.then(function(results) {
        const aggregatedResult = aggregateResults(results);

        if (!testEnv) {
          if (aggregatedResult.errorCount === 0) {
            console.log(
              colors.green(
                'Successfully generated ' +
                  aggregatedResult.successCount +
                  ' objects.',
              ),
            );
          } else {
            console.log(
              colors.red(
                'Successfully generated ' +
                  aggregatedResult.successCount +
                  ' objects. Encountered ' +
                  aggregatedResult.errorCount +
                  ' errors in other files',
              ),
            );
            process.exit(1);
          }

          ParallelProcessQueue.shutDown();
        }
      }, promise);
      return promise;
    },
    function() {
      console.log('Expected use: ./generate [flags] pathToDirectory');
      if (!testEnv) {
        ParallelProcessQueue.shutDown();
      }
      return undefined;
    },
    parsedArgs,
  );
}
