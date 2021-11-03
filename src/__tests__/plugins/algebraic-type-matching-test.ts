/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as AlgebraicTypeVoidMatching from '../../plugins/algebraic-type-matching-void';
import * as AlgebraicTypeBoolMatching from '../../plugins/algebraic-type-matching-bool';
import * as AlgebraicTypeIntegerMatching from '../../plugins/algebraic-type-matching-integer';
import * as AlgebraicTypeDoubleMatching from '../../plugins/algebraic-type-matching-double';
import * as AlgebraicTypeGenericMatching from '../../plugins/algebraic-type-matching-generic';
import * as Code from '../../code';
import * as Maybe from '../../maybe';
import * as ObjC from '../../objc';
import * as AlgebraicType from '../../algebraic-type';

const VoidPlugin = AlgebraicTypeVoidMatching.createAlgebraicTypePlugin();
const BoolPlugin = AlgebraicTypeBoolMatching.createAlgebraicTypePlugin();
const IntegerPlugin = AlgebraicTypeIntegerMatching.createAlgebraicTypePlugin();
const DoublePlugin = AlgebraicTypeDoubleMatching.createAlgebraicTypePlugin();
const GenericPlugin = AlgebraicTypeGenericMatching.createAlgebraicTypePlugin();

function algebraicTestTypeWithTwoSubtypes(): AlgebraicType.Type {
  return {
    annotations: {},
    name: 'Test',
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
              referencedGenericTypes: [],
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
              referencedGenericTypes: [],
            },
          },
        ],
        annotations: {},
      }),
      AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
        annotations: {},
        name: 'singleAttributeSubtype',
        nullability: ObjC.Nullability.Inherited(),
        comments: [],
        type: {
          name: 'SingleAttributeType',
          reference: 'SingleAttributeType *',
          libraryTypeIsDefinedIn: null,
          fileTypeIsDefinedIn: null,
          underlyingType: 'NSObject',
          conformingProtocol: null,
          referencedGenericTypes: [],
        },
      }),
    ],
  };
}

