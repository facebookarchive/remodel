/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Either = require('./either');
import Error = require('./error');
import File = require('./file');
import FileReader = require('./file-reader');
import FunctionUtils = require('./function-utils');
import List = require('./list');
import Map = require('./map');
import Maybe = require('./maybe');
import PathUtils = require('./path-utils');
import Promise = require('./promise');

export interface PluginConfig {
  absolutePath:File.AbsoluteFilePath;
}

export interface ConfigurationContext {
  basePlugins:List.List<string>;
  baseIncludes:List.List<string>;
}

interface ParsedBaseClassInformation {
  className:string;
  libraryName:Maybe.Maybe<string>;
}

interface PluginCollectionInfo {
  basePlugins:List.List<string>;
  customPluginPaths:List.List<string>;
}

export interface GenerationConfig {
  baseClassName:string;
  baseClassLibraryName:Maybe.Maybe<string>;
  diagnosticIgnores:List.List<string>;
  pluginConfigs:List.List<PluginConfig>;
  defaultIncludes:List.List<string>;
}

const CUSTOM_PLUGIN_PATHS = 'customPluginPaths';
const DEFAULT_INCLUDES_KEY = 'defaultIncludes';
const DEFAULT_EXCLUDES_KEY = 'defaultExcludes';
const BASE_CLASS_KEY = 'customBaseClass';
const BASE_CLASS_NAME_KEY = 'className';
const BASE_CLASS_LIBRARY_NAME_KEY = 'libraryName';
const DIAGNOSTIC_IGNORES = 'diagnosticIgnores';
const PATH_TO_PLUGINS_DIR = PathUtils.getAbsolutePathFromDirectoryAndRelativePath(File.getAbsoluteFilePath(__dirname), '/plugins');
const NSOBJECT_BASE_CLASS = {
  className: 'NSObject',
  libraryName: Maybe.Nothing<string>()
};

function concatString(soFar:string, thisOne:string):string {
  return soFar + thisOne;
}

function wrapInQuotes(str:string):string {
  return '"' + str + '"';
}

