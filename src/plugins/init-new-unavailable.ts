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
import * as ObjC from '../objc';
import * as ObjCInitUtils from '../objc-init-utils';
import * as ObjectSpec from '../object-spec';

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
      if (objectType.attributes.length > 0) {
        return [ObjCInitUtils.newUnavailableClassMethod()];
      } else {
        return [];
      }
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
      if (objectType.attributes.length > 0) {
        return [ObjCInitUtils.initUnavailableInstanceMethod()];
      } else {
        return [];
      }
    },
    macros: function (valueType: ObjectSpec.Type): ObjC.Macro[] {
      return [];
    },
    properties: function (objectType: ObjectSpec.Type): ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMInitNewUnavailable'],
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
      return [ObjCInitUtils.newUnavailableClassMethod()];
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
      return [ObjCInitUtils.initUnavailableInstanceMethod()];
    },
    instanceVariables: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return [];
    },
    macros: function (algebraicType: AlgebraicType.Type): ObjC.Macro[] {
      return [];
    },
    requiredIncludesToRun: ['RMInitNewUnavailable'],
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
