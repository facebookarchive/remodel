/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import Maybe = require('../maybe');

describe('Maybe', function() {
  describe('#match', function() {
    it('should return the just value when created as a just', function() {
      const maybe: Maybe.Maybe<number> = Maybe.Just(3);
      const just = function(num: number) {
        return num.toString();
      };
      const nothing = function() {
        return '';
      };
      const val: string = Maybe.match(just, nothing, maybe);

      expect(val).toBe('3');
    });

    it('should return the nothing value when created as nothing', function() {
      const maybe: Maybe.Maybe<number> = Maybe.Nothing<number>();
      const just = function(num: number) {
        return num.toString();
      };
      const nothing = function() {
        return '';
      };
      const val: string = Maybe.match(just, nothing, maybe);

      expect(val).toBe('');
    });
  });

  describe('#map', function() {
    it('applies the map when the maybe is a just', function() {
      const maybe: Maybe.Maybe<number> = Maybe.Just(3);
      const mappedMaybe = Maybe.map(function(num: number) {
        return num + '3';
      }, maybe);
      const just = function(num: string) {
        return num;
      };
      const nothing = function() {
        return '';
      };
      const val: string = Maybe.match(just, nothing, mappedMaybe);

      expect(val).toEqualJSON('33');
    });

    it('does not apply the map when the maybe is a nothing', function() {
      const maybe: Maybe.Maybe<number> = Maybe.Nothing<number>();
      const mappedMaybe = Maybe.map(function(num: number) {
        return num + '3';
      }, maybe);
      const just = function(num: string) {
        return num;
      };
      const nothing = function() {
        return '';
      };
      const val: string = Maybe.match(just, nothing, mappedMaybe);

      expect(val).toEqualJSON('');
    });
  });

  describe('#mbind', function() {
    it('applies the bind when the maybe is a just', function() {
      const maybe: Maybe.Maybe<number> = Maybe.Just(3);
      const boundMaybe = Maybe.mbind(function(num: number) {
        return Maybe.Just(num.toString());
      }, maybe);
      const just = function(num: string) {
        return num;
      };
      const nothing = function() {
        return '';
      };
      const val: string = Maybe.match(just, nothing, boundMaybe);

      expect(val).toEqualJSON('3');
    });

    it('does not apply the bind when the maybe is a nothing', function() {
      const maybe: Maybe.Maybe<number> = Maybe.Nothing<number>();
      const boundMaybe = Maybe.mbind(function(num: number) {
        return Maybe.Just(num.toString());
      }, maybe);
      const just = function(num: string) {
        return num;
      };
      const nothing = function() {
        return '';
      };
      const val: string = Maybe.match(just, nothing, boundMaybe);

      expect(val).toEqualJSON('');
    });
  });

  describe('#munit', function() {
    it('behaves like just', function() {
      const maybe: Maybe.Maybe<number> = Maybe.munit(3);
      const just = function(num: number) {
        return num.toString();
      };
      const nothing = function() {
        return '';
      };
      const val: string = Maybe.match(just, nothing, maybe);

      expect(val).toBe('3');
    });
  });

  describe('#catMaybes', function() {
    it('removes some Maybe.Nothings but returns the values from the Maybes that have them', function() {
      const maybes: Maybe.Maybe<number>[] = [
        Maybe.Just(2),
        Maybe.Nothing<number>(),
        Maybe.Just(4),
      ];
      const numbers: number[] = Maybe.catMaybes(maybes);

      expect(numbers).toEqualJSON([2, 4]);
    });
  });
});
