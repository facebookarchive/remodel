/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
      const args: string[] = [];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Nothing<CommandLine.Arguments>();

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('gives the default levels for everything when only a path is provided', function() {
      const args: string[] = ['project/to/generate'];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: [],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('decreases the minimal level to one when --verbose is provided', function() {
      const args: string[] = ['--verbose', 'project/to/generate'];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 1,
        dryRun: false,
        outputPath: undefined,
        includes: [],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes perf logging when --perf-log is provided', function() {
      const args: string[] = ['--perf-log', 'project/to/generate'];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
          Logging.LoggingType.performance,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: [],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes debug logging when --debug is provided', function() {
      const args: string[] = ['--debug', 'project/to/generate'];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
          Logging.LoggingType.debug,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: [],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes dry run when --dry-run is provided', function() {
      const args: string[] = ['--dry-run', 'project/to/generate'];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 10,
        dryRun: true,
        outputPath: undefined,
        includes: [],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes no logging info when --silent is provided', function() {
      const args: string[] = [
        '--debug',
        '--perf-log',
        '--silent',
        'project/to/generate',
      ];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of<Logging.LoggingType>(),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: [],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes valueObjectConfigPath', function() {
      const args: string[] = [
        'project/to/generate',
        '--value-object-config-path',
        'path/to/valueObjectConfig',
      ];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: 'path/to/valueObjectConfig',
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: [],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes objectConfigPath', function() {
      const args: string[] = [
        'project/to/generate',
        '--object-config-path',
        'path/to/objectConfig',
      ];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: 'path/to/objectConfig',
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: [],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes an output directory when --output-path is passed', function() {
      const args: string[] = [
        '--output-path=path/to/output',
        'project/to/generate',
      ];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: 'path/to/output',
        includes: [],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes a list of includes and excludes if specified', function() {
      const args: string[] = [
        'project/to/generate',
        '--include=PluginOne',
        '--include=PluginTwo',
        '--exclude=PluginThree',
      ];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: ['PluginOne', 'PluginTwo'],
        excludes: ['PluginThree'],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('sets flag to prohibit embedded plugin includes/excludes if passed flag', function() {
      const args: string[] = [
        'project/to/generate',
        '--prohibit-plugin-directives',
      ];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: [],
        excludes: [],
        prohibitPluginDirectives: true,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('returns nothing when both --headers-only and implementation-only are passed', function() {
      const args: string[] = ['--headers-only', '--implementation-only'];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Nothing<CommandLine.Arguments>();

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('includes a list of things to emit', function() {
      const args: string[] = [
        'project/to/generate',
        '--include=PluginOne',
        '--include=PluginTwo',
        '--emit=PluginOne',
        '--emit=object',
      ];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: ['PluginOne', 'PluginTwo'],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: ['PluginOne', 'object'],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('emitting "all" ensures empty output list, even if other emit options are present', function() {
      const args: string[] = [
        'project/to/generate',
        '--include=PluginOne',
        '--include=PluginTwo',
        '--emit=all',
        '--emit=foo',
      ];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Just<CommandLine.Arguments>({
        givenPath: 'project/to/generate',
        adtConfigPath: undefined,
        valueObjectConfigPath: undefined,
        objectConfigPath: undefined,
        interestedLoggingTypes: List.of(
          Logging.LoggingType.info,
          Logging.LoggingType.error,
        ),
        minimalLevel: 10,
        dryRun: false,
        outputPath: undefined,
        includes: ['PluginOne', 'PluginTwo'],
        excludes: [],
        prohibitPluginDirectives: false,
        outputFlags: {
          emitHeaders: true,
          emitImplementations: true,
          outputList: [],
        },
      });

      expect(parsedArgs).toEqualJSON(expectedResult);
    });

    it('returns nothing when only --verbose is provided', function() {
      const args: string[] = ['--verbose'];
      const parsedArgs: Maybe.Maybe<
        CommandLine.Arguments
      > = CommandLine.parseArgs(args);

      const expectedResult = Maybe.Nothing<CommandLine.Arguments>();

      expect(parsedArgs).toEqualJSON(expectedResult);
    });
  });
});
