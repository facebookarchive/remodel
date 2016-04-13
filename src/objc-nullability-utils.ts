/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import Maybe = require('./maybe');
import ObjC = require('./objc');

export function keywordArgumentModifiersForNullability(nullability:ObjC.Nullability):ObjC.KeywordArgumentModifier[] {
  return nullability.match(
    function inherited() {
      return [];
    },
    function nonnull() {
      return [ObjC.KeywordArgumentModifier.Nonnull()];
    },
    function nullable() {
      return [ObjC.KeywordArgumentModifier.Nullable()];
    });
}

export function propertyModifiersForNullability(nullability:ObjC.Nullability):ObjC.PropertyModifier[] {
  return nullability.match(
    function inherited() {
      return [];
    },
    function nonnull() {
      return [ObjC.PropertyModifier.Nonnull()];
    },
    function nullable() {
      return [ObjC.PropertyModifier.Nullable()];
    });
}
