/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
import ValueObject = require('./value-object');

export interface Request extends PluggableObjCFileCreation.ObjCGenerationRequest<ValueObject.Type> { }

interface ValueObjectObjCPlugIn extends PluggableObjCFileCreation.ObjCGenerationPlugIn<ValueObject.Type> { }

function createValueObjectObjCPlugIn(plugin:ValueObject.Plugin) : ValueObjectObjCPlugIn
{
  return {
    additionalFiles: function(typeInformation:ValueObject.Type): Code.File[] {
      return plugin.additionalFiles(typeInformation);
    },

    blockTypes: function(typeInformation:ValueObject.Type):ObjC.BlockType[] {
      return [];
    },

    classMethods: function(typeInformation:ValueObject.Type):ObjC.Method[] {
      return [];
    },

    comments: function(typeInformation:ValueObject.Type):ObjC.Comment[] {
      return plugin.headerComments(typeInformation);
    },

    enumerations: function(typeInformation:ValueObject.Type):ObjC.Enumeration[] {
      return [];
    },

    fileTransformation: function(writeRequest:FileWriter.Request):FileWriter.Request {
      return plugin.fileTransformation(writeRequest);
    },

    fileType: function(typeInformation:ValueObject.Type):Maybe.Maybe<Code.FileType> {
      return plugin.fileType(typeInformation);
    },

    forwardDeclarations: function(typeInformation:ValueObject.Type):ObjC.ForwardDeclaration[] {
      return plugin.forwardDeclarations(typeInformation);
    },

    functions: function(typeInformation:ValueObject.Type):ObjC.Function[] {
      return plugin.functions(typeInformation);
    },

    imports: function(typeInformation:ValueObject.Type):ObjC.Import[] {
      return plugin.imports(typeInformation);
    },

    internalProperties: function(typeInformation:ValueObject.Type):ObjC.Property[] {
      return [];
    },

    instanceMethods: function(typeInformation:ValueObject.Type):ObjC.Method[] {
      return plugin.instanceMethods(typeInformation);
    },

    properties: function(typeInformation:ValueObject.Type):ObjC.Property[] {
      return plugin.properties(typeInformation);
    },

    protocols: function(typeInformation:ValueObject.Type):ObjC.Protocol[] {
      return plugin.implementedProtocols(typeInformation);
    },

    staticConstants: function(typeInformation:ValueObject.Type):ObjC.Constant[] {
      return plugin.staticConstants(typeInformation);
    },

    validationErrors: function(typeInformation:ValueObject.Type):Error.Error[] {
      return plugin.validationErrors(typeInformation);
    },

    nullability: function(typeInformation:ValueObject.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return plugin.nullability(typeInformation);
    },
  };
}

function buildExtraAttributes(typeInformation:ValueObject.Type, soFar:ValueObject.Attribute[], plugin:ValueObject.Plugin):ValueObject.Attribute[] {
  return soFar.concat(plugin.attributes(typeInformation));
}

function buildExtraTypes(typeInformation:ValueObject.Type, soFar:ValueObject.Type[], plugin:ValueObject.Plugin):ValueObject.Type[] {
  return soFar.concat(plugin.additionalTypes(typeInformation));
}

function typeInformationWithAllAttributesFromPlugins(typeInformation:ValueObject.Type, plugins:List.List<ValueObject.Plugin>):ValueObject.Type {
  const pluginAttributes:ValueObject.Attribute[] = List.foldl(FunctionUtils.pApplyf3(typeInformation, buildExtraAttributes), [], plugins);

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

function additionalTypesFromPlugins(typeInformation:ValueObject.Type, plugins:List.List<ValueObject.Plugin>):ValueObject.Type[] {
  return List.foldl(FunctionUtils.pApplyf3(typeInformation, buildExtraTypes), [], plugins);
}

function shouldRunPluginForInclude(includes:string[], requiredIncludeToRun:string):boolean {
  return includes.indexOf(requiredIncludeToRun) !== -1;
}

function shouldRunPluginForIncludes(includes:string[], plugin:ValueObject.Plugin):boolean {
  return plugin.requiredIncludesToRun.every(FunctionUtils.pApplyf2(includes, shouldRunPluginForInclude));
}

function pluginsToRunForValueType(plugins:List.List<ValueObject.Plugin>, valueType:ValueObject.Type):List.List<ValueObject.Plugin> {
  return List.filter(FunctionUtils.pApplyf2(valueType.includes, shouldRunPluginForIncludes), plugins);
}

function objcPluginForValueObjectPlugin(plugin:ValueObject.Plugin):ValueObjectObjCPlugIn {
  return createValueObjectObjCPlugIn(plugin);
}

function additionalTypesForType(plugins:List.List<ValueObject.Plugin>, typeInformation:ValueObject.Type):ValueObject.Type[] {
  return additionalTypesFromPlugins(typeInformation, plugins);
}

function typeNameForType(typeInformation:ValueObject.Type):string {
  return typeInformation.typeName;
}

function commentsForType(typeInformation:ValueObject.Type):string[] {
  return typeInformation.comments;
}

export function fileWriteRequest(request:Request, plugins:List.List<ValueObject.Plugin>):Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
  const pluginsToRun = pluginsToRunForValueType(plugins, request.typeInformation);
  const wrappedPlugins:List.List<ValueObjectObjCPlugIn> = List.map(objcPluginForValueObjectPlugin, pluginsToRun);

  const typeInfoProvider:PluggableObjCFileCreation.ObjCGenerationTypeInfoProvider<ValueObject.Type> = {
    additionalTypesForType: FunctionUtils.pApplyf2(pluginsToRun, additionalTypesForType),
    typeNameForType: typeNameForType,
    commentsForType: commentsForType,
  };

  const requestWithUpdatedType = {
    diagnosticIgnores:request.diagnosticIgnores,
    baseClassLibraryName:request.baseClassLibraryName,
    baseClassName:request.baseClassName,
    path:request.path,
    typeInformation:typeInformationWithAllAttributesFromPlugins(request.typeInformation, pluginsToRun)
  };

  return PluggableObjCFileCreation.fileWriteRequest(requestWithUpdatedType, typeInfoProvider, wrappedPlugins);
}
