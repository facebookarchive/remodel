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

import AlgebraicType = require('../../algebraic-type');
import Coding = require('../../plugins/coding');
import Error = require('../../error');
import Maybe = require('../../maybe');
import ObjC = require('../../objc');
import ValueObject = require('../../value-object');

const ValueObjectPlugin = Coding.createPlugin();
const AlgebraicTypePlugin = Coding.createAlgebraicTypePlugin();

describe('ValueObjectPlugins.Coding', function() {
  describe('#validationErrors', function() {
    it('returns no validation errors when there are no attributes on the found type', function() {
      const valueType:ValueObject.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };
      const errors:Error.Error[] = ValueObjectPlugin.validationErrors(valueType);
      expect(errors).toEqualJSON([]);
    });

    it('returns a validation error when there is an attribute with an unknown type', function() {
      const valueType:ValueObject.Type = {
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
            name: 'likeStatus',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'LikeStatus',
              reference: 'LikeStatus',
              underlyingType:Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };
      const errors:Error.Error[] = ValueObjectPlugin.validationErrors(valueType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Coding plugin does not know how to decode and encode the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns two validation errors when there are two attributes with unknown types', function() {
      const valueType:ValueObject.Type = {
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
              underlyingType:Maybe.Nothing<string>()
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
              underlyingType:Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };
      const errors:Error.Error[] = ValueObjectPlugin.validationErrors(valueType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Coding plugin does not know how to decode and encode the type "Name" from Foo.name. Did you forget to declare a backing type?'),
        Error.Error('The Coding plugin does not know how to decode and encode the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there is an attribute with an unknown underlying type', function() {
      const valueType:ValueObject.Type = {
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
              underlyingType:Maybe.Just<string>('Baz')
            }
          }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };
      const errors:Error.Error[] = ValueObjectPlugin.validationErrors(valueType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Coding plugin does not know how to decode and encode the backing type "Baz" from Foo.name. Did you declare the wrong backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });

  describe('#instanceMethods', function() {
    it('returns no instance methods when there are no attributes on the found type', function() {
      const valueType:ValueObject.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };
      const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);
      expect(instanceMethods).toEqualJSON([]);
    });

    it('returns two instance methods which will encode and decode two values when called', function() {
      const valueType:ValueObject.Type = {
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
            name: 'doesUserLike',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'BOOL',
              reference: 'BOOL',
              underlyingType:Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someObject',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name: 'id',
              reference: 'id',
              underlyingType:Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

      const expectedInstanceMethods:ObjC.Method[] = [
        {
          belongsToProtocol:Maybe.Just<string>('NSCoding'),
          code: [
            'if ((self = [super init])) {',
            '  _name = [aDecoder decodeObjectForKey:kNameKey];',
            '  _doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];',
            '  _someObject = [aDecoder decodeObjectForKey:kSomeObjectKey];',
            '}',
            'return self;'
          ],
          comments: [],
          keywords: [
            {
              name: 'initWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aDecoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *'
                }
              })
            }
          ],
          returnType: Maybe.Just<ObjC.Type>({
            name: 'instancetype',
            reference: 'instancetype'
          })
        },
        {
          belongsToProtocol:Maybe.Just<string>('NSCoding'),
          code: [
            '[aCoder encodeObject:_name forKey:kNameKey];',
            '[aCoder encodeBool:_doesUserLike forKey:kDoesUserLikeKey];',
            '[aCoder encodeObject:_someObject forKey:kSomeObjectKey];'
          ],
          comments: [],
          keywords: [
            {
              name: 'encodeWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aCoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *'
                }
              })
            }
          ],
          returnType: Maybe.Nothing<ObjC.Type>()
        }
      ];

      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
    });
  });

  describe('#imports', function() {
    it('A correct import the found type', function() {
      const valueType:ValueObject.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'size',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name:'CGSize',
              reference: 'CGSize',
              underlyingType:Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const imports:ObjC.Import[] = ValueObjectPlugin.imports(valueType);
      const expectedImports:ObjC.Import[] = [{
        file:'UIGeometry.h',
        isPublic:false,
        library:Maybe.Just('UIKit')
      }];
      expect(imports).toEqualJSON(expectedImports);
    });
  });

  describe('#staticConstants', function() {
    it('returns no constants when there are no attributes on the found type', function() {
      const valueType:ValueObject.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };
      const staticConstants:ObjC.Constant[] = ValueObjectPlugin.staticConstants(valueType);
      expect(staticConstants).toEqualJSON([]);
    });

    it('returns a constant referencing to the key for coding when the found type ' +
      'has a single attribute', function() {
      const valueType:ValueObject.Type = {
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
              name:'NSString',
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
        typeName: 'Foo'
      };

      const staticConstants:ObjC.Constant[] = ValueObjectPlugin.staticConstants(valueType);
      const expectedStaticConstants:ObjC.Constant[] = [
        {
          type: {
            name: 'NSString',
            reference: 'NSString *'
          },
          comments: [],
          name: 'kNameKey',
          value: '@"NAME"',
          memorySemantic: ObjC.MemorySemantic.UnsafeUnretained()
        }
      ];

      expect(staticConstants).toEqualJSON(expectedStaticConstants);
    });

    it('returns a constant referencing to the key for coding when the found type ' +
      'has a single attribute of a different name', function() {
      const valueType:ValueObject.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'givenName',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name:'NSString',
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
        typeName: 'Foo'
      };

      const staticConstants:ObjC.Constant[] = ValueObjectPlugin.staticConstants(valueType);
      const expectedStaticConstants:ObjC.Constant[] = [
        {
          comments: [],
          type: {
            name: 'NSString',
            reference: 'NSString *'
          },
          name: 'kGivenNameKey',
          value: '@"GIVEN_NAME"',
          memorySemantic: ObjC.MemorySemantic.UnsafeUnretained()
        }
      ];

      expect(staticConstants).toEqualJSON(expectedStaticConstants);
    });

    it('returns two constants referencing to the key for coding when the found type ' +
      'has two attributes', function() {
      const valueType:ValueObject.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'givenName',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name:'NSString',
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
              name:'NSUInteger',
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
        typeName: 'Foo'
      };

      const staticConstants:ObjC.Constant[] = ValueObjectPlugin.staticConstants(valueType);
      const expectedStaticConstants:ObjC.Constant[] = [
        {
          comments: [],
          type: {
            name: 'NSString',
            reference: 'NSString *'
          },
          name: 'kGivenNameKey',
          value: '@"GIVEN_NAME"',
          memorySemantic: ObjC.MemorySemantic.UnsafeUnretained()
        },
        {
          comments: [],
          type: {
            name: 'NSString',
            reference: 'NSString *'
          },
          name: 'kAgeKey',
          value: '@"AGE"',
          memorySemantic: ObjC.MemorySemantic.UnsafeUnretained()
        }
      ];

      expect(staticConstants).toEqualJSON(expectedStaticConstants);
    });
  });

  describe('#decodeStatementForAttribute', function() {
    it('returns code which will decode a BOOL value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'doesUserLike',
        valueAccessor: '_doesUserLike',
        constantName: 'kDoesUserLikeKey',
        type: {
          name: 'BOOL',
          reference: 'BOOL'
        }
      };

      const code: string = Coding.decodeStatementForAttribute(attribute);
      const expectedCode: string = '_doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode an id value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'foo',
        valueAccessor: '_foo',
        constantName: 'kFooKey',
        type: {
          name: 'id',
          reference: 'id'
        }
      };

      const code: string = Coding.decodeStatementForAttribute(attribute);
      const expectedCode: string = '_foo = [aDecoder decodeObjectForKey:kFooKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode an NSObject value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'name',
        valueAccessor: '_name',
        constantName: 'kNameKey',
        type: {
          name: 'NSObject',
          reference: 'NSObject *'
        }
      };

      const code: string = Coding.decodeStatementForAttribute(attribute);
      const expectedCode: string = '_name = [aDecoder decodeObjectForKey:kNameKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode an NSInteger value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'age',
        valueAccessor: '_age',
        constantName: 'kAgeKey',
        type: {
          name: 'NSInteger',
          reference: 'NSInteger'
        }
      };

      const code: string = Coding.decodeStatementForAttribute(attribute);
      const expectedCode: string = '_age = [aDecoder decodeIntegerForKey:kAgeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode an NSUInteger value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'age',
        valueAccessor: '_age',
        constantName: 'kAgeKey',
        type: {
          name: 'NSUInteger',
          reference: 'NSUInteger'
        }
      };

      const code: string = Coding.decodeStatementForAttribute(attribute);
      const expectedCode: string = '_age = [aDecoder decodeIntegerForKey:kAgeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode a selector value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'callbackMethod',
        valueAccessor: '_callbackMethod',
        constantName: 'kCallbackMethodKey',
        type: {
          name: 'SEL',
          reference: 'SEL'
        }
      };

      const code: string = Coding.decodeStatementForAttribute(attribute);
      const expectedCode: string = '_callbackMethod = NSSelectorFromString([aDecoder decodeObjectForKey:kCallbackMethodKey]);';
      expect(code).toEqualJSON(expectedCode);
    });
  });

  describe('#encodeStatementForAttribute', function() {
    it('returns code which will encode a BOOL value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'doesUserLike',
        valueAccessor: '_doesUserLike',
        constantName: 'kDoesUserLikeKey',
        type: {
          name: 'BOOL',
          reference: 'BOOL'
        }
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string = '[aCoder encodeBool:_doesUserLike forKey:kDoesUserLikeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will encode an NSObject value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'name',
        valueAccessor: '_name',
        constantName: 'kNameKey',
        type: {
          name: 'NSObject',
          reference: 'NSObject *'
        }
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string = '[aCoder encodeObject:_name forKey:kNameKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will encode an NSInteger value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'age',
        valueAccessor: '_age',
        constantName: 'kAgeKey',
        type: {
          name: 'NSInteger',
          reference: 'NSInteger'
        }
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string = '[aCoder encodeInteger:_age forKey:kAgeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will encode an NSUInteger value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'age',
        valueAccessor: '_age',
        constantName: 'kAgeKey',
        type: {
          name: 'NSUInteger',
          reference: 'NSUInteger'
        }
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string = '[aCoder encodeInteger:_age forKey:kAgeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will encode a selector as a string value when called', function() {
      const attribute:Coding.CodeableAttribute = {
        name: 'callbackMethod',
        valueAccessor: '_callbackMethod',
        constantName: 'kCallbackMethodKey',
        type: {
          name: 'SEL',
          reference: 'SEL'
        }
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string = '[aCoder encodeObject:NSStringFromSelector(_callbackMethod) forKey:kCallbackMethodKey];';
      expect(code).toEqualJSON(expectedCode);
    });
  });
});