function safelyParsedJSON(str:string):any {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

function parseJson(str:string, errorMessage:string):Either.Either<Error.Error[], any> {
  const parsed = safelyParsedJSON(str);
  if (parsed) {
    return Either.Right<Error.Error[], any>(parsed);
  } else {
    return Either.Left<Error.Error[], any>([Error.Error(errorMessage)]);
  }
}

function parsedJsonToDefaultExcludesMap(parsed:any):Map.Map<string, string> {
  const defaultExcludes:string[] = parsed[DEFAULT_EXCLUDES_KEY] || [];
  return defaultExcludes.reduce(function(soFar:Map.Map<string, string>, defaultExclude:string) {
    return Map.insert(defaultExclude, defaultExclude, soFar);
  }, Map.Empty<string, string>());
}

function parsedJsonToDefaultIncludes(parsed:any):List.List<string> {
  const defaultIncludes:string[] = parsed[DEFAULT_INCLUDES_KEY] || [];
  return List.fromArray(defaultIncludes);
}

function parsedJsonToPluginCollectionInfo(basePlugins:List.List<string>, parsed:any):PluginCollectionInfo {
  const customPluginPaths = parsed[CUSTOM_PLUGIN_PATHS] || [];
  const customPluginPathsList = customPluginPaths.reduceRight(function(soFar:List.List<string>, thisPath:string) {
    return List.cons(thisPath, soFar);
  }, List.of<string>());
  const info:PluginCollectionInfo = {
    basePlugins: basePlugins,
    customPluginPaths: customPluginPathsList
  };
  return info;
}

function scriptConfigFromPluginCollectionInfo(configFilePath:File.AbsoluteFilePath, info:PluginCollectionInfo):List.List<PluginConfig> {
  const basePluginConfigs = List.map(builtinPluginPathToPluginConfig, info.basePlugins);
  const additionalPluginConfigs = List.map(FunctionUtils.pApplyf2(configFilePath, pluginConfigForAdditionalPlugin), info.customPluginPaths);
  return List.append(basePluginConfigs, additionalPluginConfigs);
}

function parsedJsonToDiagnosticIgnores(parsed:any):List.List<string> {
  const diagnosticIgnores:string[] = parsed[DIAGNOSTIC_IGNORES] || [];
  return List.fromArray(diagnosticIgnores);
}

function parsedJsonToBaseClass(parsed:any):ParsedBaseClassInformation {
  const paredBaseClassInfo:any = parsed[BASE_CLASS_KEY];
  if (paredBaseClassInfo && paredBaseClassInfo[BASE_CLASS_NAME_KEY]) {
    return {
      className: paredBaseClassInfo[BASE_CLASS_NAME_KEY],
      libraryName: paredBaseClassInfo[BASE_CLASS_LIBRARY_NAME_KEY] ? Maybe.Just(paredBaseClassInfo[BASE_CLASS_LIBRARY_NAME_KEY]) : Maybe.Nothing<string>()
    }
  } else {
    return NSOBJECT_BASE_CLASS;
  }
}

interface UniquesReductionTracker<T> {
  values:List.List<T>;
  seenValues:Map.Map<T, T>;
}

function uniqueValuesInList<T>(list:List.List<T>):List.List<T> {
  const tracker:UniquesReductionTracker<T> = List.foldr(function(currentReductionTracker:UniquesReductionTracker<T>, value:T):UniquesReductionTracker<T> {
    if (!Map.containsKey(value, currentReductionTracker.seenValues)) {
      return {
        values: List.cons(value, currentReductionTracker.values),
        seenValues: Map.insert(value, value, currentReductionTracker.seenValues)
      };
    } else {
      return currentReductionTracker;
    }
  }, {
    values: List.of<T>(),
    seenValues: Map.Empty<T, T>()
  }, list);
  return tracker.values;
}

function includesWithAdditionalIncludes(includes:List.List<string>, includesToAdd:List.List<string>):List.List<string> {
  const combinedIncludes:List.List<string> = List.append(includes, includesToAdd);
  return uniqueValuesInList(combinedIncludes);
}

function includesApplyingExcludesMap(includes:List.List<string>, defaultExcludesMap:Map.Map<string, string>):List.List<string> {
  return List.filter(function(include:string):boolean {
    return !Map.containsKey(include, defaultExcludesMap);
  }, includes);
}

function parse(configurationContext:ConfigurationContext, configFilePath:File.AbsoluteFilePath, contents:File.Contents):Either.Either<Error.Error[], GenerationConfig> {
  const parsedJson = parseJson(File.getContents(contents), 'Configuration file is malformed and unparseable');
  const baseClassEither = Either.map(parsedJsonToBaseClass, parsedJson);
  const defaultIncludesEither = Either.map(parsedJsonToDefaultIncludes, parsedJson);
  const defaultExcludesEither = Either.map(parsedJsonToDefaultExcludesMap, parsedJson);
  const diagnosticIgnoresEither = Either.map(parsedJsonToDiagnosticIgnores, parsedJson);
  const pluginCollectionEither = Either.map(FunctionUtils.pApplyf2(configurationContext.basePlugins, parsedJsonToPluginCollectionInfo), parsedJson);
  const scriptConfigEither = Either.map(FunctionUtils.pApplyf2(configFilePath, scriptConfigFromPluginCollectionInfo), pluginCollectionEither);
  return Either.mbind(function(baseClass:ParsedBaseClassInformation) {
    return Either.mbind(function(pluginConfigs:List.List<PluginConfig>) {
      return Either.mbind(function(diagnosticIgnores:List.List<string>) {
        return Either.mbind(function(defaultIncludes:List.List<string>) {
          return Either.map(function(defaultExcludesMap:Map.Map<string, string>):GenerationConfig {
            const combinedIncludes = includesWithAdditionalIncludes(configurationContext.baseIncludes, defaultIncludes);
            return {
              baseClassName:baseClass.className,
              baseClassLibraryName:baseClass.libraryName,
              diagnosticIgnores:diagnosticIgnores,
              pluginConfigs:pluginConfigs,
              defaultIncludes:includesApplyingExcludesMap(combinedIncludes, defaultExcludesMap)
            };
          }, defaultExcludesEither);
        }, defaultIncludesEither);
      }, diagnosticIgnoresEither);
    }, scriptConfigEither);
  }, baseClassEither);
}

function builtinPluginPathToPluginConfig(path:string):PluginConfig {
  const config:PluginConfig = {
    absolutePath: PathUtils.getAbsolutePathFromDirectoryAndRelativePath(PATH_TO_PLUGINS_DIR, path)
  };

  return config;
}

function pluginConfigForAdditionalPlugin(configFilePath:File.AbsoluteFilePath, relativePath:string) {
  const config:PluginConfig = {
    absolutePath:PathUtils.getAbsolutePathFromDirectoryAndRelativePath(PathUtils.getDirectoryPathFromAbsolutePath(configFilePath), relativePath)
  };
  return config;
}

export function generateConfig(maybePath:Maybe.Maybe<File.AbsoluteFilePath>, configurationContext:ConfigurationContext):Promise.Future<Either.Either<Error.Error[], GenerationConfig>> {
  return Maybe.match(function(path:File.AbsoluteFilePath):Promise.Future<Either.Either<Error.Error[], GenerationConfig>> {
    return Promise.map(function(either:Either.Either<Error.Error[], File.Contents>):Either.Either<Error.Error[], GenerationConfig> {
      return Either.mbind(FunctionUtils.pApply2f3(configurationContext, path, parse), either);
    }, FileReader.read(path));
  }, function():Promise.Future<Either.Either<Error.Error[], GenerationConfig>> {
    const pluginConfigs = List.map(builtinPluginPathToPluginConfig, configurationContext.basePlugins);
    return Promise.munit(Either.Right<Error.Error[], GenerationConfig>({
      baseClassName:'NSObject',
      baseClassLibraryName:Maybe.Nothing<string>(),
      diagnosticIgnores:List.of<string>(),
      pluginConfigs:pluginConfigs,
      defaultIncludes:configurationContext.baseIncludes
    }));
  }, maybePath);
}

/**
  Exported for tests
*/
export function parseConfig(contents:File.Contents, configFilePath:File.AbsoluteFilePath, configurationContext:ConfigurationContext):Either.Either<Error.Error[], GenerationConfig> {
  return parse(configurationContext, configFilePath, contents);
}
