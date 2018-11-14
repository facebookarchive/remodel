/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Maybe = require('./maybe');

export interface TypeLookup {
  name: string;
  library: Maybe.Maybe<string>;
  file: Maybe.Maybe<string>;
  canForwardDeclare: boolean;
}

export interface Annotation {
  properties: {[name: string]: string};
}

export interface AnnotationMap {
  [name: string]: Annotation[];
}
