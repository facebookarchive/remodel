/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import FetchStatus = require('../../plugins/fetch-status');
import Maybe = require('../../maybe');
import ValueObject = require('../../value-object');
import ObjC = require('../../objc');

const Plugin = FetchStatus.createPlugin();

describe('Plugins.FetchStatus', function() {
  describe('#attributes', function() {
    it('returns a fetch status attribute', function() {
      const valueType:ValueObject.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName:Maybe.Just<string>('FooLib'),
        typeName: 'Foo'
      };

      const attributes:ValueObject.Attribute[] = Plugin.attributes(valueType);

      const expectedAttributes:ValueObject.Attribute[] = [
      {
        annotations: {},
        comments: [],
        name: 'fetchStatus',
        nullability:ObjC.Nullability.Inherited(),
        type: {
          fileTypeIsDefinedIn:Maybe.Nothing<string>(),
          libraryTypeIsDefinedIn:Maybe.Just<string>('FooLib'),
          name:'FooFetchStatus',
          reference: 'FooFetchStatus *',
          underlyingType:Maybe.Just<string>('NSObject')
        }
      }];

      expect(attributes).toEqualJSON(expectedAttributes);
    });
  });
  describe('#additionalTypes', function() {
    it('returns a fetch-status type with correct attributes', function() {
      const valueType:ValueObject.Type = {
        annotations: {},
        attributes: [
        {
          annotations: {},
          comments: [],
          name: 'someUnsignedInteger',
          nullability:ObjC.Nullability.Inherited(),
          type: {
            fileTypeIsDefinedIn:Maybe.Nothing<string>(),
            libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
            name: 'NSUInteger',
            reference: 'NSUInteger',
            underlyingType:Maybe.Nothing<string>()
          }
        }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName:Maybe.Just<string>('FooLib'),
        typeName: 'Foo'
      };

      const additionalType:ValueObject.Type = Plugin.additionalTypes(valueType)[0];

      const expectedValueType:ValueObject.Type = {
        annotations: {},
        attributes: [
        {
          annotations: {},
          comments: [],
          name: 'hasFetchedSomeUnsignedInteger',
          nullability:ObjC.Nullability.Inherited(),
          type: {
            fileTypeIsDefinedIn:Maybe.Nothing<string>(),
            libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
            name:'BOOL',
            reference: 'BOOL',
            underlyingType:Maybe.Nothing<string>()
          }
        }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName:Maybe.Just<string>('FooLib'),
        typeName: 'FooFetchStatus'
      };

      expect(additionalType).toEqualJSON(expectedValueType);
    });
  });
});
