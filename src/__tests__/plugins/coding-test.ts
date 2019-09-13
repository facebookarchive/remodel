/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as AlgebraicType from '../../algebraic-type';
import * as Coding from '../../plugins/coding';
import * as Error from '../../error';
import * as Maybe from '../../maybe';
import * as ObjC from '../../objc';
import * as ObjectSpec from '../../object-spec';

const ObjectSpecPlugin = Coding.createPlugin();
const AlgebraicTypePlugin = Coding.createAlgebraicTypePlugin();

describe('ObjectSpecPlugins.Coding', function() {
  describe('#validationErrors', function() {
    it('returns no validation errors when there are no attributes on the found type', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };
      const errors: Error.Error[] = ObjectSpecPlugin.validationErrors(
        objectType,
      );
      expect(errors).toEqualJSON([]);
    });

    it('returns a validation error when there is an attribute with an unknown type', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'name',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'NSString',
              reference: 'NSString *',
              underlyingType: 'NSObject',
              conformingProtocol: null,
            },
          },
          {
            annotations: {},
            comments: [],
            name: 'likeStatus',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'LikeStatus',
              reference: 'LikeStatus',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };
      const errors: Error.Error[] = ObjectSpecPlugin.validationErrors(
        objectType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Coding plugin does not know how to decode and encode the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns two validation errors when there are two attributes with unknown types', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'name',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'Name',
              reference: 'Name',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
          {
            annotations: {},
            comments: [],
            name: 'likeStatus',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'LikeStatus',
              reference: 'LikeStatus',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };
      const errors: Error.Error[] = ObjectSpecPlugin.validationErrors(
        objectType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Coding plugin does not know how to decode and encode the type "Name" from Foo.name. Did you forget to declare a backing type?',
        ),
        Error.Error(
          'The Coding plugin does not know how to decode and encode the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there is an attribute with an unknown underlying type', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'name',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'FooBar',
              reference: 'FooBar',
              underlyingType: 'Baz',
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };
      const errors: Error.Error[] = ObjectSpecPlugin.validationErrors(
        objectType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Coding plugin does not know how to decode and encode the backing type "Baz" from Foo.name. Did you declare the wrong backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there is an attribute with legacy key with unsupported type', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {
              codingLegacyKey: [
                {
                  properties: {name: 'legacySizeCodingKey'},
                },
              ],
            },
            comments: [],
            name: 'size',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'CGSize',
              reference: 'CGSize',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };
      const errors: Error.Error[] = ObjectSpecPlugin.validationErrors(
        objectType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          '%codingLegacyKey can\'t be used with "CGSize" at Foo.size.',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });

  describe('#instanceMethods', function() {
    it('returns no instance methods when there are no attributes on the found type', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };
      const instanceMethods: ObjC.Method[] = ObjectSpecPlugin.instanceMethods(
        objectType,
      );
      expect(instanceMethods).toEqualJSON([]);
    });

    it('returns two instance methods which will encode and decode a value, respecting the legacy key name', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {
              codingLegacyKey: [
                {
                  properties: {name: 'oldNameKey'},
                },
              ],
            },
            comments: [],
            name: 'name',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'NSString',
              reference: 'NSString *',
              underlyingType: 'NSObject',
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };

      const instanceMethods: ObjC.Method[] = ObjectSpecPlugin.instanceMethods(
        objectType,
      );

      const expectedInstanceMethods: ObjC.Method[] = [
        {
          preprocessors: [],
          belongsToProtocol: 'NSCoding',
          code: [
            'if ((self = [super init])) {',
            '  _name = (id)[aDecoder decodeObjectForKey:kNameKey];',
            '  if (_name == nil) {',
            '    _name = (id)[aDecoder decodeObjectForKey:@"oldNameKey"];',
            '  }',
            '}',
            'return self;',
          ],
          comments: [],
          compilerAttributes: [],
          keywords: [
            {
              name: 'initWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aDecoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *',
                },
              }),
            },
          ],
          returnType: {
            type: Maybe.Just<ObjC.Type>({
              name: 'instancetype',
              reference: 'instancetype',
            }),
            modifiers: [ObjC.KeywordArgumentModifier.Nullable()],
          },
        },
        {
          preprocessors: [],
          belongsToProtocol: 'NSCoding',
          code: ['[aCoder encodeObject:_name forKey:kNameKey];'],
          comments: [],
          compilerAttributes: [],
          keywords: [
            {
              name: 'encodeWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aCoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *',
                },
              }),
            },
          ],
          returnType: {type: Maybe.Nothing<ObjC.Type>(), modifiers: []},
        },
      ];

      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
    });

    it('returns two instance methods which will encode and decode three values when called', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'name',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'NSString',
              reference: 'NSString *',
              underlyingType: 'NSObject',
              conformingProtocol: null,
            },
          },
          {
            annotations: {},
            comments: [],
            name: 'doesUserLike',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'BOOL',
              reference: 'BOOL',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
          {
            annotations: {},
            comments: [],
            name: 'someObject',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'id',
              reference: 'id',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };

      const instanceMethods: ObjC.Method[] = ObjectSpecPlugin.instanceMethods(
        objectType,
      );

      const expectedInstanceMethods: ObjC.Method[] = [
        {
          preprocessors: [],
          belongsToProtocol: 'NSCoding',
          code: [
            'if ((self = [super init])) {',
            '  _name = (id)[aDecoder decodeObjectForKey:kNameKey];',
            '  _doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];',
            '  _someObject = [aDecoder decodeObjectForKey:kSomeObjectKey];',
            '}',
            'return self;',
          ],
          comments: [],
          compilerAttributes: [],
          keywords: [
            {
              name: 'initWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aDecoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *',
                },
              }),
            },
          ],
          returnType: {
            type: Maybe.Just<ObjC.Type>({
              name: 'instancetype',
              reference: 'instancetype',
            }),
            modifiers: [ObjC.KeywordArgumentModifier.Nullable()],
          },
        },
        {
          preprocessors: [],
          belongsToProtocol: 'NSCoding',
          code: [
            '[aCoder encodeObject:_name forKey:kNameKey];',
            '[aCoder encodeBool:_doesUserLike forKey:kDoesUserLikeKey];',
            '[aCoder encodeObject:_someObject forKey:kSomeObjectKey];',
          ],
          comments: [],
          compilerAttributes: [],
          keywords: [
            {
              name: 'encodeWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aCoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *',
                },
              }),
            },
          ],
          returnType: {type: Maybe.Nothing<ObjC.Type>(), modifiers: []},
        },
      ];

      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
    });
  });

  describe('#imports', function() {
    it('A correct import the found type', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'size',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'CGSize',
              reference: 'CGSize',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };

      const imports: ObjC.Import[] = ObjectSpecPlugin.imports(objectType);
      const expectedImports: ObjC.Import[] = [
        {
          file: 'UIGeometry.h',
          isPublic: false,
          library: 'UIKit',
          requiresCPlusPlus: false,
        },
      ];
      expect(imports).toEqualJSON(expectedImports);
    });
  });

  describe('#staticConstants', function() {
    it('returns no constants when there are no attributes on the found type', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };
      const staticConstants: ObjC.Constant[] = ObjectSpecPlugin.staticConstants(
        objectType,
      );
      expect(staticConstants).toEqualJSON([]);
    });

    it(
      'returns a constant referencing to the key for coding when the found type ' +
        'has a single attribute',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'name',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'NSString',
                reference: 'NSString *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeName: 'Foo',
        };

        const staticConstants: ObjC.Constant[] = ObjectSpecPlugin.staticConstants(
          objectType,
        );
        const expectedStaticConstants: ObjC.Constant[] = [
          {
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            comments: [],
            name: 'kNameKey',
            value: '@"NAME"',
            memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
          },
        ];

        expect(staticConstants).toEqualJSON(expectedStaticConstants);
      },
    );

    it(
      'returns a constant referencing to the key for coding when the found type ' +
        'has a single attribute of a different name',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'givenName',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'NSString',
                reference: 'NSString *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeName: 'Foo',
        };

        const staticConstants: ObjC.Constant[] = ObjectSpecPlugin.staticConstants(
          objectType,
        );
        const expectedStaticConstants: ObjC.Constant[] = [
          {
            comments: [],
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            name: 'kGivenNameKey',
            value: '@"GIVEN_NAME"',
            memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
          },
        ];

        expect(staticConstants).toEqualJSON(expectedStaticConstants);
      },
    );

    it(
      'returns two constants referencing to the key for coding when the found type ' +
        'has two attributes',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'givenName',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'NSString',
                reference: 'NSString *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'NSUInteger',
                reference: 'NSUInteger',
                underlyingType: null,
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeName: 'Foo',
        };

        const staticConstants: ObjC.Constant[] = ObjectSpecPlugin.staticConstants(
          objectType,
        );
        const expectedStaticConstants: ObjC.Constant[] = [
          {
            comments: [],
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            name: 'kGivenNameKey',
            value: '@"GIVEN_NAME"',
            memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
          },
          {
            comments: [],
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            name: 'kAgeKey',
            value: '@"AGE"',
            memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
          },
        ];

        expect(staticConstants).toEqualJSON(expectedStaticConstants);
      },
    );

    it('uses the codingKey attribute if provided', () => {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {
              codingKey: [
                {
                  properties: {name: 'test_custom_key'},
                },
              ],
            },
            comments: [],
            name: 'test',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'NSString',
              reference: 'NSString *',
              underlyingType: 'NSObject',
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeName: 'Foo',
      };

      const staticConstants: ObjC.Constant[] = ObjectSpecPlugin.staticConstants(
        objectType,
      );
      const expectedConstants: ObjC.Constant[] = [
        {
          comments: [],
          type: {
            name: 'NSString',
            reference: 'NSString *',
          },
          name: 'kTestKey',
          value: '@"test_custom_key"',
          memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
        },
      ];

      expect(staticConstants).toEqualJSON(expectedConstants);
    });
  });

  describe('#decodeStatementForAttribute', function() {
    it('returns code which will decode a BOOL value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'doesUserLike',
        valueAccessor: '_doesUserLike',
        constantName: 'kDoesUserLikeKey',
        constantValue: 'DOES_USER_LIKE',
        legacyKeyNames: [],
        type: {
          name: 'BOOL',
          reference: 'BOOL',
        },
        originalType: {
          name: 'BOOL',
          reference: 'BOOL',
        },
      };

      const code: string = Coding.decodeStatementForAttribute(attribute, false);
      const expectedCode: string =
        '_doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode an id value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'foo',
        valueAccessor: '_foo',
        constantName: 'kFooKey',
        constantValue: 'FOO',
        legacyKeyNames: [],
        type: {
          name: 'id',
          reference: 'id',
        },
        originalType: {
          name: 'id',
          reference: 'id',
        },
      };

      const code: string = Coding.decodeStatementForAttribute(attribute, false);
      const expectedCode: string =
        '_foo = [aDecoder decodeObjectForKey:kFooKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode an NSObject value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'name',
        valueAccessor: '_name',
        constantName: 'kNameKey',
        constantValue: 'NAME',
        legacyKeyNames: [],
        type: {
          name: 'NSObject',
          reference: 'NSObject *',
        },
        originalType: {
          name: 'NSObject',
          reference: 'NSObject *',
        },
      };

      const code: string = Coding.decodeStatementForAttribute(attribute, false);
      const expectedCode: string =
        '_name = (id)[aDecoder decodeObjectForKey:kNameKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode an NSInteger value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'age',
        valueAccessor: '_age',
        constantName: 'kAgeKey',
        constantValue: 'AGE',
        legacyKeyNames: [],
        type: {
          name: 'NSInteger',
          reference: 'NSInteger',
        },
        originalType: {
          name: 'NSInteger',
          reference: 'NSInteger',
        },
      };

      const code: string = Coding.decodeStatementForAttribute(attribute, false);
      const expectedCode: string =
        '_age = [aDecoder decodeIntegerForKey:kAgeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode an NSUInteger value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'age',
        valueAccessor: '_age',
        constantName: 'kAgeKey',
        constantValue: 'AGE',
        legacyKeyNames: [],
        type: {
          name: 'NSUInteger',
          reference: 'NSUInteger',
        },
        originalType: {
          name: 'NSUInteger',
          reference: 'NSUInteger',
        },
      };

      const code: string = Coding.decodeStatementForAttribute(attribute, false);
      const expectedCode: string =
        '_age = [aDecoder decodeIntegerForKey:kAgeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will decode a selector value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'callbackMethod',
        valueAccessor: '_callbackMethod',
        constantName: 'kCallbackMethodKey',
        constantValue: 'CALLBACK_METHOD',
        legacyKeyNames: [],
        type: {
          name: 'SEL',
          reference: 'SEL',
        },
        originalType: {
          name: 'SEL',
          reference: 'SEL',
        },
      };

      const code: string = Coding.decodeStatementForAttribute(attribute, false);
      const expectedCode: string =
        '_callbackMethod = NSSelectorFromString([aDecoder decodeObjectForKey:kCallbackMethodKey]);';
      expect(code).toEqualJSON(expectedCode);
    });
  });

  describe('#encodeStatementForAttribute', function() {
    it('returns code which will encode a BOOL value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'doesUserLike',
        valueAccessor: '_doesUserLike',
        constantName: 'kDoesUserLikeKey',
        constantValue: 'DOES_USER_LIKE',
        legacyKeyNames: [],
        type: {
          name: 'BOOL',
          reference: 'BOOL',
        },
        originalType: {
          name: 'BOOL',
          reference: 'BOOL',
        },
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string =
        '[aCoder encodeBool:_doesUserLike forKey:kDoesUserLikeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will encode an NSObject value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'name',
        valueAccessor: '_name',
        constantName: 'kNameKey',
        constantValue: 'NAME',
        legacyKeyNames: [],
        type: {
          name: 'NSObject',
          reference: 'NSObject *',
        },
        originalType: {
          name: 'NSObject',
          reference: 'NSObject *',
        },
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string =
        '[aCoder encodeObject:_name forKey:kNameKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will encode an NSInteger value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'age',
        valueAccessor: '_age',
        constantName: 'kAgeKey',
        constantValue: 'AGE',
        legacyKeyNames: [],
        type: {
          name: 'NSInteger',
          reference: 'NSInteger',
        },
        originalType: {
          name: 'NSInteger',
          reference: 'NSInteger',
        },
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string =
        '[aCoder encodeInteger:_age forKey:kAgeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will encode an NSUInteger value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'age',
        valueAccessor: '_age',
        constantName: 'kAgeKey',
        constantValue: 'AGE',
        legacyKeyNames: [],
        type: {
          name: 'NSUInteger',
          reference: 'NSUInteger',
        },
        originalType: {
          name: 'NSUInteger',
          reference: 'NSUInteger',
        },
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string =
        '[aCoder encodeInteger:_age forKey:kAgeKey];';
      expect(code).toEqualJSON(expectedCode);
    });

    it('returns code which will encode a selector as a string value when called', function() {
      const attribute: Coding.CodeableAttribute = {
        name: 'callbackMethod',
        valueAccessor: '_callbackMethod',
        constantName: 'kCallbackMethodKey',
        constantValue: 'CALLBACK_METHOD',
        legacyKeyNames: [],
        type: {
          name: 'SEL',
          reference: 'SEL',
        },
        originalType: {
          name: 'SEL',
          reference: 'SEL',
        },
      };

      const code: string = Coding.encodeStatementForAttribute(attribute);
      const expectedCode: string =
        '[aCoder encodeObject:NSStringFromSelector(_callbackMethod) forKey:kCallbackMethodKey];';
      expect(code).toEqualJSON(expectedCode);
    });
  });
});

