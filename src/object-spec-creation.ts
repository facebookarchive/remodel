/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='./type-defs/node-0.11.d.ts'/>

import Code = require('./code');
import Either = require('./either');
import Error = require('./error');
import File = require('./file');
import FileWriter = require('./file-writer');
import FunctionUtils = require('./function-utils');
import List = require('./list');
import Maybe = require('./maybe');
import ObjC = require('./objc');
import PluggableObjCFileCreation = require('./pluggable-objc-file-creation');
import ObjectSpec = require('./object-spec');

export interface Request extends PluggableObjCFileCreation.ObjCGenerationRequest<ObjectSpec.Type> { }

interface ObjectSpecObjCPlugIn extends PluggableObjCFileCreation.ObjCGenerationPlugIn<ObjectSpec.Type> { }

function createObjectSpecObjCPlugIn(plugin:ObjectSpec.Plugin) : ObjectSpecObjCPlugIn
{
  return {
    additionalFiles: function(typeInformation:ObjectSpec.Type): Code.File[] {
      return plugin.additionalFiles(typeInformation);
    },

    blockTypes: function(typeInformation:ObjectSpec.Type):ObjC.BlockType[] {
      return [];
    },

    classMethods: function(typeInformation:ObjectSpec.Type):ObjC.Method[] {
      return plugin.classMethods(typeInformation);
    },

    comments: function(typeInformation:ObjectSpec.Type):ObjC.Comment[] {
      return plugin.headerComments(typeInformation);
    },

    enumerations: function(typeInformation:ObjectSpec.Type):ObjC.Enumeration[] {
      return [];
    },

    fileTransformation: function(writeRequest:FileWriter.Request):FileWriter.Request {
      return plugin.fileTransformation(writeRequest);
    },

    fileType: function(typeInformation:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
      return plugin.fileType(typeInformation);
    },

    forwardDeclarations: function(typeInformation:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
      return plugin.forwardDeclarations(typeInformation);
    },

    functions: function(typeInformation:ObjectSpec.Type):ObjC.Function[] {
      return plugin.functions(typeInformation);
    },

    imports: function(typeInformation:ObjectSpec.Type):ObjC.Import[] {
      return plugin.imports(typeInformation);
    },

    instanceVariables: function(typeInformation:ObjectSpec.Type):ObjC.InstanceVariable[] {
      return [];
    },

    instanceMethods: function(typeInformation:ObjectSpec.Type):ObjC.Method[] {
      return plugin.instanceMethods(typeInformation);
    },

    macros: plugin.macros,

    properties: function(typeInformation:ObjectSpec.Type):ObjC.Property[] {
      return plugin.properties(typeInformation);
    },

    protocols: function(typeInformation:ObjectSpec.Type):ObjC.Protocol[] {
      return plugin.implementedProtocols(typeInformation);
    },

    staticConstants: function(typeInformation:ObjectSpec.Type):ObjC.Constant[] {
      return plugin.staticConstants(typeInformation);
    },

    validationErrors: function(typeInformation:ObjectSpec.Type):Error.Error[] {
      return plugin.validationErrors(typeInformation);
    },

    nullability: function(typeInformation:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return plugin.nullability(typeInformation);
    },

    subclassingRestricted: function(typeInformation:ObjectSpec.Type):boolean {
      return plugin.subclassingRestricted(typeInformation);
    },

    requiredIncludesToRun: plugin.requiredIncludesToRun,
  };
}

function buildExtraAttributes(typeInformation:ObjectSpec.Type, soFar:ObjectSpec.Attribute[], plugin:ObjectSpec.Plugin):ObjectSpec.Attribute[] {
  return soFar.concat(plugin.attributes(typeInformation));
}

function buildExtraTypes(typeInformation:ObjectSpec.Type, soFar:ObjectSpec.Type[], plugin:ObjectSpec.Plugin):ObjectSpec.Type[] {
  return soFar.concat(plugin.additionalTypes(typeInformation));
}

function typeInformationWithAllAttributesFromPlugins(typeInformation:ObjectSpec.Type, plugins:List.List<ObjectSpec.Plugin>):ObjectSpec.Type {
  const pluginAttributes:ObjectSpec.Attribute[] = List.foldl(FunctionUtils.pApplyf3(typeInformation, buildExtraAttributes), [], plugins);

  return {
    annotations: typeInformation.annotations,
    attributes: typeInformation.attributes.concat(pluginAttributes),
    comments: typeInformation.comments,
    excludes: typeInformation.excludes,
    includes: typeInformation.includes,
    libraryName: typeInformation.libraryName,
    typeLookups: typeInformation.typeLookups,
    typeName: typeInformation.typeName
  };
}

function additionalTypesFromPlugins(typeInformation:ObjectSpec.Type, plugins:List.List<ObjectSpec.Plugin>):ObjectSpec.Type[] {
  return List.foldl(FunctionUtils.pApplyf3(typeInformation, buildExtraTypes), [], plugins);
}

function shouldRunPluginForInclude(includes:string[], requiredIncludeToRun:string):boolean {
  return includes.indexOf(requiredIncludeToRun) !== -1;
}

function shouldRunPluginForIncludes(includes:string[], plugin:ObjectSpec.Plugin):boolean {
  return plugin.requiredIncludesToRun.every(FunctionUtils.pApplyf2(includes, shouldRunPluginForInclude));
}

function pluginsToRunForValueType(plugins:List.List<ObjectSpec.Plugin>, objectType:ObjectSpec.Type):List.List<ObjectSpec.Plugin> {
  return List.filter(FunctionUtils.pApplyf2(objectType.includes, shouldRunPluginForIncludes), plugins);
}

function objcPluginForObjectSpecPlugin(plugin:ObjectSpec.Plugin):ObjectSpecObjCPlugIn {
  return createObjectSpecObjCPlugIn(plugin);
}

function additionalTypesForType(plugins:List.List<ObjectSpec.Plugin>, typeInformation:ObjectSpec.Type):ObjectSpec.Type[] {
  return additionalTypesFromPlugins(typeInformation, plugins);
}

function typeNameForType(typeInformation:ObjectSpec.Type):string {
  return typeInformation.typeName;
}

function commentsForType(typeInformation:ObjectSpec.Type):string[] {
  return typeInformation.comments;
}

export function fileWriteRequest(request:Request, plugins:List.List<ObjectSpec.Plugin>):Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
  const pluginsToRun = pluginsToRunForValueType(plugins, request.typeInformation);
  const wrappedPlugins:List.List<ObjectSpecObjCPlugIn> = List.map(objcPluginForObjectSpecPlugin, pluginsToRun);

  const typeInfoProvider:PluggableObjCFileCreation.ObjCGenerationTypeInfoProvider<ObjectSpec.Type> = {
    additionalTypesForType: FunctionUtils.pApplyf2(pluginsToRun, additionalTypesForType),
    typeNameForType: typeNameForType,
    commentsForType: commentsForType,
  };

  const requestWithUpdatedType = {
    diagnosticIgnores:request.diagnosticIgnores,
    baseClassLibraryName:request.baseClassLibraryName,
    baseClassName:request.baseClassName,
    path:request.path,
    outputPath:request.outputPath,
    outputFlags:request.outputFlags,
    typeInformation:typeInformationWithAllAttributesFromPlugins(request.typeInformation, pluginsToRun),
  };

  return PluggableObjCFileCreation.fileWriteRequest(requestWithUpdatedType, typeInfoProvider, wrappedPlugins);
}
