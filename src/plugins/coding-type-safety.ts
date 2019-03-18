/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {commentsAsBlockFromStringArray} from '../objc-comment-utils';
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecUtils from '../object-spec-utils';
import * as ObjectSpecCodeUtils from '../object-spec-code-utils';

function shouldValidateNSCodingConformanceOfAttribute(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): boolean {
  return (
    // Anything that we're going to copy is an object, so we know that we need
    // to check it for NSCoding compatibility.
    ObjectSpecCodeUtils.shouldCopyIncomingValueForAttribute(
      supportsValueSemantics,
      attribute,
    )
  );
}

function codingValidatorFunction(
  supportsValueSemantics: boolean,
  attributes: ObjectSpec.Attribute[],
): ObjC.Function {
  return {
    comments: commentsAsBlockFromStringArray([
      'This unused function ensures that all object fields conform to NSCoding.',
      'The encoding methods do not check for protocol conformance.',
    ]),
    name: 'RMCodingValidatorFunction',
    parameters: [],
    returnType: {
      type: Maybe.Nothing(),
      modifiers: [],
    },
    code: attributes
      .filter(attribute =>
        shouldValidateNSCodingConformanceOfAttribute(
          supportsValueSemantics,
          attribute,
        ),
      )
      .map(
        attribute =>
          `id<NSCoding> ${
            attribute.name
          }_must_conform_to_NSCoding __unused = (${
            attribute.type.reference
          })nil;`,
      ),
    isInline: false,
    isPublic: false,
    compilerAttributes: ['__attribute__((unused))'],
  };
}

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: empty(),
    additionalTypes: empty(),
    attributes: empty(),
    classMethods: empty(),
    fileType: nothing(),
    forwardDeclarations: empty(),
    functions: objectType => [
      codingValidatorFunction(
        ObjectSpecUtils.typeSupportsValueObjectSemantics(objectType),
        objectType.attributes,
      ),
    ],
    headerComments: empty(),
    implementedProtocols: empty(),
    imports: empty(),
    instanceMethods: empty(),
    macros: empty(),
    properties: empty(),
    requiredIncludesToRun: ['RMCodingTypeSafety'],
    staticConstants: empty(),
    transformBaseFile: (_, file) => file,
    transformFileRequest: file => file,
    validationErrors: empty(),
    nullability: nothing(),
    subclassingRestricted: _ => false,
  };
}

// Utilities to make definitions shorter.
function nothing<T, R>(): (_: T) => Maybe.Maybe<R> {
  return _ => Maybe.Nothing();
}

function empty<T, R>(): (_: T) => R[] {
  return _ => [];
}
