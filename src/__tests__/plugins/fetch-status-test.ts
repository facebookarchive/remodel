/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as FetchStatus from '../../plugins/fetch-status';
import * as Maybe from '../../maybe';
import * as ObjectSpec from '../../object-spec';
import * as ObjC from '../../objc';

const Plugin = FetchStatus.createPlugin();

describe('Plugins.FetchStatus', function() {
  describe('#attributes', function() {
    it('returns a fetch status attribute', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: 'FooLib',
        typeName: 'Foo',
      };

      const attributes: ObjectSpec.Attribute[] = Plugin.attributes(objectType);

      const expectedAttributes: ObjectSpec.Attribute[] = [
        {
          annotations: {},
          comments: [],
          name: 'fetchStatus',
          nullability: ObjC.Nullability.Inherited(),
          type: {
            fileTypeIsDefinedIn: null,
            libraryTypeIsDefinedIn: 'FooLib',
            name: 'FooFetchStatus',
            reference: 'FooFetchStatus *',
            underlyingType: 'NSObject',
            conformingProtocol: null,
          },
        },
      ];

      expect(attributes).toEqualJSON(expectedAttributes);
    });
  });
  describe('#additionalTypes', function() {
    it('returns a fetch-status type with correct attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someUnsignedInteger',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'NSUInteger',
              reference: 'NSUInteger',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: 'FooLib',
        typeName: 'Foo',
      };

      const additionalType: ObjectSpec.Type = Plugin.additionalTypes(
        objectType,
      )[0];

      const expectedValueType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'hasFetchedSomeUnsignedInteger',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'BOOL',
              reference: 'BOOL',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: 'FooLib',
        typeName: 'FooFetchStatus',
      };

      expect(additionalType).toEqualJSON(expectedValueType);
    });
  });
});
