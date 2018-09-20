/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import AlgebraicTypeVoidMatching = require('../../plugins/algebraic-type-matching-void');
import AlgebraicTypeBoolMatching = require('../../plugins/algebraic-type-matching-bool');
import AlgebraicTypeIntegerMatching = require('../../plugins/algebraic-type-matching-integer');
import AlgebraicTypeDoubleMatching = require('../../plugins/algebraic-type-matching-double');
import AlgebraicTypeGenericMatching = require('../../plugins/algebraic-type-matching-generic');
import Code = require('../../code');
import Maybe = require('../../maybe');
import ObjC = require('../../objc');
import AlgebraicType = require('../../algebraic-type');

const VoidPlugin = AlgebraicTypeVoidMatching.createAlgebraicTypePlugin();
const BoolPlugin = AlgebraicTypeBoolMatching.createAlgebraicTypePlugin();
const IntegerPlugin = AlgebraicTypeIntegerMatching.createAlgebraicTypePlugin();
const DoublePlugin = AlgebraicTypeDoubleMatching.createAlgebraicTypePlugin();
const GenericPlugin = AlgebraicTypeGenericMatching.createAlgebraicTypePlugin();

function algebraicTestTypeWithTwoSubtypes():AlgebraicType.Type {
  return {
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
}

describe('Plugins.AlgebraicTypeVoidMatching', function() {
  describe('#blockTypes', function() {
    it('returns block types for matching an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
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
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
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
        compilerAttributes:[
          'NS_SWIFT_NAME(match(someSubtype:singleAttributeSubtype:))'
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
                reference:'TestSomeSubtypeMatchHandler NS_NOESCAPE'
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
                reference:'TestSingleAttributeSubtypeMatchHandler NS_NOESCAPE'
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
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
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
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
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
        compilerAttributes:[
          'NS_SWIFT_NAME(match(someSubtype:singleAttributeSubtype:))'
        ],
        comments: [],
        keywords: [
          {
            name: 'matchBooleanSomeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'someSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestBooleanSomeSubtypeMatchHandler',
                reference:'TestBooleanSomeSubtypeMatchHandler NS_NOESCAPE'
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
                reference:'TestBooleanSingleAttributeSubtypeMatchHandler NS_NOESCAPE'
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
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
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
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
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
        compilerAttributes:[
          'NS_SWIFT_NAME(match(someSubtype:singleAttributeSubtype:))'
        ],
        comments: [],
        keywords: [
          {
            name: 'matchIntegerSomeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'someSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestIntegerSomeSubtypeMatchHandler',
                reference:'TestIntegerSomeSubtypeMatchHandler NS_NOESCAPE'
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
                reference:'TestIntegerSingleAttributeSubtypeMatchHandler NS_NOESCAPE'
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
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
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
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
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
        compilerAttributes:[
          'NS_SWIFT_NAME(match(someSubtype:singleAttributeSubtype:))'
        ],
        comments: [],
        keywords: [
          {
            name: 'matchDoubleSomeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'someSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestDoubleSomeSubtypeMatchHandler',
                reference:'TestDoubleSomeSubtypeMatchHandler NS_NOESCAPE'
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
                reference:'TestDoubleSingleAttributeSubtypeMatchHandler NS_NOESCAPE'
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

describe('Plugins.AlgebraicTypeGenericMatching', function() {
  describe('#newFile', function() {
    it('returns a new matching file for algebraic type', function() {
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
      const actualFilename = GenericPlugin.additionalFiles(algebraicType)[0].name;
      expect(actualFilename).toEqual('TestMatcher');
    });
  });

  describe('#blockTypes', function() {
    it('returns block types in additional file for generic matching an algebraic type', function() {
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
      const blockTypes:ObjC.BlockType[] = GenericPlugin.additionalFiles(algebraicType)[0].blockTypes;

      const expectedBlockTypes:ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestObjectTypeSomeSubtypeMatchHandler',
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
              name: 'ObjectType',
              reference: 'ObjectType'
            }), 
            modifiers:[]
          },
          isPublic: true,
          isInlined: true,
          nullability: ObjC.ClassNullability.default
        },
        {
          comments: [],
          name: 'TestObjectTypeSingleAttributeSubtypeMatchHandler',
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
              name: 'ObjectType',
              reference: 'ObjectType'
            }), 
            modifiers:[]
          },
          isPublic: true,
          isInlined: true,
          nullability: ObjC.ClassNullability.default
        }
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#classMethods', function() {
    it('returns a class method for generic algebraic type matching', function() {
      const algebraicType:AlgebraicType.Type = algebraicTestTypeWithTwoSubtypes();
      const instanceMethods:ObjC.Method[] = GenericPlugin.instanceMethods(algebraicType);
      const classMethods = GenericPlugin.additionalFiles(algebraicType)[0].classes[0].classMethods;

      const expectedClassMethod:ObjC.Method = {
        preprocessors:[],
        belongsToProtocol:Maybe.Nothing<string>(),
        code: [
          '__block id result = nil;',
          '',
          'TestSomeSubtypeMatchHandler matchSomeSubtype = ^(NSString *someString, NSUInteger someUnsignedInteger) {',
          '  result = someSubtypeMatchHandler(someString, someUnsignedInteger);',
          '};',
          '',
          'TestSingleAttributeSubtypeMatchHandler matchSingleAttributeSubtype = ^(SingleAttributeType *singleAttributeSubtype) {',
          '  result = singleAttributeSubtypeMatchHandler(singleAttributeSubtype);',
          '};',
          '',
          '[test matchSomeSubtype:matchSomeSubtype singleAttributeSubtype:matchSingleAttributeSubtype];',
          '',
          'return result;'
        ],
        compilerAttributes:[],
        comments: [],
        keywords: [
          {
            name: 'match',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'test',
              modifiers: [],
              type: {
                name: 'Test',
                reference:'Test*'
              }
            })
          },
          {
            name: 'someSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'someSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestObjectTypeSomeSubtypeMatchHandler',
                reference:'TestObjectTypeSomeSubtypeMatchHandler NS_NOESCAPE'
              }
            })
          },
          {
            name: 'singleAttributeSubtype',
            argument: Maybe.Just<ObjC.KeywordArgument>({
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [],
              type: {
                name: 'TestObjectTypeSingleAttributeSubtypeMatchHandler',
                reference:'TestObjectTypeSingleAttributeSubtypeMatchHandler NS_NOESCAPE'
              }
            })
          }
        ],
        returnType:{
          type:Maybe.Just<ObjC.Type>({
            name: 'ObjectType',
            reference: 'ObjectType'
          }), 
          modifiers:[]
        },
      };

      expect(classMethods).toContain(expectedClassMethod);
    });
  });
});
