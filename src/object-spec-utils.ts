/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import ObjectSpec = require('./object-spec');

export function typeReferenceForValueTypeWithName(name:string):string {
  return name + ' *';
}

export function typeSupportsObjectSpecSemantics(objectSpec:ObjectSpec.Type):boolean {
  return objectSpec.includes.indexOf(ObjectSpec.VALUE_OBJECT_SEMANTICS) >= 0;
}
