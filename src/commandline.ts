/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='./type-defs/minimist.d.ts'/>

import List = require('./list');
import Logging = require('./logging');
import Maybe = require('./maybe');
import minimist = require('minimist');

export interface Arguments {
  givenPath:string;
  adtConfigPath:string;
  valueObjectConfigPath:string;
  objectConfigPath:string;
  interestedLoggingTypes:List.List<Logging.LoggingType>;
  minimalLevel:number;
  dryRun:boolean;
  outputPath:string;
  includes:string[];
  excludes:string[];
  prohibitPluginDirectives:boolean;
  headersOnly:boolean;
  implOnly:boolean;
}

const VERBOSE_FLAG:string = 'verbose';
const PERF_LOGGING_FLAG:string = 'perf-log';
const DEBUG_LOGGING_FLAG:string = 'debug';
const SILENT_LOGGING_FLAG:string = 'silent';
const DRY_RUN_FLAG:string = 'dry-run';
const OUTPUT_PATH:string = 'output-path';
const INCLUDE:string = 'include';
const EXCLUDE:string = 'exclude';
const PROHIBIT_PLUGIN_DIRECTIVES_FLAG:string = 'prohibit-plugin-directives';
const HEADERS_ONLY:string = 'headers-only';
const IMPL_ONLY:string = 'implementation-only';

const ADT_CONFIG_PATH:string = 'adt-config-path';
const VALUE_OBJECT_CONFIG_PATH:string = 'value-object-config-path';
const OBJECT_CONFIG_PATH:string = 'object-config-path';

function interestedTypesForArgs(args:minimist.ParsedArgs):List.List<Logging.LoggingType> {
  if (args[SILENT_LOGGING_FLAG]) {
    return List.of<Logging.LoggingType>();
  } else {
    const baseList = List.of<Logging.LoggingType>();
    const baseListIncludingPerformance = args[PERF_LOGGING_FLAG] ? List.cons(Logging.LoggingType.performance, baseList) : baseList;
    const baseListIncludingDebug = args[DEBUG_LOGGING_FLAG] ? List.cons(Logging.LoggingType.debug, baseListIncludingPerformance) : baseListIncludingPerformance;
    const baseListIncludingError = List.cons(Logging.LoggingType.error, baseListIncludingDebug);
    return List.cons(Logging.LoggingType.info, baseListIncludingError);
  }
}

function sanitizeArrayArg(arg:any): string[] {
  if (typeof arg == "string") {
    return [arg];
  } else if (Array.isArray(arg)) {
    return arg;
  } else {
    return [];
  }
}

function sanitizeBooleanArg(arg:any): boolean {
  if (typeof arg == "boolean") {
    return arg;
  } else if (typeof arg == "string") {
    if (arg.lower() == "true" || arg.lower() == "yes" || arg.lower() == "y") {
      return true;
    } else {
      return false;
    }
  } else if (typeof arg == "number") {
    return arg == 1;
  } else {
    return false;
  }
}

export function parseArgs(args:string[]):Maybe.Maybe<Arguments> {
  const opts = {
    boolean:[VERBOSE_FLAG, PERF_LOGGING_FLAG, DEBUG_LOGGING_FLAG, SILENT_LOGGING_FLAG, DRY_RUN_FLAG, PROHIBIT_PLUGIN_DIRECTIVES_FLAG, HEADERS_ONLY, IMPL_ONLY],
    string:[ADT_CONFIG_PATH, VALUE_OBJECT_CONFIG_PATH, OBJECT_CONFIG_PATH, INCLUDE, EXCLUDE, OUTPUT_PATH],
  };
  const parsedArgs = minimist(args, opts);

  const sanitizedHeadersOnly = sanitizeBooleanArg(parsedArgs[HEADERS_ONLY]);
  const sanitizedImplOnly = sanitizeBooleanArg(parsedArgs[IMPL_ONLY]);

  if (parsedArgs._.length === 0) {
    return Maybe.Nothing<Arguments>();
  } else if (sanitizedHeadersOnly && sanitizedImplOnly) {
    console.log('Cannot specify both --headers-only and --implementation-only');
    return Maybe.Nothing<Arguments>();
  } else {
    return Maybe.Just({
      givenPath:parsedArgs._[0],
      adtConfigPath:parsedArgs[ADT_CONFIG_PATH],
      valueObjectConfigPath:parsedArgs[VALUE_OBJECT_CONFIG_PATH],
      objectConfigPath:parsedArgs[OBJECT_CONFIG_PATH],
      interestedLoggingTypes:interestedTypesForArgs(parsedArgs),
      minimalLevel:parsedArgs[VERBOSE_FLAG] ? 1 : 10,
      dryRun:parsedArgs[DRY_RUN_FLAG],
      outputPath:parsedArgs[OUTPUT_PATH],
      includes:sanitizeArrayArg(parsedArgs[INCLUDE]),
      excludes:sanitizeArrayArg(parsedArgs[EXCLUDE]),
      prohibitPluginDirectives:parsedArgs[PROHIBIT_PLUGIN_DIRECTIVES_FLAG],
      headersOnly:sanitizedHeadersOnly,
      implOnly:sanitizedImplOnly,
    });
  }
}
