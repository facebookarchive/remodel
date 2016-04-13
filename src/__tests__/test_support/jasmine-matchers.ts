/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jsondiffpatch.d.ts'/>

import jsondiffpatch = require('jsondiffpatch');

beforeEach(function() {
  jasmine.addMatchers({
    toEqualJSON: function(util, customEqualityTesters) {
      return {
        compare: function(actual: any, expected: any) {
          const areObjectsEqual = util.equals(actual, expected, customEqualityTesters);
          return {
            pass: areObjectsEqual,
            message: areObjectsEqual ? 'Equal' : '' + jsondiffpatch.console.format(jsondiffpatch.diff(JSON.parse(JSON.stringify(expected)), JSON.parse(JSON.stringify(actual)))),
          };
        }
      }
    }
  });
});