describe('AlgebraicTypePlugins.Coding', function() {
  describe('#instanceMethods', function() {
    it('returns two instance methods which will encode and decode two values when called', function() {
      const algebraicType:AlgebraicType.Type = {
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
            name: 'coolSingleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Just('SomeLib'),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject')
            }
          })
        ]
      };

      const instanceMethods:ObjC.Method[] = AlgebraicTypePlugin.instanceMethods(algebraicType);

      const expectedInstanceMethods:ObjC.Method[] = [
        {
          belongsToProtocol:Maybe.Just<string>('NSCoding'),
          code: [
            'if ((self = [super init])) {',
            '  NSString *codedSubtype = [aDecoder decodeObjectForKey:kCodedSubtypeKey];',
            '  if([codedSubtype isEqualToString:@\"SUBTYPE_SOME_SUBTYPE\"]) {',
            '    _someSubtype_someString = [aDecoder decodeObjectForKey:kSomeSubtypeSomeStringKey];',
            '    _someSubtype_someUnsignedInteger = [aDecoder decodeIntegerForKey:kSomeSubtypeSomeUnsignedIntegerKey];',
            '    _subtype = _TestSubtypesSomeSubtype;',
            '  }',
            '  else if([codedSubtype isEqualToString:@\"SUBTYPE_COOL_SINGLE_ATTRIBUTE_SUBTYPE\"]) {',
            '    _coolSingleAttributeSubtype = [aDecoder decodeObjectForKey:kCoolSingleAttributeSubtypeKey];',
            '    _subtype = _TestSubtypesCoolSingleAttributeSubtype;',
            '  }',
            '  else {',
            '    @throw([NSException exceptionWithName:@\"InvalidSubtypeException\" reason:@\"nil or unknown subtype provided\" userInfo:@{@\"subtype\": codedSubtype}]);',
            '  }',
            '}',
            'return self;'
          ],
          comments: [],
          keywords: [
            {
              name: 'initWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aDecoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *'
                }
              })
            }
          ],
          returnType: Maybe.Just<ObjC.Type>({
            name: 'instancetype',
            reference: 'instancetype'
          })
        },
        {
          belongsToProtocol:Maybe.Just<string>('NSCoding'),
          code: [
            'switch (_subtype) {',
            '  case _TestSubtypesSomeSubtype: {',
            '    [aCoder encodeObject:_someSubtype_someString forKey:kSomeSubtypeSomeStringKey];',
            '    [aCoder encodeInteger:_someSubtype_someUnsignedInteger forKey:kSomeSubtypeSomeUnsignedIntegerKey];',
            '    [aCoder encodeObject:@"SUBTYPE_SOME_SUBTYPE" forKey:kCodedSubtypeKey];',
            '    break;',
            '  }',
            '  case _TestSubtypesCoolSingleAttributeSubtype: {',
            '    [aCoder encodeObject:_coolSingleAttributeSubtype forKey:kCoolSingleAttributeSubtypeKey];',
            '    [aCoder encodeObject:@"SUBTYPE_COOL_SINGLE_ATTRIBUTE_SUBTYPE" forKey:kCodedSubtypeKey];',
            '    break;',
            '  }',
            '}'
          ],
          comments: [],
          keywords: [
            {
              name: 'encodeWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aCoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *'
                }
              })
            }
          ],
          returnType: Maybe.Nothing<ObjC.Type>()
        }
      ];

      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
    });
  });

  describe('#staticConstants', function() {
    it('returns four constants referencing to the key for coding when the algebraic type ' +
      'has two subtypes with three cumulative attributes', function() {
      const algebraicType:AlgebraicType.Type = {
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
            name: 'coolSingleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Just('SomeLib'),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject')
            }
          })
        ]
      };

      const staticConstants:ObjC.Constant[] = AlgebraicTypePlugin.staticConstants(algebraicType);
      const expectedStaticConstants:ObjC.Constant[] = [
        {
          comments: [],
          type: {
            name: 'NSString',
            reference: 'NSString *',
          },
          name: 'kCodedSubtypeKey',
          value: '@"CODED_SUBTYPE"',
          memorySemantic: ObjC.MemorySemantic.UnsafeUnretained()
        },
        {
          comments: [],
          type: {
            name: 'NSString',
            reference: 'NSString *'
          },
          name: 'kSomeSubtypeSomeStringKey',
          value: '@"SOME_SUBTYPE_SOME_STRING"',
          memorySemantic: ObjC.MemorySemantic.UnsafeUnretained()
        },
        {
          comments: [],
          type: {
            name: 'NSString',
            reference: 'NSString *'
          },
          name: 'kSomeSubtypeSomeUnsignedIntegerKey',
          value: '@"SOME_SUBTYPE_SOME_UNSIGNED_INTEGER"',
          memorySemantic: ObjC.MemorySemantic.UnsafeUnretained()
        },
        {
          comments: [],
          type: {
            name: 'NSString',
            reference: 'NSString *'
          },
          name: 'kCoolSingleAttributeSubtypeKey',
          value: '@"COOL_SINGLE_ATTRIBUTE_SUBTYPE"',
          memorySemantic: ObjC.MemorySemantic.UnsafeUnretained()
        }
      ];

      expect(staticConstants).toEqualJSON(expectedStaticConstants);
    });
  });

  describe('#validationErrors', function() {
    it('returns no validation errors when there are no attributes on the provided subtypes', function() {
      const algebraicType:AlgebraicType.Type = {
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
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
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
                name: 'someFoo',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>()
                }
              }
            ]
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Coding plugin does not know how to decode and encode the type "Foo" from Test.someFoo. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns two validation errors when there are two attributes with unknown types', function() {
      const algebraicType:AlgebraicType.Type = {
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
                name: 'someFoo',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'AnotherSubtype',
            comments: [],
            attributes: [
              {
                name: 'someFerr',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Ferr',
                  reference: 'Ferr',
                  libraryTypeIsDefinedIn: Maybe.Just<string>('SomeLib'),
                  fileTypeIsDefinedIn: Maybe.Just<string>('SomethingElse'),
                  underlyingType: Maybe.Nothing<string>()
                }
              }
            ]
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Coding plugin does not know how to decode and encode the type "Foo" from Test.someFoo. Did you forget to declare a backing type?'),
        Error.Error('The Coding plugin does not know how to decode and encode the type "Ferr" from Test.someFerr. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there is an attribute with an unknown underlying type', function() {
      const algebraicType:AlgebraicType.Type = {
        name: 'Test',
        includes: [],
        typeLookups:[],
        excludes: [],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'AnotherSubtype',
            comments: [],
            attributes: [
              {
                name: 'someFerr',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Ferr',
                  reference: 'Ferr',
                  libraryTypeIsDefinedIn: Maybe.Just<string>('SomeLib'),
                  fileTypeIsDefinedIn: Maybe.Just<string>('SomethingElse'),
                  underlyingType: Maybe.Just<string>('SomethingRandom')
                }
              }
            ]
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Coding plugin does not know how to decode and encode the backing type "SomethingRandom" from Test.someFerr. Did you declare the wrong backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });
});
