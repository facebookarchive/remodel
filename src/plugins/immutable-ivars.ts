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
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjCCommentUtils from '../objc-comment-utils';
import * as ObjCNullabilityUtils from '../objc-nullability-utils';
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
      return objectType.includes.indexOf('UseForwardDeclarations') !== -1
        ? ImmutableImportUtils.forwardClassDeclarationsForObjectType(objectType)
        : [];
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
    imports: ImmutableImportUtils.importsForObjectType,
    instanceMethods: (objectType) => {
      const initializers =
        ImmutableInitializerUtils.initializerMethodsForObjectType(objectType);

      const getters = objectType.attributes.map((attribute) => ({
        preprocessors: [],
        belongsToProtocol: null,
        code: [`return _${attribute.name};`],
        comments: ObjCCommentUtils.commentsAsBlockFromStringArray(
          attribute.comments,
        ),
        compilerAttributes: [],
        keywords: [
          {
            argument: null,
            name: attribute.name,
          },
        ],
        returnType: {
          type: attribute.type,
          modifiers:
            ObjCNullabilityUtils.keywordArgumentModifiersForNullability(
              attribute.nullability,
            ),
        },
      }));

      return initializers.concat(getters);
    },
    instanceVariables: (objectType) =>
      objectType.attributes.map((attribute) => ({
        comments: [],
        modifiers: [],
        access: ObjC.InstanceVariableAccess.Private(),
        name: attribute.name, // _ is automatically prepended
        returnType: attribute.type,
      })),
    macros: function (valueType: ObjectSpec.Type): ObjC.Macro[] {
      return [];
    },
    properties: function (objectType: ObjectSpec.Type): ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMImmutableIvars'],
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