describe('AlgebraicTypePlugins.Coding', function() {
  describe('#instanceMethods', function() {
    it('returns two instance methods which will encode and decode two values when called', function() {
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

      const instanceMethods: ObjC.Method[] = AlgebraicTypePlugin.instanceMethods(
        algebraicType,
      );

      const expectedInstanceMethods: ObjC.Method[] = [
        {
          preprocessors: [],
          belongsToProtocol: 'NSCoding',
          code: [
            'if ((self = [super init])) {',
            '  NSString *codedSubtype = [aDecoder decodeObjectForKey:kCodedSubtypeKey];',
            '  if([codedSubtype isEqualToString:@"SUBTYPE_SOME_SUBTYPE"]) {',
            '    _someSubtype_someString = (id)[aDecoder decodeObjectForKey:kSomeSubtypeSomeStringKey];',
            '    _someSubtype_someUnsignedInteger = [aDecoder decodeIntegerForKey:kSomeSubtypeSomeUnsignedIntegerKey];',
            '    _subtype = TestSubtypesSomeSubtype;',
            '  }',
            '  else if([codedSubtype isEqualToString:@"SUBTYPE_COOL_SINGLE_ATTRIBUTE_SUBTYPE"]) {',
            '    _coolSingleAttributeSubtype = (id)[aDecoder decodeObjectForKey:kCoolSingleAttributeSubtypeKey];',
            '    _subtype = TestSubtypesCoolSingleAttributeSubtype;',
            '  }',
            '  else {',
            '    [[NSException exceptionWithName:@"InvalidSubtypeException" reason:@"nil or unknown subtype provided" userInfo:@{@"subtype": codedSubtype}] raise];',
            '  }',
            '}',
            'return self;',
          ],
          comments: [],
          compilerAttributes: [],
          keywords: [
            {
              name: 'initWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aDecoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *',
                },
              }),
            },
          ],
          returnType: {
            type: Maybe.Just<ObjC.Type>({
              name: 'instancetype',
              reference: 'instancetype',
            }),
            modifiers: [ObjC.KeywordArgumentModifier.Nullable()],
          },
        },
        {
          preprocessors: [],
          belongsToProtocol: 'NSCoding',
          code: [
            'switch (_subtype) {',
            '  case TestSubtypesSomeSubtype: {',
            '    [aCoder encodeObject:_someSubtype_someString forKey:kSomeSubtypeSomeStringKey];',
            '    [aCoder encodeInteger:_someSubtype_someUnsignedInteger forKey:kSomeSubtypeSomeUnsignedIntegerKey];',
            '    [aCoder encodeObject:@"SUBTYPE_SOME_SUBTYPE" forKey:kCodedSubtypeKey];',
            '    break;',
            '  }',
            '  case TestSubtypesCoolSingleAttributeSubtype: {',
            '    [aCoder encodeObject:_coolSingleAttributeSubtype forKey:kCoolSingleAttributeSubtypeKey];',
            '    [aCoder encodeObject:@"SUBTYPE_COOL_SINGLE_ATTRIBUTE_SUBTYPE" forKey:kCodedSubtypeKey];',
            '    break;',
            '  }',
            '}',
          ],
          comments: [],
          compilerAttributes: [],
          keywords: [
            {
              name: 'encodeWithCoder',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'aCoder',
                modifiers: [],
                type: {
                  name: 'NSCoder',
                  reference: 'NSCoder *',
                },
              }),
            },
          ],
          returnType: {type: Maybe.Nothing<ObjC.Type>(), modifiers: []},
        },
      ];

      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
    });
  });

  describe('#staticConstants', function() {
    it(
      'returns four constants referencing to the key for coding when the algebraic type ' +
        'has two subtypes with three cumulative attributes',
      function() {
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

        const staticConstants: ObjC.Constant[] = AlgebraicTypePlugin.staticConstants(
          algebraicType,
        );
        const expectedStaticConstants: ObjC.Constant[] = [
          {
            comments: [],
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            name: 'kCodedSubtypeKey',
            value: '@"CODED_SUBTYPE"',
            memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
          },
          {
            comments: [],
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            name: 'kSomeSubtypeSomeStringKey',
            value: '@"SOME_SUBTYPE_SOME_STRING"',
            memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
          },
          {
            comments: [],
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            name: 'kSomeSubtypeSomeUnsignedIntegerKey',
            value: '@"SOME_SUBTYPE_SOME_UNSIGNED_INTEGER"',
            memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
          },
          {
            comments: [],
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            name: 'kCoolSingleAttributeSubtypeKey',
            value: '@"COOL_SINGLE_ATTRIBUTE_SUBTYPE"',
            memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
          },
        ];

        expect(staticConstants).toEqualJSON(expectedStaticConstants);
      },
    );
  });

  describe('#validationErrors', function() {
    it('returns no validation errors when there are no attributes on the provided subtypes', function() {
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

      const errors: Error.Error[] = AlgebraicTypePlugin.validationErrors(
        algebraicType,
      );
      expect(errors).toEqualJSON([]);
    });

    it('returns a validation error when there is an attribute with an unknown type', function() {
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
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: null,
                  fileTypeIsDefinedIn: null,
                  underlyingType: null,
                  conformingProtocol: null,
                },
              },
            ],
            annotations: {},
          }),
        ],
      };
      const errors: Error.Error[] = AlgebraicTypePlugin.validationErrors(
        algebraicType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Coding plugin does not know how to decode and encode the type "Foo" from Test.someFoo. Did you forget to declare a backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns two validation errors when there are two attributes with unknown types', function() {
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
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
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
            name: 'AnotherSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someFerr',
                comments: [],
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  name: 'Ferr',
                  reference: 'Ferr',
                  libraryTypeIsDefinedIn: 'SomeLib',
                  fileTypeIsDefinedIn: 'SomethingElse',
                  underlyingType: null,
                  conformingProtocol: null,
                },
              },
            ],
            annotations: {},
          }),
        ],
      };
      const errors: Error.Error[] = AlgebraicTypePlugin.validationErrors(
        algebraicType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Coding plugin does not know how to decode and encode the type "Foo" from Test.someFoo. Did you forget to declare a backing type?',
        ),
        Error.Error(
          'The Coding plugin does not know how to decode and encode the type "Ferr" from Test.someFerr. Did you forget to declare a backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there is an attribute with an unknown underlying type', function() {
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
            name: 'AnotherSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someFerr',
                comments: [],
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  name: 'Ferr',
                  reference: 'Ferr',
                  libraryTypeIsDefinedIn: 'SomeLib',
                  fileTypeIsDefinedIn: 'SomethingElse',
                  underlyingType: 'SomethingRandom',
                  conformingProtocol: null,
                },
              },
            ],
            annotations: {},
          }),
        ],
      };
      const errors: Error.Error[] = AlgebraicTypePlugin.validationErrors(
        algebraicType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Coding plugin does not know how to decode and encode the backing type "SomethingRandom" from Test.someFerr. Did you declare the wrong backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });
});
