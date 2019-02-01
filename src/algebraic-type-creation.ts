/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from './algebraic-type';
import * as Code from './code';
import * as Either from './either';
import * as Error from './error';
import * as File from './file';
import * as FileWriter from './file-writer';
import * as FunctionUtils from './function-utils';
import * as List from './list';
import * as Maybe from './maybe';
import * as ObjC from './objc';
import * as PluggableObjCFileCreation from './pluggable-objc-file-creation';

export interface Request
  extends PluggableObjCFileCreation.ObjCGenerationRequest<AlgebraicType.Type> {}

interface AlgebraicTypeObjCPlugIn
  extends PluggableObjCFileCreation.ObjCGenerationPlugIn<AlgebraicType.Type> {}

function createAlgebraicTypeObjCPlugIn(
  plugin: AlgebraicType.Plugin,
): AlgebraicTypeObjCPlugIn {
  return {
    additionalFiles: function(
      typeInformation: AlgebraicType.Type,
    ): Code.File[] {
      return plugin.additionalFiles(typeInformation);
    },

    blockTypes: function(
      typeInformation: AlgebraicType.Type,
    ): ObjC.BlockType[] {
      return plugin.blockTypes(typeInformation);
    },

    classMethods: function(typeInformation: AlgebraicType.Type): ObjC.Method[] {
      return plugin.classMethods(typeInformation);
    },

    comments: function(typeInformation: AlgebraicType.Type): ObjC.Comment[] {
      return plugin.headerComments(typeInformation);
    },

    enumerations: function(
      typeInformation: AlgebraicType.Type,
    ): ObjC.Enumeration[] {
      return plugin.enumerations(typeInformation);
    },

    fileTransformation: function(
      writeRequest: FileWriter.Request,
    ): FileWriter.Request {
      return plugin.fileTransformation(writeRequest);
    },

    fileType: function(
      typeInformation: AlgebraicType.Type,
    ): Maybe.Maybe<Code.FileType> {
      return plugin.fileType(typeInformation);
    },

    forwardDeclarations: function(
      typeInformation: AlgebraicType.Type,
    ): ObjC.ForwardDeclaration[] {
      return plugin.forwardDeclarations(typeInformation);
    },

    functions: function(typeInformation: AlgebraicType.Type): ObjC.Function[] {
      return plugin.functions(typeInformation);
    },

    imports: function(typeInformation: AlgebraicType.Type): ObjC.Import[] {
      return plugin.imports(typeInformation);
    },

    instanceVariables: function(
      typeInformation: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return plugin.instanceVariables(typeInformation);
    },

    instanceMethods: function(
      typeInformation: AlgebraicType.Type,
    ): ObjC.Method[] {
      return plugin.instanceMethods(typeInformation);
    },

    macros: plugin.macros,

    properties: function(typeInformation: AlgebraicType.Type): ObjC.Property[] {
      return [];
    },

    protocols: function(typeInformation: AlgebraicType.Type): ObjC.Protocol[] {
      return plugin.implementedProtocols(typeInformation);
    },

    staticConstants: function(
      typeInformation: AlgebraicType.Type,
    ): ObjC.Constant[] {
      return plugin.staticConstants(typeInformation);
    },

    validationErrors: function(
      typeInformation: AlgebraicType.Type,
    ): Error.Error[] {
      return plugin.validationErrors(typeInformation);
    },

    nullability: function(
      typeInformation: AlgebraicType.Type,
    ): Maybe.Maybe<ObjC.ClassNullability> {
      return plugin.nullability(typeInformation);
    },

    subclassingRestricted: function(
      typeInformation: AlgebraicType.Type,
    ): boolean {
      return plugin.subclassingRestricted(typeInformation);
    },

    requiredIncludesToRun: plugin.requiredIncludesToRun,
  };
}

function shouldRunPluginForInclude(
  includes: string[],
  requiredIncludeToRun: string,
): boolean {
  return includes.indexOf(requiredIncludeToRun) !== -1;
}

function shouldRunPluginForIncludes(
  includes: string[],
  plugin: AlgebraicType.Plugin,
): boolean {
  return plugin.requiredIncludesToRun.every(include =>
    shouldRunPluginForInclude(includes, include),
  );
}

function pluginsToRunForAlgebraicType(
  plugins: List.List<AlgebraicType.Plugin>,
  algebraicType: AlgebraicType.Type,
): List.List<AlgebraicType.Plugin> {
  return List.filter(
    plugin => shouldRunPluginForIncludes(algebraicType.includes, plugin),
    plugins,
  );
}

function objcPluginForAlgebraicTypePlugin(
  plugin: AlgebraicType.Plugin,
): AlgebraicTypeObjCPlugIn {
  return createAlgebraicTypeObjCPlugIn(plugin);
}

function typeNameForType(typeInformation: AlgebraicType.Type): string {
  return typeInformation.name;
}

function commentsForType(typeInformation: AlgebraicType.Type): string[] {
  return typeInformation.comments;
}

export function fileWriteRequest(
  request: Request,
  plugins: List.List<AlgebraicType.Plugin>,
): Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
  const pluginsToRun = pluginsToRunForAlgebraicType(
    plugins,
    request.typeInformation,
  );
  const wrappedPlugins: List.List<AlgebraicTypeObjCPlugIn> = List.map(
    objcPluginForAlgebraicTypePlugin,
    pluginsToRun,
  );

  const typeInfoProvider: PluggableObjCFileCreation.ObjCGenerationTypeInfoProvider<
    AlgebraicType.Type
  > = {
    additionalTypesForType: function(typeInformation: AlgebraicType.Type) {
      return [];
    },
    typeNameForType: typeNameForType,
    commentsForType: commentsForType,
  };

  return PluggableObjCFileCreation.fileWriteRequest(
    request,
    typeInfoProvider,
    wrappedPlugins,
  );
}
