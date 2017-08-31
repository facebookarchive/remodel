/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import CommandLine = require('../commandline');
import List = require('../list');
import Logging = require('../logging');
import Maybe = require('../maybe');

describe('CommandLine', function() {
  describe('#parseArgs', function() {
    it('returns an error when no arguments are passed in', function() {
      const args:string[] = [];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Nothing<CommandLine.Arguments>();

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('gives the default levels for everything when only a path is provided', function() {
      const args:string[] = ['project/to/generate'];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath:'project/to/generate',
        adtConfigPath:undefined,
        valueObjectConfigPath:undefined,
        objectConfigPath:undefined,
        interestedLoggingTypes:List.of(Logging.LoggingType.info, Logging.LoggingType.error),
        minimalLevel:10,
        dryRun: false
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('decreases the minimal level to one when --verbose is provided', function() {
      const args:string[] = ['--verbose', 'project/to/generate'];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath:'project/to/generate',
        adtConfigPath:undefined,
        valueObjectConfigPath:undefined,
        objectConfigPath:undefined,
        interestedLoggingTypes:List.of(Logging.LoggingType.info, Logging.LoggingType.error),
        minimalLevel:1,
        dryRun:false
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes perf logging when --perf-log is provided', function() {
      const args:string[] = ['--perf-log', 'project/to/generate'];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath:'project/to/generate',
        adtConfigPath:undefined,
        valueObjectConfigPath:undefined,
        objectConfigPath:undefined,
        interestedLoggingTypes:List.of(Logging.LoggingType.info, Logging.LoggingType.error, Logging.LoggingType.performance),
        minimalLevel:10,
        dryRun:false
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes debug logging when --debug is provided', function() {
      const args:string[] = ['--debug', 'project/to/generate'];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath:'project/to/generate',
        adtConfigPath:undefined,
        valueObjectConfigPath:undefined,
        objectConfigPath:undefined,
        interestedLoggingTypes:List.of(Logging.LoggingType.info, Logging.LoggingType.error, Logging.LoggingType.debug),
        minimalLevel:10,
        dryRun:false
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes dry run when --dry-run is provided', function() {
      const args:string[] = ['--dry-run', 'project/to/generate'];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath:'project/to/generate',
        adtConfigPath:undefined,
        valueObjectConfigPath:undefined,
        objectConfigPath:undefined,
        interestedLoggingTypes:List.of(Logging.LoggingType.info, Logging.LoggingType.error),
        minimalLevel:10,
        dryRun:true
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes no logging info when --silent is provided', function() {
      const args:string[] = ['--debug', '--perf-log', '--silent', 'project/to/generate'];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath:'project/to/generate',
        adtConfigPath:undefined,
        valueObjectConfigPath:undefined,
        objectConfigPath:undefined,
        interestedLoggingTypes:List.of<Logging.LoggingType>(),
        minimalLevel:10,
        dryRun:false
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes valueObjectConfigPath', function() {
      const args:string[] = ['project/to/generate', '--value-object-config-path', 'path/to/valueObjectConfig'];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath:'project/to/generate',
        adtConfigPath:undefined,
        valueObjectConfigPath:'path/to/valueObjectConfig',
        objectConfigPath:undefined,
        interestedLoggingTypes:List.of(Logging.LoggingType.info, Logging.LoggingType.error),
        minimalLevel:10,
        dryRun: false
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes objectConfigPath', function() {
      const args:string[] = ['project/to/generate', '--object-config-path', 'path/to/objectConfig'];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath:'project/to/generate',
        adtConfigPath:undefined,
        valueObjectConfigPath:undefined,
        objectConfigPath:'path/to/objectConfig',
        interestedLoggingTypes:List.of(Logging.LoggingType.info, Logging.LoggingType.error),
        minimalLevel:10,
        dryRun: false
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('returns nothing when only --verbose is provided', function() {
      const args:string[] = ['--verbose'];
      const parsedArgs:Maybe.Maybe<CommandLine.Arguments> = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Nothing<CommandLine.Arguments>();

      expect(parsedArgs).toEqualJSON(expectedResult);
    });
  });
});
