/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

  ///<reference path='./type-defs/node-0.11.d.ts'/>

import AlgebraicType = require('./algebraic-type');
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

export interface Request extends PluggableObjCFileCreation.ObjCGenerationRequest<AlgebraicType.Type> { }

interface AlgebraicTypeObjCPlugIn extends PluggableObjCFileCreation.ObjCGenerationPlugIn<AlgebraicType.Type> { }

function createAlgebraicTypeObjCPlugIn(plugin:AlgebraicType.Plugin) : AlgebraicTypeObjCPlugIn
{
  return {
    additionalFiles: function(typeInformation:AlgebraicType.Type): Code.File[] {
      return plugin.additionalFiles(typeInformation);
    },

    blockTypes: function(typeInformation:AlgebraicType.Type):ObjC.BlockType[] {
      return plugin.blockTypes(typeInformation);
    },

    classMethods: function(typeInformation:AlgebraicType.Type):ObjC.Method[] {
      return plugin.classMethods(typeInformation);
    },

    comments: function(typeInformation:AlgebraicType.Type):ObjC.Comment[] {
      return plugin.headerComments(typeInformation);
    },

    enumerations: function(typeInformation:AlgebraicType.Type):ObjC.Enumeration[] {
      return plugin.enumerations(typeInformation);
    },

    fileTransformation: function(writeRequest:FileWriter.Request):FileWriter.Request {
      return plugin.fileTransformation(writeRequest);
    },

    fileType: function(typeInformation:AlgebraicType.Type):Maybe.Maybe<Code.FileType> {
      return plugin.fileType(typeInformation);
    },

    forwardDeclarations: function(typeInformation:AlgebraicType.Type):ObjC.ForwardDeclaration[] {
      return plugin.forwardDeclarations(typeInformation);
    },

    functions: function(typeInformation:AlgebraicType.Type):ObjC.Function[] {
      return plugin.functions(typeInformation);
    },

    imports: function(typeInformation:AlgebraicType.Type):ObjC.Import[] {
      return plugin.imports(typeInformation);
    },

    internalProperties: function(typeInformation:AlgebraicType.Type):ObjC.Property[] {
      return plugin.internalProperties(typeInformation);
    },

    instanceMethods: function(typeInformation:AlgebraicType.Type):ObjC.Method[] {
      return plugin.instanceMethods(typeInformation);
    },

    properties: function(typeInformation:AlgebraicType.Type):ObjC.Property[] {
      return [];
    },

    protocols: function(typeInformation:AlgebraicType.Type):ObjC.Protocol[] {
      return plugin.implementedProtocols(typeInformation);
    },

    staticConstants: function(typeInformation:AlgebraicType.Type):ObjC.Constant[] {
      return plugin.staticConstants(typeInformation);
    },

    validationErrors: function(typeInformation:AlgebraicType.Type):Error.Error[] {
      return plugin.validationErrors(typeInformation);
    },

    nullability: function(typeInformation:AlgebraicType.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return plugin.nullability(typeInformation);
    },
  };
}

function shouldRunPluginForInclude(includes:string[], requiredIncludeToRun:string):boolean {
  return includes.indexOf(requiredIncludeToRun) !== -1;
}

function shouldRunPluginForIncludes(includes:string[], plugin:AlgebraicType.Plugin):boolean {
  return plugin.requiredIncludesToRun.every(FunctionUtils.pApplyf2(includes, shouldRunPluginForInclude));
}

function pluginsToRunForAlgebraicType(plugins:List.List<AlgebraicType.Plugin>, algebraicType:AlgebraicType.Type):List.List<AlgebraicType.Plugin> {
  return List.filter(FunctionUtils.pApplyf2(algebraicType.includes, shouldRunPluginForIncludes), plugins);
}

function objcPluginForAlgebraicTypePlugin(plugin:AlgebraicType.Plugin):AlgebraicTypeObjCPlugIn {
  return createAlgebraicTypeObjCPlugIn(plugin);
}

function typeNameForType(typeInformation:AlgebraicType.Type):string {
  return typeInformation.name;
}

function commentsForType(typeInformation:AlgebraicType.Type):string[] {
  return typeInformation.comments;
}

export function fileWriteRequest(request:Request, plugins:List.List<AlgebraicType.Plugin>):Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
  const pluginsToRun = pluginsToRunForAlgebraicType(plugins, request.typeInformation);
  const wrappedPlugins:List.List<AlgebraicTypeObjCPlugIn> = List.map(objcPluginForAlgebraicTypePlugin, pluginsToRun);

  const typeInfoProvider:PluggableObjCFileCreation.ObjCGenerationTypeInfoProvider<AlgebraicType.Type> = {
    additionalTypesForType: function(typeInformation: AlgebraicType.Type) { return []; },
    typeNameForType: typeNameForType,
    commentsForType: commentsForType,
  };

  return PluggableObjCFileCreation.fileWriteRequest(request, typeInfoProvider, wrappedPlugins);
}
