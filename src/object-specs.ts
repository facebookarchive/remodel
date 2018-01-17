/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import CommandLine = require('./commandline');
import Configuration = require('./configuration');
import Either = require('./either');
import Error = require('./error');
import File = require('./file');
import FileFinder = require('./file-finder');
import FileReader = require('./file-reader');
import FileWriter = require('./file-writer');
import FunctionUtils = require('./function-utils');
import List = require('./list');
import Logging = require('./logging');
import LoggingSequenceUtils = require('./logged-sequence-utils');
import Maybe = require('./maybe');
import ObjC = require('./objc');
import ReadFileUtils = require('./file-logged-sequence-read-utils');
import RequirePlugin = require('./require-plugin');
import PathUtils = require('./path-utils');
import PluginInclusionUtils = require('./plugin-inclusion-utils');
import Promise = require('./promise');
import ObjectSpec = require('./object-spec');
import ObjectSpecCreation = require('./object-spec-creation');
import ObjectSpecParser = require('./object-spec-parser');
import WriteFileUtils = require('./file-logged-sequence-write-utils');

interface ObjectSpecCreationContext {
  baseClassName:string;
  baseClassLibraryName:Maybe.Maybe<string>;
  diagnosticIgnores:List.List<string>;
  plugins:List.List<ObjectSpec.Plugin>;
  defaultIncludes:List.List<string>;
  prohibitEmbeddedIncludes:Boolean;
}

interface PathAndTypeInfo {
  path: File.AbsoluteFilePath;
  typeInformation: ObjectSpec.Type;
}

function evaluateUnparsedObjectSpecCreationRequest(request:ReadFileUtils.UnparsedObjectCreationRequest):Either.Either<Error.Error[], PathAndTypeInfo> {
  const parseResult:Either.Either<Error.Error[], ObjectSpec.Type> = ObjectSpecParser.parse(File.getContents(request.fileContents));
  return Either.match(function(errors:Error.Error[]) {
    return Either.Left<Error.Error[], PathAndTypeInfo>(errors.map(function(error:Error.Error) { return Error.Error('[' + File.getAbsolutePathString(request.path) + '] ' + Error.getReason(error)); }));
  }, function(foundType:ObjectSpec.Type) {
    return Either.Right<Error.Error[], PathAndTypeInfo>({path:request.path, typeInformation:foundType});
  }, parseResult);
}

function parseValues(either:Either.Either<Error.Error[], ReadFileUtils.UnparsedObjectCreationRequest>):Promise.Future<Logging.Context<Either.Either<Error.Error[], PathAndTypeInfo>>> {
  return Promise.munit(Logging.munit(Either.mbind(evaluateUnparsedObjectSpecCreationRequest, either)));
}

function typeInformationContainingDefaultIncludes(typeInformation:ObjectSpec.Type, defaultIncludes:List.List<string>):ObjectSpec.Type {
  return {
    annotations: typeInformation.annotations,
    attributes: typeInformation.attributes,
    comments: typeInformation.comments,
    excludes: typeInformation.excludes,
    includes: PluginInclusionUtils.includesContainingDefaultIncludes(typeInformation.includes, typeInformation.excludes, defaultIncludes),
    libraryName: typeInformation.libraryName,
    typeLookups: typeInformation.typeLookups,
    typeName: typeInformation.typeName
  };
}

function processObjectSpecCreationRequest(future:Promise.Future<Either.Either<Error.Error[], ObjectSpecCreationContext>>, either:Either.Either<Error.Error[], PathAndTypeInfo>):Promise.Future<Logging.Context<Either.Either<Error.Error[], FileWriter.FileWriteRequest>>> {
  return Promise.map(function(creationContextEither:Either.Either<Error.Error[], ObjectSpecCreationContext>) {
    return Logging.munit(Either.mbind(function(pathAndTypeInfo:PathAndTypeInfo) {
      return Either.mbind(function(creationContext:ObjectSpecCreationContext) {
        if (creationContext.prohibitEmbeddedIncludes && (pathAndTypeInfo.typeInformation.includes.length > 0 || pathAndTypeInfo.typeInformation.excludes.length > 0)) {
          return Either.Left<Error.Error[], FileWriter.FileWriteRequest>([{reason:'includes()/excludes() is disallowed with the --prohibit-embedded-includes flag'}])
        } else {
          const request:ObjectSpecCreation.Request = {
            diagnosticIgnores:creationContext.diagnosticIgnores,
            baseClassLibraryName:creationContext.baseClassLibraryName,
            baseClassName:creationContext.baseClassName,
            path:pathAndTypeInfo.path,
            typeInformation:typeInformationContainingDefaultIncludes(pathAndTypeInfo.typeInformation, creationContext.defaultIncludes)
          };

          return ObjectSpecCreation.fileWriteRequest(request, creationContext.plugins);
        }
      }, creationContextEither);
    }, either));
  }, future);
}
 
