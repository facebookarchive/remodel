/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import Maybe = require('./maybe');
import ValueObject = require('./value-object');

export function annotationValuesWithName(annotations:{[name:string]: ValueObject.Annotation[];}, annotationName:string):Maybe.Maybe<ValueObject.Annotation[]> {
  if (annotations && annotations[annotationName]) {
    return Maybe.Just<ValueObject.Annotation[]>(annotations[annotationName]);
  } else {
    return Maybe.Nothing<ValueObject.Annotation[]>();
  }
}
