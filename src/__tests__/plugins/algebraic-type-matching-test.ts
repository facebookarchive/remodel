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

import AlgebraicTypeVoidMatching = require('../../plugins/algebraic-type-matching-void');
import AlgebraicTypeBoolMatching = require('../../plugins/algebraic-type-matching-bool');
import AlgebraicTypeIntegerMatching = require('../../plugins/algebraic-type-matching-integer');
import AlgebraicTypeDoubleMatching = require('../../plugins/algebraic-type-matching-double');
import Code = require('../../code');
import Maybe = require('../../maybe');
import ObjC = require('../../objc');
import AlgebraicType = require('../../algebraic-type');

const VoidPlugin = AlgebraicTypeVoidMatching.createAlgebraicTypePlugin();
const BoolPlugin = AlgebraicTypeBoolMatching.createAlgebraicTypePlugin();
const IntegerPlugin = AlgebraicTypeIntegerMatching.createAlgebraicTypePlugin();
const DoublePlugin = AlgebraicTypeDoubleMatching.createAlgebraicTypePlugin();

describe('Plugins.AlgebraicTypeVoidMatching', function() {
  describe('#blockTypes', function() {
    it('returns block types for matching an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
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
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            nullability:ObjC.Nullability.Inherited(),
            comments: [],
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const blockTypes:ObjC.BlockType[] = VoidPlugin.blockTypes(algebraicType);

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
              },
              nullability: ObjC.Nullability.Inherited()
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference:'NSUInteger'
              },
              nullability: ObjC.Nullability.Inherited()
            }
          ],
          returnType:{ type:Maybe.Nothing<ObjC.Type>(), modifiers:[] },
          isPublic: true,
          isInlined: false,
          nullability: ObjC.ClassNullability.default
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
              },
              nullability: ObjC.Nullability.Inherited()
            }
          ],
          returnType:{ type:Maybe.Nothing<ObjC.Type>(), modifiers:[] },
          isPublic: true,
          isInlined: false,
          nullability: ObjC.ClassNullability.default
        }
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#instanceMethods', function() {
    it('returns an instance method for matching the subtypes of an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
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
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const instanceMethods:ObjC.Method[] = VoidPlugin.instanceMethods(algebraicType);

      const expectedInstanceMethod:ObjC.Method = {
        preprocessors:[],
        belongsToProtocol:Maybe.Nothing<string>(),
        code: [
          'switch (_subtype) {',
          '  case _TestSubtypesSomeSubtype: {',
          '    if (someSubtypeMatchHandler) {',
          '      someSubtypeMatchHandler(_someSubtype_someString, _someSubtype_someUnsignedInteger);',
          '    }',
          '    break;',
          '  }',
          '  case _TestSubtypesSingleAttributeSubtype: {',
          '    if (singleAttributeSubtypeMatchHandler) {',
          '      singleAttributeSubtypeMatchHandler(_singleAttributeSubtype);',
          '    }',
          '    break;',
          '  }',
          '}'
        ],
        compilerAttributes:[],
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
        returnType:{ type:Maybe.Nothing<ObjC.Type>(), modifiers:[] },
      };

      expect(instanceMethods).toContain(expectedInstanceMethod);
    });
  });
});

