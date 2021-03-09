/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import {Error} from '../error';
import * as ObjectSpec from '../object-spec';

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: empty(),
    transformBaseFile: (_, b) => b,
    additionalTypes: empty(),
    attributes: empty(),
    classMethods: empty(),
    transformFileRequest: request => request,
    fileType: nothing(),
    forwardDeclarations: empty(),
    functions: empty(),
    headerComments: empty(),
    implementedProtocols: empty(),
    imports: empty(),
    instanceMethods: empty(),
    macros: empty(),
    properties: empty(),
    requiredIncludesToRun: ['RMDescriptionAttributeError'],
    staticConstants: empty(),
    validationErrors: objectSpec =>
      objectSpec.attributes.some(attribute => attribute.name === 'description')
        ? [
            Error(
              'Adding a method named `description` will override the basic `NSObject` method for a string describing the entire object. Consider using a different name instead.',
            ),
          ]
        : [],
    nullability: nothing(),
    subclassingRestricted: _ => false,
  };
}

// Utilities to make definitions shorter.
function nothing<T, R>(): (T) => R | null {
  return _ => null;
}

function empty<T, R>(): (T) => R[] {
  return _ => [];
}
