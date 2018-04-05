/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Maybe = require('./maybe');
import ObjectGeneration = require('./object-generation');

export function annotationValuesWithName(annotations:{[name:string]: ObjectGeneration.Annotation[];}, annotationName:string):Maybe.Maybe<ObjectGeneration.Annotation[]> {
  if (annotations && annotations[annotationName]) {
    return Maybe.Just<ObjectGeneration.Annotation[]>(annotations[annotationName]);
  } else {
    return Maybe.Nothing<ObjectGeneration.Annotation[]>();
  }
}