describe('Plugins.AlgebraicTypeBoolMatching', function() {
  describe('#blockTypes', function() {
    it('returns block types for bool matching an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
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
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            nullability:ObjC.Nullability.Inherited(),
            comments: [],
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const blockTypes:ObjC.BlockType[] = BoolPlugin.blockTypes(algebraicType);

      const expectedBlockTypes:ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestBooleanSomeSubtypeMatchHandler',
          parameters: [
            {
              name: 'someString',
              type: {
                name: 'NSString',
                reference:'NSString *'
              },
              nullability: ObjC.Nullability.Inherited()
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference:'NSUInteger'
              },
              nullability: ObjC.Nullability.Inherited()
            }
          ],
          returnType:{
            type:Maybe.Just<ObjC.Type>({
              name: 'BOOL',
              reference: 'BOOL'
            }), 
            modifiers:[]
          },
          isPublic: true,
          isInlined: false,
          nullability: ObjC.ClassNullability.default
        },
        {
          comments: [],
          name: 'TestBooleanSingleAttributeSubtypeMatchHandler',
          parameters: [
            {
              name: 'singleAttributeSubtype',
              type: {
                name: 'SingleAttributeType',
                reference: 'SingleAttributeType *'
              },
              nullability: ObjC.Nullability.Inherited()
            }
          ],
          returnType:{
            type:Maybe.Just<ObjC.Type>({
              name: 'BOOL',
              reference: 'BOOL'
            }), 
            modifiers:[]
          },
          isPublic: true,
          isInlined: false,
          nullability: ObjC.ClassNullability.default
        }
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#instanceMethods', function() {
    it('returns an instance method for bool matching the subtypes of an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
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
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const instanceMethods:ObjC.Method[] = BoolPlugin.instanceMethods(algebraicType);

      const expectedInstanceMethod:ObjC.Method = {
        preprocessors:[],
        belongsToProtocol:Maybe.Nothing<string>(),
        code: [
          '__block BOOL result = NO;',
          'switch (_subtype) {',
          '  case _TestSubtypesSomeSubtype: {',
          '    if (someSubtypeMatchHandler) {',
          '      result = someSubtypeMatchHandler(_someSubtype_someString, _someSubtype_someUnsignedInteger);',
          '    }',
          '    break;',
          '  }',
          '  case _TestSubtypesSingleAttributeSubtype: {',
          '    if (singleAttributeSubtypeMatchHandler) {',
          '      result = singleAttributeSubtypeMatchHandler(_singleAttributeSubtype);',
          '    }',
          '    break;',
          '  }',
          '}',
          'return result;'
        ],
        compilerAttributes:[],
        comments: [],
        keywords: [
          {
            name: 'matchBooleanSomeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'someSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestBooleanSomeSubtypeMatchHandler',
                reference:'TestBooleanSomeSubtypeMatchHandler'
              }
            })
          },
          {
            name: 'singleAttributeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestBooleanSingleAttributeSubtypeMatchHandler',
                reference:'TestBooleanSingleAttributeSubtypeMatchHandler'
              }
            })
          }
        ],
        returnType:{
          type:Maybe.Just<ObjC.Type>({
            name: 'BOOL',
            reference: 'BOOL'
          }), 
          modifiers:[]
        },
      };

      expect(instanceMethods).toContain(expectedInstanceMethod);
    });
  });
});

describe('Plugins.AlgebraicTypeIntegerMatching', function() {
  describe('#blockTypes', function() {
    it('returns block types for integer matching an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
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
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            nullability:ObjC.Nullability.Inherited(),
            comments: [],
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const blockTypes:ObjC.BlockType[] = IntegerPlugin.blockTypes(algebraicType);

      const expectedBlockTypes:ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestIntegerSomeSubtypeMatchHandler',
          parameters: [
            {
              name: 'someString',
              type: {
                name: 'NSString',
                reference:'NSString *'
              },
              nullability: ObjC.Nullability.Inherited()
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference:'NSUInteger'
              },
              nullability: ObjC.Nullability.Inherited()
            }
          ],
          returnType:{
            type:Maybe.Just<ObjC.Type>({
              name: 'NSInteger',
              reference: 'NSInteger'
            }), 
            modifiers:[]
          },
          isPublic: true,
          isInlined: false,
          nullability: ObjC.ClassNullability.default
        },
        {
          comments: [],
          name: 'TestIntegerSingleAttributeSubtypeMatchHandler',
          parameters: [
            {
              name: 'singleAttributeSubtype',
              type: {
                name: 'SingleAttributeType',
                reference: 'SingleAttributeType *'
              },
              nullability: ObjC.Nullability.Inherited()
            }
          ],
          returnType:{
            type:Maybe.Just<ObjC.Type>({
              name: 'NSInteger',
              reference: 'NSInteger'
            }), 
            modifiers:[]
          },
          isPublic: true,
          isInlined: false,
          nullability: ObjC.ClassNullability.default
        }
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#instanceMethods', function() {
    it('returns an instance method for integer matching the subtypes of an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
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
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const instanceMethods:ObjC.Method[] = IntegerPlugin.instanceMethods(algebraicType);

      const expectedInstanceMethod:ObjC.Method = {
        preprocessors:[],
        belongsToProtocol:Maybe.Nothing<string>(),
        code: [
          '__block NSInteger result = 0;',
          'switch (_subtype) {',
          '  case _TestSubtypesSomeSubtype: {',
          '    if (someSubtypeMatchHandler) {',
          '      result = someSubtypeMatchHandler(_someSubtype_someString, _someSubtype_someUnsignedInteger);',
          '    }',
          '    break;',
          '  }',
          '  case _TestSubtypesSingleAttributeSubtype: {',
          '    if (singleAttributeSubtypeMatchHandler) {',
          '      result = singleAttributeSubtypeMatchHandler(_singleAttributeSubtype);',
          '    }',
          '    break;',
          '  }',
          '}',
          'return result;'
        ],
        compilerAttributes:[],
        comments: [],
        keywords: [
          {
            name: 'matchIntegerSomeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'someSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestIntegerSomeSubtypeMatchHandler',
                reference:'TestIntegerSomeSubtypeMatchHandler'
              }
            })
          },
          {
            name: 'singleAttributeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestIntegerSingleAttributeSubtypeMatchHandler',
                reference:'TestIntegerSingleAttributeSubtypeMatchHandler'
              }
            })
          }
        ],
        returnType:{
          type:Maybe.Just<ObjC.Type>({
            name: 'NSInteger',
            reference: 'NSInteger'
          }), 
          modifiers:[]
        },
      };

      expect(instanceMethods).toContain(expectedInstanceMethod);
    });
  });
});

