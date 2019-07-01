/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Code from './code';
import * as Either from './either';
import * as Error from './error';
import * as FileWriter from './file-writer';
import * as List from './list';
import * as Maybe from './maybe';
import * as ObjC from './objc';
import * as PluggableObjCFileCreation from './pluggable-objc-file-creation';
import * as ObjectSpec from './object-spec';

export interface Request
  extends PluggableObjCFileCreation.ObjCGenerationRequest<ObjectSpec.Type> {}

interface ObjectSpecObjCPlugIn
  extends PluggableObjCFileCreation.ObjCGenerationPlugIn<ObjectSpec.Type> {}

function createObjectSpecObjCPlugIn(
  plugin: ObjectSpec.Plugin,
): ObjectSpecObjCPlugIn {
  return {
    additionalFiles: function(typeInformation: ObjectSpec.Type): Code.File[] {
      return plugin.additionalFiles(typeInformation);
    },

    transformBaseFile: function(
      typeInformation: ObjectSpec.Type,
      baseFile: Code.File,
    ): Code.File {
      return plugin.transformBaseFile(typeInformation, baseFile);
    },

    baseClass:
      plugin.baseClass != null ? plugin.baseClass : _ => Maybe.Nothing(),

    blockTypes: function(typeInformation: ObjectSpec.Type): ObjC.BlockType[] {
      return [];
    },

    classMethods: function(typeInformation: ObjectSpec.Type): ObjC.Method[] {
      return plugin.classMethods(typeInformation);
    },

    comments: function(typeInformation: ObjectSpec.Type): ObjC.Comment[] {
      return plugin.headerComments(typeInformation);
    },

    enumerations: function(
      typeInformation: ObjectSpec.Type,
    ): ObjC.Enumeration[] {
      return [];
    },

    transformFileRequest: function(
      writeRequest: FileWriter.Request,
    ): FileWriter.Request {
      return plugin.transformFileRequest(writeRequest);
    },

    fileType: function(
      typeInformation: ObjectSpec.Type,
    ): Maybe.Maybe<Code.FileType> {
      return plugin.fileType(typeInformation);
    },

    forwardDeclarations: function(
      typeInformation: ObjectSpec.Type,
    ): ObjC.ForwardDeclaration[] {
      return plugin.forwardDeclarations(typeInformation);
    },

    functions: function(typeInformation: ObjectSpec.Type): ObjC.Function[] {
      return plugin.functions(typeInformation);
    },

    imports: function(typeInformation: ObjectSpec.Type): ObjC.Import[] {
      return plugin.imports(typeInformation);
    },

    instanceVariables: function(
      typeInformation: ObjectSpec.Type,
    ): ObjC.InstanceVariable[] {
      return plugin.instanceVariables != null
        ? plugin.instanceVariables(typeInformation)
        : [];
    },

    instanceMethods: function(typeInformation: ObjectSpec.Type): ObjC.Method[] {
      return plugin.instanceMethods(typeInformation);
    },

    macros: plugin.macros,

    properties: function(typeInformation: ObjectSpec.Type): ObjC.Property[] {
      return plugin.properties(typeInformation);
    },

    protocols: function(typeInformation: ObjectSpec.Type): ObjC.Protocol[] {
      return plugin.implementedProtocols(typeInformation);
    },

    staticConstants: function(
      typeInformation: ObjectSpec.Type,
    ): ObjC.Constant[] {
      return plugin.staticConstants(typeInformation);
    },

    validationErrors: function(
      typeInformation: ObjectSpec.Type,
    ): Error.Error[] {
      return plugin.validationErrors(typeInformation);
    },

    nullability: function(
      typeInformation: ObjectSpec.Type,
    ): Maybe.Maybe<ObjC.ClassNullability> {
      return plugin.nullability(typeInformation);
    },

    subclassingRestricted: function(typeInformation: ObjectSpec.Type): boolean {
      return plugin.subclassingRestricted(typeInformation);
    },

    structs: function(typeInformation: ObjectSpec.Type): Code.Struct[] {
      return plugin.structs != null ? plugin.structs(typeInformation) : [];
    },

    requiredIncludesToRun: plugin.requiredIncludesToRun,
  };
}

function buildExtraAttributes(
  typeInformation: ObjectSpec.Type,
  soFar: ObjectSpec.Attribute[],
  plugin: ObjectSpec.Plugin,
): ObjectSpec.Attribute[] {
  return soFar.concat(plugin.attributes(typeInformation));
}

