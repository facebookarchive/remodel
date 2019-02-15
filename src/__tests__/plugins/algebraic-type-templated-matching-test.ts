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
        libraryName: Maybe.Nothing<string>(),
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
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>(),
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
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>(),
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
              libraryTypeIsDefinedIn: Maybe.Just('SomeLib'),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>(),
            },
          }),
        ],
      };

      const additionalFiles: Code.File[] = Plugin.additionalFiles(
        algebraicType,
      );

      const expectedFile: Code.File = {
        name: 'RMTestTemplatedMatchingHelpers',
        type: Code.FileType.ObjectiveCPlusPlus(),
        imports: [
          {
            file: 'Foundation.h',
            isPublic: true,
            library: Maybe.Just<string>('Foundation'),
            requiresCPlusPlus: false,
          },
          {
            file: 'RMTest.h',
            isPublic: true,
            library: Maybe.Nothing<string>(),
            requiresCPlusPlus: false
          },
          {
            file: 'RMTestTemplatedMatchingHelpers.h',
            isPublic: false,
            library: Maybe.Nothing<string>(),
            requiresCPlusPlus: false,
          },
          {
            file: 'memory',
            isPublic: true,
            library: Maybe.Nothing<string>(),
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
          {
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
                '  RMTestSomeSubtypeMatchHandler matchSomeSubtype = ^(NSString *someString, NSUInteger someUnsignedInteger) {',
                '    result = std::make_unique<T>(someSubtypeMatchHandler(someString, someUnsignedInteger));',
                '  };',
                '',
                '  RMTestGreatThingMatchHandler matchGreatThing = ^(void) {',
                '    result = std::make_unique<T>(greatThingMatchHandler());',
                '  };',
                '',
                '  RMTestCoolSingleAttributeSubtypeMatchHandler matchCoolSingleAttributeSubtype = ^(SingleAttributeType *coolSingleAttributeSubtype) {',
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
          },
        ],
        namespaces: [],
        macros: [],
      };

      expect(additionalFiles[0]).toEqual(expectedFile);
    });
  });
});