describe('Plugins.AlgebraicTypeDoubleMatching', function() {
  describe('#blockTypes', function() {
    it('returns block types for double matching an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
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
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            nullability:ObjC.Nullability.Inherited(),
            comments: [],
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const blockTypes:ObjC.BlockType[] = DoublePlugin.blockTypes(algebraicType);

      const expectedBlockTypes:ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestDoubleSomeSubtypeMatchHandler',
          parameters: [
            {
              name: 'someString',
              type: {
                name: 'NSString',
                reference:'NSString *'
              },
              nullability: ObjC.Nullability.Inherited()
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference:'NSUInteger'
              },
              nullability: ObjC.Nullability.Inherited()
            }
          ],
          returnType:{
            type:Maybe.Just<ObjC.Type>({
              name: 'double',
              reference: 'double'
            }), 
            modifiers:[]
          },
          isPublic: true,
          isInlined: false,
          nullability: ObjC.ClassNullability.default
        },
        {
          comments: [],
          name: 'TestDoubleSingleAttributeSubtypeMatchHandler',
          parameters: [
            {
              name: 'singleAttributeSubtype',
              type: {
                name: 'SingleAttributeType',
                reference: 'SingleAttributeType *'
              },
              nullability: ObjC.Nullability.Inherited()
            }
          ],
          returnType:{
            type:Maybe.Just<ObjC.Type>({
              name: 'double',
              reference: 'double'
            }), 
            modifiers:[]
          },
          isPublic: true,
          isInlined: false,
          nullability: ObjC.ClassNullability.default
        }
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#instanceMethods', function() {
    it('returns an instance method for double matching the subtypes of an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
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
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const instanceMethods:ObjC.Method[] = DoublePlugin.instanceMethods(algebraicType);

      const expectedInstanceMethod:ObjC.Method = {
        preprocessors:[],
        belongsToProtocol:Maybe.Nothing<string>(),
        code: [
          '__block double result = 0.0f;',
          'switch (_subtype) {',
          '  case _TestSubtypesSomeSubtype: {',
          '    if (someSubtypeMatchHandler) {',
          '      result = someSubtypeMatchHandler(_someSubtype_someString, _someSubtype_someUnsignedInteger);',
          '    }',
          '    break;',
          '  }',
          '  case _TestSubtypesSingleAttributeSubtype: {',
          '    if (singleAttributeSubtypeMatchHandler) {',
          '      result = singleAttributeSubtypeMatchHandler(_singleAttributeSubtype);',
          '    }',
          '    break;',
          '  }',
          '}',
          'return result;'
        ],
        compilerAttributes:[],
        comments: [],
        keywords: [
          {
            name: 'matchDoubleSomeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'someSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestDoubleSomeSubtypeMatchHandler',
                reference:'TestDoubleSomeSubtypeMatchHandler'
              }
            })
          },
          {
            name: 'singleAttributeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestDoubleSingleAttributeSubtypeMatchHandler',
                reference:'TestDoubleSingleAttributeSubtypeMatchHandler'
              }
            })
          }
        ],
        returnType:{
          type:Maybe.Just<ObjC.Type>({
            name: 'double',
            reference: 'double'
          }), 
          modifiers:[]
        },
      };

      expect(instanceMethods).toContain(expectedInstanceMethod);
    });
  });
});