function buildExtraTypes(
  typeInformation: ObjectSpec.Type,
  soFar: ObjectSpec.Type[],
  plugin: ObjectSpec.Plugin,
): ObjectSpec.Type[] {
  return soFar.concat(plugin.additionalTypes(typeInformation));
}

function typeInformationWithAllAttributesFromPlugins(
  typeInformation: ObjectSpec.Type,
  plugins: List.List<ObjectSpec.Plugin>,
): ObjectSpec.Type {
  const pluginAttributes: ObjectSpec.Attribute[] = List.foldl<
    ObjectSpec.Plugin,
    ObjectSpec.Attribute[]
  >(
    (soFar, plugin) => buildExtraAttributes(typeInformation, soFar, plugin),
    [],
    plugins,
  );

  return {
    annotations: typeInformation.annotations,
    attributes: typeInformation.attributes.concat(pluginAttributes),
    comments: typeInformation.comments,
    excludes: typeInformation.excludes,
    includes: typeInformation.includes,
    libraryName: typeInformation.libraryName,
    typeLookups: typeInformation.typeLookups,
    typeName: typeInformation.typeName,
  };
}

function additionalTypesFromPlugins(
  typeInformation: ObjectSpec.Type,
  plugins: List.List<ObjectSpec.Plugin>,
): ObjectSpec.Type[] {
  return List.foldl<ObjectSpec.Plugin, ObjectSpec.Type[]>(
    (soFar, plugin) => buildExtraTypes(typeInformation, soFar, plugin),
    [],
    plugins,
  );
}

function shouldRunPluginForInclude(
  includes: string[],
  requiredIncludeToRun: string,
): boolean {
  return includes.indexOf(requiredIncludeToRun) !== -1;
}

function shouldRunPluginForIncludes(
  includes: string[],
  plugin: ObjectSpec.Plugin,
): boolean {
  return plugin.requiredIncludesToRun.every(requiredInclude =>
    shouldRunPluginForInclude(includes, requiredInclude),
  );
}

function pluginsToRunForValueType(
  plugins: List.List<ObjectSpec.Plugin>,
  objectType: ObjectSpec.Type,
): List.List<ObjectSpec.Plugin> {
  return List.filter(
    plugin => shouldRunPluginForIncludes(objectType.includes, plugin),
    plugins,
  );
}

function objcPluginForObjectSpecPlugin(
  plugin: ObjectSpec.Plugin,
): ObjectSpecObjCPlugIn {
  return createObjectSpecObjCPlugIn(plugin);
}

function additionalTypesForType(
  plugins: List.List<ObjectSpec.Plugin>,
  typeInformation: ObjectSpec.Type,
): ObjectSpec.Type[] {
  return additionalTypesFromPlugins(typeInformation, plugins);
}

function typeNameForType(typeInformation: ObjectSpec.Type): string {
  return typeInformation.typeName;
}

function commentsForType(typeInformation: ObjectSpec.Type): string[] {
  return typeInformation.comments;
}

export function fileWriteRequest(
  request: Request,
  plugins: List.List<ObjectSpec.Plugin>,
): Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
  const pluginsToRun = pluginsToRunForValueType(
    plugins,
    request.typeInformation,
  );
  const wrappedPlugins: List.List<ObjectSpecObjCPlugIn> = List.map(
    objcPluginForObjectSpecPlugin,
    pluginsToRun,
  );

  const typeInfoProvider: PluggableObjCFileCreation.ObjCGenerationTypeInfoProvider<
    ObjectSpec.Type
  > = {
    additionalTypesForType: type => additionalTypesForType(pluginsToRun, type),
    typeNameForType: typeNameForType,
    commentsForType: commentsForType,
  };

  const requestWithUpdatedType = {
    diagnosticIgnores: request.diagnosticIgnores,
    baseClassLibraryName: request.baseClassLibraryName,
    baseClassName: request.baseClassName,
    path: request.path,
    outputPath: request.outputPath,
    outputFlags: request.outputFlags,
    typeInformation: typeInformationWithAllAttributesFromPlugins(
      request.typeInformation,
      pluginsToRun,
    ),
  };

  return PluggableObjCFileCreation.fileWriteRequest(
    requestWithUpdatedType,
    typeInfoProvider,
    wrappedPlugins,
  );
}
