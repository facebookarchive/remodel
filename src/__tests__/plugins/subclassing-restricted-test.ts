/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import AlgebraicType = require('../../algebraic-type');
import SubclassingRestricted = require('../../plugins/subclassing-restricted');
import Maybe = require('../../maybe');
import ObjC = require('../../objc');
import ObjectSpec = require('../../object-spec');

const ObjectSpecPlugin = SubclassingRestricted.createPlugin();
const AlgebraicTypePlugin = SubclassingRestricted.createAlgebraicTypePlugin();

describe('ObjectSpecPlugins.SubclassingRestricted', function() {
  describe('#instanceMethods', function() {
    it('generates class with subclassing restricted compiler annotation', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: ['RMSubclassingRestricted'],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const subclassingRestricted:boolean = ObjectSpecPlugin.subclassingRestricted(objectType);
      expect(subclassingRestricted).toEqual(true);
    });
  });
});

describe('AlgebraicTypePlugins.SubclassingRestricted', function() {
  describe('#instanceMethods', function() {
    it('always generates unavailable init/new methods for ADTs', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: ['RMSubclassingRestricted'],
        typeLookups:[],
        excludes: [],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'subtypeOne',
            comments: [],
            attributes: [],
            annotations: {},
          })
        ],
      };

      const subclassingRestricted:boolean = AlgebraicTypePlugin.subclassingRestricted(algebraicType);
      expect(subclassingRestricted).toEqual(true);
    });
  });
});
