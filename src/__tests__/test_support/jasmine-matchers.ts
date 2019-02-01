/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jsondiffpatch.d.ts'/>

import * as jsondiffpatch from 'jsondiffpatch';

beforeEach(function() {
  jasmine.addMatchers({
    toEqualJSON: function(util, customEqualityTesters) {
      return {
        compare: function(actual: any, expected: any) {
          const areObjectsEqual = util.equals(
            actual,
            expected,
            customEqualityTesters,
          );
          return {
            pass: areObjectsEqual,
            message: areObjectsEqual
              ? 'Equal'
              : '' +
                jsondiffpatch.console.format(
                  jsondiffpatch.diff(
                    JSON.parse(JSON.stringify(expected)),
                    JSON.parse(JSON.stringify(actual)),
                  ),
                ),
          };
        },
      };
    },
  });
});
