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

import AlgebraicTypeFunctionMatching = require('../../plugins/algebraic-type-function-matching');
import Code = require('../../code');
import Maybe = require('../../maybe');
import ObjC = require('../../objc');
import AlgebraicType = require('../../algebraic-type');

const Plugin = AlgebraicTypeFunctionMatching.createAlgebraicTypePlugin();

describe('Plugins.AlgebraicTypeFunctionMatching', function() {
  describe('#blockTypes', function() {
    it('returns block types for matching an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject')
                }
              },
              {
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            name: 'singleAttributeSubtype',
            nullability:ObjC.Nullability.Inherited(),
            comments: [],
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject')
            }
          })
        ]
      };

      const blockTypes:ObjC.BlockType[] = Plugin.blockTypes(algebraicType);

      const expectedBlockTypes:ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestSomeSubtypeMatchHandler',
          parameters: [
            {
              name: 'someString',
              type: {
                name: 'NSString',
                reference:'NSString *'
              }
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference:'NSUInteger'
              }
            }
          ],
          returnType: Maybe.Nothing<ObjC.Type>(),
          isPublic: true
        },
        {
          comments: [],
          name: 'TestSingleAttributeSubtypeMatchHandler',
          parameters: [
            {
              name: 'singleAttributeSubtype',
              type: {
                name: 'SingleAttributeType',
                reference: 'SingleAttributeType *'
              }
            }
          ],
          returnType: Maybe.Nothing<ObjC.Type>(),
          isPublic: true
        }
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#instanceMethods', function() {
    it('returns an instance method for matching the subtypes of an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject')
                }
              },
              {
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            name: 'singleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject')
            }
          })
        ]
      };

      const instanceMethods:ObjC.Method[] = Plugin.instanceMethods(algebraicType);

      const expectedInstanceMethod:ObjC.Method = {
        belongsToProtocol:Maybe.Nothing<string>(),
        code: [
          'switch (_subtype) {',
          '  case _TestSubtypesSomeSubtype: {',
          '    someSubtypeMatchHandler(_someSubtype_someString, _someSubtype_someUnsignedInteger);',
          '    break;',
          '  }',
          '  case _TestSubtypesSingleAttributeSubtype: {',
          '    singleAttributeSubtypeMatchHandler(_singleAttributeSubtype);',
          '    break;',
          '  }',
          '}'
        ],
        comments: [],
        keywords: [
          {
            name: 'matchSomeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'someSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestSomeSubtypeMatchHandler',
                reference:'TestSomeSubtypeMatchHandler'
              }
            })
          },
          {
            name: 'singleAttributeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestSingleAttributeSubtypeMatchHandler',
                reference:'TestSingleAttributeSubtypeMatchHandler'
              }
            })
          }
        ],
        returnType: Maybe.Nothing<ObjC.Type>()
      };

      expect(instanceMethods).toContain(expectedInstanceMethod);
    });
  });
});
