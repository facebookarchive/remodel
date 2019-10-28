/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as AlgebraicTypeTemplatedMatching from '../../plugins/algebraic-type-templated-matching';
import * as Code from '../../code';
import * as CPlusPlus from '../../cplusplus';
import * as Maybe from '../../maybe';
import * as AlgebraicType from '../../algebraic-type';
import * as ObjC from '../../objc';

const Plugin = AlgebraicTypeTemplatedMatching.createAlgebraicTypePlugin();

describe('Plugins.AlgebraicTypeTemplatedMatching', function() {
  describe('#additionalFiles', function() {
    it('returns a header and implementation for matching on an algebraic type', function() {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'RMTest',
        includes: [],
        excludes: [],
        typeLookups: [],
        libraryName: null,
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someString',
                comments: [],
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: null,
                  fileTypeIsDefinedIn: null,
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
                },
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: null,
                  fileTypeIsDefinedIn: null,
                  underlyingType: null,
                  conformingProtocol: null,
                },
              },
            ],
            annotations: {},
          }),
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'GreatThing',
            comments: [],
            attributes: [],
            annotations: {},
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
            annotations: {},
            name: 'coolSingleAttributeSubtype',
            comments: [],
            nullability: ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: 'SomeLib',
              fileTypeIsDefinedIn: null,
              underlyingType: 'NSObject',
              conformingProtocol: null,
            },
          }),
        ],
      };

      const additionalFiles: Code.File[] = Plugin.additionalFiles(
        algebraicType,
      );

      const expectedFile: Code.File = {
        name: 'RMTestTemplatedMatchingHelpers',
        type: Code.FileType.ObjectiveCPlusPlus,
        imports: [
          {
            file: 'Foundation.h',
            isPublic: true,
            library: 'Foundation',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMTest.h',
            isPublic: true,
            library: null,
            requiresCPlusPlus: false,
          },
          {
            file: 'RMTestTemplatedMatchingHelpers.h',
            isPublic: false,
            library: null,
            requiresCPlusPlus: false,
          },
          {
            file: 'memory',
            isPublic: true,
            library: null,
            requiresCPlusPlus: true,
          },
        ],
        enumerations: [],
        blockTypes: [],
        comments: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [],
        structs: [
          Code.Struct.ObjectiveCPlusPlusStruct({
            name: 'RMTestMatcher',
            templates: [
              {
                templatedTypes: [
                  {
                    type: CPlusPlus.TemplateType.Typename(),
                    value: 'T',
                  },
                ],
                code: [],
              },
            ],
            code: [
              [
                'static T match(RMTest *test, T(^someSubtypeMatchHandler)(NSString *someString, NSUInteger someUnsignedInteger), T(^greatThingMatchHandler)(), T(^coolSingleAttributeSubtypeMatchHandler)(SingleAttributeType *coolSingleAttributeSubtype)) {',
                '  NSCAssert(test != nil, @"The ADT object test is nil");',
                '  __block std::unique_ptr<T> result;',
                '',
                '  RMTestSomeSubtypeMatchHandler __unsafe_unretained matchSomeSubtype = ^(NSString *someString, NSUInteger someUnsignedInteger) {',
                '    result = std::make_unique<T>(someSubtypeMatchHandler(someString, someUnsignedInteger));',
                '  };',
                '',
                '  RMTestGreatThingMatchHandler __unsafe_unretained matchGreatThing = ^(void) {',
                '    result = std::make_unique<T>(greatThingMatchHandler());',
                '  };',
                '',
                '  RMTestCoolSingleAttributeSubtypeMatchHandler __unsafe_unretained matchCoolSingleAttributeSubtype = ^(SingleAttributeType *coolSingleAttributeSubtype) {',
                '    result = std::make_unique<T>(coolSingleAttributeSubtypeMatchHandler(coolSingleAttributeSubtype));',
                '  };',
                '',
                '  [test matchSomeSubtype:matchSomeSubtype greatThing:matchGreatThing coolSingleAttributeSubtype:matchCoolSingleAttributeSubtype];',
                '  return *result;',
                '}',
              ],
              [
                'static T match(T(^someSubtypeMatchHandler)(NSString *someString, NSUInteger someUnsignedInteger), T(^greatThingMatchHandler)(), T(^coolSingleAttributeSubtypeMatchHandler)(SingleAttributeType *coolSingleAttributeSubtype), RMTest *test) {',
                '  return match(test, someSubtypeMatchHandler, greatThingMatchHandler, coolSingleAttributeSubtypeMatchHandler);',
                '}',
              ],
            ],
          }),
        ],
        namespaces: [],
        macros: [],
      };

      expect(additionalFiles[0]).toEqual(expectedFile);
    });
  });
});
