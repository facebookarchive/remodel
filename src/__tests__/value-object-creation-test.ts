/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import Code = require('../code');
import Either = require('../either');
import Error = require('../error');
import File = require('../file');
import FileWriter = require('../file-writer');
import List = require('../list');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjectSpec = require('../object-spec');
import ObjectSpecCreation = require('../object-spec-creation');

describe('ObjectSpecCreation', function() {
  describe('#fileWriteRequests', function() {
    it('returns a header and implementation including the instance methods ' +
       'when there is a single plugin that returns instance methods', function() {
      const Plugin:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [{content:'// Copyright something something. All Rights Reserved.'}];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          const instanceMethods:ObjC.Method[] = [
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Just('NSObject'),
              comments: [],
              code: [
                'return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'description',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'NSString',
                reference: 'NSString *'
              }), modifiers:[] }
            }
          ];
          return instanceMethods;
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Nothing<File.AbsoluteFilePath>(),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin));

      const expectedRequests = List.of<FileWriter.Request>(
        FileWriter.Request(File.getAbsoluteFilePath('Foo.h'),
                           '// Copyright something something. All Rights Reserved.\n' +
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '@interface Foo : NSObject\n' +
                           '\n' +
                           '@end\n\n'),
        FileWriter.Request(File.getAbsoluteFilePath('Foo.m'),
        '// Copyright something something. All Rights Reserved.\n' +
        '/**\n' +
        ' * This file is generated using the remodel generation script.\n' +
        ' * The name of the input file is something.value\n' +
        ' */\n\n' +
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '@implementation Foo\n' +
        '\n' +
        '- (NSString *)description\n' +
        '{\n' +
        '  return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];\n' +
        '}\n' +
        '\n' +
        '@end\n\n')
      );
      const expectedRequest = Either.Right<Error.Error, FileWriter.FileWriteRequest>({name:'Foo', requests:expectedRequests});

      expect(writeRequest).toEqualJSON(expectedRequest);
    });

    it('returns two headers and implementations when there is a single plugin ' +
       'which returns an additional header and implementation', function() {
      const Plugin:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [
            {
              name: 'FooMore',
              type: Code.FileType.ObjectiveC(),
              imports:[],
              comments: [],
              enumerations: [],
              blockTypes:[],
              staticConstants: [],
              diagnosticIgnores:[],
              forwardDeclarations:[],
              functions: [],
              classes: [
                {
                  baseClassName:'NSObject',
                  covariantTypes:[],
                  classMethods: [],
                  instanceMethods: [],
                  name:'FooMore',
                  comments: [],
                  properties: [],
                  internalProperties:[],
                  implementedProtocols: [],
                  nullability: ObjC.ClassNullability.default,
                  subclassingRestricted: false,
                }
              ],
              structs: [],
              namespaces: []
            }
          ];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Nothing<File.AbsoluteFilePath>(),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin));

      const expectedRequests = List.of<FileWriter.Request>(
        FileWriter.Request(File.getAbsoluteFilePath('Foo.h'),
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '@interface Foo : NSObject\n' +
                           '\n' +
                           '@end\n\n'),
        FileWriter.Request(File.getAbsoluteFilePath('FooMore.h'),
                           '@interface FooMore : NSObject\n' +
                           '\n' +
                           '@end\n\n')
      );
      const expectedRequest = Either.Right<Error.Error, FileWriter.FileWriteRequest>({name:'Foo', requests:expectedRequests});

      expect(writeRequest).toEqualJSON(expectedRequest);
    });

    it('returns multiple types when there is ' +
      'a single plugin that returns multiple methods', function() {
      const Plugin:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [{
            annotations: {},
            attributes: [],
            comments: [],
            typeLookups:[],
            excludes: [],
            includes: [],
            libraryName: Maybe.Nothing<string>(),
            typeName: 'AddedType1'
          },
          {
            annotations: {},
            attributes: [],
            comments: [],
            typeLookups:[],
            excludes: [],
            includes: [],
            libraryName: Maybe.Nothing<string>(),
            typeName: 'AddedType2'
          }];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'ExistingType'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Nothing<File.AbsoluteFilePath>(),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin));

      const expectedRequests = List.of<FileWriter.Request>(
        FileWriter.Request(File.getAbsoluteFilePath('ExistingType.h'),
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '@interface ExistingType : NSObject\n' +
                           '\n' +
                           '@end\n\n'),
        FileWriter.Request(File.getAbsoluteFilePath('AddedType1.h'),
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '@interface AddedType1 : NSObject\n' +
                           '\n' +
                           '@end\n\n'),
        FileWriter.Request(File.getAbsoluteFilePath('AddedType2.h'),
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '@interface AddedType2 : NSObject\n' +
                           '\n' +
                           '@end\n\n')
        );

      const expectedRequest = Either.Right<Error.Error, FileWriter.FileWriteRequest>({name:'ExistingType', requests:expectedRequests});

      expect(writeRequest).toEqualJSON(expectedRequest);
    });

    it('returns a header not including the instance methods ' +
    'from a plugin does not have its required includes fulfilled', function() {
      const Plugin:ObjectSpec.Plugin = {
        requiredIncludesToRun: ['Test'],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          const instanceMethods:ObjC.Method[] = [
          {
            preprocessors:[],
            belongsToProtocol:Maybe.Nothing<string>(),
            comments: [],
            code: [
            'return @"foo";'
            ],
            compilerAttributes:[],
            keywords: [
            {
              name: 'foo',
              argument: Maybe.Nothing<ObjC.KeywordArgument>()
            }
            ],
            returnType:{ type:Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            }), modifiers:[] }
          }
          ];
          return instanceMethods;
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Nothing<File.AbsoluteFilePath>(),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin));

      const expectedRequests = List.of<FileWriter.Request>(
        FileWriter.Request(File.getAbsoluteFilePath('Foo.h'),
        '/**\n' +
        ' * This file is generated using the remodel generation script.\n' +
        ' * The name of the input file is something.value\n' +
        ' */\n\n' +
        '@interface Foo : NSObject\n' +
        '\n' +
        '@end\n\n')
      );
      const expectedRequest = Either.Right<Error.Error, FileWriter.FileWriteRequest>({name:'Foo', requests:expectedRequests});

      expect(writeRequest).toEqualJSON(expectedRequest);
    });

    it('orders the initilizers at the top and the rest of the methods ' +
       'alphabetically there are multiple initializers and methods', function() {
      const Plugin:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          const instanceMethods:ObjC.Method[] = [
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Nothing<string>(),
              comments: [],
              code: [
                'return @"something";'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'getSomeString',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'NSString',
                reference: 'NSString *'
              }), modifiers:[] }
            },
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Nothing<string>(),
              comments: [],
              code: [
                'return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'debugDescription',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'NSString',
                reference: 'NSString *'
              }), modifiers:[] }
            },
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Nothing<string>(),
              comments: [],
              code: [
                'return [self init];'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'initSomethingElse',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'instancetype',
                reference: 'instancetype'
              }), modifiers:[] }
            }
          ];
          return instanceMethods;
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Nothing<File.AbsoluteFilePath>(),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin));

      const expectedRequests = List.of<FileWriter.Request>(
        FileWriter.Request(File.getAbsoluteFilePath('Foo.h'),
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '@interface Foo : NSObject\n' +
                           '\n' +
                           '- (instancetype)initSomethingElse;\n' +
                           '\n' +
                           '- (NSString *)debugDescription;\n' +
                           '\n' +
                           '- (NSString *)getSomeString;\n' +
                           '\n' +
                           '@end\n\n'),
        FileWriter.Request(File.getAbsoluteFilePath('Foo.m'),
        '/**\n' +
        ' * This file is generated using the remodel generation script.\n' +
        ' * The name of the input file is something.value\n' +
        ' */\n\n' +
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '@implementation Foo\n' +
        '\n' +
        '- (instancetype)initSomethingElse\n' +
        '{\n' +
        '  return [self init];\n' +
        '}\n' +
        '\n' +
        '- (NSString *)debugDescription\n' +
        '{\n' +
        '  return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];\n' +
        '}\n' +
        '\n' +
        '- (NSString *)getSomeString\n' +
        '{\n' +
        '  return @"something";\n' +
        '}\n' +
        '\n' +
        '@end\n\n')
      );
      const expectedRequest = Either.Right<Error.Error, FileWriter.FileWriteRequest>({name:'Foo', requests:expectedRequests});

      expect(writeRequest).toEqualJSON(expectedRequest);
    });

    it('returns errors returned from the plugin if it returns a ' +
       'validation error', function() {
      const Plugin:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [Error.Error('Some error')];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Nothing<File.AbsoluteFilePath>(),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest:Either.Either<Error.Error[], FileWriter.FileWriteRequest> = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin));

      const expectedRequest:Either.Either<Error.Error[], FileWriter.FileWriteRequest> = Either.Left<Error.Error[], FileWriter.FileWriteRequest>([Error.Error('[something.value]Some error')]);

      expect(writeRequest).toEqualJSON(expectedRequest);
    });

    it('returns errors returned from two plugins if both return ' +
       'validation errors', function() {
      const Plugin1:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [Error.Error('Some error'), Error.Error('Another error')];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };
      const Plugin2:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [Error.Error('Yet another error')];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Nothing<File.AbsoluteFilePath>(),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest:Either.Either<Error.Error[], FileWriter.FileWriteRequest> = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin1, Plugin2));

      const expectedRequest:Either.Either<Error.Error[], FileWriter.FileWriteRequest> = Either.Left<Error.Error[], FileWriter.FileWriteRequest>([Error.Error('[something.value]Some error'), Error.Error('[something.value]Another error'), Error.Error('[something.value]Yet another error')]);

      expect(writeRequest).toEqualJSON(expectedRequest);
    });

    it('combines the initilizers of multiple plugins when given multiple plugins ' +
       'to create an object from', function() {
      const Plugin1:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          const instanceMethods:ObjC.Method[] = [
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Nothing<string>(),
              comments: [],
              code: [
                'return @"something";'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'getSomeString',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'NSString',
                reference: 'NSString *'
              }), modifiers:[] }
            },
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Nothing<string>(),
              comments: [],
              code: [
                'return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'debugDescription',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'NSString',
                reference: 'NSString *'
              }), modifiers:[] }
            }
          ];
          return instanceMethods;
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };
      const Plugin2:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          const instanceMethods:ObjC.Method[] = [
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Nothing<string>(),
              comments: [],
              code: [
                'return [self init];'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'initSomethingElse',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'instancetype',
                reference: 'instancetype'
              }), modifiers:[] }
            }
          ];
          return instanceMethods;
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Nothing<File.AbsoluteFilePath>(),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin1, Plugin2));

      const expectedRequests = List.of<FileWriter.Request>(
        FileWriter.Request(File.getAbsoluteFilePath('Foo.h'),
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '@interface Foo : NSObject\n' +
                           '\n' +
                           '- (instancetype)initSomethingElse;\n' +
                           '\n' +
                           '- (NSString *)debugDescription;\n' +
                           '\n' +
                           '- (NSString *)getSomeString;\n' +
                           '\n' +
                           '@end\n\n'),
        FileWriter.Request(File.getAbsoluteFilePath('Foo.m'),
        '/**\n' +
        ' * This file is generated using the remodel generation script.\n' +
        ' * The name of the input file is something.value\n' +
        ' */\n\n' +
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '@implementation Foo\n' +
        '\n' +
        '- (instancetype)initSomethingElse\n' +
        '{\n' +
        '  return [self init];\n' +
        '}\n' +
        '\n' +
        '- (NSString *)debugDescription\n' +
        '{\n' +
        '  return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];\n' +
        '}\n' +
        '\n' +
        '- (NSString *)getSomeString\n' +
        '{\n' +
        '  return @"something";\n' +
        '}\n' +
        '\n' +
        '@end\n\n')
      );
      const expectedRequest = Either.Right<Error.Error, FileWriter.FileWriteRequest>({name:'Foo', requests:expectedRequests});

      expect(writeRequest).toEqualJSON(expectedRequest);
    });

    it('combines multiple file transformations when given multiple plugins ' +
       'that each transform the file write request', function() {
      const Plugin1:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          const newRequest:FileWriter.Request = {
            content:'Plugin1\n' + request.content,
            path:request.path
          };
          return newRequest;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          const instanceMethods:ObjC.Method[] = [
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Nothing<string>(),
              comments: [],
              code: [
                'return @"something";'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'getSomeString',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'NSString',
                reference: 'NSString *'
              }), modifiers:[] }
            },
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Nothing<string>(),
              comments: [],
              code: [
                'return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'debugDescription',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'NSString',
                reference: 'NSString *'
              }), modifiers:[] }
            }
          ];
          return instanceMethods;
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };
      const Plugin2:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          const newRequest:FileWriter.Request = {
            content:'Plugin2\n' + request.content,
            path:request.path
          };
          return newRequest;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          const instanceMethods:ObjC.Method[] = [
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Nothing<string>(),
              comments: [],
              code: [
                'return [self init];'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'initSomethingElse',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'instancetype',
                reference: 'instancetype'
              }), modifiers:[] }
            }
          ];
          return instanceMethods;
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Nothing<File.AbsoluteFilePath>(),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin1, Plugin2));

      const expectedRequests = List.of<FileWriter.Request>(
        FileWriter.Request(File.getAbsoluteFilePath('Foo.h'),
                           'Plugin1\n' +
                           'Plugin2\n' +
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '@interface Foo : NSObject\n' +
                           '\n' +
                           '- (instancetype)initSomethingElse;\n' +
                           '\n' +
                           '- (NSString *)debugDescription;\n' +
                           '\n' +
                           '- (NSString *)getSomeString;\n' +
                           '\n' +
                           '@end\n\n'),
        FileWriter.Request(File.getAbsoluteFilePath('Foo.m'),
                           'Plugin1\n' +
                           'Plugin2\n' +
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '#if  ! __has_feature(objc_arc)\n' +
                           '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
                           '#endif\n\n' +
                           '@implementation Foo\n' +
                           '\n' +
                           '- (instancetype)initSomethingElse\n' +
                           '{\n' +
                           '  return [self init];\n' +
                           '}\n' +
                           '\n' +
                           '- (NSString *)debugDescription\n' +
                           '{\n' +
                           '  return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];\n' +
                           '}\n' +
                           '\n' +
                           '- (NSString *)getSomeString\n' +
                           '{\n' +
                           '  return @"something";\n' +
                           '}\n' +
                           '\n' +
                           '@end\n\n')
      );
      const expectedRequest = Either.Right<Error.Error, FileWriter.FileWriteRequest>({name:'Foo', requests:expectedRequests});

      expect(writeRequest).toEqualJSON(expectedRequest);
    });

    it('writes the output files into a given output directory', function() {
      const Plugin:ObjectSpec.Plugin = {
        requiredIncludesToRun: [],
        imports:function(objectType:ObjectSpec.Type):ObjC.Import[] {
          return [];
        },
        fileTransformation:function(request:FileWriter.Request):FileWriter.Request {
          return request;
        },
        fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
          return Maybe.Nothing<Code.FileType>();
        },
        forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
          return [];
        },
        headerComments:function(objectType:ObjectSpec.Type):ObjC.Comment[] {
          return [{content:'// Copyright something something. All Rights Reserved.'}];
        },
        instanceMethods:function(objectType:ObjectSpec.Type):ObjC.Method[] {
          const instanceMethods:ObjC.Method[] = [
            {
              preprocessors:[],
              belongsToProtocol:Maybe.Just('NSObject'),
              comments: [],
              code: [
                'return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];'
              ],
              compilerAttributes:[],
              keywords: [
                {
                  name: 'description',
                  argument: Maybe.Nothing<ObjC.KeywordArgument>()
                }
              ],
              returnType:{ type:Maybe.Just({
                name: 'NSString',
                reference: 'NSString *'
              }), modifiers:[] }
            }
          ];
          return instanceMethods;
        },
        additionalFiles:function(objectType:ObjectSpec.Type):Code.File[] {
          return [];
        },
        additionalTypes:function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
          return [];
        },
        attributes:function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
          return [];
        },
        properties:function(objectType:ObjectSpec.Type):ObjC.Property[] {
          return [];
        },
        classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
          return [];
        },
        staticConstants:function(objectType:ObjectSpec.Type):ObjC.Constant[] {
          return [];
        },
        implementedProtocols:function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
          return [];
        },
        functions:function(objectType:ObjectSpec.Type):ObjC.Function[] {
          return [];
        },
        validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
          return [];
        },
        nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
          return Maybe.Nothing<ObjC.ClassNullability>();
        },
        subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
          return false;
        },
      };

      const objectType:ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const generationRequest = {
        baseClassName:'NSObject',
        baseClassLibraryName:Maybe.Nothing<string>(),
        diagnosticIgnores:List.of<string>(),
        path:File.getAbsoluteFilePath('something.value'),
        typeInformation:objectType,
        outputPath:Maybe.Just<File.AbsoluteFilePath>({absolutePath:'local/path'}),
        renderHeader:true,
        renderImpl:true,
      };

      const writeRequest = ObjectSpecCreation.fileWriteRequest(generationRequest, List.of(Plugin));

      const expectedRequests = List.of<FileWriter.Request>(
        FileWriter.Request(File.getAbsoluteFilePath('local/path/Foo.h'),
                           '// Copyright something something. All Rights Reserved.\n' +
                           '/**\n' +
                           ' * This file is generated using the remodel generation script.\n' +
                           ' * The name of the input file is something.value\n' +
                           ' */\n\n' +
                           '@interface Foo : NSObject\n' +
                           '\n' +
                           '@end\n\n'),
        FileWriter.Request(File.getAbsoluteFilePath('local/path/Foo.m'),
        '// Copyright something something. All Rights Reserved.\n' +
        '/**\n' +
        ' * This file is generated using the remodel generation script.\n' +
        ' * The name of the input file is something.value\n' +
        ' */\n\n' +
        '#if  ! __has_feature(objc_arc)\n' +
        '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
        '#endif\n\n' +
        '@implementation Foo\n' +
        '\n' +
        '- (NSString *)description\n' +
        '{\n' +
        '  return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];\n' +
        '}\n' +
        '\n' +
        '@end\n\n')
      );
      const expectedRequest = Either.Right<Error.Error, FileWriter.FileWriteRequest>({name:'Foo', requests:expectedRequests});

      expect(writeRequest).toEqualJSON(expectedRequest);
    });
  });
});
