/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import List = require('../list');
import Logging = require('../logging');

describe('Logging', function() {
  describe('#evaluate', function() {
    it(
      'should call the logger when the logging context was created with ' +
        'a debug and it is interested in that and it has a level greater ' +
        'than the min',
      function() {
        const context: Logging.Context<number> = Logging.Debug(
          8,
          'Something',
          3,
        );
        var wasCalled: boolean = false;
        const logger: Logging.Logger = {
          interestedLoggingTypes: List.of(Logging.LoggingType.debug),
          minimalLevel: 5,
          processLog: function(
            type: Logging.LoggingType,
            time: Date,
            info: string,
          ) {
            expect(type).toEqualJSON(Logging.LoggingType.debug);
            expect(info).toEqualJSON('Something');
            wasCalled = true;
          },
        };

        Logging.evaluate(logger, context);

        expect(wasCalled).toBe(true);
      },
    );

    it(
      'should not call the logger when the logging context was created with ' +
        'a debug and it is interested in that and but it has a level less ' +
        'than the min',
      function() {
        const context: Logging.Context<number> = Logging.Debug(
          1,
          'Something',
          3,
        );
        var wasCalled: boolean = false;
        const logger: Logging.Logger = {
          interestedLoggingTypes: List.of(Logging.LoggingType.debug),
          minimalLevel: 5,
          processLog: function(
            type: Logging.LoggingType,
            time: Date,
            info: string,
          ) {
            wasCalled = true;
          },
        };

        Logging.evaluate(logger, context);

        expect(wasCalled).toBe(false);
      },
    );

    it(
      'should call the logger when the logging context was created with ' +
        'a debug and it is interested in that and it has a less than the ' +
        'min',
      function() {
        const context: Logging.Context<number> = Logging.Debug(
          5,
          'Something',
          3,
        );
        var wasCalled: boolean = false;
        const logger: Logging.Logger = {
          interestedLoggingTypes: List.of(Logging.LoggingType.debug),
          minimalLevel: 5,
          processLog: function(
            type: Logging.LoggingType,
            time: Date,
            info: string,
          ) {
            expect(type).toEqualJSON(Logging.LoggingType.debug);
            expect(info).toEqualJSON('Something');
            wasCalled = true;
          },
        };

        Logging.evaluate(logger, context);

        expect(wasCalled).toBe(true);
      },
    );

    it(
      'should call the logger when the logging context was created with ' +
        'a debug and it is interested in that and other things and it has a ' +
        'priority greater than the min ',
      function() {
        const context: Logging.Context<number> = Logging.Debug(
          5,
          'Something',
          3,
        );
        var wasCalled: boolean = false;
        const logger: Logging.Logger = {
          interestedLoggingTypes: List.of(
            Logging.LoggingType.debug,
            Logging.LoggingType.info,
          ),
          minimalLevel: 3,
          processLog: function(
            type: Logging.LoggingType,
            time: Date,
            info: string,
          ) {
            expect(type).toEqualJSON(Logging.LoggingType.debug);
            expect(info).toEqualJSON('Something');
            wasCalled = true;
          },
        };

        Logging.evaluate(logger, context);

        expect(wasCalled).toBe(true);
      },
    );

    it(
      'should call the logger when the logging context was created with ' +
        'a debug and it is interested other things even if it has a ' +
        'priority greater than the min ',
      function() {
        const context: Logging.Context<number> = Logging.Debug(
          5,
          'Something',
          3,
        );
        var wasCalled: boolean = false;
        const logger: Logging.Logger = {
          interestedLoggingTypes: List.of(
            Logging.LoggingType.performance,
            Logging.LoggingType.info,
          ),
          minimalLevel: 3,
          processLog: function(
            type: Logging.LoggingType,
            time: Date,
            info: string,
          ) {
            wasCalled = true;
          },
        };

        Logging.evaluate(logger, context);

        expect(wasCalled).toBe(false);
      },
    );
  });

  describe('#map', function() {
    it(
      'maps the value of the context to the result of calling the function ' +
        'with the current value without affecting the logged info',
      function() {
        const context: Logging.Context<number> = Logging.Debug(
          8,
          'Something',
          3,
        );
        const mappedContext: Logging.Context<string> = Logging.map(function(
          num: number,
        ) {
          return num.toString();
        },
        context);
        const actualValue: string = Logging.getValue(mappedContext);

        const expectedValue: string = '3';

        expect(actualValue).toBe(expectedValue);
      },
    );
  });

  describe('#mbind', function() {
    it(
      'binds the value of the context to the result of calling the function ' +
        'with the current value',
      function() {
        const context: Logging.Context<number> = Logging.Debug(
          8,
          'Something',
          3,
        );
        const newContext: Logging.Context<string> = Logging.mbind(function(
          num: number,
        ) {
          return Logging.Debug(4, 'Something Else', num.toString());
        },
        context);
        const actualValue: string = Logging.getValue(newContext);

        const expectedValue: string = '3';

        expect(actualValue).toBe(expectedValue);
      },
    );

    it(
      'binds and combines both the logging contexts when the given logger ' +
        'is interested in both events',
      function() {
        const context: Logging.Context<number> = Logging.Debug(
          8,
          'Something',
          3,
        );
        const newContext: Logging.Context<string> = Logging.mbind(function(
          num: number,
        ) {
          return Logging.Info(4, 'Something Else', num.toString());
        },
        context);

        const calledWith = [];
        const logger: Logging.Logger = {
          interestedLoggingTypes: List.of(
            Logging.LoggingType.debug,
            Logging.LoggingType.info,
          ),
          minimalLevel: 1,
          processLog: function(
            type: Logging.LoggingType,
            time: Date,
            info: string,
          ) {
            calledWith.push({loggingType: type, info: info});
          },
        };

        Logging.evaluate(logger, newContext);

        const expectedCalledWith = [
          {loggingType: Logging.LoggingType.debug, info: 'Something'},
          {loggingType: Logging.LoggingType.info, info: 'Something Else'},
        ];

        expect(calledWith).toEqualJSON(expectedCalledWith);
      },
    );

    it(
      'binds and combines both logging contexts but it does not log the event ' +
        'the passed logger is not interested in',
      function() {
        const context: Logging.Context<number> = Logging.Performance(
          8,
          'Something',
          3,
        );
        const newContext: Logging.Context<string> = Logging.mbind(function(
          num: number,
        ) {
          return Logging.Warn(4, 'Something Else', num.toString());
        },
        context);

        const calledWith = [];
        const logger: Logging.Logger = {
          interestedLoggingTypes: List.of(
            Logging.LoggingType.performance,
            Logging.LoggingType.info,
          ),
          minimalLevel: 1,
          processLog: function(
            type: Logging.LoggingType,
            time: Date,
            info: string,
          ) {
            calledWith.push({loggingType: type, info: info});
          },
        };

        Logging.evaluate(logger, newContext);

        const expectedCalledWith = [
          {loggingType: Logging.LoggingType.performance, info: 'Something'},
        ];

        expect(calledWith).toEqualJSON(expectedCalledWith);
      },
    );

    it(
      'binds and combines both the logging contexts when the given logger ' +
        'is interested in both events but it only logs the one that has not ' +
        'previously been logged when one has been evaluated already',
      function() {
        const context: Logging.Context<number> = Logging.Error(
          8,
          'Something',
          3,
        );

        const calledWith = [];
        const logger: Logging.Logger = {
          interestedLoggingTypes: List.of(
            Logging.LoggingType.error,
            Logging.LoggingType.info,
          ),
          minimalLevel: 1,
          processLog: function(
            type: Logging.LoggingType,
            time: Date,
            info: string,
          ) {
            calledWith.push({loggingType: type, info: info});
          },
        };

        const evaluatedContext: Logging.Context<number> = Logging.evaluate(
          logger,
          context,
        );

        const newContext: Logging.Context<string> = Logging.mbind(function(
          num: number,
        ) {
          return Logging.Info(4, 'Something Else', num.toString());
        },
        evaluatedContext);

        Logging.evaluate(logger, newContext);

        const expectedCalledWith = [
          {loggingType: Logging.LoggingType.error, info: 'Something'},
          {loggingType: Logging.LoggingType.info, info: 'Something Else'},
        ];

        expect(calledWith).toEqualJSON(expectedCalledWith);
      },
    );
  });

  describe('#munit', function() {
    it('puts a value into a logging context without anything to log', function() {
      const context: Logging.Context<number> = Logging.munit(3);
      var wasCalled: boolean = false;
      const logger: Logging.Logger = {
        interestedLoggingTypes: List.of(Logging.LoggingType.debug),
        minimalLevel: 5,
        processLog: function(
          type: Logging.LoggingType,
          time: Date,
          info: string,
        ) {
          wasCalled = true;
        },
      };

      Logging.evaluate(logger, context);

      expect(wasCalled).toBe(false);
      expect(Logging.getValue(context)).toBe(3);
    });
  });
});
