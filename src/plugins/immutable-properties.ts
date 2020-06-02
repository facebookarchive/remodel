/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Code from '../code';
import * as Error from '../error';
import * as FileWriter from '../file-writer';
import * as ImmutableImportUtils from '../immutable-import-utils';
import * as ImmutableInitializerUtils from '../immutable-initializer-utils';
import * as ImmutablePropertyUtils from '../immutable-property-utils';
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecUtils from '../object-spec-utils';

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: function(objectType: ObjectSpec.Type): Code.File[] {
      return [];
    },
    transformBaseFile: function(
      objectType: ObjectSpec.Type,
      baseFile: Code.File,
    ): Code.File {
      return baseFile;
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
    transformFileRequest: function(
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function(objectType: ObjectSpec.Type): Code.FileType | null {
      return null;
    },
    forwardDeclarations: function(
      objectType: ObjectSpec.Type,
    ): ObjC.ForwardDeclaration[] {
      return objectType.includes.indexOf('UseForwardDeclarations') !== -1
        ? ImmutableImportUtils.forwardClassDeclarationsForObjectType(objectType)
        : [];
    },
    functions: function(objectType: ObjectSpec.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function(objectType: ObjectSpec.Type): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(
      objectType: ObjectSpec.Type,
    ): ObjC.ImplementedProtocol[] {
      return [];
    },
    imports: ImmutableImportUtils.importsForObjectType,
    instanceMethods: ImmutableInitializerUtils.initializerMethodsForObjectType,
    macros: function(valueType: ObjectSpec.Type): ObjC.Macro[] {
      return [];
    },
    properties: function(objectType: ObjectSpec.Type): ObjC.Property[] {
      const supportsValueSemantics: boolean = ObjectSpecUtils.typeSupportsValueObjectSemantics(
        objectType,
      );
      return objectType.attributes.map(attribute =>
        ImmutablePropertyUtils.propertyFromAttribute(
          supportsValueSemantics,
          attribute,
        ),
      );
    },
    requiredIncludesToRun: ['RMImmutableProperties'],
    staticConstants: function(objectType: ObjectSpec.Type): ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType: ObjectSpec.Type): Error.Error[] {
      return [];
    },
    nullability: function(
      objectType: ObjectSpec.Type,
    ): ObjC.ClassNullability | null {
      return null;
    },
    subclassingRestricted: function(objectType: ObjectSpec.Type): boolean {
      return false;
    },
  };
}
