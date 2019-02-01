/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ObjectSpec from './object-spec';

export function typeReferenceForValueTypeWithName(name: string): string {
  return name + ' *';
}

export function typeSupportsValueObjectSemantics(
  objectSpec: ObjectSpec.Type,
): boolean {
  return objectSpec.includes.indexOf('RMValueObjectSemantics') >= 0;
}
