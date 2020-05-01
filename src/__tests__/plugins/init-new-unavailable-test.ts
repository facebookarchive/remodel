/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as AlgebraicType from '../../algebraic-type';
import * as InitNewUnavailable from '../../plugins/init-new-unavailable';
import * as Maybe from '../../maybe';
import * as ObjC from '../../objc';
import * as ObjectSpec from '../../object-spec';

const ObjectSpecPlugin = InitNewUnavailable.createPlugin();
const AlgebraicTypePlugin = InitNewUnavailable.createAlgebraicTypePlugin();

describe('ObjectSpecPlugins.InitNewUnavailable', function() {
  describe('#instanceMethods', function() {
    it('generates no instance or class methods, if no attributes are given', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: ['RMInitNewUnavailable'],
        libraryName: null,
        typeName: 'Foo',
      };

      const instanceMethods: ObjC.Method[] = ObjectSpecPlugin.instanceMethods(
        objectType,
      );
      const expectedInstanceMethods: ObjC.Method[] = [];
      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);

      const classMethods: ObjC.Method[] = ObjectSpecPlugin.classMethods(
        objectType,
      );
      const expectedClassMethods: ObjC.Method[] = [];
      expect(classMethods).toEqualJSON(expectedClassMethods);
    });

    it('generates unavailable init/new instance methods, if at least one attribute is given', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'value',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'NSString',
              reference: 'NSString *',
              underlyingType: 'NSObject',
              conformingProtocol: null,
              referencedGenericTypes: [],
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: ['RMInitNewUnavailable'],
        libraryName: null,
        typeName: 'Foo',
      };

      const instanceMethods: ObjC.Method[] = ObjectSpecPlugin.instanceMethods(
        objectType,
      );
      const expectedInstanceMethods: ObjC.Method[] = [
        {
          preprocessors: [],
          belongsToProtocol: 'NSObject',
          code: [],
          comments: [],
          compilerAttributes: ['NS_UNAVAILABLE'],
          keywords: [
            {
              name: 'init',
              argument: null,
            },
          ],
          returnType: {
            type: {
              name: 'instancetype',
              reference: 'instancetype',
            },
            modifiers: [],
          },
        },
      ];
      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);

      const classMethods: ObjC.Method[] = ObjectSpecPlugin.classMethods(
        objectType,
      );
      const expectedClassMethods: ObjC.Method[] = [
        {
          preprocessors: [],
          belongsToProtocol: 'NSObject',
          code: [],
          comments: [],
          compilerAttributes: ['NS_UNAVAILABLE'],
          keywords: [
            {
              name: 'new',
              argument: null,
            },
          ],
          returnType: {
            type: {
              name: 'instancetype',
              reference: 'instancetype',
            },
            modifiers: [],
          },
        },
      ];
      expect(classMethods).toEqualJSON(expectedClassMethods);
    });
  });
});

describe('AlgebraicTypePlugins.InitNewUnavailable', function() {
  describe('#instanceMethods', function() {
    it('always generates unavailable init/new methods for ADTs', function() {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: ['RMInitNewUnavailable'],
        typeLookups: [],
        excludes: [],
        libraryName: null,
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'subtypeOne',
            comments: [],
            attributes: [],
            annotations: {},
          }),
        ],
      };

      const instanceMethods: ObjC.Method[] = AlgebraicTypePlugin.instanceMethods(
        algebraicType,
      );
      const expectedInstanceMethods: ObjC.Method[] = [
        {
          preprocessors: [],
          belongsToProtocol: 'NSObject',
          code: [],
          comments: [],
          compilerAttributes: ['NS_UNAVAILABLE'],
          keywords: [
            {
              name: 'init',
              argument: null,
            },
          ],
          returnType: {
            type: {
              name: 'instancetype',
              reference: 'instancetype',
            },
            modifiers: [],
          },
        },
      ];
      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);

      const classMethods: ObjC.Method[] = AlgebraicTypePlugin.classMethods(
        algebraicType,
      );
      const expectedClassMethods: ObjC.Method[] = [
        {
          preprocessors: [],
          belongsToProtocol: 'NSObject',
          code: [],
          comments: [],
          compilerAttributes: ['NS_UNAVAILABLE'],
          keywords: [
            {
              name: 'new',
              argument: null,
            },
          ],
          returnType: {
            type: {
              name: 'instancetype',
              reference: 'instancetype',
            },
            modifiers: [],
          },
        },
      ];
      expect(classMethods).toEqualJSON(expectedClassMethods);
    });
  });
});
