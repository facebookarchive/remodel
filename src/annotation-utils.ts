/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Maybe from './maybe';
import * as ObjectGeneration from './object-generation';

export function annotationValuesWithName(
  annotations: {[name: string]: ObjectGeneration.Annotation[]},
  annotationName: string,
): Maybe.Maybe<ObjectGeneration.Annotation[]> {
  if (annotations && annotations[annotationName]) {
    return Maybe.Just<ObjectGeneration.Annotation[]>(
      annotations[annotationName],
    );
  } else {
    return Maybe.Nothing<ObjectGeneration.Annotation[]>();
  }
}
