/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as AlgebraicType from '../../algebraic-type';
import * as Equality from '../../plugins/equality';
import * as Error from '../../error';
import * as CLangCommon from '../../clang-common';
import * as ObjC from '../../objc';
import * as ObjectSpec from '../../object-spec';
import * as ObjectSpecHelpers from '../../object-spec-helpers';

const ObjectSpecPlugin = Equality.createPlugin();
const AlgebraicTypePlugin = Equality.createAlgebraicTypePlugin();

describe('ObjectSpecPlugins.Equality', function () {
  describe('#validationErrors', function () {
    it('returns no validation errors when there are no attributes on the found type', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeLookups: [],
        typeName: 'Foo',
      };
      const errors: Error.Error[] =
        ObjectSpecPlugin.validationErrors(objectType);
      expect(errors).toEqualJSON([]);
    });

    it('returns a validation error when there is an attribute with an unknown type', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'name',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSString',
              'NSString *',
              'NSObject',
            ),
          ).asObject(),
          new ObjectSpecHelpers.AttributeBuilder(
            'likeStatus',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'LikeStatus',
              'LikeStatus',
              null,
            ),
          ).asObject(),
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeLookups: [],
        typeName: 'Foo',
      };
      const errors: Error.Error[] =
        ObjectSpecPlugin.validationErrors(objectType);
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Equality plugin does not know how to compare or hash the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns two validation errors when there are two attributes with unknown types', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'name',
            new ObjectSpecHelpers.AttributeTypeBuilder('Name', 'Name', null),
          ).asObject(),
          new ObjectSpecHelpers.AttributeBuilder(
            'likeStatus',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'LikeStatus',
              'LikeStatus',
              null,
            ),
          ).asObject(),
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeLookups: [],
        typeName: 'Foo',
      };
      const errors: Error.Error[] =
        ObjectSpecPlugin.validationErrors(objectType);
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Equality plugin does not know how to compare or hash the type "Name" from Foo.name. Did you forget to declare a backing type?',
        ),
        Error.Error(
          'The Equality plugin does not know how to compare or hash the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there is an attribute with an unknown underlying type', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'name',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'FooBar',
              'FooBar',
              'Baz',
            ),
          ).asObject(),
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeLookups: [],
        typeName: 'Foo',
      };
      const errors: Error.Error[] =
        ObjectSpecPlugin.validationErrors(objectType);
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Equality plugin does not know how to compare or hash the backing type "Baz" from Foo.name. Did you declare the wrong backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });

  describe('#imports', function () {
    it(
      'returns an import for objc/runtime when an attribute with a SEL ' +
        'type is included',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'someAction',
              new ObjectSpecHelpers.AttributeTypeBuilder('SEL', 'SEL', null),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'name',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSString',
                'NSString *',
                'NSObject',
              ),
            ).asObject(),
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'Foo',
        };
        const imports: ObjC.Import[] = ObjectSpecPlugin.imports(objectType);
        const expectedImport: ObjC.Import = {
          file: 'runtime.h',
          isPublic: false,
          library: 'objc',
          requiresCPlusPlus: false,
        };
        expect(imports).toContain(expectedImport);
      },
    );
  });

  describe('#instanceMethods', function () {
    it(
      'returns hash and equality methods when provided a value type that ' +
        'has some attributes',
      function () {
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
            new ObjectSpecHelpers.AttributeBuilder(
              'someInteger',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSInteger',
                'NSInteger',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someString',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSString',
                'NSString *',
                'NSObject',
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someFloat',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'float',
                'float',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someDouble',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'double',
                'double',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someBool',
              new ObjectSpecHelpers.AttributeTypeBuilder('BOOL', 'BOOL', null),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someCGFloat',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'CGFloat',
                'CGFloat',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someRect',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'CGRect',
                'CGRect',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'somePoint',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'CGPoint',
                'CGPoint',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someSize',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'CGSize',
                'CGSize',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someEdgeInsets',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'UIEdgeInsets',
                'UIEdgeInsets',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someRange',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSRange',
                'NSRange',
                null,
              ),
            ).asObject(),
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'Foo',
        };

        const instanceMethods: ObjC.Method[] =
          ObjectSpecPlugin.instanceMethods(objectType);

        const expectedInstanceMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: 'NSObject',
            keywords: [
              {
                name: 'isEqual',
                argument: {
                  name: 'object',
                  modifiers: [],
                  type: {
                    name: 'Foo',
                    reference: 'Foo *',
                  },
                },
              },
            ],
            code: [
              'if (self == object) {',
              '  return YES;',
              '} else if (object == nil || ![object isKindOfClass:[self class]]) {',
              '  return NO;',
              '}',
              'return',
              '  _someUnsignedInteger == object->_someUnsignedInteger &&',
              '  _someInteger == object->_someInteger &&',
              '  _someBool == object->_someBool &&',
              '  CompareFloats(_someFloat, object->_someFloat) &&',
              '  CompareDoubles(_someDouble, object->_someDouble) &&',
              '  CompareCGFloats(_someCGFloat, object->_someCGFloat) &&',
              '  CGRectEqualToRect(_someRect, object->_someRect) &&',
              '  CGPointEqualToPoint(_somePoint, object->_somePoint) &&',
              '  CGSizeEqualToSize(_someSize, object->_someSize) &&',
              '  UIEdgeInsetsEqualToEdgeInsets(_someEdgeInsets, object->_someEdgeInsets) &&',
              '  NSEqualRanges(_someRange, object->_someRange) &&',
              '  (_someString == object->_someString ? YES : [_someString isEqual:object->_someString]);',
            ],
            comments: [],
            compilerAttributes: [],
            returnType: {
              type: {
                name: 'BOOL',
                reference: 'BOOL',
              },
              modifiers: [],
            },
          },
          {
            preprocessors: [],
            belongsToProtocol: 'NSObject',
            keywords: [
              {
                name: 'hash',
                argument: null,
              },
            ],
            code: [
              'NSUInteger subhashes[] = {_someUnsignedInteger, ABS(_someInteger), [_someString hash], HashFloat(_someFloat), HashDouble(_someDouble), (NSUInteger)_someBool, HashCGFloat(_someCGFloat), HashCGFloat(_someRect.origin.x), HashCGFloat(_someRect.origin.y), HashCGFloat(_someRect.size.width), HashCGFloat(_someRect.size.height), HashCGFloat(_somePoint.x), HashCGFloat(_somePoint.y), HashCGFloat(_someSize.width), HashCGFloat(_someSize.height), HashCGFloat(_someEdgeInsets.top), HashCGFloat(_someEdgeInsets.left), HashCGFloat(_someEdgeInsets.bottom), HashCGFloat(_someEdgeInsets.right), _someRange.location, _someRange.length};',
              'NSUInteger result = subhashes[0];',
              'for (int ii = 1; ii < 21; ++ii) {',
              '  unsigned long long base = (((unsigned long long)result) << 32 | subhashes[ii]);',
              '  base = (~base) + (base << 18);',
              '  base ^= (base >> 31);',
              '  base *=  21;',
              '  base ^= (base >> 11);',
              '  base += (base << 6);',
              '  base ^= (base >> 22);',
              '  result = base;',
              '}',
              'return result;',
            ],
            comments: [],
            compilerAttributes: [],
            returnType: {
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      },
    );

    it(
      'returns hash and equality methods when provided a value type that ' +
        'has some different attributes',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'someDouble',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'double',
                'double',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'something',
              new ObjectSpecHelpers.AttributeTypeBuilder('id', 'id', null),
            ).asObject(),
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'Foo',
        };

        const instanceMethods: ObjC.Method[] =
          ObjectSpecPlugin.instanceMethods(objectType);

        const expectedInstanceMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: 'NSObject',
            keywords: [
              {
                name: 'isEqual',
                argument: {
                  name: 'object',
                  modifiers: [],
                  type: {
                    name: 'Foo',
                    reference: 'Foo *',
                  },
                },
              },
            ],
            code: [
              'if (self == object) {',
              '  return YES;',
              '} else if (object == nil || ![object isKindOfClass:[self class]]) {',
              '  return NO;',
              '}',
              'return',
              '  CompareDoubles(_someDouble, object->_someDouble) &&',
              '  (_something == object->_something ? YES : [_something isEqual:object->_something]);',
            ],
            comments: [],
            compilerAttributes: [],
            returnType: {
              type: {
                name: 'BOOL',
                reference: 'BOOL',
              },
              modifiers: [],
            },
          },
          {
            preprocessors: [],
            belongsToProtocol: 'NSObject',
            keywords: [
              {
                name: 'hash',
                argument: null,
              },
            ],
            code: [
              'NSUInteger subhashes[] = {HashDouble(_someDouble), [_something hash]};',
              'NSUInteger result = subhashes[0];',
              'for (int ii = 1; ii < 2; ++ii) {',
              '  unsigned long long base = (((unsigned long long)result) << 32 | subhashes[ii]);',
              '  base = (~base) + (base << 18);',
              '  base ^= (base >> 31);',
              '  base *=  21;',
              '  base ^= (base >> 11);',
              '  base += (base << 6);',
              '  base ^= (base >> 22);',
              '  result = base;',
              '}',
              'return result;',
            ],
            comments: [],
            compilerAttributes: [],
            returnType: {
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      },
    );

    it(
      'returns no instance methods when provided a value type that ' +
        'does not have attributes',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'Foo',
        };

        const instanceMethods: ObjC.Method[] =
          ObjectSpecPlugin.instanceMethods(objectType);
        const expectedInstanceMethods: ObjC.Method[] = [];
        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      },
    );
  });

  describe('#functions', function () {
    it(
      'does not return functions when provided a value type that ' +
        'does not have attributes',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'Foo',
        };

        const functions: ObjC.Function[] =
          ObjectSpecPlugin.functions(objectType);
        const expectedFunctions: ObjC.Method[] = [];
        expect(functions).toEqualJSON(expectedFunctions);
      },
    );

    it(
      'returns float equality and hash functions when provided a value type that ' +
        'contains attributes which require float functions',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'someFloat',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'float',
                'float',
                null,
              ),
            ).asObject(),
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'Foo',
        };

        const functions: ObjC.Function[] =
          ObjectSpecPlugin.functions(objectType);
        const expectedFunctions: ObjC.Function[] = [
          {
            comments: [],
            name: 'CompareFloats',
            parameters: [
              {
                type: {
                  name: 'float',
                  reference: 'float',
                },
                name: 'givenFloat',
              },
              {
                type: {
                  name: 'float',
                  reference: 'float',
                },
                name: 'floatToCompare',
              },
            ],
            returnType: {
              type: {
                name: 'BOOL',
                reference: 'BOOL',
              },
              modifiers: [],
            },
            code: [
              'return fabsf(givenFloat - floatToCompare) < FLT_EPSILON * fabsf(givenFloat + floatToCompare) || fabsf(givenFloat - floatToCompare) < FLT_MIN;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
          {
            comments: [],
            name: 'HashFloat',
            parameters: [
              {
                type: {
                  name: 'float',
                  reference: 'float',
                },
                name: 'givenFloat',
              },
            ],
            returnType: {
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              modifiers: [],
            },
            code: [
              'union {',
              '  float key;',
              '  uint32_t bits;',
              '} u;',
              'u.key = givenFloat;',
              'NSUInteger h = (NSUInteger)u.bits;',
              '#if !TARGET_RT_64_BIT',
              'h = ~h + (h << 15);',
              'h ^= (h >> 12);',
              'h += (h << 2);',
              'h ^= (h >> 4);',
              'h *= 2057;',
              'h ^= (h >> 16);',
              '#else',
              'h += ~h + (h << 21);',
              'h ^= (h >> 24);',
              'h = (h + (h << 3)) + (h << 8);',
              'h ^= (h >> 14);',
              'h = (h + (h << 2)) + (h << 4);',
              'h ^= (h >> 28);',
              'h += (h << 31);',
              '#endif',
              'return h;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
        ];
        expect(functions).toEqualJSON(expectedFunctions);
      },
    );

    it(
      'returns only one float equality and hash function when provided a ' +
        'value type that contains two attributes which require float functions',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'someFloat',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'float',
                'float',
                null,
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'anotherFloat',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'float',
                'float',
                null,
              ),
            ).asObject(),
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'Foo',
        };

        const functions: ObjC.Function[] =
          ObjectSpecPlugin.functions(objectType);
        const expectedFunctions: ObjC.Function[] = [
          {
            comments: [],
            name: 'CompareFloats',
            parameters: [
              {
                type: {
                  name: 'float',
                  reference: 'float',
                },
                name: 'givenFloat',
              },
              {
                type: {
                  name: 'float',
                  reference: 'float',
                },
                name: 'floatToCompare',
              },
            ],
            returnType: {
              type: {
                name: 'BOOL',
                reference: 'BOOL',
              },
              modifiers: [],
            },
            code: [
              'return fabsf(givenFloat - floatToCompare) < FLT_EPSILON * fabsf(givenFloat + floatToCompare) || fabsf(givenFloat - floatToCompare) < FLT_MIN;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
          {
            comments: [],
            name: 'HashFloat',
            parameters: [
              {
                type: {
                  name: 'float',
                  reference: 'float',
                },
                name: 'givenFloat',
              },
            ],
            returnType: {
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              modifiers: [],
            },
            code: [
              'union {',
              '  float key;',
              '  uint32_t bits;',
              '} u;',
              'u.key = givenFloat;',
              'NSUInteger h = (NSUInteger)u.bits;',
              '#if !TARGET_RT_64_BIT',
              'h = ~h + (h << 15);',
              'h ^= (h >> 12);',
              'h += (h << 2);',
              'h ^= (h >> 4);',
              'h *= 2057;',
              'h ^= (h >> 16);',
              '#else',
              'h += ~h + (h << 21);',
              'h ^= (h >> 24);',
              'h = (h + (h << 3)) + (h << 8);',
              'h ^= (h >> 14);',
              'h = (h + (h << 2)) + (h << 4);',
              'h ^= (h >> 28);',
              'h += (h << 31);',
              '#endif',
              'return h;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
        ];
        expect(functions).toEqualJSON(expectedFunctions);
      },
    );

    it(
      'returns double equality and hash functions when provided a value type that ' +
        'contains attributes which require double functions',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'someTypeBackedByDouble',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'Derrrpppppp',
                'Derrrpppppp',
                'double',
              ),
            ).asObject(),
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'Foo',
        };

        const functions: ObjC.Function[] =
          ObjectSpecPlugin.functions(objectType);
        const expectedFunctions: ObjC.Function[] = [
          {
            comments: [],
            name: 'CompareDoubles',
            parameters: [
              {
                type: {
                  name: 'double',
                  reference: 'double',
                },
                name: 'givenDouble',
              },
              {
                type: {
                  name: 'double',
                  reference: 'double',
                },
                name: 'doubleToCompare',
              },
            ],
            returnType: {
              type: {
                name: 'BOOL',
                reference: 'BOOL',
              },
              modifiers: [],
            },
            code: [
              'return fabs(givenDouble - doubleToCompare) < DBL_EPSILON * fabs(givenDouble + doubleToCompare) || fabs(givenDouble - doubleToCompare) < DBL_MIN;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
          {
            comments: [],
            name: 'HashDouble',
            parameters: [
              {
                type: {
                  name: 'double',
                  reference: 'double',
                },
                name: 'givenDouble',
              },
            ],
            returnType: {
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              modifiers: [],
            },
            code: [
              'union {',
              '  double key;',
              '  uint64_t bits;',
              '} u;',
              'u.key = givenDouble;',
              'NSUInteger p = u.bits;',
              'p = (~p) + (p << 18);',
              'p ^= (p >> 31);',
              'p *=  21;',
              'p ^= (p >> 11);',
              'p += (p << 6);',
              'p ^= (p >> 22);',
              'return (NSUInteger) p;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
        ];
        expect(functions).toEqualJSON(expectedFunctions);
      },
    );

    it(
      'returns CGFloat, float and double equality and hash functions when ' +
        'provided a value type that contains attributes which require ' +
        'float, double, and CGFloat functions',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'someCGFloat',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'CGFloat',
                'CGFloat',
                null,
              ),
            ).asObject(),
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'Foo',
        };

        const functions: ObjC.Function[] =
          ObjectSpecPlugin.functions(objectType);
        const expectedFunctions: ObjC.Function[] = [
          {
            comments: [],
            name: 'CompareFloats',
            parameters: [
              {
                type: {
                  name: 'float',
                  reference: 'float',
                },
                name: 'givenFloat',
              },
              {
                type: {
                  name: 'float',
                  reference: 'float',
                },
                name: 'floatToCompare',
              },
            ],
            returnType: {
              type: {
                name: 'BOOL',
                reference: 'BOOL',
              },
              modifiers: [],
            },
            code: [
              'return fabsf(givenFloat - floatToCompare) < FLT_EPSILON * fabsf(givenFloat + floatToCompare) || fabsf(givenFloat - floatToCompare) < FLT_MIN;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
          {
            comments: [],
            name: 'CompareDoubles',
            parameters: [
              {
                type: {
                  name: 'double',
                  reference: 'double',
                },
                name: 'givenDouble',
              },
              {
                type: {
                  name: 'double',
                  reference: 'double',
                },
                name: 'doubleToCompare',
              },
            ],
            returnType: {
              type: {
                name: 'BOOL',
                reference: 'BOOL',
              },
              modifiers: [],
            },
            code: [
              'return fabs(givenDouble - doubleToCompare) < DBL_EPSILON * fabs(givenDouble + doubleToCompare) || fabs(givenDouble - doubleToCompare) < DBL_MIN;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
          {
            comments: [],
            name: 'CompareCGFloats',
            parameters: [
              {
                type: {
                  name: 'CGFloat',
                  reference: 'CGFloat',
                },
                name: 'givenCGFloat',
              },
              {
                type: {
                  name: 'CGFloat',
                  reference: 'CGFloat',
                },
                name: 'cgFloatToCompare',
              },
            ],
            returnType: {
              type: {
                name: 'BOOL',
                reference: 'BOOL',
              },
              modifiers: [],
            },
            code: [
              '#if CGFLOAT_IS_DOUBLE',
              '  BOOL useDouble = YES;',
              '#else',
              '  BOOL useDouble = NO;',
              '#endif',
              '  if (useDouble) {',
              '    return CompareDoubles(givenCGFloat, cgFloatToCompare);',
              '  } else {',
              '    return CompareFloats(givenCGFloat, cgFloatToCompare);',
              '  }',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
          {
            comments: [],
            name: 'HashFloat',
            parameters: [
              {
                type: {
                  name: 'float',
                  reference: 'float',
                },
                name: 'givenFloat',
              },
            ],
            returnType: {
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              modifiers: [],
            },
            code: [
              'union {',
              '  float key;',
              '  uint32_t bits;',
              '} u;',
              'u.key = givenFloat;',
              'NSUInteger h = (NSUInteger)u.bits;',
              '#if !TARGET_RT_64_BIT',
              'h = ~h + (h << 15);',
              'h ^= (h >> 12);',
              'h += (h << 2);',
              'h ^= (h >> 4);',
              'h *= 2057;',
              'h ^= (h >> 16);',
              '#else',
              'h += ~h + (h << 21);',
              'h ^= (h >> 24);',
              'h = (h + (h << 3)) + (h << 8);',
              'h ^= (h >> 14);',
              'h = (h + (h << 2)) + (h << 4);',
              'h ^= (h >> 28);',
              'h += (h << 31);',
              '#endif',
              'return h;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
          {
            comments: [],
            name: 'HashDouble',
            parameters: [
              {
                type: {
                  name: 'double',
                  reference: 'double',
                },
                name: 'givenDouble',
              },
            ],
            returnType: {
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              modifiers: [],
            },
            code: [
              'union {',
              '  double key;',
              '  uint64_t bits;',
              '} u;',
              'u.key = givenDouble;',
              'NSUInteger p = u.bits;',
              'p = (~p) + (p << 18);',
              'p ^= (p >> 31);',
              'p *=  21;',
              'p ^= (p >> 11);',
              'p += (p << 6);',
              'p ^= (p >> 22);',
              'return (NSUInteger) p;',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
          {
            comments: [],
            name: 'HashCGFloat',
            parameters: [
              {
                type: {
                  name: 'CGFloat',
                  reference: 'CGFloat',
                },
                name: 'givenCGFloat',
              },
            ],
            returnType: {
              type: {
                name: 'NSUInteger',
                reference: 'NSUInteger',
              },
              modifiers: [],
            },
            code: [
              '#if CGFLOAT_IS_DOUBLE',
              '  BOOL useDouble = YES;',
              '#else',
              '  BOOL useDouble = NO;',
              '#endif',
              '  if (useDouble) {',
              '    return HashDouble(givenCGFloat);',
              '  } else {',
              '    return HashFloat(givenCGFloat);',
              '  }',
            ],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
        ];
        expect(functions).toEqualJSON(expectedFunctions);
      },
    );
  });
});

describe('AlgebraicTypePlugins.Equality', function () {
  describe('#validationErrors', function () {
    it('returns no validation errors when there are no attributes on the provided subtypes', function () {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: [],
        typeLookups: [],
        excludes: [],
        libraryName: null,
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'ASubType',
            comments: [],
            attributes: [],
            annotations: {},
          }),
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'AnotherSubtype',
            comments: [],
            attributes: [],
            annotations: {},
          }),
        ],
      };

      const errors: Error.Error[] =
        AlgebraicTypePlugin.validationErrors(algebraicType);
      expect(errors).toEqualJSON([]);
    });

    it('returns a validation error when there is an attribute with an unknown type', function () {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        typeLookups: [],
        excludes: [],
        libraryName: null,
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
            annotations: {},
            name: 'someFoo',
            comments: [],
            nullability: CLangCommon.Nullability.Inherited(),
            type: {
              name: 'Foo',
              reference: 'Foo *',
              libraryTypeIsDefinedIn: null,
              fileTypeIsDefinedIn: null,
              underlyingType: null,
              conformingProtocol: null,
              referencedGenericTypes: [],
            },
          }),
        ],
      };
      const errors: Error.Error[] =
        AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Equality plugin does not know how to compare or hash the type "Foo" from Test.someFoo. Did you forget to declare a backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns two validation errors when there are two attributes with unknown types', function () {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        typeLookups: [],
        excludes: [],
        libraryName: null,
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someFoo',
                comments: [],
                nullability: CLangCommon.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
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
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'AnotherSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someFerr',
                comments: [],
                nullability: CLangCommon.Nullability.Inherited(),
                type: {
                  name: 'Ferr',
                  reference: 'Ferr',
                  libraryTypeIsDefinedIn: 'SomeLib',
                  fileTypeIsDefinedIn: 'SomethingElse',
                  underlyingType: null,
                  conformingProtocol: null,
                  referencedGenericTypes: [],
                },
              },
            ],
            annotations: {},
          }),
        ],
      };
      const errors: Error.Error[] =
        AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Equality plugin does not know how to compare or hash the type "Foo" from Test.someFoo. Did you forget to declare a backing type?',
        ),
        Error.Error(
          'The Equality plugin does not know how to compare or hash the type "Ferr" from Test.someFerr. Did you forget to declare a backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there is an attribute with an unknown underlying type', function () {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        typeLookups: [],
        excludes: [],
        libraryName: null,
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
            annotations: {},
            name: 'someFerr',
            comments: [],
            nullability: CLangCommon.Nullability.Inherited(),
            type: {
              name: 'Ferr',
              reference: 'Ferr',
              libraryTypeIsDefinedIn: 'SomeLib',
              fileTypeIsDefinedIn: 'SomethingElse',
              underlyingType: 'SomethingRandom',
              conformingProtocol: null,
              referencedGenericTypes: [],
            },
          }),
        ],
      };
      const errors: Error.Error[] =
        AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Equality plugin does not know how to compare or hash the backing type "SomethingRandom" from Test.someFerr. Did you declare the wrong backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });
});