describe('Plugins.AlgebraicTypeVoidMatching', function () {
  describe('#blockTypes', function () {
    it('returns block types for matching an algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const blockTypes: ObjC.BlockType[] = VoidPlugin.blockTypes(algebraicType);

      const expectedBlockTypes: ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestSomeSubtypeMatchHandler',
          parameters: [
            {
              name: 'someString',
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {type: null, modifiers: []},
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
        {
          comments: [],
          name: 'TestSingleAttributeSubtypeMatchHandler',
          parameters: [
            {
              name: 'singleAttributeSubtype',
              type: {
                name: 'SingleAttributeType',
                reference: 'SingleAttributeType *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {type: null, modifiers: []},
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#instanceMethods', function () {
    it('returns an instance method for matching the subtypes of an algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const instanceMethods: ObjC.Method[] =
        VoidPlugin.instanceMethods(algebraicType);

      const expectedInstanceMethod: ObjC.Method = {
        preprocessors: [],
        belongsToProtocol: null,
        code: [
          'switch (_subtype) {',
          '  case TestSubtypesSomeSubtype: {',
          '    if (someSubtypeMatchHandler) {',
          '      someSubtypeMatchHandler(_someSubtype_someString, _someSubtype_someUnsignedInteger);',
          '    }',
          '    break;',
          '  }',
          '  case TestSubtypesSingleAttributeSubtype: {',
          '    if (singleAttributeSubtypeMatchHandler) {',
          '      singleAttributeSubtypeMatchHandler(_singleAttributeSubtype);',
          '    }',
          '    break;',
          '  }',
          '}',
        ],
        compilerAttributes: [
          'NS_SWIFT_NAME(match(someSubtype:singleAttributeSubtype:))',
        ],
        comments: [],
        keywords: [
          {
            name: 'matchSomeSubtype',
            argument: {
              name: 'someSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestSomeSubtypeMatchHandler',
                reference: 'TestSomeSubtypeMatchHandler',
              },
            },
          },
          {
            name: 'singleAttributeSubtype',
            argument: {
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestSingleAttributeSubtypeMatchHandler',
                reference: 'TestSingleAttributeSubtypeMatchHandler',
              },
            },
          },
        ],
        returnType: {type: null, modifiers: []},
      };

      expect(instanceMethods).toContain(expectedInstanceMethod);
    });
  });
});

describe('Plugins.AlgebraicTypeBoolMatching', function () {
  describe('#blockTypes', function () {
    it('returns block types for bool matching an algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const blockTypes: ObjC.BlockType[] = BoolPlugin.blockTypes(algebraicType);

      const expectedBlockTypes: ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestBooleanSomeSubtypeMatchHandler',
          parameters: [
            {
              name: 'someString',
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {
            type: {
              name: 'BOOL',
              reference: 'BOOL',
            },
            modifiers: [],
          },
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
        {
          comments: [],
          name: 'TestBooleanSingleAttributeSubtypeMatchHandler',
          parameters: [
            {
              name: 'singleAttributeSubtype',
              type: {
                name: 'SingleAttributeType',
                reference: 'SingleAttributeType *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {
            type: {
              name: 'BOOL',
              reference: 'BOOL',
            },
            modifiers: [],
          },
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#instanceMethods', function () {
    it('returns an instance method for bool matching the subtypes of an algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const instanceMethods: ObjC.Method[] =
        BoolPlugin.instanceMethods(algebraicType);

      const expectedInstanceMethod: ObjC.Method = {
        preprocessors: [],
        belongsToProtocol: null,
        code: [
          '__block BOOL result = NO;',
          'switch (_subtype) {',
          '  case TestSubtypesSomeSubtype: {',
          '    if (someSubtypeMatchHandler) {',
          '      result = someSubtypeMatchHandler(_someSubtype_someString, _someSubtype_someUnsignedInteger);',
          '    }',
          '    break;',
          '  }',
          '  case TestSubtypesSingleAttributeSubtype: {',
          '    if (singleAttributeSubtypeMatchHandler) {',
          '      result = singleAttributeSubtypeMatchHandler(_singleAttributeSubtype);',
          '    }',
          '    break;',
          '  }',
          '}',
          'return result;',
        ],
        compilerAttributes: [
          'NS_SWIFT_NAME(match(someSubtype:singleAttributeSubtype:))',
        ],
        comments: [],
        keywords: [
          {
            name: 'matchBooleanSomeSubtype',
            argument: {
              name: 'someSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestBooleanSomeSubtypeMatchHandler',
                reference: 'TestBooleanSomeSubtypeMatchHandler',
              },
            },
          },
          {
            name: 'singleAttributeSubtype',
            argument: {
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestBooleanSingleAttributeSubtypeMatchHandler',
                reference: 'TestBooleanSingleAttributeSubtypeMatchHandler',
              },
            },
          },
        ],
        returnType: {
          type: {
            name: 'BOOL',
            reference: 'BOOL',
          },
          modifiers: [],
        },
      };

      expect(instanceMethods).toContain(expectedInstanceMethod);
    });
  });
});

describe('Plugins.AlgebraicTypeIntegerMatching', function () {
  describe('#blockTypes', function () {
    it('returns block types for integer matching an algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const blockTypes: ObjC.BlockType[] =
        IntegerPlugin.blockTypes(algebraicType);

      const expectedBlockTypes: ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestIntegerSomeSubtypeMatchHandler',
          parameters: [
            {
              name: 'someString',
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {
            type: {
              name: 'NSInteger',
              reference: 'NSInteger',
            },
            modifiers: [],
          },
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
        {
          comments: [],
          name: 'TestIntegerSingleAttributeSubtypeMatchHandler',
          parameters: [
            {
              name: 'singleAttributeSubtype',
              type: {
                name: 'SingleAttributeType',
                reference: 'SingleAttributeType *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {
            type: {
              name: 'NSInteger',
              reference: 'NSInteger',
            },
            modifiers: [],
          },
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#instanceMethods', function () {
    it('returns an instance method for integer matching the subtypes of an algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const instanceMethods: ObjC.Method[] =
        IntegerPlugin.instanceMethods(algebraicType);

      const expectedInstanceMethod: ObjC.Method = {
        preprocessors: [],
        belongsToProtocol: null,
        code: [
          '__block NSInteger result = 0;',
          'switch (_subtype) {',
          '  case TestSubtypesSomeSubtype: {',
          '    if (someSubtypeMatchHandler) {',
          '      result = someSubtypeMatchHandler(_someSubtype_someString, _someSubtype_someUnsignedInteger);',
          '    }',
          '    break;',
          '  }',
          '  case TestSubtypesSingleAttributeSubtype: {',
          '    if (singleAttributeSubtypeMatchHandler) {',
          '      result = singleAttributeSubtypeMatchHandler(_singleAttributeSubtype);',
          '    }',
          '    break;',
          '  }',
          '}',
          'return result;',
        ],
        compilerAttributes: [
          'NS_SWIFT_NAME(match(someSubtype:singleAttributeSubtype:))',
        ],
        comments: [],
        keywords: [
          {
            name: 'matchIntegerSomeSubtype',
            argument: {
              name: 'someSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestIntegerSomeSubtypeMatchHandler',
                reference: 'TestIntegerSomeSubtypeMatchHandler',
              },
            },
          },
          {
            name: 'singleAttributeSubtype',
            argument: {
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestIntegerSingleAttributeSubtypeMatchHandler',
                reference: 'TestIntegerSingleAttributeSubtypeMatchHandler',
              },
            },
          },
        ],
        returnType: {
          type: {
            name: 'NSInteger',
            reference: 'NSInteger',
          },
          modifiers: [],
        },
      };

      expect(instanceMethods).toContain(expectedInstanceMethod);
    });
  });
});

describe('Plugins.AlgebraicTypeDoubleMatching', function () {
  describe('#blockTypes', function () {
    it('returns block types for double matching an algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const blockTypes: ObjC.BlockType[] =
        DoublePlugin.blockTypes(algebraicType);

      const expectedBlockTypes: ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestDoubleSomeSubtypeMatchHandler',
          parameters: [
            {
              name: 'someString',
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {
            type: {
              name: 'double',
              reference: 'double',
            },
            modifiers: [],
          },
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
        {
          comments: [],
          name: 'TestDoubleSingleAttributeSubtypeMatchHandler',
          parameters: [
            {
              name: 'singleAttributeSubtype',
              type: {
                name: 'SingleAttributeType',
                reference: 'SingleAttributeType *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {
            type: {
              name: 'double',
              reference: 'double',
            },
            modifiers: [],
          },
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#instanceMethods', function () {
    it('returns an instance method for double matching the subtypes of an algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const instanceMethods: ObjC.Method[] =
        DoublePlugin.instanceMethods(algebraicType);

      const expectedInstanceMethod: ObjC.Method = {
        preprocessors: [],
        belongsToProtocol: null,
        code: [
          '__block double result = 0.0f;',
          'switch (_subtype) {',
          '  case TestSubtypesSomeSubtype: {',
          '    if (someSubtypeMatchHandler) {',
          '      result = someSubtypeMatchHandler(_someSubtype_someString, _someSubtype_someUnsignedInteger);',
          '    }',
          '    break;',
          '  }',
          '  case TestSubtypesSingleAttributeSubtype: {',
          '    if (singleAttributeSubtypeMatchHandler) {',
          '      result = singleAttributeSubtypeMatchHandler(_singleAttributeSubtype);',
          '    }',
          '    break;',
          '  }',
          '}',
          'return result;',
        ],
        compilerAttributes: [
          'NS_SWIFT_NAME(match(someSubtype:singleAttributeSubtype:))',
        ],
        comments: [],
        keywords: [
          {
            name: 'matchDoubleSomeSubtype',
            argument: {
              name: 'someSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestDoubleSomeSubtypeMatchHandler',
                reference: 'TestDoubleSomeSubtypeMatchHandler',
              },
            },
          },
          {
            name: 'singleAttributeSubtype',
            argument: {
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestDoubleSingleAttributeSubtypeMatchHandler',
                reference: 'TestDoubleSingleAttributeSubtypeMatchHandler',
              },
            },
          },
        ],
        returnType: {
          type: {
            name: 'double',
            reference: 'double',
          },
          modifiers: [],
        },
      };

      expect(instanceMethods).toContain(expectedInstanceMethod);
    });
  });
});

describe('Plugins.AlgebraicTypeGenericMatching', function () {
  describe('#newFile', function () {
    it('returns a new matching file for algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const actualFilename =
        GenericPlugin.additionalFiles(algebraicType)[0].name;
      expect(actualFilename).toEqual('TestMatcher');
    });
  });

  describe('#blockTypes', function () {
    it('returns block types in additional file for generic matching an algebraic type', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const blockTypes: ObjC.BlockType[] =
        GenericPlugin.additionalFiles(algebraicType)[0].classes[0]
          .inlineBlockTypedefs;

      const expectedBlockTypes: ObjC.BlockType[] = [
        {
          comments: [],
          name: 'TestObjectTypeSomeSubtypeMatchHandler',
          parameters: [
            {
              name: 'someString',
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
            {
              name: 'someUnsignedInteger',
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {
            type: {
              name: 'ObjectType',
              reference: 'ObjectType',
            },
            modifiers: [],
          },
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
        {
          comments: [],
          name: 'TestObjectTypeSingleAttributeSubtypeMatchHandler',
          parameters: [
            {
              name: 'singleAttributeSubtype',
              type: {
                name: 'SingleAttributeType',
                reference: 'SingleAttributeType *',
              },
              nullability: ObjC.Nullability.Inherited(),
            },
          ],
          returnType: {
            type: {
              name: 'ObjectType',
              reference: 'ObjectType',
            },
            modifiers: [],
          },
          isPublic: true,
          nullability: ObjC.ClassNullability.default,
        },
      ];

      expect(blockTypes).toEqualJSON(expectedBlockTypes);
    });
  });

  describe('#classMethods', function () {
    it('returns a class method for generic algebraic type matching', function () {
      const algebraicType: AlgebraicType.Type =
        algebraicTestTypeWithTwoSubtypes();
      const instanceMethods: ObjC.Method[] =
        GenericPlugin.instanceMethods(algebraicType);
      const classMethods =
        GenericPlugin.additionalFiles(algebraicType)[0].classes[0].classMethods;

      const expectedClassMethod: ObjC.Method = {
        preprocessors: [],
        belongsToProtocol: null,
        code: [
          '__block id result = nil;',
          '',
          'TestSomeSubtypeMatchHandler __unsafe_unretained matchSomeSubtype = ^(NSString *someString, NSUInteger someUnsignedInteger) {',
          '  result = someSubtypeMatchHandler(someString, someUnsignedInteger);',
          '};',
          '',
          'TestSingleAttributeSubtypeMatchHandler __unsafe_unretained matchSingleAttributeSubtype = ^(SingleAttributeType *singleAttributeSubtype) {',
          '  result = singleAttributeSubtypeMatchHandler(singleAttributeSubtype);',
          '};',
          '',
          '[test matchSomeSubtype:matchSomeSubtype singleAttributeSubtype:matchSingleAttributeSubtype];',
          '',
          'return result;',
        ],
        compilerAttributes: [],
        comments: [],
        keywords: [
          {
            name: 'match',
            argument: {
              name: 'test',
              modifiers: [],
              type: {
                name: 'Test',
                reference: 'Test*',
              },
            },
          },
          {
            name: 'someSubtype',
            argument: {
              name: 'someSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestObjectTypeSomeSubtypeMatchHandler',
                reference: 'TestObjectTypeSomeSubtypeMatchHandler',
              },
            },
          },
          {
            name: 'singleAttributeSubtype',
            argument: {
              name: 'singleAttributeSubtypeMatchHandler',
              modifiers: [
                ObjC.KeywordArgumentModifier.Noescape(),
                ObjC.KeywordArgumentModifier.UnsafeUnretained(),
              ],
              type: {
                name: 'TestObjectTypeSingleAttributeSubtypeMatchHandler',
                reference: 'TestObjectTypeSingleAttributeSubtypeMatchHandler',
              },
            },
          },
        ],
        returnType: {
          type: {
            name: 'ObjectType',
            reference: 'ObjectType',
          },
          modifiers: [],
        },
      };

      expect(classMethods).toContain(expectedClassMethod);
    });
  });
});
