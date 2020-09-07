/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as AlgebraicType from '../../algebraic-type';
import * as AlgebraicTypeInitialization from '../../plugins/algebraic-type-initialization';
import * as Code from '../../code';
import * as Error from '../../error';
import * as Maybe from '../../maybe';
import * as ObjC from '../../objc';

const AlgebraicTypePlugin = AlgebraicTypeInitialization.createAlgebraicTypePlugin();

describe('AlgebraicTypePlugins.AlgebraicTypeInitialization', function() {
  describe('#imports', function() {
    it('includes a public import for Foundation/Foundation.h', function() {
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
        ],
      };

      const imports: ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImport: ObjC.Import = {
        library: 'Foundation',
        file: 'Foundation.h',
        isPublic: true,
        requiresCPlusPlus: false,
      };
      expect(imports).toContain(expectedImport);
    });

    it('includes a private import for its own header', function() {
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
        ],
      };

      const imports: ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImport: ObjC.Import = {
        library: null,
        file: 'Foo.h',
        isPublic: false,
        requiresCPlusPlus: false,
      };
      expect(imports).toContain(expectedImport);
    });

    it(
      'does not include a public import for its own type when it is included ' +
        'in a type lookup',
      function() {
        const algebraicType: AlgebraicType.Type = {
          annotations: {},
          name: 'Foo',
          includes: [],
          excludes: [],
          typeLookups: [
            {
              name: 'Foo',
              library: null,
              file: null,
              canForwardDeclare: true,
            },
          ],
          libraryName: null,
          comments: [],
          subtypes: [
            AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
              name: 'ASubType',
              comments: [],
              attributes: [],
              annotations: {},
            }),
          ],
        };

        const imports: ObjC.Import[] = AlgebraicTypePlugin.imports(
          algebraicType,
        );
        const expectedImport: ObjC.Import = {
          library: null,
          file: 'Foo.h',
          isPublic: true,
          requiresCPlusPlus: false,
        };
        expect(imports).not.toContain(expectedImport);
      },
    );

    it('includes the public imports for some of its attributes', function() {
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
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: null,
                  fileTypeIsDefinedIn: null,
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
                  referencedGenericTypes: [],
                },
              },
              {
                annotations: {},
                name: 'someBool',
                comments: [],
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  name: 'BOOL',
                  reference: 'BOOL',
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
            comments: [],
            nullability: ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: 'SomeLib',
              fileTypeIsDefinedIn: null,
              underlyingType: 'NSObject',
              conformingProtocol: null,
              referencedGenericTypes: [],
            },
          }),
        ],
      };

      const imports: ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImports: ObjC.Import[] = [
        {
          library: 'Foundation',
          file: 'Foundation.h',
          isPublic: true,
          requiresCPlusPlus: false,
        },
        {
          library: null,
          file: 'Test.h',
          isPublic: false,
          requiresCPlusPlus: false,
        },
        {
          library: null,
          file: 'Foo.h',
          isPublic: true,
          requiresCPlusPlus: false,
        },
        {
          library: 'SomeLib',
          file: 'SingleAttributeType.h',
          isPublic: true,
          requiresCPlusPlus: false,
        },
      ];
      expect(imports).toEqualJSON(expectedImports);
    });

    it(
      'includes for an attribute that is an NSObject but does not have a ' +
        'specified library and the algebraic type is in a library',
      function() {
        const algebraicType: AlgebraicType.Type = {
          annotations: {},
          name: 'Test',
          includes: [],
          excludes: [],
          typeLookups: [],
          libraryName: 'RMSomeLibrary',
          comments: [],
          subtypes: [
            AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
              annotations: {},
              name: 'someFoo',
              comments: [],
              nullability: ObjC.Nullability.Inherited(),
              type: {
                name: 'Foo',
                reference: 'Foo *',
                libraryTypeIsDefinedIn: null,
                fileTypeIsDefinedIn: null,
                underlyingType: 'NSObject',
                conformingProtocol: null,
                referencedGenericTypes: [],
              },
            }),
          ],
        };

        const imports: ObjC.Import[] = AlgebraicTypePlugin.imports(
          algebraicType,
        );
        const expectedImport: ObjC.Import = {
          library: 'RMSomeLibrary',
          file: 'Foo.h',
          isPublic: true,
          requiresCPlusPlus: false,
        };
        expect(imports).toContain(expectedImport);
      },
    );
  });

  describe('#instanceMethods', function() {
    it('returns an internal initializer', function() {
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
            name: 'SomeSubtype',
            comments: [],
            attributes: [],
            annotations: {},
          }),
        ],
      };
    });
  });

  describe('#classMethods', function() {
    it(
      'returns a single class method when there is one subtype ' +
        'with no attributes',
      function() {
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
              name: 'SomeSubtype',
              comments: [],
              attributes: [],
              annotations: {},
            }),
          ],
        };

        const classMethods: ObjC.Method[] = AlgebraicTypePlugin.classMethods(
          algebraicType,
        );
        const expectedClassMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: null,
            code: [
              'Foo *object = [(Class)self new];',
              'object->_subtype = FooSubtypesSomeSubtype;',
              'return object;',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'someSubtype',
                argument: null,
              },
            ],
            returnType: {
              type: {
                name: 'instancetype',
                reference: 'instancetype',
              },
              modifiers: [],
            },
          },
        ];
        expect(classMethods).toEqualJSON(expectedClassMethods);
      },
    );

    it(
      'returns two class methods when there are two subtypes ' +
        'with some attributes',
      function() {
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
              comments: [],
              nullability: ObjC.Nullability.Inherited(),
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

        const classMethods: ObjC.Method[] = AlgebraicTypePlugin.classMethods(
          algebraicType,
        );
        const expectedClassMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: null,
            code: [
              'Test *object = [(Class)self new];',
              'object->_subtype = TestSubtypesSomeSubtype;',
              'object->_someSubtype_someString = someString;',
              'object->_someSubtype_someUnsignedInteger = someUnsignedInteger;',
              'return object;',
            ],
            comments: [],
            compilerAttributes: [
              'NS_SWIFT_NAME(someSubtype(someString:someUnsignedInteger:))',
            ],
            keywords: [
              {
                name: 'someSubtypeWithSomeString',
                argument: {
                  name: 'someString',
                  modifiers: [],
                  type: {
                    name: 'NSString',
                    reference: 'NSString *',
                  },
                },
              },
              {
                name: 'someUnsignedInteger',
                argument: {
                  name: 'someUnsignedInteger',
                  modifiers: [],
                  type: {
                    name: 'NSUInteger',
                    reference: 'NSUInteger',
                  },
                },
              },
            ],
            returnType: {
              type: {
                name: 'instancetype',
                reference: 'instancetype',
              },
              modifiers: [],
            },
          },
          {
            preprocessors: [],
            belongsToProtocol: null,
            code: [
              'Test *object = [(Class)self new];',
              'object->_subtype = TestSubtypesSingleAttributeSubtype;',
              'object->_singleAttributeSubtype = singleAttributeSubtype;',
              'return object;',
            ],
            comments: [],
            compilerAttributes: [],
            keywords: [
              {
                name: 'singleAttributeSubtype',
                argument: {
                  name: 'singleAttributeSubtype',
                  modifiers: [],
                  type: {
                    name: 'SingleAttributeType',
                    reference: 'SingleAttributeType *',
                  },
                },
              },
            ],
            returnType: {
              type: {
                name: 'instancetype',
                reference: 'instancetype',
              },
              modifiers: [],
            },
          },
        ];
        expect(classMethods).toEqualJSON(expectedClassMethods);
      },
    );
  });

  describe('#instanceVariables', function() {
    it(
      'returns internal properties for storing the subtypes attributes as well ' +
        'as the type',
      function() {
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
              comments: [],
              nullability: ObjC.Nullability.Inherited(),
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

        const instanceVariables: ObjC.InstanceVariable[] = AlgebraicTypePlugin.instanceVariables(
          algebraicType,
        );
        const expectedInstanceVariables: ObjC.InstanceVariable[] = [
          {
            comments: [],
            name: 'subtype',
            returnType: {
              name: 'TestSubtypes',
              reference: 'TestSubtypes',
            },
            modifiers: [],
            access: ObjC.InstanceVariableAccess.Private(),
          },
          {
            comments: [],
            name: 'someSubtype_someString',
            returnType: {
              name: 'NSString',
              reference: 'NSString *',
            },
            modifiers: [],
            access: ObjC.InstanceVariableAccess.Private(),
          },
          {
            comments: [],
            name: 'someSubtype_someUnsignedInteger',
            returnType: {
              name: 'NSUInteger',
              reference: 'NSUInteger',
            },
            modifiers: [],
            access: ObjC.InstanceVariableAccess.Private(),
          },
          {
            comments: [],
            name: 'singleAttributeSubtype',
            returnType: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
            },
            modifiers: [],
            access: ObjC.InstanceVariableAccess.Private(),
          },
        ];
        expect(instanceVariables).toEqualJSON(expectedInstanceVariables);
      },
    );
  });

  describe('#enumerations', function() {
    it('returns an enumeration for its subtypes', function() {
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
            comments: [],
            nullability: ObjC.Nullability.Inherited(),
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

      const enumerations = AlgebraicTypePlugin.enumerations(algebraicType);

      const expectedEnumeration: ObjC.Enumeration = {
        name: 'FooSubtypes',
        underlyingType: 'NSUInteger',
        values: ['FooSubtypesSomeSubtype', 'FooSubtypesSingleAttributeSubtype'],
        isPublic: false,
        comments: [],
      };

      expect(enumerations).toContain(expectedEnumeration);
    });
  });

  describe('#validationErrors', function() {
    it('returns no validation errors when there are no attributes on the provided subtypes', function() {
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

      const errors: Error.Error[] = AlgebraicTypePlugin.validationErrors(
        algebraicType,
      );
      expect(errors).toEqualJSON([]);
    });

    it('returns a validation error when there are two subtypes with the same name', function() {
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
                nullability: ObjC.Nullability.Inherited(),
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
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'anotherFoo',
                comments: [],
                nullability: ObjC.Nullability.Inherited(),
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
        ],
      };
      const errors: Error.Error[] = AlgebraicTypePlugin.validationErrors(
        algebraicType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'Algebraic types cannot have two subtypes with the same name, but found two or more subtypes with the name SomeSubtype',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there are two single attribute subtypes with the same name', function() {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups: [],
        libraryName: null,
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability: ObjC.Nullability.Inherited(),
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
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability: ObjC.Nullability.Inherited(),
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
      const errors: Error.Error[] = AlgebraicTypePlugin.validationErrors(
        algebraicType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'Algebraic types cannot have two subtypes with the same name, but found two or more subtypes with the name SingleAttributeSubtype',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when one single attribute subtype and one named subtype have same name', function() {
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
                nullability: ObjC.Nullability.Inherited(),
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
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
            annotations: {},
            name: 'someSubtype',
            comments: [],
            nullability: ObjC.Nullability.Inherited(),
            type: {
              name: 'NSString',
              reference: 'NSString *',
              libraryTypeIsDefinedIn: null,
              fileTypeIsDefinedIn: null,
              underlyingType: null,
              conformingProtocol: null,
              referencedGenericTypes: [],
            },
          }),
        ],
      };
      const errors: Error.Error[] = AlgebraicTypePlugin.validationErrors(
        algebraicType,
      );
      const expectedErrors: Error.Error[] = [
        Error.Error(
          'Algebraic types cannot have two subtypes with the same name, but found two or more subtypes with the name SomeSubtype',
        ),
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });

  describe('#forwardDeclarations', function() {
    it('returns forward declarations when UseForwardDeclarations is in includes', function() {
      const algebraicType: AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: ['UseForwardDeclarations'],
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
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference:
                    'Foo<NSString *, NSDictionary<id<Bar>, Baz *> *> *',
                  libraryTypeIsDefinedIn: null,
                  fileTypeIsDefinedIn: null,
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
                  referencedGenericTypes: [
                    {
                      name: 'NSString',
                      conformingProtocol: null,
                      referencedGenericTypes: [],
                    },
                    {
                      name: 'NSDictionary',
                      conformingProtocol: null,
                      referencedGenericTypes: [
                        {
                          name: 'id',
                          conformingProtocol: 'Bar',
                          referencedGenericTypes: [],
                        },
                        {
                          name: 'Baz',
                          conformingProtocol: null,
                          referencedGenericTypes: [],
                        },
                      ],
                    },
                  ],
                },
              },
            ],
            annotations: {},
          }),
        ],
      };
      const forwardDeclarations: ObjC.ForwardDeclaration[] = AlgebraicTypePlugin.forwardDeclarations(
        algebraicType,
      );
      const expectedForwardDeclarations: ObjC.ForwardDeclaration[] = [
        ObjC.ForwardDeclaration.ForwardProtocolDeclaration('Bar'),
        ObjC.ForwardDeclaration.ForwardClassDeclaration('Foo'),
        ObjC.ForwardDeclaration.ForwardClassDeclaration('Baz'),
      ];
      expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
    });

    it(
      'returns no forward declarations when the same type being generated ' +
        'is not being referenced in a subtype',
      function() {
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
                  nullability: ObjC.Nullability.Inherited(),
                  type: {
                    name: 'AnotherTest',
                    reference: 'AnotherTest *',
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
          ],
        };
        const forwardDeclarations: ObjC.ForwardDeclaration[] = AlgebraicTypePlugin.forwardDeclarations(
          algebraicType,
        );
        const expectedForwardDeclarations: ObjC.ForwardDeclaration[] = [];
        expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
      },
    );
  });
});
