/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import Either = require('../either');

describe('Either', function() {
  describe('#match', function() {
    it('should return the left value when created with left', function() {
      const either: Either.Either<number, string> = Either.Left<number, string>(
        3,
      );
      const left = function(num: number) {
        return 'left';
      };
      const right = function(str: string) {
        return 'right';
      };
      const val: string = Either.match(left, right, either);
      expect(val).toEqualJSON('left');
    });

    it('should match the right value when created with right', function() {
      const either: Either.Either<number, string> = Either.Right<
        number,
        string
      >('3');
      const left = function(num: number) {
        return 'left';
      };
      const right = function(str: string) {
        return 'right';
      };
      const val: string = Either.match(left, right, either);
      expect(val).toEqualJSON('right');
    });
  });

  describe('#map', function() {
    it('applies the map when the either is of the right type', function() {
      const either: Either.Either<number, string> = Either.Right<
        number,
        string
      >('3');
      const mappedEither = Either.map(function(str: string) {
        return str + '3';
      }, either);
      const left = function(num: number) {
        return 'left';
      };
      const identity = function(str: string) {
        return str;
      };
      const val: string = Either.match(left, identity, mappedEither);

      expect(val).toEqualJSON('33');
    });

    it('does not apply the map when the either is of the left type', function() {
      const either: Either.Either<number, string> = Either.Left<number, string>(
        3,
      );
      const mappedEither = Either.map(function(str: string) {
        return str + '3';
      }, either);
      const identity = function(num: number) {
        return num;
      };
      const right = function(str: string) {
        return -1;
      };
      const val: number = Either.match(identity, right, mappedEither);

      expect(val).toEqualJSON(3);
    });
  });

  describe('#mbind', function() {
    it(
      'it applies the bind when the either is of the right type and the ' +
        'resulting either is the right type',
      function() {
        const either: Either.Either<number, string> = Either.Right<
          number,
          string
        >('3');
        const mappedEither = Either.mbind(function(str: string) {
          return Either.Right(str + '3');
        }, either);
        const left = function(num: number) {
          return 'left';
        };
        const identity = function(str: string) {
          return str;
        };
        const val: string = Either.match(left, identity, mappedEither);

        expect(val).toEqualJSON('33');
      },
    );

    it(
      'it applies the bind when the either is of the right type and the ' +
        'resulting either is the left type',
      function() {
        const either: Either.Either<number, string> = Either.Right<
          number,
          string
        >('3');
        const mappedEither = Either.mbind(function(str: string) {
          return Either.Left(3);
        }, either);
        const left = function(num: number) {
          return (num + 1).toString();
        };
        const identity = function(str: string) {
          return str;
        };
        const val: string = Either.match(left, identity, mappedEither);

        expect(val).toEqualJSON('4');
      },
    );

    it('it applies the bind when the either is of the left type ', function() {
      const either: Either.Either<number, string> = Either.Left<number, string>(
        3,
      );
      const mappedEither = Either.mbind(function(str: string) {
        return Either.Right(str + '3');
      }, either);
      const left = function(num: number) {
        return num;
      };
      const identity = function(str: string) {
        return -1;
      };
      const val: number = Either.match(left, identity, mappedEither);

      expect(val).toEqualJSON(3);
    });
  });

  describe('#munit', function() {
    it('should return the left value when created with munit', function() {
      const str: string = '123';
      const either: Either.Either<number, string> = Either.munit<
        number,
        string
      >(str);
      const left = function(num: number) {
        return 'left';
      };
      const right = function(str: string) {
        return str;
      };
      const val: string = Either.match(left, right, either);
      expect(val).toEqualJSON('123');
    });
  });
});
