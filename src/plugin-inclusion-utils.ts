/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as List from './list';

export function includesContainingDefaultIncludes(
  includesFromType: string[],
  excludesFromType: string[],
  defaultIncludes: List.List<string>,
): string[] {
  const defaultIncludesToInclude: string[] = List.foldr(
    function(soFar: string[], defaultInclude: string): string[] {
      if (excludesFromType.indexOf(defaultInclude) === -1) {
        return soFar.concat(defaultInclude);
      } else {
        return soFar;
      }
    },
    [],
    defaultIncludes,
  );
  return includesFromType.concat(defaultIncludesToInclude);
}
