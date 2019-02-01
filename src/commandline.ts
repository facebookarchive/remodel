/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='./type-defs/minimist.d.ts'/>

import * as List from './list';
import * as Logging from './logging';
import * as Maybe from './maybe';
import * as minimist from 'minimist';
import * as OutputControl from './output-control';

export interface Arguments {
  givenPaths: string[];
  adtConfigPath: string;
  valueObjectConfigPath: string;
  objectConfigPath: string;
  interestedLoggingTypes: List.List<Logging.LoggingType>;
  minimalLevel: number;
  dryRun: boolean;
  outputPath: string;
  includes: string[];
  excludes: string[];
  prohibitPluginDirectives: boolean;
  outputFlags: OutputControl.OutputFlags;
}

const VERBOSE_FLAG: string = 'verbose';
const PERF_LOGGING_FLAG: string = 'perf-log';
const DEBUG_LOGGING_FLAG: string = 'debug';
const SILENT_LOGGING_FLAG: string = 'silent';
const DRY_RUN_FLAG: string = 'dry-run';
const OUTPUT_PATH: string = 'output-path';
const INCLUDE: string = 'include';
const EXCLUDE: string = 'exclude';
const PROHIBIT_PLUGIN_DIRECTIVES_FLAG: string = 'prohibit-plugin-directives';
const EMIT_HEADER: string = 'emit-header';
const HEADERS_ONLY: string = 'headers-only';
const IMPL_ONLY: string = 'implementations-only';
const EMIT: string = 'emit';

const ADT_CONFIG_PATH: string = 'adt-config-path';
const VALUE_OBJECT_CONFIG_PATH: string = 'value-object-config-path';
const OBJECT_CONFIG_PATH: string = 'object-config-path';

function interestedTypesForArgs(
  args: minimist.ParsedArgs,
): List.List<Logging.LoggingType> {
  if (args[SILENT_LOGGING_FLAG]) {
    return List.of<Logging.LoggingType>();
  } else {
    const baseList = List.of<Logging.LoggingType>();
    const baseListIncludingPerformance = args[PERF_LOGGING_FLAG]
      ? List.cons(Logging.LoggingType.performance, baseList)
      : baseList;
    const baseListIncludingDebug = args[DEBUG_LOGGING_FLAG]
      ? List.cons(Logging.LoggingType.debug, baseListIncludingPerformance)
      : baseListIncludingPerformance;
    const baseListIncludingError = List.cons(
      Logging.LoggingType.error,
      baseListIncludingDebug,
    );
    return List.cons(Logging.LoggingType.info, baseListIncludingError);
  }
}

function sanitizeArrayArg(arg: any): string[] {
  if (typeof arg == 'string') {
    return [arg];
  } else if (Array.isArray(arg)) {
    return arg;
  } else {
    return [];
  }
}

function findInArray(
  list: string[],
  findFunc: (value: string) => boolean,
): boolean {
  var item;
  for (item of list) {
    if (findFunc(item)) {
      return true;
    }
  }
  return false;
}

function sanitizeEmitOption(arg: any): string[] {
  const sanitized = sanitizeArrayArg(arg);
  if (
    findInArray(sanitized, function(element) {
      return element.toLowerCase() == 'all';
    }) === true
  ) {
    return [];
  } else {
    return sanitized;
  }
}

function sanitizeBooleanArg(arg: any, defaultValue: boolean): boolean {
  if (typeof arg == 'boolean') {
    return arg;
  } else if (typeof arg == 'string') {
    if (
      arg.toLowerCase() == 'true' ||
      arg.toLowerCase() == 'yes' ||
      arg.toLowerCase() == 'y'
    ) {
      return true;
    } else {
      return false;
    }
  } else if (typeof arg == 'number') {
    return arg == 1;
  } else {
    return defaultValue;
  }
}

export function parseArgs(args: string[]): Maybe.Maybe<Arguments> {
  const opts = {
    boolean: [
      VERBOSE_FLAG,
      PERF_LOGGING_FLAG,
      DEBUG_LOGGING_FLAG,
      SILENT_LOGGING_FLAG,
      DRY_RUN_FLAG,
      PROHIBIT_PLUGIN_DIRECTIVES_FLAG,
      HEADERS_ONLY,
      IMPL_ONLY,
    ],
    string: [
      ADT_CONFIG_PATH,
      VALUE_OBJECT_CONFIG_PATH,
      OBJECT_CONFIG_PATH,
      INCLUDE,
      EXCLUDE,
      OUTPUT_PATH,
      EMIT,
    ],
    default: {[HEADERS_ONLY]: false, [IMPL_ONLY]: false},
  };
  const parsedArgs = minimist(args, opts);

  const sanitizedHeadersOnly = sanitizeBooleanArg(
    parsedArgs[HEADERS_ONLY],
    false,
  );
  const sanitizedImplsOnly = sanitizeBooleanArg(parsedArgs[IMPL_ONLY], false);

  if (parsedArgs._.length === 0) {
    return Maybe.Nothing<Arguments>();
  } else if (sanitizedHeadersOnly && sanitizedImplsOnly) {
    console.log(
      'Error: %s and %s cannot both be set simultaneously',
      HEADERS_ONLY,
      IMPL_ONLY,
    );
    return Maybe.Nothing<Arguments>();
  } else {
    return Maybe.Just({
      givenPaths: parsedArgs._,
      adtConfigPath: parsedArgs[ADT_CONFIG_PATH],
      valueObjectConfigPath: parsedArgs[VALUE_OBJECT_CONFIG_PATH],
      objectConfigPath: parsedArgs[OBJECT_CONFIG_PATH],
      interestedLoggingTypes: interestedTypesForArgs(parsedArgs),
      minimalLevel: parsedArgs[VERBOSE_FLAG] ? 1 : 10,
      dryRun: parsedArgs[DRY_RUN_FLAG],
      outputPath: parsedArgs[OUTPUT_PATH],
      includes: sanitizeArrayArg(parsedArgs[INCLUDE]),
      excludes: sanitizeArrayArg(parsedArgs[EXCLUDE]),
      prohibitPluginDirectives: parsedArgs[PROHIBIT_PLUGIN_DIRECTIVES_FLAG],
      outputFlags: {
        emitHeaders: !sanitizedImplsOnly,
        emitImplementations: !sanitizedHeadersOnly,
        outputList: sanitizeEmitOption(parsedArgs[EMIT]),
      },
    });
  }
}
