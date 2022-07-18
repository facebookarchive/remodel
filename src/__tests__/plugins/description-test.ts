/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as AlgebraicType from '../../algebraic-type';
import * as Description from '../../plugins/description';
import * as Error from '../../error';
import * as CLangCommon from '../../clang-common';
import * as ObjC from '../../objc';
import * as ObjectSpec from '../../object-spec';
import * as ObjectSpecHelpers from '../../object-spec-helpers';

const AlgebraicTypePlugin = Description.createAlgebraicTypePlugin();
const ObjectSpecPlugin = Description.createPlugin();

describe('ObjectSpecPlugins.Description', function () {
  describe('Value Object', function () {
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
            'The Description plugin does not know how to format the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?',
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
            'The Description plugin does not know how to format the type "Name" from Foo.name. Did you forget to declare a backing type?',
          ),
          Error.Error(
            'The Description plugin does not know how to format the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?',
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
            'The Description plugin does not know how to format the backing type "Baz" from Foo.name. Did you declare the wrong backing type?',
          ),
        ];
        expect(errors).toEqualJSON(expectedErrors);
      });
    });

    describe('#imports', function () {
      it('correctly finds imports for description functions that require them', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'rect',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'CGRect',
                'CGRect',
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

    describe('#instanceMethods', function () {
      it('returns no instance methods when there are no attributes on the found type', function () {
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
        expect(instanceMethods).toEqualJSON([]);
      });

      it('returns an instance method which will output a BOOL attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'doesUserLike',
              new ObjectSpecHelpers.AttributeTypeBuilder('BOOL', 'BOOL', null),
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t doesUserLike: %@; \\n", [super description], _doesUserLike ? @"YES" : @"NO"];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSString* attribute when called', function () {
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t name: %@; \\n", [super description], _name];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an id attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t something: %@; \\n", [super description], _something];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSInteger attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSInteger',
                'NSInteger',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %lld; \\n", [super description], (long long)_age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSUInteger attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSUInteger',
                'NSUInteger',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %llu; \\n", [super description], (unsigned long long)_age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a double attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'double',
                'double',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %lf; \\n", [super description], _age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a float attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
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

        const instanceMethods: ObjC.Method[] =
          ObjectSpecPlugin.instanceMethods(objectType);

        const expectedInstanceMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: 'NSObject',
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %f; \\n", [super description], _age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a CGFloat attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
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

        const instanceMethods: ObjC.Method[] =
          ObjectSpecPlugin.instanceMethods(objectType);

        const expectedInstanceMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: 'NSObject',
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %f; \\n", [super description], _age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSTimeInterval attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSTimeInterval',
                'NSTimeInterval',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %lf; \\n", [super description], _age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a uintptr_t attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'uintptr_t',
                'uintptr_t',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %p; \\n", [super description], (void *)_age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an uint64_t attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'uint64_t',
                'uint64_t',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %llu; \\n", [super description], (unsigned long long)_age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an int32_t attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'int32_t',
                'int32_t',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %d; \\n", [super description], _age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an int64_t attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'age',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'int64_t',
                'int64_t',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %lld; \\n", [super description], (long long)_age];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it(
        'returns an instance method which will output an NSUInteger attribute ' +
          'when called and the attribute type has an underlying type of NSUInteger',
        function () {
          const objectType: ObjectSpec.Type = {
            annotations: {},
            attributes: [
              new ObjectSpecHelpers.AttributeBuilder(
                'age',
                new ObjectSpecHelpers.AttributeTypeBuilder(
                  'SomeEnum',
                  'SomeEnum',
                  'NSUInteger',
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
              code: [
                'return [NSString stringWithFormat:@"%@ - \\n\\t age: %llu; \\n", [super description], (unsigned long long)_age];',
              ],
              comments: [],
              compilerAttributes: [],
              keywords: [
                {
                  name: 'description',
                  argument: null,
                },
              ],
              returnType: {
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                },
                modifiers: [],
              },
            },
          ];

          expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
        },
      );

      it('returns an instance method which will output a selector attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'action',
              new ObjectSpecHelpers.AttributeTypeBuilder('SEL', 'SEL', null),
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t action: %@; \\n", [super description], NSStringFromSelector(_action)];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSRange attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'range',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t range: %@; \\n", [super description], NSStringFromRange(_range)];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a CGRect attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'rect',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'CGRect',
                'CGRect',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t rect: %@; \\n", [super description], NSStringFromCGRect(_rect)];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a CGPoint attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'origin',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'CGPoint',
                'CGPoint',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t origin: %@; \\n", [super description], NSStringFromCGPoint(_origin)];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a CGSize attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'size',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'CGSize',
                'CGSize',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t size: %@; \\n", [super description], NSStringFromCGSize(_size)];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a UIEdgeInsets attribute when called', function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'insets',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'UIEdgeInsets',
                'UIEdgeInsets',
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
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t insets: %@; \\n", [super description], NSStringFromUIEdgeInsets(_insets)];',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });
    });
  });
});
describe('AlgebraicTypePlugins.Description', function () {
  describe('#imports', function () {
    it('correctly finds imports for description functions that require them', function () {
      const algebraicType: AlgebraicType.Type = {
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
                nullability: CLangCommon.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: null,
                  fileTypeIsDefinedIn: null,
                  underlyingType: 'NSObject',
                  conformingProtocols: [],
                  referencedGenericTypes: [],
                },
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability: CLangCommon.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: null,
                  fileTypeIsDefinedIn: null,
                  underlyingType: null,
                  conformingProtocols: [],
                  referencedGenericTypes: [],
                },
              },
            ],
            annotations: {},
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
            annotations: {},
            name: 'coolSingleAttributeRectSubtype',
            comments: [],
            nullability: CLangCommon.Nullability.Inherited(),
            type: {
              name: 'CGRect',
              reference: 'CGRect',
              libraryTypeIsDefinedIn: null,
              fileTypeIsDefinedIn: null,
              underlyingType: null,
              conformingProtocols: [],
              referencedGenericTypes: [],
            },
          }),
        ],
      };

      const imports: ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
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
  describe('#instanceMethods', function () {
    it(
      'returns an instance method which will output a different description ' +
        'depending on which subtype is being represented',
      function () {
        const algebraicType: AlgebraicType.Type = {
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
                  nullability: CLangCommon.Nullability.Inherited(),
                  type: {
                    name: 'NSString',
                    reference: 'NSString *',
                    libraryTypeIsDefinedIn: null,
                    fileTypeIsDefinedIn: null,
                    underlyingType: 'NSObject',
                    conformingProtocols: [],
                    referencedGenericTypes: [],
                  },
                },
                {
                  annotations: {},
                  name: 'someUnsignedInteger',
                  comments: [],
                  nullability: CLangCommon.Nullability.Inherited(),
                  type: {
                    name: 'NSUInteger',
                    reference: 'NSUInteger',
                    libraryTypeIsDefinedIn: null,
                    fileTypeIsDefinedIn: null,
                    underlyingType: null,
                    conformingProtocols: [],
                    referencedGenericTypes: [],
                  },
                },
              ],
              annotations: {},
            }),
            AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
              annotations: {},
              name: 'coolSingleAttributeBoolSubtype',
              comments: [],
              nullability: CLangCommon.Nullability.Inherited(),
              type: {
                name: 'BOOL',
                reference: 'BOOL',
                libraryTypeIsDefinedIn: null,
                fileTypeIsDefinedIn: null,
                underlyingType: null,
                conformingProtocols: [],
                referencedGenericTypes: [],
              },
            }),
          ],
        };

        const instanceMethods: ObjC.Method[] =
          AlgebraicTypePlugin.instanceMethods(algebraicType);

        const expectedInstanceMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: 'NSObject',
            code: [
              'switch (_subtype) {',
              '  case TestSubtypesSomeSubtype: {',
              '    return [NSString stringWithFormat:@"%@ - SomeSubtype \\n\\t someString: %@; \\n\\t someUnsignedInteger: %llu; \\n", [super description], _someSubtype_someString, (unsigned long long)_someSubtype_someUnsignedInteger];',
              '    break;',
              '  }',
              '  case TestSubtypesCoolSingleAttributeBoolSubtype: {',
              '    return [NSString stringWithFormat:@"%@ - \\n\\t coolSingleAttributeBoolSubtype: %@; \\n", [super description], _coolSingleAttributeBoolSubtype ? @"YES" : @"NO"];',
              '    break;',
              '  }',
              '}',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'description',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
          },
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      },
    );
  });

  describe('#validationErrors', function () {
    it('returns no validation errors when there are no attributes on the provided subtypes', function () {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: [],
        excludes: [],
        typeLookups: [],
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
                name: 'someFoo',
                comments: [],
                nullability: CLangCommon.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: null,
                  fileTypeIsDefinedIn: null,
                  underlyingType: null,
                  conformingProtocols: [],
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
          'The Description plugin does not know how to format the type "Foo" from Test.someFoo. Did you forget to declare a backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
    it('returns two validation errors when there are two attributes with unknown types', function () {
      const algebraicType: AlgebraicType.Type = {
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
                name: 'someFoo',
                comments: [],
                nullability: CLangCommon.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: null,
                  fileTypeIsDefinedIn: null,
                  underlyingType: null,
                  conformingProtocols: [],
                  referencedGenericTypes: [],
                },
              },
            ],
            annotations: {},
          }),
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
              underlyingType: null,
              conformingProtocols: [],
              referencedGenericTypes: [],
            },
          }),
        ],
      };
      const errors: Error.Error[] =
        AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'The Description plugin does not know how to format the type "Foo" from Test.someFoo. Did you forget to declare a backing type?',
        ),
        Error.Error(
          'The Description plugin does not know how to format the type "Ferr" from Test.someFerr. Did you forget to declare a backing type?',
        ),
      ];

      expect(errors).toEqualJSON(expectedErrors);
    });
    it('returns a validation error when there is an attribute with an unknown underlying type', function () {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups: [],
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
                nullability: CLangCommon.Nullability.Inherited(),
                type: {
                  name: 'Ferr',
                  reference: 'Ferr',
                  libraryTypeIsDefinedIn: 'SomeLib',
                  fileTypeIsDefinedIn: 'SomethingElse',
                  underlyingType: 'SomethingRandom',
                  conformingProtocols: [],
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
          'The Description plugin does not know how to format the backing type "SomethingRandom" from Test.someFerr. Did you declare the wrong backing type?',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });
});