function pluginsFromPluginConfigs(pluginConfigs:List.List<Configuration.PluginConfig>):Either.Either<Error.Error[], List.List<ObjectSpec.Plugin>> {
  return List.foldr(function(soFar:Either.Either<Error.Error[], List.List<ObjectSpec.Plugin>>, config:Configuration.PluginConfig):Either.Either<Error.Error[], List.List<ObjectSpec.Plugin>> {
    return Either.mbind(function(list:List.List<ObjectSpec.Plugin>):Either.Either<Error.Error[], List.List<ObjectSpec.Plugin>> {
      return Either.map(function(maybePlugin:Maybe.Maybe<ObjectSpec.Plugin>):List.List<ObjectSpec.Plugin> {
        return Maybe.match(function(plugin:ObjectSpec.Plugin) {
                              return List.cons(plugin, list);
                            },function() {
                              return list;
                            }, maybePlugin);
                          }, RequirePlugin.requireObjectSpecPlugin(config.absolutePath));
    }, soFar);
  }, Either.Right<Error.Error[], List.List<ObjectSpec.Plugin>>(List.of<ObjectSpec.Plugin>()), pluginConfigs);
}

function getObjectSpecCreationContext(valueObjectConfigPathFuture:Promise.Future<Maybe.Maybe<File.AbsoluteFilePath>>, configurationContext:Configuration.ConfigurationContext,
  parsedArgs:CommandLine.Arguments):Promise.Future<Either.Either<Error.Error[], ObjectSpecCreationContext>> {
  return Promise.mbind(function(maybePath:Maybe.Maybe<File.AbsoluteFilePath>):Promise.Future<Either.Either<Error.Error[], ObjectSpecCreationContext>> {
    const configFuture:Promise.Future<Either.Either<Error.Error[], Configuration.GenerationConfig>> = Configuration.generateConfig(maybePath, configurationContext);
    return Promise.map(function(either:Either.Either<Error.Error[], Configuration.GenerationConfig>) {
      return Either.mbind(function(configuration:Configuration.GenerationConfig):Either.Either<Error.Error[], ObjectSpecCreationContext> {
        const pluginsEither = pluginsFromPluginConfigs(configuration.pluginConfigs);
        return Either.map(function(plugins:List.List<ObjectSpec.Plugin>):ObjectSpecCreationContext {
          return {
            baseClassName:configuration.baseClassName,
            baseClassLibraryName:configuration.baseClassLibraryName,
            diagnosticIgnores:configuration.diagnosticIgnores,
            plugins:plugins,
            defaultIncludes:List.fromArray<string>(PluginInclusionUtils.includesContainingDefaultIncludes(parsedArgs.includes, parsedArgs.excludes, configuration.defaultIncludes)),
            prohibitEmbeddedIncludes:parsedArgs.prohibitEmbeddedIncludes,
          };
        }, pluginsEither);
      }, either);
    }, configFuture);
  }, valueObjectConfigPathFuture);
}

function valueObjectConfigPathFuture(configFileName:string, requestedPath:File.AbsoluteFilePath, configPathFromArguments:string): Promise.Future<Maybe.Maybe<File.AbsoluteFilePath>> {
  var absoluteValueObjectConfigPath: Promise.Future<Maybe.Maybe<File.AbsoluteFilePath>>;
  if (configPathFromArguments === undefined) {
      absoluteValueObjectConfigPath = FileFinder.findConfig(configFileName, requestedPath);
  } else {
      absoluteValueObjectConfigPath = Promise.munit(Maybe.Just(File.getAbsoluteFilePath(configPathFromArguments)));
  }
  return absoluteValueObjectConfigPath;
}

export function generate(directoryRunFrom:string, extension:string, configFileName:string, optionalConfigPath:string, configurationContext:Configuration.ConfigurationContext, parsedArgs:CommandLine.Arguments):Promise.Future<WriteFileUtils.ConsoleOutputResults> {
    const requestedPath:File.AbsoluteFilePath = PathUtils.getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath(File.getAbsoluteFilePath(directoryRunFrom), parsedArgs.givenPath);

    const valueObjectCreationContextFuture = getObjectSpecCreationContext(valueObjectConfigPathFuture(configFileName, requestedPath, optionalConfigPath), configurationContext, parsedArgs);

    const readFileSequence = ReadFileUtils.loggedSequenceThatReadsFiles(requestedPath, extension);

    const parsedSequence = LoggingSequenceUtils.mapLoggedSequence(readFileSequence,
                                                                  parseValues);

    const pluginProcessedSequence = LoggingSequenceUtils.mapLoggedSequence(parsedSequence,
                                                                           FunctionUtils.pApplyf2(valueObjectCreationContextFuture, processObjectSpecCreationRequest));

    return WriteFileUtils.evaluateObjectFileWriteRequestSequence(parsedArgs, pluginProcessedSequence);
}
