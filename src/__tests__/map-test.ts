/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import Map = require('../map');
import Maybe = require('../maybe');

describe('Map', function() {
  describe('#get', function() {
    it('should return nothing when looking up on the empty map', function() {
      const map: Map.Map<string, string> = Map.Empty<string, string>();
      const actualValue = Map.get('key', map);

      const expectedValue = Maybe.Nothing<string>();

      expect(actualValue).toEqualJSON(expectedValue);
    });

    it(
      'should return the actual value when looking up on a map that has ' +
        'that key',
      function() {
        const map: Map.Map<string, string> = Map.Map<string, string>([
          ['key', 'value'],
        ]);
        const actualValue = Map.get('key', map);

        const expectedValue = Maybe.Just('value');

        expect(actualValue).toEqualJSON(expectedValue);
      },
    );

    it(
      'should return the actual value when looking up on a map that has ' +
        'a key and value but not that key',
      function() {
        const map: Map.Map<string, string> = Map.Map<string, string>([
          ['key', 'value'],
        ]);
        const actualValue = Map.get('anotherKey', map);

        const expectedValue = Maybe.Nothing<string>();

        expect(actualValue).toEqualJSON(expectedValue);
      },
    );
  });

  describe('#insert', function() {
    it('inserts a value into an empty map and can read it out', function() {
      const map: Map.Map<string, string> = Map.Empty<string, string>();
      const insertedMap = Map.insert('anotherKey', 'value', map);
      const actualValue = Map.get('anotherKey', insertedMap);

      const expectedValue = Maybe.Just('value');

      expect(actualValue).toEqualJSON(expectedValue);
    });

    it(
      'inserts a value into a map that has values but not at the key that is ' +
        'being inserted and can read it out',
      function() {
        const map: Map.Map<string, string> = Map.Map<string, string>([
          ['key', 'value'],
        ]);
        const insertedMap = Map.insert('anotherKey', 'anotherValue', map);
        const actualValue = Map.get('anotherKey', insertedMap);

        const expectedValue = Maybe.Just('anotherValue');

        expect(actualValue).toEqualJSON(expectedValue);
      },
    );

    it(
      'inserts a value into a map that has values at the key that is ' +
        'being inserted and can read it out',
      function() {
        const map: Map.Map<string, string> = Map.Map<string, string>([
          ['key', 'value'],
        ]);
        const insertedMap = Map.insert('key', 'anotherValue', map);
        const actualValue = Map.get('key', insertedMap);

        const expectedValue = Maybe.Just('anotherValue');

        expect(actualValue).toEqualJSON(expectedValue);
      },
    );
  });

  describe('#remove', function() {
    it('deletes a value from an empty map and can cannot read it out', function() {
      const map: Map.Map<string, string> = Map.Empty<string, string>();
      const clearedMap = Map.remove('key', map);
      const actualValue = Map.get('key', clearedMap);

      const expectedValue = Maybe.Nothing<string>();

      expect(actualValue).toEqualJSON(expectedValue);
    });

    it(
      'deletes a value from a non-empty map that does not already have that key ' +
        'and can cannot read it out',
      function() {
        const map: Map.Map<string, string> = Map.Map<string, string>([
          ['key', 'value'],
        ]);
        const clearedMap = Map.remove('anotherKey', map);
        const actualValue = Map.get('anotherKey', clearedMap);

        const expectedValue = Maybe.Nothing<string>();

        expect(actualValue).toEqualJSON(expectedValue);
      },
    );

    it(
      'deletes a value from a non-empty map that does not already have that key ' +
        'and can read the other key out',
      function() {
        const map: Map.Map<string, string> = Map.Map<string, string>([
          ['key', 'value'],
        ]);
        const clearedMap = Map.remove('anotherKey', map);
        const actualValue = Map.get('key', clearedMap);

        const expectedValue = Maybe.Just('value');

        expect(actualValue).toEqualJSON(expectedValue);
      },
    );

    it(
      'deletes a value from a non-empty map that does already have that key ' +
        'and can not read that key out',
      function() {
        const map: Map.Map<string, string> = Map.Map<string, string>([
          ['key', 'value'],
        ]);
        const clearedMap = Map.remove('key', map);
        const actualValue = Map.get('key', clearedMap);

        const expectedValue = Maybe.Nothing<string>();

        expect(actualValue).toEqualJSON(expectedValue);
      },
    );
  });

  describe('#containsKey', function() {
    it('should return false when the key is not present in the map', function() {
      const map: Map.Map<string, number> = Map.Empty<string, number>();
      const actualValue = Map.containsKey('something', map);

      expect(actualValue).toBe(false);
    });

    it('should return true when the key is present in the map', function() {
      const map: Map.Map<string, number> = Map.Map<string, number>([
        ['something', 4],
      ]);
      const actualValue = Map.containsKey('something', map);

      expect(actualValue).toBe(true);
    });
  });

  describe('#foldl', function() {
    it('returns the initial value when given an empty map', function() {
      const map: Map.Map<string, number> = Map.Empty<string, number>();
      const actualValue: Map.Map<string, number> = Map.foldl(
        function(soFar: Map.Map<string, number>, key: string, num: number) {
          return Map.insert(key, num * 2, soFar);
        },
        Map.Empty<string, number>(),
        map,
      );

      const expectedValue = Map.Empty<string, number>();

      expect(actualValue).toEqualJSON(expectedValue);
    });

    it('returns the folded value when given a non empty map', function() {
      const map: Map.Map<string, number> = Map.Map<string, number>([
        ['something', 4],
      ]);
      const actualValue: Map.Map<string, number> = Map.foldl(
        function(soFar: Map.Map<string, number>, key: string, num: number) {
          return Map.insert(key, num * 2, soFar);
        },
        Map.Empty<string, number>(),
        map,
      );

      const expectedValue = Map.insert(
        'something',
        8,
        Map.Empty<string, number>(),
      );

      expect(actualValue).toEqualJSON(expectedValue);
    });

    it('returns the folded value when given a larger map', function() {
      const map: Map.Map<string, number> = Map.Map<string, number>([
        ['something', 4],
        ['else', 8],
      ]);
      const actualValue: Map.Map<string, number> = Map.foldl(
        function(soFar: Map.Map<string, number>, key: string, num: number) {
          return Map.insert(key, num * 2, soFar);
        },
        Map.Empty<string, number>(),
        map,
      );

      const expectedValue1 = Map.insert(
        'something',
        8,
        Map.Empty<string, number>(),
      );
      const expectedValue = Map.insert('else', 16, expectedValue1);

      expect(actualValue).toEqualJSON(expectedValue);
    });
  });
});
