/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import AlgebraicType = require('../../algebraic-type');
import Equality = require('../../plugins/equality');
import Error = require('../../error');
import Maybe = require('../../maybe');
import ObjC = require('../../objc');
import ObjectSpec = require('../../object-spec');

const ObjectSpecPlugin = Equality.createPlugin();
const AlgebraicTypePlugin = Equality.createAlgebraicTypePlugin();

describe('ObjectSpecPlugins.Equality', function() {
  describe('#validationErrors', function() {
    it('returns no validation errors when there are no attributes on the found type', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };
      const errors:Error.Error[] = ObjectSpecPlugin.validationErrors(objectType);
      expect(errors).toEqualJSON([]);
    });

    it('returns a validation error when there is an attribute with an unknown type', function() {
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
              underlyingType:Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'likeStatus',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'LikeStatus',
              reference: 'LikeStatus',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };
      const errors:Error.Error[] = ObjectSpecPlugin.validationErrors(objectType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Equality plugin does not know how to compare or hash the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns two validation errors when there are two attributes with unknown types', function() {
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
              name: 'Name',
              reference: 'Name',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'likeStatus',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'LikeStatus',
              reference: 'LikeStatus',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };
      const errors:Error.Error[] = ObjectSpecPlugin.validationErrors(objectType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Equality plugin does not know how to compare or hash the type "Name" from Foo.name. Did you forget to declare a backing type?'),
        Error.Error('The Equality plugin does not know how to compare or hash the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there is an attribute with an unknown underlying type', function() {
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
              name: 'FooBar',
              reference: 'FooBar',
              underlyingType:Maybe.Just<string>('Baz'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };
      const errors:Error.Error[] = ObjectSpecPlugin.validationErrors(objectType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Equality plugin does not know how to compare or hash the backing type "Baz" from Foo.name. Did you declare the wrong backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });

  describe('#imports', function() {
    it('returns an import for objc/runtime when an attribute with a SEL ' +
       'type is included', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someAction',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'SEL',
              reference: 'SEL',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
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
              underlyingType:Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };
      const imports:ObjC.Import[] = ObjectSpecPlugin.imports(objectType);
      const expectedImport:ObjC.Import = {
        file:'runtime.h',
        isPublic:false,
        library:Maybe.Just('objc')
      };
      expect(imports).toContain(expectedImport);
    });
  });

  describe('#instanceMethods', function() {
    it('returns hash and equality methods when provided a value type that ' +
       'has some attributes', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someUnsignedInteger',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'NSUInteger',
              reference: 'NSUInteger',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someInteger',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'NSInteger',
              reference: 'NSInteger',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someString',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'NSString',
              reference: 'NSString *',
              underlyingType:Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someFloat',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'float',
              reference: 'float',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someDouble',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'double',
              reference: 'double',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someBool',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'BOOL',
              reference: 'BOOL',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someCGFloat',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'CGFloat',
              reference: 'CGFloat',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someRect',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'CGRect',
              reference: 'CGRect',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'somePoint',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'CGPoint',
              reference: 'CGPoint',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someSize',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'CGSize',
              reference: 'CGSize',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someEdgeInsets',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'UIEdgeInsets',
              reference: 'UIEdgeInsets',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someRange',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'NSRange',
              reference: 'NSRange',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };

      const instanceMethods:ObjC.Method[] = ObjectSpecPlugin.instanceMethods(objectType);

      const expectedInstanceMethods:ObjC.Method[] = [
        {
          preprocessors:[],
          belongsToProtocol:Maybe.Just('NSObject'),
          keywords: [
            {
              name: 'isEqual',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'object',
                modifiers: [],
                type: {
                  name: 'Foo',
                  reference: 'Foo *'
                }
              })
            }
          ],
          code: [
            'if (self == object) {',
            '  return YES;',
            '} else if (object == nil || ![object isKindOfClass:[self class]]) {',
            '  return NO;',
            '}',
            'return',
            '  _someUnsignedInteger == object->_someUnsignedInteger &&',
            '  _someBool == object->_someBool &&',
            '  _someInteger == object->_someInteger &&',
            '  CompareFloats(_someFloat, object->_someFloat) &&',
            '  CompareDoubles(_someDouble, object->_someDouble) &&',
            '  NSEqualRanges(_someRange, object->_someRange) &&',
            '  UIEdgeInsetsEqualToEdgeInsets(_someEdgeInsets, object->_someEdgeInsets) &&',
            '  CGRectEqualToRect(_someRect, object->_someRect) &&',
            '  CGPointEqualToPoint(_somePoint, object->_somePoint) &&',
            '  CGSizeEqualToSize(_someSize, object->_someSize) &&',
            '  CompareCGFloats(_someCGFloat, object->_someCGFloat) &&',
            '  (_someString == object->_someString ? YES : [_someString isEqual:object->_someString]);'
          ],
          comments: [],
          compilerAttributes:[],
          returnType:{ type:Maybe.Just({
            name: 'BOOL',
            reference: 'BOOL'
          }), modifiers:[] }
        },
        {
          preprocessors:[],
          belongsToProtocol:Maybe.Just('NSObject'),
          keywords: [
            {
              name: 'hash',
              argument: Maybe.Nothing<ObjC.KeywordArgument>()
            }
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
            'return result;'
          ],
          comments: [],
          compilerAttributes:[],
          returnType:{ type:Maybe.Just({
            name: 'NSUInteger',
            reference: 'NSUInteger'
          }), modifiers:[] }
        }
      ];

      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
    });

    it('returns hash and equality methods when provided a value type that ' +
       'has some different attributes', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someDouble',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'double',
              reference: 'double',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'id',
              reference: 'id',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };

      const instanceMethods:ObjC.Method[] = ObjectSpecPlugin.instanceMethods(objectType);

      const expectedInstanceMethods:ObjC.Method[] = [
        {
          preprocessors:[],
          belongsToProtocol:Maybe.Just('NSObject'),
          keywords: [
            {
              name: 'isEqual',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'object',
                modifiers: [],
                type: {
                  name: 'Foo',
                  reference: 'Foo *'
                }
              })
            }
          ],
          code: [
            'if (self == object) {',
            '  return YES;',
            '} else if (object == nil || ![object isKindOfClass:[self class]]) {',
            '  return NO;',
            '}',
            'return',
            '  CompareDoubles(_someDouble, object->_someDouble) &&',
            '  (_something == object->_something ? YES : [_something isEqual:object->_something]);'
          ],
          comments: [],
          compilerAttributes:[],
          returnType:{ type:Maybe.Just({
            name: 'BOOL',
            reference: 'BOOL'
          }), modifiers:[] }
        },
        {
          preprocessors:[],
          belongsToProtocol:Maybe.Just('NSObject'),
          keywords: [
            {
              name: 'hash',
              argument: Maybe.Nothing<ObjC.KeywordArgument>()
            }
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
            'return result;'
          ],
          comments: [],
          compilerAttributes:[],
          returnType:{ type:Maybe.Just({
            name: 'NSUInteger',
            reference: 'NSUInteger'
          }), modifiers:[] }
        }
      ];

      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
    });

    it('returns no instance methods when provided a value type that ' +
       'does not have attributes', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };

      const instanceMethods:ObjC.Method[] = ObjectSpecPlugin.instanceMethods(objectType);
      const expectedInstanceMethods:ObjC.Method[] = [];
      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
    });
  });

  describe('#functions', function() {
    it('does not return functions when provided a value type that ' +
       'does not have attributes', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };

      const functions:ObjC.Function[] = ObjectSpecPlugin.functions(objectType);
      const expectedFunctions:ObjC.Method[] = [];
      expect(functions).toEqualJSON(expectedFunctions);
    });

    it('returns float equality and hash functions when provided a value type that ' +
       'contains attributes which require float functions', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someFloat',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'float',
              reference: 'float',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };

      const functions:ObjC.Function[] = ObjectSpecPlugin.functions(objectType);
      const expectedFunctions:ObjC.Function[] = [
        {
          comments: [],
          name: 'CompareFloats',
          parameters: [
            {
              type: {
                name: 'float',
                reference: 'float'
              },
              name: 'givenFloat'
            },
            {
              type: {
                name: 'float',
                reference: 'float'
              },
              name: 'floatToCompare'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'BOOL',
            reference: 'BOOL'
          }), modifiers:[] },
          code: [
            'return fabsf(givenFloat - floatToCompare) < FLT_EPSILON * fabsf(givenFloat + floatToCompare) || fabsf(givenFloat - floatToCompare) < FLT_MIN;'
          ],
          isPublic: false
        },
        {
          comments: [],
          name: 'HashFloat',
          parameters: [
            {
              type: {
                name: 'float',
                reference: 'float'
              },
              name: 'givenFloat'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'NSUInteger',
            reference: 'NSUInteger'
          }), modifiers:[] },
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
            'return h;'
          ],
          isPublic: false
        }
      ];
      expect(functions).toEqualJSON(expectedFunctions);
    });

    it('returns only one float equality and hash function when provided a ' +
       'value type that contains two attributes which require float functions', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someFloat',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'float',
              reference: 'float',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'anotherFloat',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'float',
              reference: 'float',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };

      const functions:ObjC.Function[] = ObjectSpecPlugin.functions(objectType);
      const expectedFunctions:ObjC.Function[] = [
        {
          comments: [],
          name: 'CompareFloats',
          parameters: [
            {
              type: {
                name: 'float',
                reference: 'float'
              },
              name: 'givenFloat'
            },
            {
              type: {
                name: 'float',
                reference: 'float'
              },
              name: 'floatToCompare'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'BOOL',
            reference: 'BOOL'
          }), modifiers:[] },
          code: [
            'return fabsf(givenFloat - floatToCompare) < FLT_EPSILON * fabsf(givenFloat + floatToCompare) || fabsf(givenFloat - floatToCompare) < FLT_MIN;'
          ],
          isPublic: false
        },
        {
          comments: [],
          name: 'HashFloat',
          parameters: [
            {
              type: {
                name: 'float',
                reference: 'float'
              },
              name: 'givenFloat'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'NSUInteger',
            reference: 'NSUInteger'
          }), modifiers:[] },
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
            'return h;'
          ],
          isPublic: false
        }
      ];
      expect(functions).toEqualJSON(expectedFunctions);
    });

    it('returns double equality and hash functions when provided a value type that ' +
       'contains attributes which require double functions', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someTypeBackedByDouble',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'Derrrpppppp',
              reference: 'Derrrpppppp',
              underlyingType:Maybe.Just<string>('double'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };

      const functions:ObjC.Function[] = ObjectSpecPlugin.functions(objectType);
      const expectedFunctions:ObjC.Function[] = [
        {
          comments: [],
          name: 'CompareDoubles',
          parameters: [
            {
              type: {
                name: 'double',
                reference: 'double'
              },
              name: 'givenDouble'
            },
            {
              type: {
                name: 'double',
                reference: 'double'
              },
              name: 'doubleToCompare'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'BOOL',
            reference: 'BOOL'
          }), modifiers:[] },
          code: [
            'return fabs(givenDouble - doubleToCompare) < DBL_EPSILON * fabs(givenDouble + doubleToCompare) || fabs(givenDouble - doubleToCompare) < DBL_MIN;'
          ],
          isPublic: false
        },
        {
          comments: [],
          name: 'HashDouble',
          parameters: [
            {
              type: {
                name: 'double',
                reference: 'double'
              },
              name: 'givenDouble'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'NSUInteger',
            reference: 'NSUInteger'
          }), modifiers:[] },
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
            'return (NSUInteger) p;'
          ],
          isPublic: false
        }
      ];
      expect(functions).toEqualJSON(expectedFunctions);
    });

    it('returns CGFloat, float and double equality and hash functions when ' +
       'provided a value type that contains attributes which require ' +
       'float, double, and CGFloat functions', function() {
      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someCGFloat',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'CGFloat',
              reference: 'CGFloat',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups:[],
        typeName: 'Foo'
      };

      const functions:ObjC.Function[] = ObjectSpecPlugin.functions(objectType);
      const expectedFunctions:ObjC.Function[] = [
        {
          comments: [],
          name: 'CompareFloats',
          parameters: [
            {
              type: {
                name: 'float',
                reference: 'float'
              },
              name: 'givenFloat'
            },
            {
              type: {
                name: 'float',
                reference: 'float'
              },
              name: 'floatToCompare'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'BOOL',
            reference: 'BOOL'
          }), modifiers:[] },
          code: [
            'return fabsf(givenFloat - floatToCompare) < FLT_EPSILON * fabsf(givenFloat + floatToCompare) || fabsf(givenFloat - floatToCompare) < FLT_MIN;'
          ],
          isPublic: false
        },
        {
          comments: [],
          name: 'CompareDoubles',
          parameters: [
            {
              type: {
                name: 'double',
                reference: 'double'
              },
              name: 'givenDouble'
            },
            {
              type: {
                name: 'double',
                reference: 'double'
              },
              name: 'doubleToCompare'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'BOOL',
            reference: 'BOOL'
          }), modifiers:[] },
          code: [
            'return fabs(givenDouble - doubleToCompare) < DBL_EPSILON * fabs(givenDouble + doubleToCompare) || fabs(givenDouble - doubleToCompare) < DBL_MIN;'
          ],
          isPublic: false
        },
        {
          comments: [],
          name: 'CompareCGFloats',
          parameters: [
            {
              type: {
                name: 'CGFloat',
                reference: 'CGFloat'
              },
              name: 'givenCGFloat'
            },
            {
              type: {
                name: 'CGFloat',
                reference: 'CGFloat'
              },
              name: 'cgFloatToCompare'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'BOOL',
            reference: 'BOOL'
          }), modifiers:[] },
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
            '  }'
          ],
          isPublic: false
        },
        {
          comments: [],
          name: 'HashFloat',
          parameters: [
            {
              type: {
                name: 'float',
                reference: 'float'
              },
              name: 'givenFloat'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'NSUInteger',
            reference: 'NSUInteger'
          }), modifiers:[] },
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
            'return h;'
          ],
          isPublic: false
        },
        {
          comments: [],
          name: 'HashDouble',
          parameters: [
            {
              type: {
                name: 'double',
                reference: 'double'
              },
              name: 'givenDouble'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'NSUInteger',
            reference: 'NSUInteger'
          }), modifiers:[] },
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
            'return (NSUInteger) p;'
          ],
          isPublic: false
        },
        {
          comments: [],
          name: 'HashCGFloat',
          parameters: [
            {
              type: {
                name: 'CGFloat',
                reference: 'CGFloat'
              },
              name: 'givenCGFloat'
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'NSUInteger',
            reference: 'NSUInteger'
          }), modifiers:[] },
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
            '  }'
          ],
          isPublic: false
        }
      ];
      expect(functions).toEqualJSON(expectedFunctions);
    });
  });
});

