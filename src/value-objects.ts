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
import ValueObject = require('./value-object');
import ValueObjectCreation = require('./value-object-creation');
import ValueObjectParser = require('./value-object-parser');
import WriteFileUtils = require('./file-logged-sequence-write-utils');

const BASE_INCLUDES:List.List<string> = List.of(
  'RMCopying',
  'RMDescription',
  'RMEquality',
  'RMImmutableProperties'
);

const BASE_PLUGINS:List.List<string> = List.of(
  'builder',
  'coding',
  'copying',
  'description',
  'equality',
  'fetch-status',
  'immutable-properties',
  'use-cpp'
);

interface ValueObjectCreationContext {
  baseClassName:string;
  baseClassLibraryName:Maybe.Maybe<string>;
  diagnosticIgnores:List.List<string>;
  plugins:List.List<ValueObject.Plugin>;
  defaultIncludes:List.List<string>;
}

interface PathAndTypeInfo {
  path: File.AbsoluteFilePath;
  typeInformation: ValueObject.Type;
}

function evaluateUnparsedValueObjectCreationRequest(request:ReadFileUtils.UnparsedObjectCreationRequest):Either.Either<Error.Error[], PathAndTypeInfo> {
  const parseResult:Either.Either<Error.Error[], ValueObject.Type> = ValueObjectParser.parse(File.getContents(request.fileContents));
  return Either.match(function(errors:Error.Error[]) {
    return Either.Left<Error.Error[], PathAndTypeInfo>(errors.map(function(error:Error.Error) { return Error.Error('[' + File.getAbsolutePathString(request.path) + '] ' + Error.getReason(error)); }));
  }, function(foundType:ValueObject.Type) {
    return Either.Right<Error.Error[], PathAndTypeInfo>({path:request.path, typeInformation:foundType});
  }, parseResult);
}

function parseValues(either:Either.Either<Error.Error[], ReadFileUtils.UnparsedObjectCreationRequest>):Promise.Future<Logging.Context<Either.Either<Error.Error[], PathAndTypeInfo>>> {
  return Promise.munit(Logging.munit(Either.mbind(evaluateUnparsedValueObjectCreationRequest, either)));
}

function typeInformationContainingDefaultIncludes(typeInformation:ValueObject.Type, defaultIncludes:List.List<string>):ValueObject.Type {
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

function processValueObjectCreationRequest(future:Promise.Future<Either.Either<Error.Error[], ValueObjectCreationContext>>, either:Either.Either<Error.Error[], PathAndTypeInfo>):Promise.Future<Logging.Context<Either.Either<Error.Error[], FileWriter.FileWriteRequest>>> {
  return Promise.map(function(creationContextEither:Either.Either<Error.Error[], ValueObjectCreationContext>) {
    return Logging.munit(Either.mbind(function(pathAndTypeInfo:PathAndTypeInfo) {
      return Either.mbind(function(creationContext:ValueObjectCreationContext) {
        const request:ValueObjectCreation.Request = {
          diagnosticIgnores:creationContext.diagnosticIgnores,
          baseClassLibraryName:creationContext.baseClassLibraryName,
          baseClassName:creationContext.baseClassName,
          path:pathAndTypeInfo.path,
          typeInformation:typeInformationContainingDefaultIncludes(pathAndTypeInfo.typeInformation, creationContext.defaultIncludes)
        };

        return ValueObjectCreation.fileWriteRequest(request, creationContext.plugins);
      }, creationContextEither);
    }, either));
  }, future);
}

function pluginsFromPluginConfigs(pluginConfigs:List.List<Configuration.PluginConfig>):Either.Either<Error.Error[], List.List<ValueObject.Plugin>> {
  return List.foldr(function(soFar:Either.Either<Error.Error[], List.List<ValueObject.Plugin>>, config:Configuration.PluginConfig):Either.Either<Error.Error[], List.List<ValueObject.Plugin>> {
    return Either.mbind(function(list:List.List<ValueObject.Plugin>):Either.Either<Error.Error[], List.List<ValueObject.Plugin>> {
      return Either.map(function(maybePlugin:Maybe.Maybe<ValueObject.Plugin>):List.List<ValueObject.Plugin> {
        return Maybe.match(function(plugin:ValueObject.Plugin) {
                              return List.cons(plugin, list);
                            },function() {
                              return list;
                            }, maybePlugin);
                          }, RequirePlugin.requireValueObjectPlugin(config.absolutePath));
    }, soFar);
  }, Either.Right<Error.Error[], List.List<ValueObject.Plugin>>(List.of<ValueObject.Plugin>()), pluginConfigs);
}

function getValueObjectCreationContext(currentWorkingDirectory:File.AbsoluteFilePath):Promise.Future<Either.Either<Error.Error[], ValueObjectCreationContext>> {
  const findConfigFuture = FileFinder.findConfig('.valueObjectConfig', currentWorkingDirectory);
  return Promise.mbind(function(maybePath:Maybe.Maybe<File.AbsoluteFilePath>):Promise.Future<Either.Either<Error.Error[], ValueObjectCreationContext>> {
    const configurationContext:Configuration.ConfigurationContext = {
      basePlugins: BASE_PLUGINS,
      baseIncludes: BASE_INCLUDES
    };
    const configFuture:Promise.Future<Either.Either<Error.Error[], Configuration.GenerationConfig>> = Configuration.generateConfig(maybePath, configurationContext);
    return Promise.map(function(either:Either.Either<Error.Error[], Configuration.GenerationConfig>) {
      return Either.mbind(function(configuration:Configuration.GenerationConfig):Either.Either<Error.Error[], ValueObjectCreationContext> {
        const pluginsEither = pluginsFromPluginConfigs(configuration.pluginConfigs);
        return Either.map(function(plugins:List.List<ValueObject.Plugin>):ValueObjectCreationContext {
          return {
            baseClassName:configuration.baseClassName,
            baseClassLibraryName:configuration.baseClassLibraryName,
            diagnosticIgnores:configuration.diagnosticIgnores,
            plugins:plugins,
            defaultIncludes:configuration.defaultIncludes
          };
        }, pluginsEither);
      }, either);
    }, configFuture);
  }, findConfigFuture);
}

export function generate(directoryRunFrom:string, parsedArgs:CommandLine.Arguments):Promise.Future<WriteFileUtils.ConsoleOutputResults> {
    const requestedPath:File.AbsoluteFilePath = PathUtils.getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath(File.getAbsoluteFilePath(directoryRunFrom), parsedArgs.givenPath);

    const valueObjectCreationContextFuture = getValueObjectCreationContext(requestedPath);

    const readFileSequence = ReadFileUtils.loggedSequenceThatReadsFiles(requestedPath, 'value');

    const parsedSequence = LoggingSequenceUtils.mapLoggedSequence(readFileSequence,
                                                                  parseValues);

    const pluginProcessedSequence = LoggingSequenceUtils.mapLoggedSequence(parsedSequence,
                                                                           FunctionUtils.pApplyf2(valueObjectCreationContextFuture, processValueObjectCreationRequest));

    return WriteFileUtils.evaluateObjectFileWriteRequestSequence(parsedArgs, pluginProcessedSequence);
}
