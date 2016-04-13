/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */


import Maybe = require('./maybe');

export interface TypeLookup {
  name:string;
  library:Maybe.Maybe<string>;
  file:Maybe.Maybe<string>;
  canForwardDeclare:boolean;
}
