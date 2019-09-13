/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Maybe from './maybe';

export interface TypeLookup {
  name: string;
  library: string | null;
  file: string | null;
  canForwardDeclare: boolean;
}

export interface Annotation {
  properties: {[name: string]: string};
}

export interface AnnotationMap {
  [name: string]: Annotation[];
}
