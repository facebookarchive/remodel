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

import List = require('../list');
import Maybe = require('../maybe');
import PluginInclusionUtils = require('../plugin-inclusion-utils');
import ValueObject = require('../value-object');

describe('PluginInclusionUtils', function() {
  describe('#includesContainingDefaultIncludes', function() {
    it('returns includes containing the provided default include', function() {
      const includesFromType:string[] = [];
      const excludesFromType:string[] = [];
      const defaultIncludes:List.List<string> = List.of<string>('SomeDefault');

      const includes:string[] = PluginInclusionUtils.includesContainingDefaultIncludes(includesFromType, excludesFromType, defaultIncludes);
      const expectedIncludes:string[] = ['SomeDefault'];

      expect(includes).toEqualJSON(expectedIncludes);
    });

    it('returns includes containing the provided default include as well as its own ' +
       'include which is supplied', function() {
      const includesFromType:string[] = ['SomeAlreadyIncludedThang'];
      const excludesFromType:string[] = [];
      const defaultIncludes:List.List<string> = List.of<string>('SomeDefault');

      const includes:string[] = PluginInclusionUtils.includesContainingDefaultIncludes(includesFromType, excludesFromType, defaultIncludes);
      const expectedIncludes:string[] = ['SomeAlreadyIncludedThang', 'SomeDefault'];

      expect(includes).toEqualJSON(expectedIncludes);
    });

    it('returns includes containing the provided default include as well as two of its own ' +
       'includes which are supplied', function() {
      const includesFromType:string[] = ['SomeAlreadyIncludedThang', 'Another'];
      const excludesFromType:string[] = [];
      const defaultIncludes:List.List<string> = List.of<string>('SomeDefault');

      const includes:string[] = PluginInclusionUtils.includesContainingDefaultIncludes(includesFromType, excludesFromType, defaultIncludes);
      const expectedIncludes:string[] = ['SomeAlreadyIncludedThang', 'Another', 'SomeDefault'];

      expect(includes).toEqualJSON(expectedIncludes);
    });

    it('does not return includes when the only default include is excluded', function() {
      const includesFromType:string[] = [];
      const excludesFromType:string[] = ['SomeDefault'];
      const defaultIncludes:List.List<string> = List.of<string>('SomeDefault');

      const includes:string[] = PluginInclusionUtils.includesContainingDefaultIncludes(includesFromType, excludesFromType, defaultIncludes);
      const expectedIncludes:string[] = [];

      expect(includes).toEqualJSON(expectedIncludes);
    });

    it('returns includes containing only one provided default include when two default ' +
       'includes are supplied but one is excluded', function() {
      const includesFromType:string[] = [];
      const excludesFromType:string[] = ['Another'];
      const defaultIncludes:List.List<string> = List.of<string>('SomeDefault', 'Another');

      const includes:string[] = PluginInclusionUtils.includesContainingDefaultIncludes(includesFromType, excludesFromType, defaultIncludes);
      const expectedIncludes:string[] = ['SomeDefault'];

      expect(includes).toEqualJSON(expectedIncludes);
    });
  });
});
