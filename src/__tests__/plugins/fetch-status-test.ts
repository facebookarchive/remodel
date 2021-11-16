/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as FetchStatus from '../../plugins/fetch-status';
import * as ObjectSpec from '../../object-spec';
import * as ObjectSpecHelpers from '../../object-spec-helpers';

const Plugin = FetchStatus.createPlugin();

describe('Plugins.FetchStatus', function () {
  describe('#attributes', function () {
    it('returns a fetch status attribute', function () {
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
        new ObjectSpecHelpers.AttributeBuilder(
          'fetchStatus',
          new ObjectSpecHelpers.AttributeTypeBuilder(
            'FooFetchStatus',
            'FooFetchStatus *',
            'NSObject',
          ).withLibraryTypeIsDefinedIn('FooLib'),
        ).asObject(),
      ];

      expect(attributes).toEqualJSON(expectedAttributes);
    });
  });
  describe('#additionalTypes', function () {
    it('returns a fetch-status type with correct attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'someUnsignedInteger',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSUInteger',
              'NSUInteger',
              null,
            ),
          ).asObject(),
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: 'FooLib',
        typeName: 'Foo',
      };

      const additionalType: ObjectSpec.Type =
        Plugin.additionalTypes(objectType)[0];

      const expectedValueType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'hasFetchedSomeUnsignedInteger',
            new ObjectSpecHelpers.AttributeTypeBuilder('BOOL', 'BOOL', null),
          ).asObject(),
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
