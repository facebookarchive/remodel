/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const colors = require('cli-color');
const List = require('./list');
const Maybe = require('./maybe');
const ObjectSpecs = require('./object-specs');
const ParallelProcessQueue = require('./parallel-process-queue');
const Promise = require('./promise');
const ValueObjectDefaultConfig = require('./value-object-default-config');
const ObjectSpecDefaultConfig = require('./object-spec-default-config');
const AlgebraicTypes = require('./algebraic-types');

function flattenResults(results) {
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

function aggregateResults(results) {
  const flattenedOnce = List.map(flattenResults, results);
  return flattenResults(flattenedOnce);
}

export function main(parsedArgs) {
  Maybe.match(
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
      const algebraicTypesFuture = AlgebraicTypes.generate(process.cwd(), args);

      const promise = Promise.all(
        List.of(valueObjectsFuture, objectsFuture, algebraicTypesFuture),
      );

      Promise.then(function(results) {
        const aggregatedResult = aggregateResults(results);

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
      }, promise);
    },
    function() {
      console.log('Expected use: ./generate [flags] pathToDirectory');
      ParallelProcessQueue.shutDown();
    },
    parsedArgs,
  );
}
