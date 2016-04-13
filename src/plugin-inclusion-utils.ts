/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import List = require('./list');

export function includesContainingDefaultIncludes(includesFromType:string[], excludesFromType:string[], defaultIncludes:List.List<string>):string[] {
  const defaultIncludesToInclude:string[] = List.foldr(function(soFar:string[], defaultInclude:string):string[] {
    if (excludesFromType.indexOf(defaultInclude) === -1) {
      return soFar.concat(defaultInclude);
    } else {
      return soFar;
    }
  }, [], defaultIncludes);
  return includesFromType.concat(defaultIncludesToInclude);
}
