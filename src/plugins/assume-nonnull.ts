/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from '../algebraic-type';
import * as Code from '../code';
import * as Error from '../error';
import * as FileWriter from '../file-writer';
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjectSpec from '../object-spec';

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: function(objectType: ObjectSpec.Type): Code.File[] {
      return [];
    },
    additionalTypes: function(objectType: ObjectSpec.Type): ObjectSpec.Type[] {
      return [];
    },
    attributes: function(objectType: ObjectSpec.Type): ObjectSpec.Attribute[] {
      return [];
    },
    classMethods: function(objectType: ObjectSpec.Type): ObjC.Method[] {
      return [];
    },
    fileTransformation: function(
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function(
      objectType: ObjectSpec.Type,
    ): Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(
      objectType: ObjectSpec.Type,
    ): ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(objectType: ObjectSpec.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function(objectType: ObjectSpec.Type): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(
      objectType: ObjectSpec.Type,
    ): ObjC.Protocol[] {
      return [];
    },
    imports: function(objectType: ObjectSpec.Type): ObjC.Import[] {
      return [
        {
          file: 'Foundation.h',
          isPublic: true,
          requiresCPlusPlus: false,
          library: Maybe.Just('Foundation'),
        },
      ];
    },
    instanceMethods: function(objectType: ObjectSpec.Type): ObjC.Method[] {
      return [];
    },
    macros: function(valueType: ObjectSpec.Type): ObjC.Macro[] {
      return [];
    },
    properties: function(objectType: ObjectSpec.Type): ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMAssumeNonnull'],
    staticConstants: function(objectType: ObjectSpec.Type): ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType: ObjectSpec.Type): Error.Error[] {
      return [];
    },
    nullability: function(
      objectType: ObjectSpec.Type,
    ): Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Just(ObjC.ClassNullability.assumeNonnull);
    },
    subclassingRestricted: function(objectType: ObjectSpec.Type): boolean {
      return false;
    },
  };
}

export function createAlgebraicTypePlugin(): AlgebraicType.Plugin {
  return {
    additionalFiles: function(algebraicType: AlgebraicType.Type): Code.File[] {
      return [];
    },
    blockTypes: function(algebraicType: AlgebraicType.Type): ObjC.BlockType[] {
      return [];
    },
    classMethods: function(algebraicType: AlgebraicType.Type): ObjC.Method[] {
      return [];
    },
    enumerations: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Enumeration[] {
      return [];
    },
    fileTransformation: function(
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function(
      algebraicType: AlgebraicType.Type,
    ): Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(algebraicType: AlgebraicType.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Protocol[] {
      return [];
    },
    imports: function(algebraicType: AlgebraicType.Type): ObjC.Import[] {
      return [
        {
          file: 'Foundation.h',
          isPublic: true,
          requiresCPlusPlus: false,
          library: Maybe.Just('Foundation'),
        },
      ];
    },
    instanceMethods: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Method[] {
      return [];
    },
    instanceVariables: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return [];
    },
    macros: function(algebraicType: AlgebraicType.Type): ObjC.Macro[] {
      return [];
    },
    requiredIncludesToRun: ['RMAssumeNonnull'],
    staticConstants: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Constant[] {
      return [];
    },
    validationErrors: function(
      algebraicType: AlgebraicType.Type,
    ): Error.Error[] {
      return [];
    },
    nullability: function(
      algebraicType: AlgebraicType.Type,
    ): Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Just(ObjC.ClassNullability.assumeNonnull);
    },
    subclassingRestricted: function(
      algebraicType: AlgebraicType.Type,
    ): boolean {
      return false;
    },
  };
}
