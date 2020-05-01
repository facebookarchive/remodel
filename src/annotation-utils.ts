/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ObjectGeneration from './object-generation';

export function annotationValuesWithName(
  annotations: {[name: string]: ObjectGeneration.Annotation[]},
  annotationName: string,
): ObjectGeneration.Annotation[] | null {
  if (annotations && annotations[annotationName]) {
    return annotations[annotationName];
  } else {
    return null;
  }
}
