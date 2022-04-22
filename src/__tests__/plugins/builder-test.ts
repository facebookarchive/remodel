/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as Builder from '../../plugins/builder';
import * as Code from '../../code';
import * as CLangCommon from '../../clang-common';
import * as ObjC from '../../objc';
import * as ObjectSpec from '../../object-spec';
import * as ObjectSpecHelpers from '../../object-spec-helpers';

const Plugin = Builder.createPlugin();

describe('Plugins.Builder', function () {
  describe('#additionalFiles', function () {
    it(
      'returns a header and an implementation for a builder when provided a ' +
        'value type that has no attributes',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: ['RMValueObjectSemantics'],
          libraryName: null,
          typeLookups: [],
          typeName: 'FooBarBaz',
        };

        const additionalFiles: Code.File[] = Plugin.additionalFiles(objectType);

        const expectedAdditionalFiles: Code.File[] = [
          {
            name: 'FooBarBazBuilder',
            type: Code.FileType.ObjectiveC,
            comments: [],
            imports: [
              {
                file: 'Foundation.h',
                isPublic: true,
                library: 'Foundation',
                requiresCPlusPlus: false,
              },
              {
                file: 'FooBarBaz.h',
                isPublic: false,
                library: null,
                requiresCPlusPlus: false,
              },
              {
                file: 'FooBarBazBuilder.h',
                isPublic: false,
                library: null,
                requiresCPlusPlus: false,
              },
            ],
            enumerations: [],
            blockTypes: [],
            staticConstants: [],
            globalVariables: [],
            diagnosticIgnores: [],
            functions: [],
            forwardDeclarations: [
              ObjC.ForwardDeclaration.ForwardClassDeclaration('FooBarBaz'),
            ],
            classes: [
              {
                baseClassName: 'NSObject',
                covariantTypes: [],
                classMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: ['return [FooBarBazBuilder new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'fooBarBaz',
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
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: [
                      'FooBarBazBuilder *builder = [FooBarBazBuilder new];',
                      'return builder;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'fooBarBazFromExistingFooBarBaz',
                        argument: {
                          name: 'existingFooBarBaz',
                          modifiers: [],
                          type: {
                            name: 'FooBarBaz',
                            reference: 'FooBarBaz *',
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
                ],
                comments: [],
                inlineBlockTypedefs: [],
                instanceMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: ['return [FooBarBaz new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'build',
                        argument: null,
                      },
                    ],
                    returnType: {
                      type: {
                        name: 'FooBarBaz',
                        reference: 'FooBarBaz *',
                      },
                      modifiers: [],
                    },
                  },
                ],
                name: 'FooBarBazBuilder',
                properties: [],
                instanceVariables: [],
                implementedProtocols: [],
                nullability: ObjC.ClassNullability.default,
                subclassingRestricted: false,
              },
            ],
            structs: [],
            cppClasses: [],
            namespaces: [],
            macros: [],
          },
        ];

        expect(additionalFiles).toEqualJSON(expectedAdditionalFiles);
      },
    );

    it(
      'returns a header and an implementation for a builder when provided a ' +
        'value type that has no attributes and a different name',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: ['RMValueObjectSemantics'],
          libraryName: 'RMSomeLibrary',
          typeLookups: [],
          typeName: 'RMFerr',
        };

        const additionalFiles: Code.File[] = Plugin.additionalFiles(objectType);

        const expectedAdditionalFiles: Code.File[] = [
          {
            name: 'RMFerrBuilder',
            type: Code.FileType.ObjectiveC,
            comments: [],
            imports: [
              {
                file: 'Foundation.h',
                isPublic: true,
                library: 'Foundation',
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerr.h',
                isPublic: false,
                library: 'RMSomeLibrary',
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerrBuilder.h',
                isPublic: false,
                library: null,
                requiresCPlusPlus: false,
              },
            ],
            enumerations: [],
            blockTypes: [],
            staticConstants: [],
            globalVariables: [],
            diagnosticIgnores: [],
            functions: [],
            forwardDeclarations: [
              ObjC.ForwardDeclaration.ForwardClassDeclaration('RMFerr'),
            ],
            classes: [
              {
                baseClassName: 'NSObject',
                covariantTypes: [],
                classMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: ['return [RMFerrBuilder new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferr',
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
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: [
                      'RMFerrBuilder *builder = [RMFerrBuilder new];',
                      'return builder;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferrFromExistingFerr',
                        argument: {
                          name: 'existingFerr',
                          modifiers: [],
                          type: {
                            name: 'RMFerr',
                            reference: 'RMFerr *',
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
                ],
                comments: [],
                inlineBlockTypedefs: [],
                instanceMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: ['return [RMFerr new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'build',
                        argument: null,
                      },
                    ],
                    returnType: {
                      type: {
                        name: 'RMFerr',
                        reference: 'RMFerr *',
                      },
                      modifiers: [],
                    },
                  },
                ],
                name: 'RMFerrBuilder',
                properties: [],
                instanceVariables: [],
                implementedProtocols: [],
                nullability: ObjC.ClassNullability.default,
                subclassingRestricted: false,
              },
            ],
            structs: [],
            cppClasses: [],
            namespaces: [],
            macros: [],
          },
        ];

        expect(additionalFiles).toEqualJSON(expectedAdditionalFiles);
      },
    );

    it(
      'returns a header and an implementation for a builder when provided a ' +
        'value type that has a bunch of attributes and supports value semantics',
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
              'someCustomObject',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMCustomObject',
                'RMCustomObject *',
                'NSObject',
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someBool',
              new ObjectSpecHelpers.AttributeTypeBuilder('BOOL', 'BOOL', null),
            ).asObject(),
          ],
          comments: [],
          excludes: [],
          includes: ['RMValueObjectSemantics'],
          libraryName: null,
          typeLookups: [],
          typeName: 'RMFerr',
        };

        const additionalFiles: Code.File[] = Plugin.additionalFiles(objectType);

        const expectedAdditionalFiles: Code.File[] = [
          {
            name: 'RMFerrBuilder',
            type: Code.FileType.ObjectiveC,
            comments: [],
            imports: [
              {
                file: 'Foundation.h',
                isPublic: true,
                library: 'Foundation',
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerr.h',
                isPublic: false,
                library: null,
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerrBuilder.h',
                isPublic: false,
                library: null,
                requiresCPlusPlus: false,
              },
              {
                file: 'RMCustomObject.h',
                isPublic: false,
                library: null,
                requiresCPlusPlus: false,
              },
            ],
            enumerations: [],
            blockTypes: [],
            staticConstants: [],
            globalVariables: [],
            diagnosticIgnores: [],
            forwardDeclarations: [
              ObjC.ForwardDeclaration.ForwardClassDeclaration('RMFerr'),
              ObjC.ForwardDeclaration.ForwardClassDeclaration('RMCustomObject'),
            ],
            functions: [],
            classes: [
              {
                baseClassName: 'NSObject',
                covariantTypes: [],
                classMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: ['return [RMFerrBuilder new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferr',
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
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: [
                      'RMFerrBuilder *builder = [RMFerrBuilder new];',
                      'builder->_someUnsignedInteger = existingFerr.someUnsignedInteger;',
                      'builder->_someCustomObject = [existingFerr.someCustomObject copy];',
                      'builder->_someBool = existingFerr.someBool;',
                      'return builder;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferrFromExistingFerr',
                        argument: {
                          name: 'existingFerr',
                          modifiers: [],
                          type: {
                            name: 'RMFerr',
                            reference: 'RMFerr *',
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
                ],
                comments: [],
                inlineBlockTypedefs: [],
                instanceMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: [
                      'return [[RMFerr alloc] initWithSomeUnsignedInteger:_someUnsignedInteger someCustomObject:_someCustomObject someBool:_someBool];',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'build',
                        argument: null,
                      },
                    ],
                    returnType: {
                      type: {
                        name: 'RMFerr',
                        reference: 'RMFerr *',
                      },
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: [
                      '_someUnsignedInteger = someUnsignedInteger;',
                      'return self;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeUnsignedInteger',
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
                      '_someCustomObject = [someCustomObject copy];',
                      'return self;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeCustomObject',
                        argument: {
                          name: 'someCustomObject',
                          modifiers: [],
                          type: {
                            name: 'RMCustomObject',
                            reference: 'RMCustomObject *',
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
                    code: ['_someBool = someBool;', 'return self;'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeBool',
                        argument: {
                          name: 'someBool',
                          modifiers: [],
                          type: {
                            name: 'BOOL',
                            reference: 'BOOL',
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
                ],
                name: 'RMFerrBuilder',
                properties: [],
                instanceVariables: [
                  {
                    comments: [],
                    name: 'someUnsignedInteger',
                    returnType: {
                      name: 'NSUInteger',
                      reference: 'NSUInteger',
                    },
                    modifiers: [],
                    access: ObjC.InstanceVariableAccess.Private(),
                  },
                  {
                    comments: [],
                    name: 'someCustomObject',
                    returnType: {
                      name: 'RMCustomObject',
                      reference: 'RMCustomObject *',
                    },
                    modifiers: [],
                    access: ObjC.InstanceVariableAccess.Private(),
                  },
                  {
                    comments: [],
                    name: 'someBool',
                    returnType: {
                      name: 'BOOL',
                      reference: 'BOOL',
                    },
                    modifiers: [],
                    access: ObjC.InstanceVariableAccess.Private(),
                  },
                ],
                implementedProtocols: [],
                nullability: ObjC.ClassNullability.default,
                subclassingRestricted: false,
              },
            ],
            structs: [],
            cppClasses: [],
            namespaces: [],
            macros: [],
          },
        ];

        expect(additionalFiles).toEqualJSON(expectedAdditionalFiles);
      },
    );

    it(
      'returns a header and an implementation for a builder when provided a ' +
        'value type that has a bunch of attributes and does not supports value semantics',
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
              'someCustomObject',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMCustomObject',
                'RMCustomObject *',
                'NSObject',
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someBool',
              new ObjectSpecHelpers.AttributeTypeBuilder('BOOL', 'BOOL', null),
            ).asObject(),
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: null,
          typeLookups: [],
          typeName: 'RMFerr',
        };

        const additionalFiles: Code.File[] = Plugin.additionalFiles(objectType);

        const expectedAdditionalFiles: Code.File[] = [
          {
            name: 'RMFerrBuilder',
            type: Code.FileType.ObjectiveC,
            comments: [],
            imports: [
              {
                file: 'Foundation.h',
                isPublic: true,
                library: 'Foundation',
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerr.h',
                isPublic: false,
                library: null,
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerrBuilder.h',
                isPublic: false,
                library: null,
                requiresCPlusPlus: false,
              },
              {
                file: 'RMCustomObject.h',
                isPublic: false,
                library: null,
                requiresCPlusPlus: false,
              },
            ],
            enumerations: [],
            blockTypes: [],
            staticConstants: [],
            globalVariables: [],
            diagnosticIgnores: [],
            forwardDeclarations: [
              ObjC.ForwardDeclaration.ForwardClassDeclaration('RMFerr'),
              ObjC.ForwardDeclaration.ForwardClassDeclaration('RMCustomObject'),
            ],
            functions: [],
            classes: [
              {
                baseClassName: 'NSObject',
                covariantTypes: [],
                classMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: ['return [RMFerrBuilder new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferr',
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
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: [
                      'RMFerrBuilder *builder = [RMFerrBuilder new];',
                      'builder->_someUnsignedInteger = existingFerr.someUnsignedInteger;',
                      'builder->_someCustomObject = existingFerr.someCustomObject;',
                      'builder->_someBool = existingFerr.someBool;',
                      'return builder;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferrFromExistingFerr',
                        argument: {
                          name: 'existingFerr',
                          modifiers: [],
                          type: {
                            name: 'RMFerr',
                            reference: 'RMFerr *',
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
                ],
                comments: [],
                inlineBlockTypedefs: [],
                instanceMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: [
                      'return [[RMFerr alloc] initWithSomeUnsignedInteger:_someUnsignedInteger someCustomObject:_someCustomObject someBool:_someBool];',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'build',
                        argument: null,
                      },
                    ],
                    returnType: {
                      type: {
                        name: 'RMFerr',
                        reference: 'RMFerr *',
                      },
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: null,
                    code: [
                      '_someUnsignedInteger = someUnsignedInteger;',
                      'return self;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeUnsignedInteger',
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
                      '_someCustomObject = someCustomObject;',
                      'return self;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeCustomObject',
                        argument: {
                          name: 'someCustomObject',
                          modifiers: [],
                          type: {
                            name: 'RMCustomObject',
                            reference: 'RMCustomObject *',
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
                    code: ['_someBool = someBool;', 'return self;'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeBool',
                        argument: {
                          name: 'someBool',
                          modifiers: [],
                          type: {
                            name: 'BOOL',
                            reference: 'BOOL',
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
                ],
                name: 'RMFerrBuilder',
                properties: [],
                instanceVariables: [
                  {
                    comments: [],
                    name: 'someUnsignedInteger',
                    returnType: {
                      name: 'NSUInteger',
                      reference: 'NSUInteger',
                    },
                    modifiers: [],
                    access: ObjC.InstanceVariableAccess.Private(),
                  },
                  {
                    comments: [],
                    name: 'someCustomObject',
                    returnType: {
                      name: 'RMCustomObject',
                      reference: 'RMCustomObject *',
                    },
                    modifiers: [],
                    access: ObjC.InstanceVariableAccess.Private(),
                  },
                  {
                    comments: [],
                    name: 'someBool',
                    returnType: {
                      name: 'BOOL',
                      reference: 'BOOL',
                    },
                    modifiers: [],
                    access: ObjC.InstanceVariableAccess.Private(),
                  },
                ],
                implementedProtocols: [],
                nullability: ObjC.ClassNullability.default,
                subclassingRestricted: false,
              },
            ],
            structs: [],
            cppClasses: [],
            namespaces: [],
            macros: [],
          },
        ];

        expect(additionalFiles).toEqualJSON(expectedAdditionalFiles);
      },
    );
  });

  describe('#importsForTypeLookupsOfObjectType', function () {
    it('returns an import for a type which cannot be forward declared', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeLookups: [
          {
            name: 'RMSomeType',
            library: null,
            file: 'RMSomeFile',
            canForwardDeclare: false,
          },
        ],
        typeName: 'FooBarBaz',
      };

      const imports: ObjC.Import[] =
        Builder.importsForTypeLookupsOfObjectType(objectType);

      const expectedImports: ObjC.Import[] = [
        {
          file: 'RMSomeFile.h',
          isPublic: true,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(imports).toEqualJSON(expectedImports);
    });

    it(
      'returns an import for a type which cannot be forward declared containing ' +
        'the default library',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: 'SomeLib',
          typeLookups: [
            {
              name: 'RMSomeType',
              library: null,
              file: 'RMSomeFile',
              canForwardDeclare: false,
            },
          ],
          typeName: 'FooBarBaz',
        };

        const imports: ObjC.Import[] =
          Builder.importsForTypeLookupsOfObjectType(objectType);

        const expectedImports: ObjC.Import[] = [
          {
            file: 'RMSomeFile.h',
            isPublic: true,
            library: 'SomeLib',
            requiresCPlusPlus: false,
          },
        ];

        expect(imports).toEqualJSON(expectedImports);
      },
    );

    it('does not return an import for a type which can be forward declared', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: null,
        typeLookups: [
          {
            name: 'RMSomeType',
            library: null,
            file: 'RMSomeFile',
            canForwardDeclare: true,
          },
        ],
        typeName: 'FooBarBaz',
      };

      const imports: ObjC.Import[] =
        Builder.importsForTypeLookupsOfObjectType(objectType);
      const expectedImports: ObjC.Import[] = [];

      expect(imports).toEqualJSON(expectedImports);
    });

    it('does return a private import if UseForwardDeclarations is used', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: ['UseForwardDeclarations'],
        libraryName: null,
        typeLookups: [
          {
            name: 'RMSomeType',
            library: null,
            file: 'RMSomeFile',
            canForwardDeclare: true,
          },
        ],
        typeName: 'FooBarBaz',
      };

      const imports: ObjC.Import[] =
        Builder.importsForTypeLookupsOfObjectType(objectType);

      const expectedImports: ObjC.Import[] = [
        {
          file: 'RMSomeFile.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(imports).toEqualJSON(expectedImports);
    });
  });
});
