/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from '../algebraic-type';
import * as AlgebraicTypeUtils from '../algebraic-type-utils';
import * as Code from '../code';
import * as Error from '../error';
import * as FileWriter from '../file-writer';
import * as CLangCommon from '../clang-common';
import * as ObjC from '../objc';
import * as ObjCNullabilityUtils from '../objc-nullability-utils';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecCodeUtils from '../object-spec-code-utils';

function parameterAssertMacro(): ObjC.Macro {
  return {
    comments: [],
    name: 'RMParameterAssert',
    parameters: ['condition'],
    code: 'NSCParameterAssert((condition))',
  };
}

function canAssertExistenceForTypeOfObjectSpecAttribute(
  attribute: ObjectSpec.Attribute,
) {
  return ObjCNullabilityUtils.canAssertExistenceForType(
    ObjectSpecCodeUtils.computeTypeOfAttribute(attribute),
  );
}

function canAssertExistenceForTypeOfAlgebraicTypeSubtypeAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
) {
  return ObjCNullabilityUtils.canAssertExistenceForType(
    AlgebraicTypeUtils.computeTypeOfAttribute(attribute),
  );
}

function parameterAssertMacroArray(
  assumeNonnull: boolean,
  attributeNullabilities: CLangCommon.Nullability[],
): ObjC.Macro[] {
  if (
    ObjCNullabilityUtils.nullabilityRequiresNonnullProtection(
      assumeNonnull,
      attributeNullabilities,
    )
  ) {
    return [parameterAssertMacro()];
  } else {
    return [];
  }
}

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: function (objectType: ObjectSpec.Type): Code.File[] {
      return [];
    },
    transformBaseFile: function (
      objectType: ObjectSpec.Type,
      baseFile: Code.File,
    ): Code.File {
      return baseFile;
    },
    additionalTypes: function (objectType: ObjectSpec.Type): ObjectSpec.Type[] {
      return [];
    },
    attributes: function (objectType: ObjectSpec.Type): ObjectSpec.Attribute[] {
      return [];
    },
    classMethods: function (objectType: ObjectSpec.Type): ObjC.Method[] {
      return [];
    },
    transformFileRequest: function (
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function (objectType: ObjectSpec.Type): Code.FileType | null {
      return null;
    },
    forwardDeclarations: function (
      objectType: ObjectSpec.Type,
    ): ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function (objectType: ObjectSpec.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function (objectType: ObjectSpec.Type): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function (
      objectType: ObjectSpec.Type,
    ): ObjC.ImplementedProtocol[] {
      return [];
    },
    imports: function (objectType: ObjectSpec.Type): ObjC.Import[] {
      return [];
    },
    instanceMethods: function (objectType: ObjectSpec.Type): ObjC.Method[] {
      return [];
    },
    macros: function (objectType: ObjectSpec.Type): ObjC.Macro[] {
      const assumeNonnull: boolean =
        objectType.includes.indexOf('RMAssumeNonnull') >= 0;
      const attributeNullabilities = objectType.attributes
        .filter(canAssertExistenceForTypeOfObjectSpecAttribute)
        .map((attribute) => attribute.nullability);
      return parameterAssertMacroArray(assumeNonnull, attributeNullabilities);
    },
    properties: function (objectType: ObjectSpec.Type): ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMAssertNullability'],
    staticConstants: function (objectType: ObjectSpec.Type): ObjC.Constant[] {
      return [];
    },
    validationErrors: function (objectType: ObjectSpec.Type): Error.Error[] {
      return [];
    },
    nullability: function (
      objectType: ObjectSpec.Type,
    ): ObjC.ClassNullability | null {
      return null;
    },
    subclassingRestricted: function (objectType: ObjectSpec.Type): boolean {
      return false;
    },
  };
}

export function createAlgebraicTypePlugin(): AlgebraicType.Plugin {
  return {
    additionalFiles: function (algebraicType: AlgebraicType.Type): Code.File[] {
      return [];
    },
    transformBaseFile: function (
      algebraicType: AlgebraicType.Type,
      baseFile: Code.File,
    ): Code.File {
      return baseFile;
    },
    blockTypes: function (algebraicType: AlgebraicType.Type): ObjC.BlockType[] {
      return [];
    },
    classMethods: function (algebraicType: AlgebraicType.Type): ObjC.Method[] {
      return [];
    },
    enumerations: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.Enumeration[] {
      return [];
    },
    transformFileRequest: function (
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function (
      algebraicType: AlgebraicType.Type,
    ): Code.FileType | null {
      return null;
    },
    forwardDeclarations: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function (algebraicType: AlgebraicType.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.ImplementedProtocol[] {
      return [];
    },
    imports: function (algebraicType: AlgebraicType.Type): ObjC.Import[] {
      return [];
    },
    instanceMethods: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.Method[] {
      return [];
    },
    instanceVariables: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return [];
    },
    macros: function (algebraicType: AlgebraicType.Type): ObjC.Macro[] {
      const assumeNonnull: boolean =
        algebraicType.includes.indexOf('RMAssumeNonnull') >= 0;
      const attributeNullabilities =
        AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes)
          .filter(canAssertExistenceForTypeOfAlgebraicTypeSubtypeAttribute)
          .map((attribute) => attribute.nullability);
      return parameterAssertMacroArray(assumeNonnull, attributeNullabilities);
    },
    requiredIncludesToRun: ['RMAssertNullability'],
    staticConstants: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.Constant[] {
      return [];
    },
    validationErrors: function (
      algebraicType: AlgebraicType.Type,
    ): Error.Error[] {
      return [];
    },
    nullability: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.ClassNullability | null {
      return null;
    },
    subclassingRestricted: function (
      algebraicType: AlgebraicType.Type,
    ): boolean {
      return false;
    },
  };
}
