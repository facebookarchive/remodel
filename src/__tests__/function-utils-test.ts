/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import FunctionUtils = require('../function-utils');

describe('FunctionUtils', function() {
  describe('#pApplyf1', function() {
    it('partially applies a function with one parameter', function() {
      const f: (a: number) => number = function(a: number): number {
        return a * 2;
      };

      const pf: () => number = FunctionUtils.pApplyf1(2, f);

      const actualVal = pf();
      const expectedVal = 4;

      expect(actualVal).toEqualJSON(expectedVal);
    });
  });

  describe('#pApplyf2', function() {
    it('partially applies a function with two parameters', function() {
      const f: (a: number, b: number) => number = function(
        a: number,
        b: number,
      ): number {
        return a + b;
      };

      const pf: (b: number) => number = FunctionUtils.pApplyf2(2, f);

      const actualVal = pf(4);
      const expectedVal = 6;

      expect(actualVal).toEqualJSON(expectedVal);
    });
  });

  describe('#pApplyf3', function() {
    it('partially applies a function with three parameters', function() {
      const f: (a: number, b: number, c: number) => number = function(
        a: number,
        b: number,
        c: number,
      ): number {
        return a + b + c;
      };

      const pf: (b: number, c: number) => number = FunctionUtils.pApplyf3(2, f);

      const actualVal = pf(4, 2);
      const expectedVal = 8;

      expect(actualVal).toEqualJSON(expectedVal);
    });
  });

  describe('#pApplyf4', function() {
    it('partially applies a function with four parameters', function() {
      const f: (
        a: number,
        b: number,
        c: number,
        d: number,
      ) => number = function(
        a: number,
        b: number,
        c: number,
        d: number,
      ): number {
        return a + b + c + d;
      };

      const pf: (
        b: number,
        c: number,
        d: number,
      ) => number = FunctionUtils.pApplyf4(2, f);

      const actualVal = pf(4, 2, 3);
      const expectedVal = 11;

      expect(actualVal).toEqualJSON(expectedVal);
    });
  });

  describe('#pApplyf5', function() {
    it('partially applies a function with five parameters', function() {
      const f: (
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
      ) => number = function(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
      ): number {
        return a + b + c + d + e;
      };

      const pf: (
        b: number,
        c: number,
        d: number,
        e: number,
      ) => number = FunctionUtils.pApplyf5(2, f);

      const actualVal = pf(4, 2, 3, 4);
      const expectedVal = 15;

      expect(actualVal).toEqualJSON(expectedVal);
    });
  });

  describe('#pApply2f3', function() {
    it('partially applies two parameters to a function with three parameters', function() {
      const f: (a: number, b: number, c: number) => number = function(
        a: number,
        b: number,
        c: number,
      ): number {
        return a + b + c;
      };

      const pf: (c: number) => number = FunctionUtils.pApply2f3(2, 4, f);

      const actualVal = pf(8);
      const expectedVal = 14;

      expect(actualVal).toEqualJSON(expectedVal);
    });
  });

  describe('#pApply2f4', function() {
    it('partially applies two parameters to a function with four parameters', function() {
      const f: (
        a: number,
        b: number,
        c: number,
        d: number,
      ) => number = function(
        a: number,
        b: number,
        c: number,
        d: number,
      ): number {
        return a + b + c + d;
      };

      const pf: (c: number, d: number) => number = FunctionUtils.pApply2f4(
        2,
        4,
        f,
      );

      const actualVal = pf(8, 5);
      const expectedVal = 19;

      expect(actualVal).toEqualJSON(expectedVal);
    });
  });

  describe('#pApply3f4', function() {
    it('partially applies three parameters to a function with four parameters', function() {
      const f: (
        a: string,
        b: string,
        c: string,
        d: string,
      ) => string = function(
        a: string,
        b: string,
        c: string,
        d: string,
      ): string {
        return a + b + c + d;
      };

      const pf: (c: string) => string = FunctionUtils.pApply3f4(
        'A',
        'B',
        'C',
        f,
      );

      const actualVal = pf('D');
      const expectedVal = 'ABCD';

      expect(actualVal).toEqualJSON(expectedVal);
    });
  });

  describe('#pApply3f5', function() {
    it('partially applies three parameters to a function with five parameters', function() {
      const f: (
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
      ) => number = function(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
      ): number {
        return a + b + c + d + e;
      };

      const pf: (c: number, d: number) => number = FunctionUtils.pApply3f5(
        2,
        4,
        5,
        f,
      );

      const actualVal = pf(8, 13);
      const expectedVal = 32;

      expect(actualVal).toEqualJSON(expectedVal);
    });
  });
});
