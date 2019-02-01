/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import * as Functor from '../functor';
import * as List from '../list';
import * as Promise from '../promise';

describe('Promise', function() {
  describe('#then', function() {
    it(
      'calls then synchronously when the promise is created with an ' +
        'initial value',
      function() {
        const promise: Promise.Promise<number> = Promise.resolved<number>(3);
        const future: Promise.Future<number> = promise.getFuture();
        var wasCalled: boolean = false;
        Promise.then(function(val: number) {
          expect(val).toBe(3);
          wasCalled = true;
        }, future);
        expect(wasCalled).toBe(true);
      },
    );

    it(
      'should not call then handler until a value is given when a promise is ' +
        'not provided with an initial value',
      function() {
        const promise: Promise.Promise<number> = Promise.pending<number>();
        const future: Promise.Future<number> = promise.getFuture();
        var wasCalledAtTheCorrectTime = false;
        var wasCalled = false;

        Promise.then(function(val: number) {
          wasCalled = true;
          expect(wasCalledAtTheCorrectTime).toBe(true);
          expect(val).toBe(3);
        }, future);

        wasCalledAtTheCorrectTime = true;
        promise.setValue(3);

        expect(wasCalled).toBe(true);
      },
    );
  });
  describe('#map', function() {
    it(
      'should allow the mapping of the value of the future and produce a new ' +
        'future that gets resolved when the underlying one does',
      function() {
        const promise: Promise.Promise<number> = Promise.pending<number>();
        const future: Promise.Future<number> = promise.getFuture();
        var wasCalledAtTheCorrectTime = false;
        var wasCalled = false;

        const mappedFuture: Promise.Future<string> = Promise.map(function(
          val: number,
        ) {
          return val.toString();
        },
        future);

        Promise.then(function(val: string) {
          wasCalled = true;
          expect(wasCalledAtTheCorrectTime).toBe(true);
          expect(val).toBe('3');
        }, mappedFuture);

        wasCalledAtTheCorrectTime = true;
        promise.setValue(3);

        expect(wasCalled).toBe(true);
      },
    );

    it(
      'should allow the mapping of the value of the future and produce a new ' +
        'future that gets resolved when the underlying one does multiple times',
      function() {
        const promise: Promise.Promise<number> = Promise.pending<number>();
        const future: Promise.Future<number> = promise.getFuture();
        var wasCalledAtTheCorrectTime = false;
        var wasCalled = false;

        const mappedFuture: Promise.Future<number> = Promise.map(function(
          val: number,
        ) {
          return val + 3;
        },
        future);

        const mappedFuture2: Promise.Future<string> = Promise.map(function(
          val: number,
        ) {
          return val.toString();
        },
        mappedFuture);

        Promise.then(function(val: string) {
          wasCalled = true;
          expect(wasCalledAtTheCorrectTime).toBe(true);
          expect(val).toBe('6');
        }, mappedFuture2);

        wasCalledAtTheCorrectTime = true;
        promise.setValue(3);

        expect(wasCalled).toBe(true);
      },
    );

    it(
      'should allow the mapping of the value of the future and produce a new ' +
        'future when the future is created with a value',
      function() {
        const promise: Promise.Promise<number> = Promise.resolved<number>(3);
        const future: Promise.Future<number> = promise.getFuture();
        var wasCalled: boolean = false;

        const mappedFuture: Promise.Future<number> = Promise.map(function(
          val: number,
        ) {
          return val + 3;
        },
        future);

        const mappedFuture2: Promise.Future<string> = Promise.map(function(
          val: number,
        ) {
          return val.toString();
        },
        mappedFuture);

        Promise.then(function(val: string) {
          wasCalled = true;
          expect(val).toBe('6');
        }, mappedFuture2);

        expect(wasCalled).toBe(true);
      },
    );

    it('should implement the functor interface on future', function() {
      const promise: Promise.Promise<number> = Promise.resolved<number>(3);
      const future: Promise.Future<number> = promise.getFuture();
      var wasCalled: boolean = false;

      const mappedFuture = Functor.map(function(val: number) {
        return val + 3;
      }, future);

      Promise.then(
        function(val: number) {
          wasCalled = true;
          expect(val).toBe(6);
        },
        <Promise.Future<number>>mappedFuture,
      );

      expect(wasCalled).toBe(true);
    });
  });

  describe('#mbind', function() {
    it(
      'should allow the binding of the value of the future and produce a new ' +
        'future that gets resolved when the underlying one does',
      function() {
        const promise: Promise.Promise<number> = Promise.pending<number>();
        const boundPromise: Promise.Promise<string> = Promise.pending<string>();
        const future: Promise.Future<number> = promise.getFuture();
        var wasCalledAtTheCorrectTime = false;
        var wasCalled = false;

        const boundFuture: Promise.Future<string> = Promise.mbind(function(
          val: number,
        ) {
          return boundPromise.getFuture();
        },
        future);

        Promise.then(function(val: string) {
          wasCalled = true;
          expect(wasCalledAtTheCorrectTime).toBe(true);
          expect(val).toBe('6');
        }, boundFuture);

        promise.setValue(3);

        wasCalledAtTheCorrectTime = true;

        boundPromise.setValue('6');

        expect(wasCalled).toBe(true);
      },
    );

    it(
      'should allow the binding of the value of the future and produce a new ' +
        'future when the base promise is resolved',
      function() {
        const promise: Promise.Promise<number> = Promise.resolved<number>(3);
        const pendingPromise: Promise.Promise<number> = Promise.pending<
          number
        >();
        const future: Promise.Future<number> = promise.getFuture();
        var wasCalledAtTheCorrectTime = false;
        var wasCalled = false;

        const boundFuture: Promise.Future<string> = Promise.mbind(function(
          val: number,
        ) {
          return Promise.map(function(incomingVal: number) {
            return (incomingVal + val).toString();
          }, pendingPromise.getFuture());
        },
        future);

        Promise.then(function(val: string) {
          wasCalled = true;
          expect(wasCalledAtTheCorrectTime).toBe(true);
          expect(val).toBe('6');
        }, boundFuture);

        wasCalledAtTheCorrectTime = true;
        pendingPromise.setValue(3);

        expect(wasCalled).toBe(true);
      },
    );

    it('provides a unit function for the promise monad', function() {
      const num: number = 3;
      const future: Promise.Future<number> = Promise.munit(num);
      var wasCalled: boolean = false;
      Promise.then(function(val: number) {
        expect(val).toBe(3);
        wasCalled = true;
      }, future);
      expect(wasCalled).toBe(true);
    });
  });

  describe('#aapply', function() {
    it(
      'takes a future of a function from A to B and a future of A and ' +
        'returns a future of B',
      function() {
        const func: (a: number) => string = function(num: number) {
          return num.toString();
        };
        const futureFunc: Promise.Future<
          (a: number) => string
        > = Promise.resolved(func).getFuture();
        const numPromise: Promise.Promise<number> = Promise.pending<number>();
        var wasCalled: boolean = false;

        const resultingFuture: Promise.Future<string> = Promise.aapply(
          futureFunc,
          numPromise.getFuture(),
        );

        Promise.then(function(val: string) {
          expect(val).toBe('3');
          wasCalled = true;
        }, resultingFuture);

        expect(wasCalled).toBe(false);
        numPromise.setValue(3);
        expect(wasCalled).toBe(true);
      },
    );
  });

  describe('#all', function() {
    it(
      'takes a list of futures and returns a promise of the list of ' +
        'values',
      function() {
        const promise1: Promise.Promise<number> = Promise.pending<number>();
        const promise2: Promise.Promise<number> = Promise.pending<number>();
        var wasCalled = false;

        const promiseOfList: Promise.Future<List.List<number>> = Promise.all(
          List.of(promise1.getFuture(), promise2.getFuture()),
        );

        Promise.then(function(list: List.List<number>) {
          wasCalled = true;
          expect(list).toEqualJSON(List.of(2, 3));
        }, promiseOfList);

        expect(wasCalled).toBe(false);
        promise2.setValue(3);
        expect(wasCalled).toBe(false);
        promise1.setValue(2);
        expect(wasCalled).toBe(true);
      },
    );

    it(
      'takes an array of futures and returns a promise of the array of ' +
        'values even when the resolution order is different',
      function() {
        const promise1: Promise.Promise<number> = Promise.pending<number>();
        const promise2: Promise.Promise<number> = Promise.pending<number>();
        var wasCalled = false;

        const promiseOfList: Promise.Future<List.List<number>> = Promise.all(
          List.of(promise1.getFuture(), promise2.getFuture()),
        );

        Promise.then(function(list: List.List<number>) {
          wasCalled = true;
          expect(list).toEqualJSON(List.of(2, 3));
        }, promiseOfList);

        expect(wasCalled).toBe(false);
        promise1.setValue(2);
        expect(wasCalled).toBe(false);
        promise2.setValue(3);
        expect(wasCalled).toBe(true);
      },
    );
  });
});
