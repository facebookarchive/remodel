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
import * as Maybe from '../maybe';
import * as ObjC from '../objc';

function matchingBlockTypeForPlugin(): Maybe.Maybe<
  AlgebraicTypeUtils.MatchingBlockType
> {
  return Maybe.Nothing<AlgebraicTypeUtils.MatchingBlockType>();
}

export function createAlgebraicTypePlugin(): AlgebraicType.Plugin {
  return {
    additionalFiles: function(algebraicType: AlgebraicType.Type): Code.File[] {
      return [];
    },
    transformBaseFile: function(
      algebraicType: AlgebraicType.Type,
      baseFile: Code.File,
    ): Code.File {
      return baseFile;
    },
    blockTypes: function(algebraicType: AlgebraicType.Type): ObjC.BlockType[] {
      const matchingBlockType = matchingBlockTypeForPlugin();
      return algebraicType.subtypes.map(subtype =>
        AlgebraicTypeUtils.blockTypeForSubtype(
          algebraicType,
          matchingBlockType,
          subtype,
        ),
      );
    },
    classMethods: function(algebraicType: AlgebraicType.Type): ObjC.Method[] {
      return [];
    },
    enumerations: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Enumeration[] {
      return [];
    },
    transformFileRequest: function(
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function(
      algebraicType: AlgebraicType.Type,
    ): Code.FileType | null {
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
      return [];
    },
    instanceMethods: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Method[] {
      // While ADT matchers are always nil-checked (and thus nullable), we only want to insert an annotation for this
      // if the nullability plugin is enabled, to avoid partial nullability annotations in the file, which trigger a
      // compiler error.
      const assumesNonnull =
        algebraicType.includes.indexOf('RMAssumeNonnull') >= 0;
      return [
        AlgebraicTypeUtils.instanceMethodForMatchingSubtypesOfAlgebraicType(
          algebraicType,
          matchingBlockTypeForPlugin(),
          assumesNonnull,
        ),
      ];
    },
    instanceVariables: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return [];
    },
    macros: function(algebraicType: AlgebraicType.Type): ObjC.Macro[] {
      return [];
    },
    requiredIncludesToRun: ['VoidMatching'],
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
    ): ObjC.ClassNullability | null {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(
      algebraicType: AlgebraicType.Type,
    ): boolean {
      return false;
    },
  };
}
