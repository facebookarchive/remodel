/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import * as Code from '../code';
import * as CPlusPlus from '../cplusplus';
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjCRenderer from '../objc-renderer';

describe('ObjCRenderer', function() {
  describe('#renderHeader', function() {
    it('renders the class comments of a class header', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        comments: [
          {content: '// Copyright something something. All Rights Reserved.'},
        ],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: ['return [(Class)self new];'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'someClassMethodWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
            comments: [{content: '// Man, what a great class.'}],
            inlineBlockTypedefs: [],
            instanceMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: [
                  'if (self = [super init]) {',
                  '  _value1 = value1;',
                  '  _value2 = value2;',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'initWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
                belongsToProtocol: 'NSObject',
                code: ['return 0;'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'hash',
                    argument: null,
                  },
                ],
                returnType: {
                  type: {
                    name: 'NSUInteger',
                    reference: 'NSUInteger',
                  },
                  modifiers: [],
                },
              },
            ],
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
            instanceVariables: [
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value3',
                returnType: {
                  name: 'RMSomethingElse',
                  reference: 'RMSomethingElse',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value4',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Package(),
                name: 'value5',
                returnType: {
                  name: 'NSString',
                  reference: 'NSString *',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Public(),
                name: 'value6',
                returnType: {
                  name: 'NSNumber',
                  reference: 'NSNumber *',
                },
              },
            ],
            implementedProtocols: [
              {
                name: 'NSCoding',
              },
            ],
            nullability: ObjC.ClassNullability.default,
            subclassingRestricted: false,
          },
        ],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '// Copyright something something. All Rights Reserved.\n\n' +
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '// Man, what a great class.\n' +
        '@interface RMSomeValue : NSObject <NSCoding>\n' +
        '{\n' +
        '  @package\n' +
        '  NSString *_value5;\n' +
        '  @public\n' +
        '  NSNumber *_value6;\n' +
        '}\n' +
        '\n' +
        '@property (nonatomic, readonly) RMSomething *value1;\n' +
        '@property (nonatomic, readonly) RMSomething *value2;\n' +
        '\n' +
        '+ (instancetype)someClassMethodWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
        '\n' +
        '- (instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders the base case of a class header', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        comments: [
          {content: '// Copyright something something. All Rights Reserved.'},
        ],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: ['return [(Class)self new];'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'someClassMethodWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
                  'if (self = [super init]) {',
                  '  _value1 = value1;',
                  '  _value2 = value2;',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'initWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
                belongsToProtocol: 'NSObject',
                code: ['return 0;'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'hash',
                    argument: null,
                  },
                ],
                returnType: {
                  type: {
                    name: 'NSUInteger',
                    reference: 'NSUInteger',
                  },
                  modifiers: [],
                },
              },
            ],
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
            instanceVariables: [
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value3',
                returnType: {
                  name: 'RMSomethingElse',
                  reference: 'RMSomethingElse',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value4',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
              },
            ],
            implementedProtocols: [
              {
                name: 'NSCoding',
              },
            ],
            nullability: ObjC.ClassNullability.default,
            subclassingRestricted: false,
          },
        ],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '// Copyright something something. All Rights Reserved.\n\n' +
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '@interface RMSomeValue : NSObject <NSCoding>\n' +
        '\n' +
        '@property (nonatomic, readonly) RMSomething *value1;\n' +
        '@property (nonatomic, readonly) RMSomething *value2;\n' +
        '\n' +
        '+ (instancetype)someClassMethodWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
        '\n' +
        '- (instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it(
      'renders the base case of a class header with a different base class and ' +
        'diagnostic ignores',
      function() {
        const fileToRender: Code.File = {
          name: 'RMSomeValue',
          type: Code.FileType.ObjectiveC,
          imports: [
            {
              file: 'RMSomething.h',
              isPublic: true,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
            {
              file: 'RMSomethingElse.h',
              isPublic: false,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
            {
              file: 'RMObjectSpecBase.h',
              isPublic: true,
              library: 'RMObjectSpec',
              requiresCPlusPlus: false,
            },
          ],
          comments: [
            {content: '// Copyright something something. All Rights Reserved.'},
          ],
          enumerations: [],
          blockTypes: [],
          staticConstants: [],
          functions: [],
          forwardDeclarations: [],
          diagnosticIgnores: [],
          classes: [
            {
              baseClassName: 'RMObjectSpecBase',
              covariantTypes: [],
              classMethods: [
                {
                  preprocessors: [],
                  belongsToProtocol: null,
                  code: ['return [(Class)self new];'],
                  comments: [],
                  compilerAttributes: [],
                  keywords: [
                    {
                      name: 'someClassMethodWithValue1',
                      argument: {
                        name: 'value1',
                        modifiers: [],
                        type: {
                          name: 'RMSomething',
                          reference: 'RMSomething *',
                        },
                      },
                    },
                    {
                      name: 'value2',
                      argument: {
                        name: 'value2',
                        modifiers: [],
                        type: {
                          name: 'RMSomething',
                          reference: 'RMSomething *',
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
                    'if (self = [super init]) {',
                    '  _value1 = value1;',
                    '  _value2 = value2;',
                    '}',
                    '',
                    'return self;',
                  ],
                  comments: [],
                  compilerAttributes: [],
                  keywords: [
                    {
                      name: 'initWithValue1',
                      argument: {
                        name: 'value1',
                        modifiers: [],
                        type: {
                          name: 'RMSomething',
                          reference: 'RMSomething *',
                        },
                      },
                    },
                    {
                      name: 'value2',
                      argument: {
                        name: 'value2',
                        modifiers: [],
                        type: {
                          name: 'RMSomething',
                          reference: 'RMSomething *',
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
                  belongsToProtocol: 'NSObject',
                  code: ['return 0;'],
                  comments: [],
                  compilerAttributes: [],
                  keywords: [
                    {
                      name: 'hash',
                      argument: null,
                    },
                  ],
                  returnType: {
                    type: {
                      name: 'NSUInteger',
                      reference: 'NSUInteger',
                    },
                    modifiers: [],
                  },
                },
              ],
              name: 'RMSomeValue',
              properties: [
                {
                  comments: [],
                  modifiers: [
                    ObjC.PropertyModifier.Nonatomic(),
                    ObjC.PropertyModifier.Readonly(),
                  ],
                  access: ObjC.PropertyAccess.Public(),
                  name: 'value1',
                  returnType: {
                    name: 'RMSomething',
                    reference: 'RMSomething *',
                  },
                  preprocessors: [],
                },
                {
                  comments: [],
                  modifiers: [
                    ObjC.PropertyModifier.Nonatomic(),
                    ObjC.PropertyModifier.Readonly(),
                  ],
                  access: ObjC.PropertyAccess.Public(),
                  name: 'value2',
                  returnType: {
                    name: 'RMSomething',
                    reference: 'RMSomething *',
                  },
                  preprocessors: [],
                },
              ],
              instanceVariables: [
                {
                  comments: [],
                  modifiers: [],
                  access: ObjC.InstanceVariableAccess.Private(),
                  name: 'value3',
                  returnType: {
                    name: 'RMSomethingElse',
                    reference: 'RMSomethingElse',
                  },
                },
                {
                  comments: [],
                  modifiers: [],
                  access: ObjC.InstanceVariableAccess.Private(),
                  name: 'value4',
                  returnType: {
                    name: 'RMSomething',
                    reference: 'RMSomething *',
                  },
                },
              ],
              implementedProtocols: [
                {
                  name: 'NSCoding',
                },
              ],
              nullability: ObjC.ClassNullability.default,
              subclassingRestricted: false,
            },
          ],
          structs: [],
          cppClasses: [],
          namespaces: [],
          macros: [],
        };

        const renderedOutput: string | null = ObjCRenderer.renderHeader(
          fileToRender,
        );

        const expectedOutput: string | null =
          '// Copyright something something. All Rights Reserved.\n\n' +
          '#import <RMLibrary/RMSomething.h>\n' +
          '#import <RMObjectSpec/RMObjectSpecBase.h>\n' +
          '\n' +
          '@interface RMSomeValue : RMObjectSpecBase <NSCoding>\n' +
          '\n' +
          '@property (nonatomic, readonly) RMSomething *value1;\n' +
          '@property (nonatomic, readonly) RMSomething *value2;\n' +
          '\n' +
          '+ (instancetype)someClassMethodWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
          '\n' +
          '- (instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
          '\n' +
          '@end\n';

        expect(renderedOutput).toEqualJSON(expectedOutput);
      },
    );

    it('renders a class without any imports', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: [
                  'if (self = [super init]) {',
                  '  _value1 = value1;',
                  '  _value2 = value2;',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'initWithValue',
                    argument: {
                      name: 'value',
                      modifiers: [],
                      type: {
                        name: 'NSString',
                        reference: 'NSString *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'BOOL',
                        reference: 'BOOL',
                      },
                    },
                  },
                  {
                    name: 'value3',
                    argument: {
                      name: 'value3',
                      modifiers: [],
                      type: {
                        name: 'id',
                        reference: 'id',
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
                belongsToProtocol: 'NSObject',
                code: ['return 0;'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'hash',
                    argument: null,
                  },
                ],
                returnType: {
                  type: {
                    name: 'NSUInteger',
                    reference: 'NSUInteger',
                  },
                  modifiers: [],
                },
              },
            ],
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                  ObjC.PropertyModifier.Copy(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value',
                returnType: {
                  name: 'NSString',
                  reference: 'NSString *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'BOOL',
                  reference: 'BOOL',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                  ObjC.PropertyModifier.Copy(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value3',
                returnType: {
                  name: 'id',
                  reference: 'id',
                },
                preprocessors: [],
              },
            ],
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '@interface RMSomeValue : NSObject\n' +
        '\n' +
        '@property (nonatomic, readonly, copy) NSString *value;\n' +
        '@property (nonatomic, readonly) BOOL value2;\n' +
        '@property (nonatomic, readonly, copy) id value3;\n' +
        '\n' +
        '- (instancetype)initWithValue:(NSString *)value value2:(BOOL)value2 value3:(id)value3;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a class with no properties', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: [
                  'if (self = [super init]) {',
                  '  _value1 = value1;',
                  '  _value2 = value2;',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'initWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
                belongsToProtocol: 'NSObject',
                code: ['return 0;'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'hash',
                    argument: null,
                  },
                ],
                returnType: {
                  type: {
                    name: 'NSUInteger',
                    reference: 'NSUInteger',
                  },
                  modifiers: [],
                },
              },
            ],
            name: 'RMSomeValue',
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '@interface RMSomeValue : NSObject\n' +
        '\n' +
        '- (instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a class with a preprocessor wrapped method', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [
              {
                preprocessors: [
                  {
                    openingCode: '#if DEBUG',
                    closingCode: '#endif',
                  },
                ],
                belongsToProtocol: null,
                code: [
                  'if (self = [super init]) {',
                  '  _value1 = value1;',
                  '  _value2 = value2;',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'initWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
                belongsToProtocol: 'NSObject',
                code: ['return 0;'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'hash',
                    argument: null,
                  },
                ],
                returnType: {
                  type: {
                    name: 'NSUInteger',
                    reference: 'NSUInteger',
                  },
                  modifiers: [],
                },
              },
            ],
            name: 'RMSomeValue',
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '@interface RMSomeValue : NSObject\n' +
        '\n' +
        '#if DEBUG\n' +
        '- (instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
        '#endif\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a class header with no instance methods', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            instanceMethods: [],
            inlineBlockTypedefs: [],
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readwrite(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readwrite(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '@interface RMSomeValue : NSObject\n' +
        '\n' +
        '@property (nonatomic, readwrite) RMSomething *value1;\n' +
        '@property (nonatomic, readwrite) RMSomething *value2;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it(
      'renders a class header with one public function and does ' +
        'not include a non-public function in the header',
      function() {
        const fileToRender: Code.File = {
          name: 'RMSomeValue',
          type: Code.FileType.ObjectiveC,
          imports: [
            {
              file: 'RMSomething.h',
              isPublic: true,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
            {
              file: 'RMSomethingElse.h',
              isPublic: false,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
          ],
          comments: [],
          enumerations: [],
          blockTypes: [],
          forwardDeclarations: [],
          staticConstants: [],
          functions: [
            {
              comments: [
                {
                  content:
                    '// There is just nothing in the world like a good function.',
                },
              ],
              name: 'APublicFunction',
              parameters: [
                {
                  type: {
                    name: 'NSString',
                    reference: 'NSString *',
                  },
                  name: 'str',
                },
                {
                  type: {
                    name: 'NSUInteger',
                    reference: 'NSUInteger',
                  },
                  name: 'num',
                },
              ],
              returnType: {
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                },
                modifiers: [],
              },
              code: [
                '#if SOMETHING',
                'return @"foo";',
                '#else',
                'return @"bar";',
                '#endif',
              ],
              isPublic: true,
              isInline: false,
              compilerAttributes: [],
            },
            {
              comments: [],
              name: 'AnotherPublicFunction',
              parameters: [],
              returnType: {
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                },
                modifiers: [],
              },
              code: ['return 17;'],
              isPublic: true,
              isInline: false,
              compilerAttributes: [],
            },
            {
              comments: [],
              name: 'ANonPublicFunction',
              parameters: [],
              returnType: {type: null, modifiers: []},
              code: ['something();'],
              isPublic: false,
              isInline: false,
              compilerAttributes: [],
            },
          ],
          diagnosticIgnores: [],
          classes: [
            {
              baseClassName: 'NSObject',
              covariantTypes: [],
              classMethods: [],
              comments: [],
              instanceMethods: [],
              inlineBlockTypedefs: [],
              name: 'RMSomeValue',
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
        };

        const renderedOutput: string | null = ObjCRenderer.renderHeader(
          fileToRender,
        );

        const expectedOutput: string | null =
          '#import <RMLibrary/RMSomething.h>\n' +
          '\n' +
          '@interface RMSomeValue : NSObject\n' +
          '\n' +
          '@end\n\n' +
          '#ifdef __cplusplus\n' +
          'extern "C" {\n' +
          '#endif\n' +
          '\n' +
          '// There is just nothing in the world like a good function.\n' +
          'extern NSString *APublicFunction(NSString *str, NSUInteger num);\n' +
          'extern NSUInteger AnotherPublicFunction(void);\n' +
          '\n' +
          '#ifdef __cplusplus\n' +
          '}\n' +
          '#endif\n';

        expect(renderedOutput).toEqualJSON(expectedOutput);
      },
    );

    it('renders a class header with a public enum when the file contains an public enumeration', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        enumerations: [
          {
            comments: [
              {
                content:
                  '// This is a note about this very introspective enumeration.',
              },
            ],
            name: 'SomePrivateEnum',
            underlyingType: 'NSInteger',
            values: [
              'SomePrivateEnumSomeValue',
              'SomePrivateEnumSomeOtherValue',
            ],
            isPublic: false,
          },
          {
            comments: [
              {
                content:
                  '// This is a note about this very outgoing enumeration.',
              },
            ],
            name: 'SomePublicEnum',
            underlyingType: 'NSUInteger',
            values: [
              'SomePublicEnumAValue',
              'SomePublicEnumSomeDifferentValue',
            ],
            isPublic: true,
          },
        ],
        blockTypes: [],
        comments: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '// This is a note about this very outgoing enumeration.\n' +
        'typedef NS_ENUM(NSUInteger, SomePublicEnum) {\n' +
        '  SomePublicEnumAValue,\n' +
        '  SomePublicEnumSomeDifferentValue\n' +
        '};\n' +
        '\n' +
        '@interface RMSomeValue : NSObject\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a class header with public block definitions when the file contains two block types', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        enumerations: [],
        blockTypes: [
          {
            comments: [
              {
                content:
                  '// It is hard to articulate all the things I love about this block.',
              },
            ],
            name: 'SomeBlock',
            parameters: [
              {
                name: 'aString',
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
            name: 'AnotherBlock',
            parameters: [
              {
                name: 'someBool',
                type: {
                  name: 'BOOL',
                  reference: 'BOOL',
                },
                nullability: ObjC.Nullability.Inherited(),
              },
            ],
            returnType: {
              type: {
                name: 'Foo',
                reference: 'Foo *',
              },
              modifiers: [],
            },
            isPublic: true,
            nullability: ObjC.ClassNullability.default,
          },
        ],
        comments: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '// It is hard to articulate all the things I love about this block.\n' +
        'typedef void (^SomeBlock)(NSString *aString, NSUInteger someUnsignedInteger);\n' +
        'typedef Foo *(^AnotherBlock)(BOOL someBool);\n' +
        '\n' +
        '@interface RMSomeValue : NSObject\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it(
      'renders a class header with no functions when the only provided function ' +
        'is non-public',
      function() {
        const fileToRender: Code.File = {
          name: 'RMSomeValue',
          type: Code.FileType.ObjectiveC,
          imports: [
            {
              file: 'RMSomething.h',
              isPublic: true,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
            {
              file: 'RMSomethingElse.h',
              isPublic: false,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
          ],
          comments: [],
          enumerations: [],
          blockTypes: [],
          staticConstants: [],
          diagnosticIgnores: [],
          forwardDeclarations: [],
          functions: [
            {
              comments: [
                {content: '// FbSomeValue...think of all the possibilites.'},
              ],
              name: 'ANonPublicFunction',
              parameters: [],
              returnType: {type: null, modifiers: []},
              code: ['something();'],
              isPublic: false,
              isInline: false,
              compilerAttributes: [],
            },
          ],
          classes: [
            {
              baseClassName: 'NSObject',
              covariantTypes: [],
              classMethods: [],
              comments: [],
              inlineBlockTypedefs: [],
              instanceMethods: [],
              name: 'RMSomeValue',
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
        };

        const renderedOutput: string | null = ObjCRenderer.renderHeader(
          fileToRender,
        );

        const expectedOutput: string | null =
          '#import <RMLibrary/RMSomething.h>\n' +
          '\n' +
          '@interface RMSomeValue : NSObject\n' +
          '\n' +
          '@end\n';

        expect(renderedOutput).toEqualJSON(expectedOutput);
      },
    );

    it('renders a class header with two implemented protocols', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            instanceMethods: [],
            inlineBlockTypedefs: [],
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readwrite(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readwrite(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
            instanceVariables: [],
            implementedProtocols: [
              {
                name: 'NSCoding',
              },
              {
                name: 'NSCopying',
              },
            ],
            nullability: ObjC.ClassNullability.default,
            subclassingRestricted: false,
          },
        ],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '@interface RMSomeValue : NSObject <NSCoding, NSCopying>\n' +
        '\n' +
        '@property (nonatomic, readwrite) RMSomething *value1;\n' +
        '@property (nonatomic, readwrite) RMSomething *value2;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a class header with an import and forward declaration', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        forwardDeclarations: [
          ObjC.ForwardDeclaration.ForwardClassDeclaration('RMCDeclaration'),
          ObjC.ForwardDeclaration.ForwardProtocolDeclaration('RMPDeclaration'),
        ],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readwrite(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readwrite(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
            instanceVariables: [],
            implementedProtocols: [
              {
                name: 'NSCoding',
              },
              {
                name: 'NSCopying',
              },
            ],
            nullability: ObjC.ClassNullability.default,
            subclassingRestricted: false,
          },
        ],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '#import <RMLibrary/RMSomething.h>\n\n' +
        '@class RMCDeclaration;\n' +
        '@protocol RMPDeclaration;\n' +
        '\n' +
        '@interface RMSomeValue : NSObject <NSCoding, NSCopying>\n' +
        '\n' +
        '@property (nonatomic, readwrite) RMSomething *value1;\n' +
        '@property (nonatomic, readwrite) RMSomething *value2;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it(
      'renders a class header with a single void instance method with comments and two ' +
        'properties, one of which has comments.',
      function() {
        const fileToRender: Code.File = {
          name: 'RMSomeValue',
          type: Code.FileType.ObjectiveC,
          imports: [
            {
              file: 'RMSomething.h',
              isPublic: true,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
            {
              file: 'RMSomethingElse.h',
              isPublic: false,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
          ],
          comments: [],
          enumerations: [],
          blockTypes: [],
          staticConstants: [],
          forwardDeclarations: [],
          functions: [],
          diagnosticIgnores: [],
          classes: [
            {
              baseClassName: 'NSObject',
              covariantTypes: [],
              classMethods: [],
              comments: [],
              inlineBlockTypedefs: [],
              instanceMethods: [
                {
                  preprocessors: [],
                  belongsToProtocol: null,
                  code: [],
                  comments: [{content: '// Check this method out!!!!'}],
                  compilerAttributes: [],
                  keywords: [
                    {
                      name: 'doSomething',
                      argument: null,
                    },
                  ],
                  returnType: {type: null, modifiers: []},
                },
              ],
              name: 'RMSomeValue',
              properties: [
                {
                  comments: [],
                  modifiers: [
                    ObjC.PropertyModifier.Nonatomic(),
                    ObjC.PropertyModifier.Readwrite(),
                  ],
                  access: ObjC.PropertyAccess.Public(),
                  name: 'value1',
                  returnType: {
                    name: 'RMSomething',
                    reference: 'RMSomething *',
                  },
                  preprocessors: [],
                },
                {
                  comments: [{content: '// One special comment'}],
                  modifiers: [
                    ObjC.PropertyModifier.Nonatomic(),
                    ObjC.PropertyModifier.Readwrite(),
                  ],
                  access: ObjC.PropertyAccess.Public(),
                  name: 'value2',
                  returnType: {
                    name: 'RMSomething',
                    reference: 'RMSomething *',
                  },
                  preprocessors: [],
                },
              ],
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
        };

        const renderedOutput: string | null = ObjCRenderer.renderHeader(
          fileToRender,
        );

        const expectedOutput: string | null =
          '#import <RMLibrary/RMSomething.h>\n' +
          '\n' +
          '@interface RMSomeValue : NSObject\n' +
          '\n' +
          '@property (nonatomic, readwrite) RMSomething *value1;\n' +
          '// One special comment\n' +
          '@property (nonatomic, readwrite) RMSomething *value2;\n' +
          '\n' +
          '// Check this method out!!!!\n' +
          '- (void)doSomething;\n' +
          '\n' +
          '@end\n';

        expect(renderedOutput).toEqualJSON(expectedOutput);
      },
    );

    it(
      'renders a header containing a namespace with a templated function ' +
        'when the file contains that',
      function() {
        const fileToRender: Code.File = {
          name: 'RMSomeValue',
          type: Code.FileType.ObjectiveC,
          imports: [
            {
              file: 'RMSomething.h',
              isPublic: true,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
            {
              file: 'RMSomethingElse.h',
              isPublic: false,
              library: 'RMLibrary',
              requiresCPlusPlus: false,
            },
          ],
          comments: [],
          enumerations: [],
          blockTypes: [],
          staticConstants: [],
          forwardDeclarations: [],
          functions: [],
          diagnosticIgnores: [],
          classes: [],
          structs: [],
          cppClasses: [],
          namespaces: [
            {
              name: 'Something',
              templates: [
                {
                  templatedTypes: [
                    {
                      type: CPlusPlus.TemplateType.Typename(),
                      value: 'T',
                    },
                  ],
                  code: [
                    'extern T someFunc(T(^someBlock)()) {',
                    '  return someBlock();',
                    '}',
                  ],
                },
              ],
            },
          ],
          macros: [],
        };

        const renderedOutput: string | null = ObjCRenderer.renderHeader(
          fileToRender,
        );

        const expectedOutput: string | null =
          '#import <RMLibrary/RMSomething.h>\n' +
          '\n' +
          'namespace Something {\n' +
          '  template <typename T>\n' +
          '  extern T someFunc(T(^someBlock)()) {\n' +
          '    return someBlock();\n' +
          '  }\n' +
          '}\n';

        expect(renderedOutput).toEqualJSON(expectedOutput);
      },
    );

    it('renders a header containing the given method compiler attributes', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: [
                  'if (self = [super init]) {',
                  '  _value1 = value1;',
                  '  _value2 = value2;',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: ['NS_DESIGNATED_INITIALIZER'],
                keywords: [
                  {
                    name: 'initWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '@interface RMSomeValue : NSObject\n' +
        '\n' +
        '@property (nonatomic, readonly) RMSomething *value1;\n' +
        '@property (nonatomic, readonly) RMSomething *value2;\n' +
        '\n' +
        '- (instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2 NS_DESIGNATED_INITIALIZER;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a header containing method return type modifiers', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: [
                  'if (self = [super init]) {',
                  '  _value1 = value1;',
                  '  _value2 = value2;',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'initWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                ],
                returnType: {
                  type: {
                    name: 'instancetype',
                    reference: 'instancetype',
                  },
                  modifiers: [ObjC.KeywordArgumentModifier.Nullable()],
                },
              },
            ],
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '@interface RMSomeValue : NSObject\n' +
        '\n' +
        '@property (nonatomic, readonly) RMSomething *value1;\n' +
        '@property (nonatomic, readonly) RMSomething *value2;\n' +
        '\n' +
        '- (nullable instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('includes covariantTypes in the header file', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        comments: [],
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        forwardDeclarations: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: ['ObjectType'],
            classMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: ['return [[RMSomeValue alloc] init];'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'someClassMethodWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                ],
                returnType: {
                  type: {
                    name: 'ObjectType',
                    reference: 'ObjectType',
                  },
                  modifiers: [ObjC.KeywordArgumentModifier.Nullable()],
                },
              },
            ],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '@interface RMSomeValue<__covariant ObjectType> : NSObject\n' +
        '\n' +
        '+ (nullable ObjectType)someClassMethodWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('supports multiple covariantTypes in the header file', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        comments: [],
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            covariantTypes: ['KeyType', 'ValueType'],
            instanceMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: ['return [[RMSomeValue alloc] init];'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'objectForKey',
                    argument: {
                      name: 'key',
                      modifiers: [],
                      type: {
                        name: 'KeyType',
                        reference: 'KeyType',
                      },
                    },
                  },
                ],
                returnType: {
                  type: {
                    name: 'ValueType',
                    reference: 'ValueType',
                  },
                  modifiers: [ObjC.KeywordArgumentModifier.Nullable()],
                },
              },
            ],
            name: 'RMSomeValue',
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
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '#import <RMLibrary/RMSomething.h>\n' +
        '\n' +
        '@interface RMSomeValue<__covariant KeyType, __covariant ValueType> : NSObject\n' +
        '\n' +
        '- (nullable ValueType)objectForKey:(KeyType)key;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('dedupes protocols in the class header', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
            instanceVariables: [],
            implementedProtocols: [
              {
                name: 'NSCoding',
              },
              {
                name: 'NSCoding',
              },
            ],
            nullability: ObjC.ClassNullability.default,
            subclassingRestricted: false,
          },
        ],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null =
        '@interface RMSomeValue : NSObject <NSCoding>\n' +
        '\n' +
        '@property (nonatomic, readonly) RMSomething *value1;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });
  });

  describe('#renderImplementation', function() {
    it('renders the base case of a class header', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomeValue.h',
            isPublic: false,
            library: null,
            requiresCPlusPlus: false,
          },
        ],
        comments: [
          {content: '// Copyright something something. All Rights Reserved.'},
        ],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: ['-Wprotocol', '-Wincomplete-implementation'],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: ['return [(Class)self new];'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'someClassMethodWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
                  'if ((self = [super init])) {',
                  '  _value1 = [value1 copy];',
                  '  _value2 = [value2 copy];',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'initWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
            instanceVariables: [
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value3',
                returnType: {
                  name: 'RMSomethingElse',
                  reference: 'RMSomethingElse',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value4',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
              },
              {
                comments: [],
                modifiers: [ObjC.InstanceVariableModifier.Weak()],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value5',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Package(),
                name: 'value5',
                returnType: {
                  name: 'NSString',
                  reference: 'NSString *',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Public(),
                name: 'value6',
                returnType: {
                  name: 'NSNumber',
                  reference: 'NSNumber *',
                },
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
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null =
        '// Copyright something something. All Rights Reserved.\n\n' +
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '#import "RMSomeValue.h"\n' +
        '\n' +
        '#pragma clang diagnostic push\n' +
        '#pragma GCC diagnostic ignored "-Wprotocol"\n' +
        '#pragma GCC diagnostic ignored "-Wincomplete-implementation"\n' +
        '\n' +
        '@implementation RMSomeValue\n' +
        '{\n' +
        '  RMSomethingElse _value3;\n' +
        '  RMSomething *_value4;\n' +
        '  __weak RMSomething *_value5;\n' +
        '}\n' +
        '\n' +
        '+ (instancetype)someClassMethodWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2\n' +
        '{\n' +
        '  return [(Class)self new];\n' +
        '}\n' +
        '\n' +
        '- (instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2\n' +
        '{\n' +
        '  if ((self = [super init])) {\n' +
        '    _value1 = [value1 copy];\n' +
        '    _value2 = [value2 copy];\n' +
        '  }\n' +
        '\n' +
        '  return self;\n' +
        '}\n' +
        '\n' +
        '@end\n' +
        '#pragma clang diagnostic pop\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a class file which contains static constants', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomeValue.h',
            isPublic: false,
            library: null,
            requiresCPlusPlus: false,
          },
        ],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [
          {
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            comments: [
              {content: '// The most interesting comment in the world.'},
            ],
            name: 'kSomething',
            value: '@"FOOOOO"',
            memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
          },
          {
            type: {
              name: 'NSUInteger',
              reference: 'NSUInteger',
            },
            comments: [],
            name: 'kSomethingElse',
            value: '2',
            memorySemantic: ObjC.MemorySemantic.Assign(),
          },
        ],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: [
                  'if ((self = [super init])) {',
                  '  _value1 = [value1 copy];',
                  '  _value2 = [value2 copy];',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'initWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
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
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null =
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '#import "RMSomeValue.h"\n' +
        '\n' +
        '// The most interesting comment in the world.\n' +
        'static __unsafe_unretained NSString * const kSomething = @"FOOOOO";\n' +
        'static assign NSUInteger const kSomethingElse = 2;\n' +
        '\n' +
        '@implementation RMSomeValue\n' +
        '\n' +
        '- (instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2\n' +
        '{\n' +
        '  if ((self = [super init])) {\n' +
        '    _value1 = [value1 copy];\n' +
        '    _value2 = [value2 copy];\n' +
        '  }\n' +
        '\n' +
        '  return self;\n' +
        '}\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders the base case of a class header where methods are wrapped by preprocessor macros', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomeValue.h',
            isPublic: false,
            library: null,
            requiresCPlusPlus: false,
          },
        ],
        comments: [
          {content: '// Copyright something something. All Rights Reserved.'},
        ],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: ['-Wprotocol', '-Wincomplete-implementation'],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [
              {
                preprocessors: [
                  {
                    openingCode: '#if DEBUG',
                    closingCode: '#endif',
                  },
                ],
                belongsToProtocol: null,
                code: ['return [(Class)self new];'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'someClassMethodWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
                preprocessors: [
                  {
                    openingCode: '#pragma push test',
                    closingCode: '#pragma pop',
                  },
                ],
                belongsToProtocol: null,
                code: [
                  'if ((self = [super init])) {',
                  '  _value1 = [value1 copy];',
                  '  _value2 = [value2 copy];',
                  '}',
                  '',
                  'return self;',
                ],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'initWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
            name: 'RMSomeValue',
            properties: [
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value1',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
              {
                comments: [],
                modifiers: [
                  ObjC.PropertyModifier.Nonatomic(),
                  ObjC.PropertyModifier.Readonly(),
                ],
                access: ObjC.PropertyAccess.Public(),
                name: 'value2',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
                preprocessors: [],
              },
            ],
            instanceVariables: [
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value3',
                returnType: {
                  name: 'RMSomethingElse',
                  reference: 'RMSomethingElse',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value4',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
              },
              {
                comments: [],
                modifiers: [ObjC.InstanceVariableModifier.Weak()],
                access: ObjC.InstanceVariableAccess.Private(),
                name: 'value5',
                returnType: {
                  name: 'RMSomething',
                  reference: 'RMSomething *',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Package(),
                name: 'value5',
                returnType: {
                  name: 'NSString',
                  reference: 'NSString *',
                },
              },
              {
                comments: [],
                modifiers: [],
                access: ObjC.InstanceVariableAccess.Public(),
                name: 'value6',
                returnType: {
                  name: 'NSNumber',
                  reference: 'NSNumber *',
                },
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
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null =
        '// Copyright something something. All Rights Reserved.\n\n' +
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '#import "RMSomeValue.h"\n' +
        '\n' +
        '#pragma clang diagnostic push\n' +
        '#pragma GCC diagnostic ignored "-Wprotocol"\n' +
        '#pragma GCC diagnostic ignored "-Wincomplete-implementation"\n' +
        '\n' +
        '@implementation RMSomeValue\n' +
        '{\n' +
        '  RMSomethingElse _value3;\n' +
        '  RMSomething *_value4;\n' +
        '  __weak RMSomething *_value5;\n' +
        '}\n' +
        '\n' +
        '#if DEBUG\n' +
        '+ (instancetype)someClassMethodWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2\n' +
        '{\n' +
        '  return [(Class)self new];\n' +
        '}\n' +
        '#endif\n' +
        '\n' +
        '#pragma push test\n' +
        '- (instancetype)initWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2\n' +
        '{\n' +
        '  if ((self = [super init])) {\n' +
        '    _value1 = [value1 copy];\n' +
        '    _value2 = [value2 copy];\n' +
        '  }\n' +
        '\n' +
        '  return self;\n' +
        '}\n' +
        '#pragma pop\n' +
        '\n' +
        '@end\n' +
        '#pragma clang diagnostic pop\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a class file which contains functions', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomeValue.h',
            isPublic: false,
            library: null,
            requiresCPlusPlus: false,
          },
        ],
        enumerations: [],
        blockTypes: [],
        comments: [],
        staticConstants: [],
        diagnosticIgnores: [],
        forwardDeclarations: [],
        functions: [
          {
            comments: [{content: '// Functions are FUN'}],
            name: 'APublicFunction',
            parameters: [
              {
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                },
                name: 'str',
              },
              {
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                },
                name: 'num',
              },
            ],
            returnType: {
              type: {
                name: 'NSString',
                reference: 'NSString *',
              },
              modifiers: [],
            },
            code: [
              '#if SOMETHING',
              'return @"foo";',
              '#else',
              'return @"bar";',
              '#endif',
            ],
            isPublic: true,
            isInline: false,
            compilerAttributes: [],
          },
          {
            comments: [{content: '// Functions are like fungus'}],
            name: 'ANonPublicFunction',
            parameters: [],
            returnType: {type: null, modifiers: []},
            code: ['something();'],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
        ],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            instanceMethods: [],
            name: 'RMSomeValue',
            inlineBlockTypedefs: [],
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
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null =
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '#import "RMSomeValue.h"\n' +
        '\n' +
        'static void ANonPublicFunction(void);\n\n' +
        '@implementation RMSomeValue\n' +
        '\n' +
        '@end\n' +
        'extern NSString *APublicFunction(NSString *str, NSUInteger num) {\n' +
        '#if SOMETHING\n' +
        '  return @"foo";\n' +
        '#else\n' +
        '  return @"bar";\n' +
        '#endif\n' +
        '}\n' +
        '\n' +
        '// Functions are like fungus\n' +
        'static void ANonPublicFunction(void) {\n' +
        '  something();\n' +
        '}\n';

      expect(renderedOutput).toEqual(expectedOutput);
    });

    it('replaces return type with id for covariantTypes in implementation file', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomeValue.h',
            isPublic: false,
            library: null,
            requiresCPlusPlus: false,
          },
        ],
        enumerations: [],
        blockTypes: [],
        comments: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: ['ObjectType'],
            classMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: ['return [[RMSomeValue alloc] init];'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'someClassMethodWithValue1',
                    argument: {
                      name: 'value1',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
                      },
                    },
                  },
                  {
                    name: 'value2',
                    argument: {
                      name: 'value2',
                      modifiers: [],
                      type: {
                        name: 'RMSomething',
                        reference: 'RMSomething *',
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
              },
            ],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
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
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null =
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '#import "RMSomeValue.h"\n' +
        '\n' +
        '@implementation RMSomeValue\n' +
        '\n' +
        '+ (id)someClassMethodWithValue1:(RMSomething *)value1 value2:(RMSomething *)value2\n' +
        '{\n' +
        '  return [[RMSomeValue alloc] init];\n' +
        '}\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('replaces parameter type with id for covariantTypes in implementation file', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomeValue.h',
            isPublic: false,
            library: null,
            requiresCPlusPlus: false,
          },
        ],
        enumerations: [],
        blockTypes: [],
        comments: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: ['KeyType', 'ValueType'],
            classMethods: [],
            comments: [],
            instanceMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: ['return [[RMSomeValue alloc] init];'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'objectForKey',
                    argument: {
                      name: 'key',
                      modifiers: [],
                      type: {
                        name: 'KeyType',
                        reference: 'KeyType',
                      },
                    },
                  },
                ],
                returnType: {
                  type: {
                    name: 'ValueType',
                    reference: 'ValueType',
                  },
                  modifiers: [],
                },
              },
            ],
            name: 'RMSomeValue',
            properties: [],
            inlineBlockTypedefs: [],
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
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null =
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '#import "RMSomeValue.h"\n' +
        '\n' +
        '@implementation RMSomeValue\n' +
        '\n' +
        '- (id)objectForKey:(id)key\n' +
        '{\n' +
        '  return [[RMSomeValue alloc] init];\n' +
        '}\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a class file which contains enumerations', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomeValue.h',
            isPublic: false,
            library: null,
            requiresCPlusPlus: false,
          },
        ],
        enumerations: [
          {
            comments: [
              {
                content:
                  '// This is a note about this very introspective enumeration.',
              },
            ],
            name: 'SomePrivateEnum',
            underlyingType: 'NSInteger',
            values: [
              'SomePrivateEnumSomeValue',
              'SomePrivateEnumSomeOtherValue',
            ],
            isPublic: false,
          },
          {
            comments: [
              {
                content:
                  '// This is a note about this very outgoing enumeration.',
              },
            ],
            name: 'SomePublicEnum',
            underlyingType: 'NSUInteger',
            values: [
              'SomePublicEnumAValue',
              'SomePublicEnumSomeDifferentValue',
            ],
            isPublic: true,
          },
        ],
        blockTypes: [],
        comments: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
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
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null =
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '#import "RMSomeValue.h"\n' +
        '\n' +
        '// This is a note about this very introspective enumeration.\n' +
        'typedef NS_ENUM(NSInteger, SomePrivateEnum) {\n' +
        '  SomePrivateEnumSomeValue,\n' +
        '  SomePrivateEnumSomeOtherValue\n' +
        '};\n' +
        '\n' +
        '@implementation RMSomeValue\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders a header file with visibility specified', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        enumerations: [],
        blockTypes: [],
        comments: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [
              {
                preprocessors: [],
                belongsToProtocol: null,
                code: ['return [[RMSomeValue alloc] init];'],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'objectForKey',
                    argument: {
                      name: 'key',
                      modifiers: [],
                      type: {
                        name: 'KeyType',
                        reference: 'KeyType',
                      },
                    },
                  },
                ],
                returnType: {
                  type: {
                    name: 'ValueType',
                    reference: 'ValueType',
                  },
                  modifiers: [],
                },
              },
            ],
            name: 'RMSomeValue',
            properties: [],
            instanceVariables: [],
            implementedProtocols: [],
            nullability: ObjC.ClassNullability.default,
            subclassingRestricted: false,
            visibility: ObjC.ClassVisibility.default,
          },
        ],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput = ObjCRenderer.renderHeader(fileToRender);

      const expectedOutput: string | null =
        '__attribute__((visibility("default")))\n' +
        '@interface RMSomeValue : NSObject\n' +
        '\n' +
        '- (ValueType)objectForKey:(KeyType)key;\n' +
        '\n' +
        '@end\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it(
      'does not render an implementation for a file which only contains public ' +
        'enumerations',
      function() {
        const fileToRender: Code.File = {
          name: 'RMSomeValue',
          type: Code.FileType.ObjectiveC,
          imports: [],
          enumerations: [
            {
              comments: [],
              name: 'SomePublicEnum',
              underlyingType: 'NSUInteger',
              values: [
                'SomePublicEnumAValue',
                'SomePublicEnumSomeDifferentValue',
              ],
              isPublic: true,
            },
          ],
          blockTypes: [],
          comments: [],
          staticConstants: [],
          forwardDeclarations: [],
          functions: [],
          diagnosticIgnores: [],
          classes: [],
          structs: [],
          cppClasses: [],
          namespaces: [],
          macros: [],
        };

        const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);
        const expectedOutput: string | null = null;
        expect(renderedOutput).toEqualJSON(expectedOutput);
      },
    );

    it('renders an implementation file with private block definitions when the file contains one private block type', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomeValue.h',
            isPublic: false,
            library: null,
            requiresCPlusPlus: false,
          },
        ],
        enumerations: [],
        blockTypes: [
          {
            comments: [],
            name: 'SomeBlock',
            parameters: [
              {
                name: 'aString',
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
            name: 'AnotherBlock',
            parameters: [
              {
                name: 'someBool',
                type: {
                  name: 'BOOL',
                  reference: 'BOOL',
                },
                nullability: ObjC.Nullability.Inherited(),
              },
            ],
            returnType: {
              type: {
                name: 'Foo',
                reference: 'Foo *',
              },
              modifiers: [],
            },
            isPublic: false,
            nullability: ObjC.ClassNullability.default,
          },
        ],
        comments: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null =
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '#import "RMSomeValue.h"\n' +
        '\n' +
        'typedef Foo *(^AnotherBlock)(BOOL someBool);\n';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it(
      'does not render an implementation for a file which only contains public ' +
        'block types',
      function() {
        const fileToRender: Code.File = {
          name: 'RMSomeValue',
          type: Code.FileType.ObjectiveC,
          imports: [],
          enumerations: [],
          blockTypes: [
            {
              comments: [],
              name: 'SomeBlock',
              parameters: [
                {
                  name: 'aString',
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
          ],
          comments: [],
          staticConstants: [],
          forwardDeclarations: [],
          functions: [],
          diagnosticIgnores: [],
          classes: [],
          structs: [],
          cppClasses: [],
          namespaces: [],
          macros: [],
        };

        const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);
        const expectedOutput: string | null = null;
        expect(renderedOutput).toEqualJSON(expectedOutput);
      },
    );

    it('does not render an implementation file which only contains an empty class', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
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
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);
      const expectedOutput: string | null = null;
      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it(
      'does not render an implementation file which only contains public or package access ' +
        'internal variables',
      function() {
        const fileToRender: Code.File = {
          name: 'RMSomeValue',
          type: Code.FileType.ObjectiveC,
          imports: [],
          comments: [],
          enumerations: [],
          blockTypes: [],
          staticConstants: [],
          forwardDeclarations: [],
          functions: [],
          diagnosticIgnores: [],
          classes: [
            {
              baseClassName: 'NSObject',
              covariantTypes: [],
              classMethods: [],
              comments: [],
              inlineBlockTypedefs: [],
              instanceMethods: [],
              name: 'RMSomeValue',
              properties: [],
              instanceVariables: [
                {
                  comments: [],
                  modifiers: [],
                  access: ObjC.InstanceVariableAccess.Package(),
                  name: 'value3',
                  returnType: {
                    name: 'RMSomethingElse',
                    reference: 'RMSomethingElse',
                  },
                },
                {
                  comments: [],
                  modifiers: [],
                  access: ObjC.InstanceVariableAccess.Public(),
                  name: 'value4',
                  returnType: {
                    name: 'RMSomething',
                    reference: 'RMSomething *',
                  },
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
        };

        const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);
        const expectedOutput: string | null = null;
        expect(renderedOutput).toEqualJSON(expectedOutput);
      },
    );

    it('does not render an implementation file which is empty', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        blockTypes: [],
        enumerations: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);
      const expectedOutput: string | null = null;
      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders file level nullability annotations', function() {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        blockTypes: [],
        enumerations: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [
          {
            comments: [],
            name: 'RMSomeFunction',
            parameters: [
              {name: 'parameter', type: {name: 'BOOL', reference: 'BOOL'}},
            ],
            returnType: {
              type: {
                name: 'int',
                reference: 'int',
              },
              modifiers: [],
            },
            code: ['// Test'],
            isPublic: true,
            isInline: false,
            compilerAttributes: [],
          },
        ],
        diagnosticIgnores: [],
        classes: [],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
        nullability: ObjC.ClassNullability.assumeNonnull,
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null = <string>(
        `#if  ! __has_feature(objc_arc)
#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
#endif

NS_ASSUME_NONNULL_BEGIN


extern int RMSomeFunction(BOOL parameter) {
  // Test
}

NS_ASSUME_NONNULL_END\n`
      );

      expect(renderedOutput).toEqualJSON(expectedOutput);

      const renderedHeader: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedHeader: string | null = <string>`NS_ASSUME_NONNULL_BEGIN

#ifdef __cplusplus
extern \"C\" {
#endif

extern int RMSomeFunction(BOOL parameter);

#ifdef __cplusplus
}
#endif

NS_ASSUME_NONNULL_END\n`;

      expect(renderedHeader).toEqualJSON(expectedHeader);
    });

    it('renders a macro', () => {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [
          {
            comments: [],
            name: 'RMSomeFunction',
            parameters: [
              {name: 'parameter', type: {name: 'BOOL', reference: 'BOOL'}},
            ],
            returnType: {
              type: {
                name: 'int',
                reference: 'int',
              },
              modifiers: [],
            },
            code: [],
            isPublic: false,
            isInline: false,
            compilerAttributes: [],
          },
        ],
        diagnosticIgnores: [],
        classes: [],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [
          {
            comments: [],
            name: 'RMSomeMacro',
            parameters: ['a, b'],
            code: 'RMSomeMacroExpansion((a), (b))',
          },
        ],
      };

      const renderedOutput = ObjCRenderer.renderImplementation(fileToRender);

      const expectedOutput: string | null = <string>(
        `#if  ! __has_feature(objc_arc)
#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
#endif

#define RMSomeMacro(a, b) RMSomeMacroExpansion((a), (b))

static int RMSomeFunction(BOOL parameter);


static int RMSomeFunction(BOOL parameter) {

}\n`
      );

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('renders an inline public function ', () => {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [
          {
            comments: [],
            name: 'RMSomeFunction',
            parameters: [
              {name: 'parameter', type: {name: 'BOOL', reference: 'BOOL'}},
            ],
            returnType: {
              type: {
                name: 'int',
                reference: 'int',
              },
              modifiers: [],
            },
            code: ['// Test'],
            isPublic: true,
            isInline: true,
            compilerAttributes: [],
          },
        ],
        diagnosticIgnores: [],
        classes: [],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );

      const expectedOutput: string | null = <string>(
        `static inline int RMSomeFunction(BOOL parameter) {
  // Test
}\n`
      );
      expect(renderedOutput).toEqualJSON(expectedOutput);

      const renderedImpl = ObjCRenderer.renderImplementation(fileToRender);

      expect(renderedImpl).toEqual(null);
    });

    it('renders an inline public function within a class', () => {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [],
        comments: [],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        forwardDeclarations: [],
        functions: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
            properties: [],
            instanceVariables: [],
            implementedProtocols: [{name: 'RMTestProtocol'}],
            nullability: ObjC.ClassNullability.default,
            subclassingRestricted: true,
            functions: [
              {
                comments: [],
                name: 'RMSomeFunction',
                parameters: [
                  {name: 'parameter', type: {name: 'BOOL', reference: 'BOOL'}},
                ],
                returnType: {
                  type: {
                    name: 'int',
                    reference: 'int',
                  },
                  modifiers: [],
                },
                code: ['// Test'],
                isPublic: true,
                isInline: true,
                compilerAttributes: [],
              },
            ],
          },
        ],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput: string | null = ObjCRenderer.renderHeader(
        fileToRender,
      );
      const expectedOutput: string | null =
        '__attribute__((objc_subclassing_restricted))\n' +
        '@interface RMSomeValue : NSObject <RMTestProtocol>\n\n' +
        '@end\n\n' +
        'static inline int RMSomeFunction(BOOL parameter) {\n' +
        '  // Test\n' +
        '}\n';
      expect(renderedOutput).toEqualJSON(expectedOutput);

      const renderedImpl = ObjCRenderer.renderImplementation(fileToRender);

      expect(renderedImpl).not.toContain('RMSomeFunction');
    });

    it('filters class methods implemented in protocols', () => {
      const fileToRender: Code.File = {
        name: 'RMSomeValue',
        type: Code.FileType.ObjectiveC,
        imports: [
          {
            file: 'RMSomething.h',
            isPublic: true,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
          {
            file: 'RMSomethingElse.h',
            isPublic: false,
            library: 'RMLibrary',
            requiresCPlusPlus: false,
          },
        ],
        comments: [
          {content: '// Copyright something something. All Rights Reserved.'},
        ],
        enumerations: [],
        blockTypes: [],
        staticConstants: [],
        functions: [],
        forwardDeclarations: [],
        diagnosticIgnores: [],
        classes: [
          {
            baseClassName: 'NSObject',
            covariantTypes: [],
            classMethods: [
              {
                preprocessors: [],
                belongsToProtocol: 'RMTestProtocol',
                code: [],
                comments: [],
                compilerAttributes: [],
                keywords: [
                  {
                    name: 'testClassMethod',
                    argument: null,
                  },
                ],
                returnType: {
                  type: null,
                  modifiers: [],
                },
              },
            ],
            comments: [],
            inlineBlockTypedefs: [],
            instanceMethods: [],
            name: 'RMSomeValue',
            properties: [],
            instanceVariables: [],
            implementedProtocols: [{name: 'RMTestProtocol'}],
            nullability: ObjC.ClassNullability.default,
            subclassingRestricted: true,
          },
        ],
        structs: [],
        cppClasses: [],
        namespaces: [],
        macros: [],
      };

      const renderedOutput = ObjCRenderer.renderHeader(fileToRender);
      expect(renderedOutput).not.toContain('testClassMethod');
    });
  });

  describe('#toKeywordArgumentString', function() {
    it('outputs a type and name when provided a simple keyword argument', function() {
      const keywordArgument: ObjC.KeywordArgument = {
        name: 'value1',
        modifiers: [],
        type: {
          name: 'RMSomething',
          reference: 'RMSomething *',
        },
      };
      const argumentString: string = ObjCRenderer.toKeywordArgumentString(
        [],
        keywordArgument,
      );
      const expectedArgumentString: string = ':(RMSomething *)value1';
      expect(argumentString).toEqualJSON(expectedArgumentString);
    });

    it('outputs an argument string with a nonnull modifier', function() {
      const keywordArgument: ObjC.KeywordArgument = {
        name: 'value1',
        modifiers: [ObjC.KeywordArgumentModifier.Nonnull()],
        type: {
          name: 'RMSomething',
          reference: 'RMSomething *',
        },
      };
      const argumentString: string = ObjCRenderer.toKeywordArgumentString(
        [],
        keywordArgument,
      );
      const expectedArgumentString: string = ':(nonnull RMSomething *)value1';
      expect(argumentString).toEqualJSON(expectedArgumentString);
    });

    it('outputs an argument string with a nullable modifier', function() {
      const keywordArgument: ObjC.KeywordArgument = {
        name: 'value1',
        modifiers: [ObjC.KeywordArgumentModifier.Nullable()],
        type: {
          name: 'RMSomething',
          reference: 'RMSomething *',
        },
      };
      const argumentString: string = ObjCRenderer.toKeywordArgumentString(
        [],
        keywordArgument,
      );
      const expectedArgumentString: string = ':(nullable RMSomething *)value1';
      expect(argumentString).toEqualJSON(expectedArgumentString);
    });

    it('outputs an argument string with a generic replaced by id', function() {
      const keywordArgument: ObjC.KeywordArgument = {
        name: 'value1',
        modifiers: [],
        type: {
          name: 'ObjectType',
          reference: 'ObjectType *',
        },
      };
      const argumentString: string = ObjCRenderer.toKeywordArgumentString(
        ['ObjectType'],
        keywordArgument,
      );
      const expectedArgumentString: string = ':(id)value1';
      expect(argumentString).toEqualJSON(expectedArgumentString);
    });
  });

  describe('#indexOfFirstEndingAsterisk', function() {
    it('returns -1 when the string does not contain an asterisk', function() {
      const str: string = 'foo';
      const index: number = ObjCRenderer.indexOfFirstEndingAsterisk(str);
      expect(index).toEqualJSON(-1);
    });

    it('returns 3 when the string has an asterisk as its fourth and last character', function() {
      const str: string = 'foo*';
      const index: number = ObjCRenderer.indexOfFirstEndingAsterisk(str);
      expect(index).toEqualJSON(3);
    });

    it(
      'returns 3 when the string has an asterisk as its fourth and last character ' +
        'as well as an asterisk in the middle',
      function() {
        const str: string = 'f*o*';
        const index: number = ObjCRenderer.indexOfFirstEndingAsterisk(str);
        expect(index).toEqualJSON(3);
      },
    );

    it('returns 3 when the string has an asterisk as its fourth and fifth characters', function() {
      const str: string = 'foo**';
      const index: number = ObjCRenderer.indexOfFirstEndingAsterisk(str);
      expect(index).toEqualJSON(3);
    });

    it(
      'returns 4 when the string has an asterisk as its fifth character ' +
        'with a space before it',
      function() {
        const str: string = 'foo *';
        const index: number = ObjCRenderer.indexOfFirstEndingAsterisk(str);
        expect(index).toEqualJSON(4);
      },
    );
  });

  describe('#renderableTypeReference', function() {
    it('returns a type reference with a space before its ending asterisk', function() {
      const type: string = 'Foo*';
      const renderableType: string = ObjCRenderer.renderableTypeReference(type);
      expect(renderableType).toEqualJSON('Foo *');
    });

    it(
      'returns a type reference with a space before its ending asterisk when ' +
        'it already has a space before the asterisk',
      function() {
        const type: string = 'Foo *';
        const renderableType: string = ObjCRenderer.renderableTypeReference(
          type,
        );
        expect(renderableType).toEqualJSON('Foo *');
      },
    );

    it(
      'returns a type reference with a space before its ending asterisk when ' +
        'it contains generics',
      function() {
        const type: string = 'Foo<Bar *, Baz *>*';
        const renderableType: string = ObjCRenderer.renderableTypeReference(
          type,
        );
        expect(renderableType).toEqualJSON('Foo<Bar *, Baz *> *');
      },
    );
  });

  describe('#renderableTypeReferenceNestingSubsequentToken', function() {
    it(
      'returns a type reference with a space before its ending asterisk when ' +
        'it contains generics',
      function() {
        const type: string = 'Foo<Bar *, Baz *>*';
        const renderableType: string = ObjCRenderer.renderableTypeReferenceNestingSubsequentToken(
          type,
        );
        expect(renderableType).toEqualJSON('Foo<Bar *, Baz *> *');
      },
    );
  });

  describe('#toFunctionImplementationString', () => {
    it('renders compiler attributes', () => {
      const definition: ObjC.Function = {
        name: 'TestFunction',
        parameters: [],
        returnType: {
          type: null,
          modifiers: [],
        },
        comments: [],
        code: [],
        isPublic: false,
        isInline: false,
        compilerAttributes: ['__attribute__((some_attribute))'],
      };

      expect(ObjCRenderer.toFunctionImplementationString(definition)).toContain(
        '__attribute__((some_attribute))',
      );
    });
    it('renders nullablity for return type', () => {
      const definition: ObjC.Function = {
        name: 'TestFunction',
        parameters: [],
        returnType: {
          type: {
            name: 'RMSomething',
            reference: 'RMSomething *',
          },
          modifiers: [
            ObjC.KeywordArgumentModifier.Nullable(),
            ObjC.KeywordArgumentModifier.UnsafeUnretained(),
          ],
        },
        comments: [],
        code: [],
        isPublic: false,
        isInline: false,
        compilerAttributes: [],
      };

      expect(ObjCRenderer.toFunctionImplementationString(definition)).toContain(
        'static RMSomething *__nullable __unsafe_unretained TestFunction(void)',
      );
    });
    it('renders nullablity for parameter type', () => {
      const definition: ObjC.Function = {
        name: 'TestFunction',
        parameters: [
          {
            type: {
              name: 'NSString',
              reference: 'NSString *',
            },
            name: 'str',
            modifiers: [
              ObjC.KeywordArgumentModifier.Nullable(),
              ObjC.KeywordArgumentModifier.UnsafeUnretained(),
            ],
          },
        ],
        returnType: {
          type: {
            name: 'RMSomething',
            reference: 'RMSomething *',
          },
          modifiers: [],
        },
        comments: [],
        code: [],
        isPublic: false,
        isInline: false,
        compilerAttributes: [],
      };

      expect(ObjCRenderer.toFunctionImplementationString(definition)).toContain(
        'static RMSomething *TestFunction(NSString *__nullable __unsafe_unretained str)',
      );
    });
  });

  describe('#toStructImplementationString', () => {
    it('renders objective-c struct', () => {
      const struct: ObjC.Struct = {
        name: 'MyCoolStruct',
        comments: [
          {content: '// Copyright something something.'},
          {content: '// All Rights Reserved.'},
        ],
        members: [
          {
            comments: [],
            name: 'Member1',
            type: {
              name: 'NSInteger',
              reference: 'NSInteger',
            },
            nullability: ObjC.Nullability.Inherited(),
          },
          {
            comments: [
              {content: '// Interesting content'},
              {content: '// With one other line'},
            ],
            name: 'Member2',
            type: {
              name: 'RMSomething',
              reference: 'RMSomething *',
            },
            nullability: ObjC.Nullability.Nonnull(),
          },
        ],
      };

      expect(
        ObjCRenderer.toStructContents(Code.Struct.ObjectiveCStruct(struct)),
      ).toEqual(
        [
          '// Copyright something something.',
          '// All Rights Reserved.',
          'typedef struct MyCoolStruct {',
          '  NSInteger Member1;',
          '  // Interesting content',
          '  // With one other line',
          '  RMSomething *_Nonnull Member2;',
          '} MyCoolStruct;',
        ].join('\n'),
      );
    });
  });
});
