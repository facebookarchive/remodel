/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import Functor = require('../functor');

describe('Functor', function() {
  describe('#map', function() {
    it('should map over arrays', function() {
      const numbers: number[] = [1, 2, 3, 4];
      const doubledNumbers = Functor.map(function(num: number) {
        return num * 2;
      }, numbers);

      expect(doubledNumbers).toEqualJSON([2, 4, 6, 8]);
    });

    it('should map over a custom functor', function() {
      const functor = {
        map: function(funct) {
          return funct(3) + 1;
        },
      };
      const result = Functor.map(function(num: number) {
        return num * 2;
      }, functor);

      expect(result).toBe(7);
    });
  });

  describe('#pipeline2', function() {
    it('should sequentially apply the maps', function() {
      const multiplyByTwo = function(a: number) {
        return a * 2;
      };
      const subtractByTwo = function(a: number) {
        return a - 2;
      };

      const result = Functor.pipeline2([1, 2, 3], multiplyByTwo, subtractByTwo);

      expect(result).toEqualJSON([0, 2, 4]);
    });
  });

  describe('#pipeline3', function() {
    it('should sequentially apply the maps', function() {
      const multiplyByTwo = function(a: number) {
        return a * 2;
      };
      const subtractByTwo = function(a: number) {
        return a - 2;
      };

      const result = Functor.pipeline3(
        [1, 2, 3],
        multiplyByTwo,
        subtractByTwo,
        subtractByTwo,
      );

      expect(result).toEqualJSON([-2, 0, 2]);
    });
  });

  describe('#pipeline4', function() {
    it('should sequentially apply the maps', function() {
      const multiplyByTwo = function(a: number) {
        return a * 2;
      };
      const subtractByTwo = function(a: number) {
        return a - 2;
      };

      const result = Functor.pipeline4(
        [1, 2, 3],
        multiplyByTwo,
        subtractByTwo,
        subtractByTwo,
        multiplyByTwo,
      );

      expect(result).toEqualJSON([-4, 0, 4]);
    });
  });

  describe('#pipeline5', function() {
    it('should sequentially apply the maps', function() {
      const multiplyByTwo = function(a: number) {
        return a * 2;
      };
      const subtractByTwo = function(a: number) {
        return a - 2;
      };

      const result = Functor.pipeline5(
        [1, 2, 3],
        multiplyByTwo,
        subtractByTwo,
        subtractByTwo,
        multiplyByTwo,
        multiplyByTwo,
      );

      expect(result).toEqualJSON([-8, 0, 8]);
    });
  });

  describe('#pipeline6', function() {
    it('should sequentially apply the maps', function() {
      const multiplyByTwo = function(a: number) {
        return a * 2;
      };
      const subtractByTwo = function(a: number) {
        return a - 2;
      };

      const result = Functor.pipeline6(
        [1, 2, 3],
        multiplyByTwo,
        subtractByTwo,
        subtractByTwo,
        multiplyByTwo,
        multiplyByTwo,
        multiplyByTwo,
      );

      expect(result).toEqualJSON([-16, 0, 16]);
    });
  });
});
