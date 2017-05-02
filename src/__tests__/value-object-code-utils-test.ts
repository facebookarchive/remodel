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

import Maybe = require('../maybe');
import ObjectSpec = require('../object-spec');
import ObjectSpecCodeUtils = require('../object-spec-code-utils');
import ObjC = require('../objc');

function valueGenerator(attribute:ObjectSpec.Attribute):string {
  return attribute.name;
}

describe('ObjectSpecCodeUtils', function() {
  describe('#methodInvocationForConstructor', function() {
    it('returns a constructor with no parameters when there are no attributes', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const methodInvocation:string = ObjectSpecCodeUtils.methodInvocationForConstructor(objectType, valueGenerator);
      const expectedMethodInvocation:string = '[[Foo alloc] init]';
      expect(methodInvocation).toEqualJSON(expectedMethodInvocation);
    });

    it('returns a constructor with no parameters and the correct name when there ' +
       'are no attributes', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Test'
      };

      const methodInvocation:string = ObjectSpecCodeUtils.methodInvocationForConstructor(objectType, valueGenerator);
      const expectedMethodInvocation:string = '[[Test alloc] init]';
      expect(methodInvocation).toEqualJSON(expectedMethodInvocation);
    });

    it('returns a constructor with one parameter when there is one attribute', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'name',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'NSString',
              reference: 'NSString *',
              underlyingType:Maybe.Just<string>('NSObject')
            }
          }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Test'
      };

      const methodInvocation:string = ObjectSpecCodeUtils.methodInvocationForConstructor(objectType, valueGenerator);
      const expectedMethodInvocation:string = '[[Test alloc] initWithName:name]';
      expect(methodInvocation).toEqualJSON(expectedMethodInvocation);
    });

    it('returns a constructor with the correct parameter when there is one attribute', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'age',
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
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Test'
      };

      const methodInvocation:string = ObjectSpecCodeUtils.methodInvocationForConstructor(objectType, valueGenerator);
      const expectedMethodInvocation:string = '[[Test alloc] initWithAge:age]';
      expect(methodInvocation).toEqualJSON(expectedMethodInvocation);
    });

    it('returns a constructor with the two parameters when there are two attributes', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'name',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'NSString',
              reference: 'NSString *',
              underlyingType:Maybe.Just<string>('NSObject')
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'age',
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
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Test'
      };

      const methodInvocation:string = ObjectSpecCodeUtils.methodInvocationForConstructor(objectType, valueGenerator);
      const expectedMethodInvocation:string = '[[Test alloc] initWithName:name age:age]';
      expect(methodInvocation).toEqualJSON(expectedMethodInvocation);
    });
  });
});
