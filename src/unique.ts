/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as List from './list';
import * as Map from './map';

export interface UniquesReductionTracker<T> {
  values: List.List<T>;
  seenValues: Map.Map<T, T>;
}

export function uniqueValuesInList<T>(list: List.List<T>): List.List<T> {
  const tracker: UniquesReductionTracker<T> = List.foldr(
    function (
      currentReductionTracker: UniquesReductionTracker<T>,
      value: T,
    ): UniquesReductionTracker<T> {
      if (!Map.containsKey(value, currentReductionTracker.seenValues)) {
        return {
          values: List.cons(value, currentReductionTracker.values),
          seenValues: Map.insert(
            value,
            value,
            currentReductionTracker.seenValues,
          ),
        };
      } else {
        return currentReductionTracker;
      }
    },
    {
      values: List.of<T>(),
      seenValues: Map.Empty<T, T>(),
    },
    list,
  );
  return tracker.values;
}
