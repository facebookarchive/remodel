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
import * as Maybe from '../../maybe';
import * as ObjC from '../../objc';
import * as ObjectGeneration from '../../object-generation';
import * as ObjectSpec from '../../object-spec';

const Plugin = Builder.createPlugin();

describe('Plugins.Builder', function() {
  describe('#additionalFiles', function() {
    it(
      'returns a header and an implementation for a builder when provided a ' +
        'value type that has no attributes',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: ['RMValueObjectSemantics'],
          libraryName: Maybe.Nothing<string>(),
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
                library: Maybe.Just('Foundation'),
                requiresCPlusPlus: false,
              },
              {
                file: 'FooBarBaz.h',
                isPublic: false,
                library: Maybe.Nothing<string>(),
                requiresCPlusPlus: false,
              },
              {
                file: 'FooBarBazBuilder.h',
                isPublic: false,
                library: Maybe.Nothing<string>(),
                requiresCPlusPlus: false,
              },
            ],
            enumerations: [],
            blockTypes: [],
            staticConstants: [],
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
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['return [FooBarBazBuilder new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'fooBarBaz',
                        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['return [FooBarBazBuilder fooBarBaz];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'fooBarBazFromExistingFooBarBaz',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'existingFooBarBaz',
                          modifiers: [],
                          type: {
                            name: 'FooBarBaz',
                            reference: 'FooBarBaz *',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                ],
                comments: [],
                inlineBlockTypedefs: [],
                instanceMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['return [FooBarBaz new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'build',
                        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'FooBarBaz',
                        reference: 'FooBarBaz *',
                      }),
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
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: ['RMValueObjectSemantics'],
          libraryName: Maybe.Just<string>('RMSomeLibrary'),
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
                library: Maybe.Just('Foundation'),
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerr.h',
                isPublic: false,
                library: Maybe.Just('RMSomeLibrary'),
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerrBuilder.h',
                isPublic: false,
                library: Maybe.Nothing<string>(),
                requiresCPlusPlus: false,
              },
            ],
            enumerations: [],
            blockTypes: [],
            staticConstants: [],
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
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['return [RMFerrBuilder new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferr',
                        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['return [RMFerrBuilder ferr];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferrFromExistingFerr',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'existingFerr',
                          modifiers: [],
                          type: {
                            name: 'RMFerr',
                            reference: 'RMFerr *',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                ],
                comments: [],
                inlineBlockTypedefs: [],
                instanceMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['return [RMFerr new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'build',
                        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'RMFerr',
                        reference: 'RMFerr *',
                      }),
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
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'someUnsignedInteger',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                name: 'NSUInteger',
                reference: 'NSUInteger',
                underlyingType: Maybe.Nothing<string>(),
                conformingProtocol: Maybe.Nothing<string>(),
              },
            },
            {
              annotations: {},
              comments: [],
              name: 'someCustomObject',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                name: 'RMCustomObject',
                reference: 'RMCustomObject *',
                underlyingType: Maybe.Just<string>('NSObject'),
                conformingProtocol: Maybe.Nothing<string>(),
              },
            },
            {
              annotations: {},
              comments: [],
              name: 'someBool',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                name: 'BOOL',
                reference: 'BOOL',
                underlyingType: Maybe.Nothing<string>(),
                conformingProtocol: Maybe.Nothing<string>(),
              },
            },
          ],
          comments: [],
          excludes: [],
          includes: ['RMValueObjectSemantics'],
          libraryName: Maybe.Nothing<string>(),
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
                library: Maybe.Just('Foundation'),
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerr.h',
                isPublic: false,
                library: Maybe.Nothing<string>(),
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerrBuilder.h',
                isPublic: false,
                library: Maybe.Nothing<string>(),
                requiresCPlusPlus: false,
              },
              {
                file: 'RMCustomObject.h',
                isPublic: false,
                library: Maybe.Nothing<string>(),
                requiresCPlusPlus: false,
              },
            ],
            enumerations: [],
            blockTypes: [],
            staticConstants: [],
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
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['return [RMFerrBuilder new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferr',
                        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: [
                      'return [[[[RMFerrBuilder ferr]',
                      '          withSomeUnsignedInteger:existingFerr.someUnsignedInteger]',
                      '         withSomeCustomObject:existingFerr.someCustomObject]',
                      '        withSomeBool:existingFerr.someBool];',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferrFromExistingFerr',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'existingFerr',
                          modifiers: [],
                          type: {
                            name: 'RMFerr',
                            reference: 'RMFerr *',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                ],
                comments: [],
                inlineBlockTypedefs: [],
                instanceMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: [
                      'return [[RMFerr alloc] initWithSomeUnsignedInteger:_someUnsignedInteger someCustomObject:_someCustomObject someBool:_someBool];',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'build',
                        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'RMFerr',
                        reference: 'RMFerr *',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: [
                      '_someUnsignedInteger = someUnsignedInteger;',
                      'return self;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeUnsignedInteger',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'someUnsignedInteger',
                          modifiers: [],
                          type: {
                            name: 'NSUInteger',
                            reference: 'NSUInteger',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: [
                      '_someCustomObject = [someCustomObject copy];',
                      'return self;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeCustomObject',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'someCustomObject',
                          modifiers: [],
                          type: {
                            name: 'RMCustomObject',
                            reference: 'RMCustomObject *',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['_someBool = someBool;', 'return self;'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeBool',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'someBool',
                          modifiers: [],
                          type: {
                            name: 'BOOL',
                            reference: 'BOOL',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
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
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'someUnsignedInteger',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                name: 'NSUInteger',
                reference: 'NSUInteger',
                underlyingType: Maybe.Nothing<string>(),
                conformingProtocol: Maybe.Nothing<string>(),
              },
            },
            {
              annotations: {},
              comments: [],
              name: 'someCustomObject',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                name: 'RMCustomObject',
                reference: 'RMCustomObject *',
                underlyingType: Maybe.Just<string>('NSObject'),
                conformingProtocol: Maybe.Nothing<string>(),
              },
            },
            {
              annotations: {},
              comments: [],
              name: 'someBool',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                name: 'BOOL',
                reference: 'BOOL',
                underlyingType: Maybe.Nothing<string>(),
                conformingProtocol: Maybe.Nothing<string>(),
              },
            },
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
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
                library: Maybe.Just('Foundation'),
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerr.h',
                isPublic: false,
                library: Maybe.Nothing<string>(),
                requiresCPlusPlus: false,
              },
              {
                file: 'RMFerrBuilder.h',
                isPublic: false,
                library: Maybe.Nothing<string>(),
                requiresCPlusPlus: false,
              },
              {
                file: 'RMCustomObject.h',
                isPublic: false,
                library: Maybe.Nothing<string>(),
                requiresCPlusPlus: false,
              },
            ],
            enumerations: [],
            blockTypes: [],
            staticConstants: [],
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
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['return [RMFerrBuilder new];'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferr',
                        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: [
                      'return [[[[RMFerrBuilder ferr]',
                      '          withSomeUnsignedInteger:existingFerr.someUnsignedInteger]',
                      '         withSomeCustomObject:existingFerr.someCustomObject]',
                      '        withSomeBool:existingFerr.someBool];',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'ferrFromExistingFerr',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'existingFerr',
                          modifiers: [],
                          type: {
                            name: 'RMFerr',
                            reference: 'RMFerr *',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                ],
                comments: [],
                inlineBlockTypedefs: [],
                instanceMethods: [
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: [
                      'return [[RMFerr alloc] initWithSomeUnsignedInteger:_someUnsignedInteger someCustomObject:_someCustomObject someBool:_someBool];',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'build',
                        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'RMFerr',
                        reference: 'RMFerr *',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: [
                      '_someUnsignedInteger = someUnsignedInteger;',
                      'return self;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeUnsignedInteger',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'someUnsignedInteger',
                          modifiers: [],
                          type: {
                            name: 'NSUInteger',
                            reference: 'NSUInteger',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: [
                      '_someCustomObject = someCustomObject;',
                      'return self;',
                    ],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeCustomObject',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'someCustomObject',
                          modifiers: [],
                          type: {
                            name: 'RMCustomObject',
                            reference: 'RMCustomObject *',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
                      modifiers: [],
                    },
                  },
                  {
                    preprocessors: [],
                    belongsToProtocol: Maybe.Nothing<string>(),
                    code: ['_someBool = someBool;', 'return self;'],
                    comments: [],
                    compilerAttributes: [],
                    keywords: [
                      {
                        name: 'withSomeBool',
                        argument: Maybe.Just<ObjC.KeywordArgument>({
                          name: 'someBool',
                          modifiers: [],
                          type: {
                            name: 'BOOL',
                            reference: 'BOOL',
                          },
                        }),
                      },
                    ],
                    returnType: {
                      type: Maybe.Just({
                        name: 'instancetype',
                        reference: 'instancetype',
                      }),
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
            namespaces: [],
            macros: [],
          },
        ];

        expect(additionalFiles).toEqualJSON(expectedAdditionalFiles);
      },
    );
  });

  describe('#importsForTypeLookupsOfObjectType', function() {
    it('returns an import for a type which cannot be forward declared', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups: [
          {
            name: 'RMSomeType',
            library: Maybe.Nothing<string>(),
            file: Maybe.Just<string>('RMSomeFile'),
            canForwardDeclare: false,
          },
        ],
        typeName: 'FooBarBaz',
      };

      const imports: ObjC.Import[] = Builder.importsForTypeLookupsOfObjectType(
        objectType,
      );

      const expectedImports: ObjC.Import[] = [
        {
          file: 'RMSomeFile.h',
          isPublic: true,
          library: Maybe.Nothing<string>(),
          requiresCPlusPlus: false,
        },
      ];

      expect(imports).toEqualJSON(expectedImports);
    });

    it(
      'returns an import for a type which cannot be forward declared containing ' +
        'the default library',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Just<string>('SomeLib'),
          typeLookups: [
            {
              name: 'RMSomeType',
              library: Maybe.Nothing<string>(),
              file: Maybe.Just<string>('RMSomeFile'),
              canForwardDeclare: false,
            },
          ],
          typeName: 'FooBarBaz',
        };

        const imports: ObjC.Import[] = Builder.importsForTypeLookupsOfObjectType(
          objectType,
        );

        const expectedImports: ObjC.Import[] = [
          {
            file: 'RMSomeFile.h',
            isPublic: true,
            library: Maybe.Just<string>('SomeLib'),
            requiresCPlusPlus: false,
          },
        ];

        expect(imports).toEqualJSON(expectedImports);
      },
    );

    it('does not return an import for a type which can be forward declared', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeLookups: [
          {
            name: 'RMSomeType',
            library: Maybe.Nothing<string>(),
            file: Maybe.Just<string>('RMSomeFile'),
            canForwardDeclare: true,
          },
        ],
        typeName: 'FooBarBaz',
      };

      const imports: ObjC.Import[] = Builder.importsForTypeLookupsOfObjectType(
        objectType,
      );
      const expectedImports: ObjC.Import[] = [];

      expect(imports).toEqualJSON(expectedImports);
    });

    it('does return a private import if UseForwardDeclarations is used', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        excludes: [],
        includes: ['UseForwardDeclarations'],
        libraryName: Maybe.Nothing<string>(),
        typeLookups: [
          {
            name: 'RMSomeType',
            library: Maybe.Nothing<string>(),
            file: Maybe.Just<string>('RMSomeFile'),
            canForwardDeclare: true,
          },
        ],
        typeName: 'FooBarBaz',
      };

      const imports: ObjC.Import[] = Builder.importsForTypeLookupsOfObjectType(
        objectType,
      );

      const expectedImports: ObjC.Import[] = [
        {
          file: 'RMSomeFile.h',
          isPublic: false,
          library: Maybe.Nothing<string>(),
          requiresCPlusPlus: false,
        },
      ];

      expect(imports).toEqualJSON(expectedImports);
    });
  });
});