describe('AlgebraicTypePlugins.Equality', function() {
  describe('#validationErrors', function() {
    it('returns no validation errors when there are no attributes on the provided subtypes', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: [],
        typeLookups:[],
        excludes: [],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'ASubType',
            comments: [],
            attributes: []
          }),
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'AnotherSubtype',
            comments: [],
            attributes: []
          })
        ]
      };

      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      expect(errors).toEqualJSON([]);
    });

    it('returns a validation error when there is an attribute with an unknown type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        typeLookups:[],
        excludes: [],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'someFoo',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'Foo',
              reference: 'Foo *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Equality plugin does not know how to compare or hash the type "Foo" from Test.someFoo. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns two validation errors when there are two attributes with unknown types', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        typeLookups:[],
        excludes: [],
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
                name: 'someFoo',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'AnotherSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someFerr',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Ferr',
                  reference: 'Ferr',
                  libraryTypeIsDefinedIn: Maybe.Just<string>('SomeLib'),
                  fileTypeIsDefinedIn: Maybe.Just<string>('SomethingElse'),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Equality plugin does not know how to compare or hash the type "Foo" from Test.someFoo. Did you forget to declare a backing type?'),
        Error.Error('The Equality plugin does not know how to compare or hash the type "Ferr" from Test.someFerr. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there is an attribute with an unknown underlying type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        typeLookups:[],
        excludes: [],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'someFerr',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'Ferr',
              reference: 'Ferr',
              libraryTypeIsDefinedIn: Maybe.Just<string>('SomeLib'),
              fileTypeIsDefinedIn: Maybe.Just<string>('SomethingElse'),
              underlyingType: Maybe.Just<string>('SomethingRandom'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Equality plugin does not know how to compare or hash the backing type "SomethingRandom" from Test.someFerr. Did you declare the wrong backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });
});
