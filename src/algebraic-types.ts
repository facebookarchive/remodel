/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import AlgebraicType = require('./algebraic-type');
import AlgebraicTypeCreation = require('./algebraic-type-creation');
import AlgebraicTypeParser = require('./algebraic-type-parser');
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
import PathUtils = require('./path-utils');
import PluginInclusionUtils = require('./plugin-inclusion-utils');
import Promise = require('./promise');
import ReadFileUtils = require('./file-logged-sequence-read-utils');
import RequirePlugin = require('./require-plugin');
import WriteFileUtils = require('./file-logged-sequence-write-utils');
import path = require('./path');

interface AlgebraicTypeCreationContext {
  baseClassName:string;
  baseClassLibraryName:Maybe.Maybe<string>;
  diagnosticIgnores:List.List<string>;
  plugins:List.List<AlgebraicType.Plugin>;
  defaultIncludes:List.List<string>;
  prohibitPluginDirectives:Boolean;
}

interface PathAndTypeInfo {
  path: File.AbsoluteFilePath;
  typeInformation: AlgebraicType.Type;
}

const BASE_INCLUDES:List.List<string> = List.of(
  'AlgebraicTypeInitialization',
  'RMAssertNullability',
  'RMCopying',
  'RMDescription',
  'RMEquality',
  'RMInitNewUnavailable',
  'FunctionMatching'
);

const BASE_PLUGINS:List.List<string> = List.of(
  'algebraic-type-initialization',
  'assert-nullability',
  'assume-nonnull',
  'coding',
  'copying',
  'description',
  'equality',
  'init-new-unavailable',
  'use-cpp',
  'algebraic-type-function-matching',
  'algebraic-type-templated-matching'
);

function evaluateUnparsedAlgebraicTypeCreationRequest(request:ReadFileUtils.UnparsedObjectCreationRequest):Either.Either<Error.Error[], PathAndTypeInfo> {
  const parseResult:Either.Either<Error.Error[], AlgebraicType.Type> = AlgebraicTypeParser.parse(File.getContents(request.fileContents));
  return Either.map(function(foundType:AlgebraicType.Type) {
    return {path:request.path, typeInformation:foundType};
  }, parseResult);
}

function parseValues(either:Either.Either<Error.Error[], ReadFileUtils.UnparsedObjectCreationRequest>):Promise.Future<Logging.Context<Either.Either<Error.Error[], PathAndTypeInfo>>> {
  return Promise.munit(Logging.munit(Either.mbind(evaluateUnparsedAlgebraicTypeCreationRequest, either)));
}

function typeInformationContainingDefaultIncludes(typeInformation:AlgebraicType.Type, defaultIncludes:List.List<string>):AlgebraicType.Type {
  return {
    annotations:typeInformation.annotations,
    comments: typeInformation.comments,
    excludes: typeInformation.excludes,
    includes: PluginInclusionUtils.includesContainingDefaultIncludes(typeInformation.includes, typeInformation.excludes, defaultIncludes),
    libraryName: typeInformation.libraryName,
    name: typeInformation.name,
    typeLookups:typeInformation.typeLookups,
    subtypes: typeInformation.subtypes
  };
}

function processAlgebraicTypeCreationRequest(outputPath:Maybe.Maybe<File.AbsoluteFilePath>, future:Promise.Future<Either.Either<Error.Error[], AlgebraicTypeCreationContext>>, either:Either.Either<Error.Error[], PathAndTypeInfo>):Promise.Future<Logging.Context<Either.Either<Error.Error[], FileWriter.FileWriteRequest>>> {
  return Promise.map(function(creationContextEither:Either.Either<Error.Error[], AlgebraicTypeCreationContext>) {
    return Logging.munit(Either.mbind(function(pathAndTypeInfo:PathAndTypeInfo) {
      return Either.mbind(function(creationContext:AlgebraicTypeCreationContext) {
        if (creationContext.prohibitPluginDirectives && (pathAndTypeInfo.typeInformation.includes.length > 0 || pathAndTypeInfo.typeInformation.excludes.length > 0)) {
          return Either.Left<Error.Error[], FileWriter.FileWriteRequest>([{reason:'includes()/excludes() is disallowed with the --prohibit-plugin-directives flag'}])
        } else {
          const request:AlgebraicTypeCreation.Request = {
            diagnosticIgnores:creationContext.diagnosticIgnores,
            baseClassLibraryName:creationContext.baseClassLibraryName,
            baseClassName:creationContext.baseClassName,
            path:pathAndTypeInfo.path,
            outputPath:outputPath,
            typeInformation:typeInformationContainingDefaultIncludes(pathAndTypeInfo.typeInformation, creationContext.defaultIncludes)
          };

          return AlgebraicTypeCreation.fileWriteRequest(request, creationContext.plugins);
        }
      }, creationContextEither);
    }, either));
  }, future);
}

