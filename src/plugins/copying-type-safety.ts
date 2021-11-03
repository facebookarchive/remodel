/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from '../algebraic-type';
import * as ObjC from '../objc';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecUtils from '../object-spec-utils';
import * as ObjectSpecCodeUtils from '../object-spec-code-utils';

function shouldValidateNSCopyingConformanceOfAttribute(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): boolean {
  return (
    // UIImage implements -copyWithZone:, but doesn't declare conformance with
    // NSCopying. Whitelist it manually to avoid breaking the build on any value
    // object with a UIImage attribute.
    attribute.type.name !== 'UIImage' &&
    // Blocks are copyable, but they aren't type-compatible with id<NSCopying>.
    // We need to compute the actual type, because blocks can be declared with an
    // underlying type, i.e. RMBlock(dispatch_block_t)
    ObjectSpecCodeUtils.computeTypeOfAttribute(attribute).name !==
      'dispatch_block_t' &&
    ObjectSpecCodeUtils.shouldCopyIncomingValueForAttribute(
      supportsValueSemantics,
      attribute,
    )
  );
}

function copyingValidatorFunction(
  supportsValueSemantics: boolean,
  attributes: ObjectSpec.Attribute[],
): ObjC.Function {
  return {
    comments: [
      {
        content:
          '// This unused function ensures that all object fields conform to NSCopying.',
      },
      {
        content:
          '// The -copy method is implemented on NSObject, and throws an exception at runtime.',
      },
    ],
    name: 'RMCopyingValidatorFunction',
    parameters: [],
    returnType: {
      type: null,
      modifiers: [],
    },
    code: attributes
      .filter((attribute) =>
        shouldValidateNSCopyingConformanceOfAttribute(
          supportsValueSemantics,
          attribute,
        ),
      )
      .map(
        (attribute) =>
          `id<NSCopying> ${attribute.name}_must_conform_to_NSCopying __unused = (${attribute.type.reference})nil;`,
      ),
    isPublic: false,
    isInline: false,
    compilerAttributes: ['__attribute__((unused))'],
  };
}

const INSTANCE_METHODS = [
  {
    preprocessors: [],
    belongsToProtocol: null,
    code: null,
    comments: [],
    compilerAttributes: [],
    keywords: [{argument: null, name: 'copy'}],
    returnType: {
      type: {
        name: 'instancetype',
        reference: 'instancetype',
      },
      modifiers: [],
    },
  },
];

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: empty(),
    transformBaseFile: (_, b) => b,
    additionalTypes: empty(),
    attributes: empty(),
    classMethods: empty(),
    transformFileRequest: (request) => request,
    fileType: nothing(),
    forwardDeclarations: empty(),
    functions: (objectType) => [
      copyingValidatorFunction(
        ObjectSpecUtils.typeSupportsValueObjectSemantics(objectType),
        objectType.attributes,
      ),
    ],
    headerComments: empty(),
    implementedProtocols: empty(),
    imports: empty(),
    instanceMethods: (_) => INSTANCE_METHODS,
    macros: empty(),
    properties: empty(),
    requiredIncludesToRun: ['RMCopyingTypeSafety'],
    staticConstants: empty(),
    validationErrors: empty(),
    nullability: nothing(),
    subclassingRestricted: (_) => false,
  };
}

export function createAlgebraicTypePlugin(): AlgebraicType.Plugin {
  return {
    additionalFiles: empty(),
    blockTypes: empty(),
    classMethods: empty(),
    enumerations: empty(),
    fileType: nothing(),
    forwardDeclarations: empty(),
    functions: empty(),
    headerComments: empty(),
    implementedProtocols: empty(),
    imports: empty(),
    instanceMethods: (_) => INSTANCE_METHODS,
    instanceVariables: empty(),
    macros: empty(),
    nullability: nothing(),
    requiredIncludesToRun: ['RMCopyingTypeSafety'],
    staticConstants: empty(),
    subclassingRestricted: (_) => false,
    transformBaseFile: (_, b) => b,
    transformFileRequest: (request) => request,
    validationErrors: empty(),
  };
}

// Utilities to make definitions shorter.
function nothing<T, R>(): (T) => R | null {
  return (_) => null;
}

function empty<T, R>(): (T) => R[] {
  return (_) => [];
}
