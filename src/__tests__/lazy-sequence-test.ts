/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import LazySequence = require('../lazy-sequence');
import Functor = require('../functor');
import Promise = require('../promise');

describe('LazySequence', function() {
  describe('Sequence', function() {
    it('should return a future for an array of the sequnce when asked to ' +
       'evalutate the lazy sequence', function() {
      const source:LazySequence.Source<number> = LazySequence.source<number>();
      const sequence:LazySequence.Sequence<number> = source.getSequence();
      const future:Promise.Future<number[]> = LazySequence.evaluate(sequence);
      var wasRun:boolean = false;
      Promise.then(function(numbers:number[]) {
        wasRun = true;
        expect(numbers).toEqualJSON([1, 2, 3, 4]);
      }, future);

      source.nextValue(1);
      source.nextValue(2);
      source.nextValue(3);
      source.nextValue(4);
      source.finished();

      expect(wasRun).toBe(true);
    });

    it('should allow a hook into each new value as it comes into the sequence' +
       'as the values come in', function() {
      const source:LazySequence.Source<number> = LazySequence.source<number>();
      const sequence:LazySequence.Sequence<number> = source.getSequence();
      const future:Promise.Future<number[]> = LazySequence.evaluate(sequence);
      var wasRun:boolean = false;
      const soFar = [];

      LazySequence.forEach(function(num:number) {
        soFar.push(num);
      }, sequence);

      Promise.then(function(numbers:number[]) {
        wasRun = true;
        expect(numbers).toEqualJSON([1, 2, 3, 4]);
      }, future);

      source.nextValue(1);
      expect(soFar).toEqualJSON([1]);
      source.nextValue(2);
      expect(soFar).toEqualJSON([1, 2]);
      source.nextValue(3);
      expect(soFar).toEqualJSON([1, 2, 3]);
      source.nextValue(4);
      expect(soFar).toEqualJSON([1, 2, 3, 4]);
      source.finished();

      expect(wasRun).toBe(true);
    });

    it('should allow a hook into each new value as it comes into the sequence' +
    'as the values come in but it does all the values so far when the ' +
    'enumeration starts after the events start coming in', function() {
      const source:LazySequence.Source<number> = LazySequence.source<number>();
      const sequence:LazySequence.Sequence<number> = source.getSequence();
      const future:Promise.Future<number[]> = LazySequence.evaluate(sequence);
      var wasRun:boolean = false;
      const soFar = [];

      Promise.then(function(numbers:number[]) {
        wasRun = true;
        expect(numbers).toEqualJSON([1, 2, 3, 4]);
      }, future);

      source.nextValue(1);
      expect(soFar).toEqualJSON([]);

      LazySequence.forEach(function(num:number) {
        soFar.push(num);
      }, sequence);

      source.nextValue(2);
      expect(soFar).toEqualJSON([1, 2]);
      source.nextValue(3);
      expect(soFar).toEqualJSON([1, 2, 3]);
      source.nextValue(4);
      expect(soFar).toEqualJSON([1, 2, 3, 4]);
      source.finished();

      expect(wasRun).toBe(true);
    });

    it('should allow for evaluation to be called even after the sequence has ' +
       'been completed', function() {
      const source:LazySequence.Source<number> = LazySequence.source<number>();
      const sequence:LazySequence.Sequence<number> = source.getSequence();
      var wasRun:boolean = false;

      source.nextValue(1);
      source.nextValue(2);
      source.nextValue(3);
      source.nextValue(4);
      source.finished();

      const future:Promise.Future<number[]> = LazySequence.evaluate(sequence);
      Promise.then(function(numbers:number[]) {
        wasRun = true;
        expect(numbers).toEqualJSON([1, 2, 3, 4]);
      }, future);

      expect(wasRun).toBe(true);
    });

    it('should error if calling nextValue after finished', function() {
      const source:LazySequence.Source<number> = LazySequence.source<number>();
      source.nextValue(3);
      source.finished();
      expect(function() {
        source.nextValue(3);
      }).toThrow();
    });

    it('should allow mapping to another lazy sequence and evaluating the ' +
       'result', function() {
      const source:LazySequence.Source<number> = LazySequence.source<number>();
      const sequence:LazySequence.Sequence<number> = source.getSequence();
      const mappedSequence:LazySequence.Sequence<string> = LazySequence.map(function(num:number) {
        return num.toString();
      }, sequence);
      var wasRun:boolean = false;

      source.nextValue(1);
      source.nextValue(2);
      source.nextValue(3);
      source.nextValue(4);
      source.finished();

      const future:Promise.Future<string[]> = LazySequence.evaluate(mappedSequence);
      Promise.then(function(numbers:string[]) {
        wasRun = true;
        expect(numbers).toEqualJSON(['1', '2', '3', '4']);
      }, future);

      expect(wasRun).toBe(true);
    });

    it('should allow mapping to another lazy sequence and getting each of ' +
       'the values as they come in', function() {
      const source:LazySequence.Source<number> = LazySequence.source<number>();
      const sequence:LazySequence.Sequence<number> = source.getSequence();
      const mappedSequence:LazySequence.Sequence<string> = LazySequence.map(function(num:number) {
        return num.toString();
      }, sequence);
      var wasRun:boolean = false;
      const soFar = [];

      LazySequence.forEach(function(str:string) {
        soFar.push(str);
      }, mappedSequence);

      source.nextValue(1);
      expect(soFar).toEqualJSON(['1']);
      source.nextValue(2);
      expect(soFar).toEqualJSON(['1', '2']);
      source.nextValue(3);
      expect(soFar).toEqualJSON(['1', '2', '3']);
      source.nextValue(4);
      expect(soFar).toEqualJSON(['1', '2', '3', '4']);
      source.finished();

      const future:Promise.Future<string[]> = LazySequence.evaluate(mappedSequence);
      Promise.then(function(numbers:string[]) {
        wasRun = true;
        expect(numbers).toEqualJSON(['1', '2', '3', '4']);
      }, future);

      expect(wasRun).toBe(true);
    });

    it('should allow mapping as a functor and getting each of ' +
       'the values as they come in', function() {
      const source:LazySequence.Source<number> = LazySequence.source<number>();
      const sequence:LazySequence.Sequence<number> = source.getSequence();
      const mappedSequence = Functor.map(function(num:number) {
        return num.toString();
      }, sequence);
      var wasRun:boolean = false;
      const soFar = [];

      LazySequence.forEach(function(str:string) {
        soFar.push(str);
      }, <LazySequence.Sequence<string>>mappedSequence);

      source.nextValue(1);
      expect(soFar).toEqualJSON(['1']);
      source.nextValue(2);
      expect(soFar).toEqualJSON(['1', '2']);
      source.nextValue(3);
      expect(soFar).toEqualJSON(['1', '2', '3']);
      source.nextValue(4);
      expect(soFar).toEqualJSON(['1', '2', '3', '4']);
      source.finished();

      const future:Promise.Future<string[]> = LazySequence.evaluate(<LazySequence.Sequence<string>>mappedSequence);
      Promise.then(function(numbers:string[]) {
        wasRun = true;
        expect(numbers).toEqualJSON(['1', '2', '3', '4']);
      }, future);

      expect(wasRun).toBe(true);
    });

    it('should allow folding and getting each of the values as they come in', function() {
      const source:LazySequence.Source<number> = LazySequence.source<number>();
      const sequence:LazySequence.Sequence<number> = source.getSequence();
      const foldedSequence:Promise.Future<number[]> = LazySequence.foldl(function(soFar:number[], num:number) {
        if (num % 2 === 0) {
          return soFar.concat(num);
        } else {
          return soFar;
        }
      }, [], sequence);
      var wasRun:boolean = false;

      source.nextValue(1);
      source.nextValue(2);
      source.nextValue(3);
      source.nextValue(4);
      source.finished();

      Promise.then(function(numbers:number[]) {
        wasRun = true;
        expect(numbers).toEqualJSON([2, 4]);
      }, foldedSequence);

      expect(wasRun).toBe(true);
    });
  });
});
