/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

///<reference path='./type-defs/minimist.d.ts'/>

import List = require('./list');
import Logging = require('./logging');
import Maybe = require('./maybe');
import minimist = require('minimist');

export interface Arguments {
  givenPath:string;
  interestedLoggingTypes:List.List<Logging.LoggingType>;
  minimalLevel:number;
  dryRun:boolean;
}

const VERBOSE_FLAG:string = 'verbose';
const PERF_LOGGING_FLAG:string = 'perf-log';
const DEBUG_LOGGING_FLAG:string = 'debug';
const SILENT_LOGGING_FLAG:string = 'silent';
const DRY_RUN_FLAG:string = 'dry-run';

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

export function parseArgs(args:string[]):Maybe.Maybe<Arguments> {
  const opts = {boolean:[VERBOSE_FLAG, PERF_LOGGING_FLAG, DEBUG_LOGGING_FLAG, SILENT_LOGGING_FLAG, DRY_RUN_FLAG]};
  const parsedArgs = minimist(args, opts);
  if (parsedArgs._.length === 0) {
    return Maybe.Nothing<Arguments>();
  } else {
    return Maybe.Just({
      givenPath:parsedArgs._[0],
      interestedLoggingTypes:interestedTypesForArgs(parsedArgs),
      minimalLevel:parsedArgs[VERBOSE_FLAG] ? 1 : 10,
      dryRun:parsedArgs[DRY_RUN_FLAG]
    });
  }
}