function pluginsFromPluginConfigs(pluginConfigs:List.List<Configuration.PluginConfig>):Either.Either<Error.Error[], List.List<AlgebraicType.Plugin>> {
  return List.foldr(function(soFar:Either.Either<Error.Error[], List.List<AlgebraicType.Plugin>>, config:Configuration.PluginConfig):Either.Either<Error.Error[], List.List<AlgebraicType.Plugin>> {
    return Either.mbind(function(list:List.List<AlgebraicType.Plugin>):Either.Either<Error.Error[], List.List<AlgebraicType.Plugin>> {
      return Either.map(function(maybePlugin:Maybe.Maybe<AlgebraicType.Plugin>):List.List<AlgebraicType.Plugin> {
        return Maybe.match(function(plugin:AlgebraicType.Plugin) {
                              return List.cons(plugin, list);
                            },function() {
                              return list;
                            }, maybePlugin);
                          }, RequirePlugin.requireAlgebraicTypePlugin(config.absolutePath));
    }, soFar);
  }, Either.Right<Error.Error[], List.List<AlgebraicType.Plugin>>(List.of<AlgebraicType.Plugin>()), pluginConfigs);
}

function getAlgebraicTypeCreationContext(currentWorkingDirectory:File.AbsoluteFilePath, parsedArgs:CommandLine.Arguments):Promise.Future<Either.Either<Error.Error[], AlgebraicTypeCreationContext>> {
  const findConfigFuture = FileFinder.findConfig('.algebraicTypeConfig', currentWorkingDirectory);
  return Promise.mbind(function(maybePath:Maybe.Maybe<File.AbsoluteFilePath>):Promise.Future<Either.Either<Error.Error[], AlgebraicTypeCreationContext>> {
    const configurationContext:Configuration.ConfigurationContext = {
      basePlugins: BASE_PLUGINS,
      baseIncludes: BASE_INCLUDES
    };
    const configFuture:Promise.Future<Either.Either<Error.Error[], Configuration.GenerationConfig>> = Configuration.generateConfig(maybePath, configurationContext);

    return Promise.map(function(either:Either.Either<Error.Error[], Configuration.GenerationConfig>):Either.Either<Error.Error[], AlgebraicTypeCreationContext> {
      return Either.match(
        function(error: Error.Error[]):Either.Either<Error.Error[], AlgebraicTypeCreationContext> {
          return Either.Left<Error.Error[], AlgebraicTypeCreationContext>(error);
        },
        function(configuration:Configuration.GenerationConfig):Either.Either<Error.Error[], AlgebraicTypeCreationContext> {
          const pluginsEither:Either.Either<Error.Error[], List.List<AlgebraicType.Plugin>> = pluginsFromPluginConfigs(configuration.pluginConfigs);
          return Either.map(function(plugins:List.List<AlgebraicType.Plugin>):AlgebraicTypeCreationContext {
            return {
              baseClassName:configuration.baseClassName,
              baseClassLibraryName:configuration.baseClassLibraryName,
              diagnosticIgnores:configuration.diagnosticIgnores,
              plugins:plugins,
              defaultIncludes:List.fromArray<string>(PluginInclusionUtils.includesContainingDefaultIncludes(parsedArgs.includes, parsedArgs.excludes, configuration.defaultIncludes)),
              prohibitPluginDirectives:parsedArgs.prohibitPluginDirectives,
            };
          }, pluginsEither);
        },
        either);
    }, configFuture);
  }, findConfigFuture);
}

function outputDirectory(directoryRunFrom:string, outputPath:string):Maybe.Maybe<File.AbsoluteFilePath> {
  if (outputPath === undefined || outputPath === "") {
    return Maybe.Nothing<File.AbsoluteFilePath>();  
  } else {
    return Maybe.Just<File.AbsoluteFilePath>(PathUtils.getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath(File.getAbsoluteFilePath(directoryRunFrom), outputPath));
  }
}

export function generate(directoryRunFrom:string, parsedArgs:CommandLine.Arguments):Promise.Future<WriteFileUtils.ConsoleOutputResults> {
    const requestedPath:File.AbsoluteFilePath = PathUtils.getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath(File.getAbsoluteFilePath(directoryRunFrom), parsedArgs.givenPath);
    const outputPath:Maybe.Maybe<File.AbsoluteFilePath> = outputDirectory(directoryRunFrom, parsedArgs.outputPath);

    const algebraicTypeCreationContextFuture = getAlgebraicTypeCreationContext(requestedPath, parsedArgs);

    const readFileSequence = ReadFileUtils.loggedSequenceThatReadsFiles(requestedPath, 'adtValue');

    const parsedSequence = LoggingSequenceUtils.mapLoggedSequence(readFileSequence,
                                                                  parseValues);

    const pluginProcessedSequence = LoggingSequenceUtils.mapLoggedSequence(parsedSequence,
                                                                           FunctionUtils.pApply2f3(outputPath, algebraicTypeCreationContextFuture, processAlgebraicTypeCreationRequest));

    return WriteFileUtils.evaluateObjectFileWriteRequestSequence(parsedArgs, pluginProcessedSequence);
}
