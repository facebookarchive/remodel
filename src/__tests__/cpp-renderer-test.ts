/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import * as CPlusPlus from '../cplusplus';
import * as CppRenderer from '../cpp-renderer';

let complexFunc: CPlusPlus.Function = {
  kind: 'function',
  name: 'MyFunction',
  returnType: {
    baseType: 'Foobar',
    qualifier: {
      passBy: CPlusPlus.TypePassBy.Pointer,
      is_const: false,
    },
  },
  is_const: false,
  params: [
    {
      name: 'param1',
      type: {
        baseType: 'MyStruct',
        qualifier: {
          passBy: CPlusPlus.TypePassBy.Reference,
          is_const: true,
        },
      },
    },
    {
      name: 'param2',
      type: {
        baseType: 'int',
        qualifier: {
          passBy: CPlusPlus.TypePassBy.Value,
          is_const: false,
        },
      },
    },
  ],
};

describe('CPlusPlus Rendering', function() {
  describe('EmitFunction', function() {
    it('emits a simple function declaration', function() {
      let funct: CPlusPlus.Function = {
        kind: 'function',
        name: 'MyFunction',
        returnType: {
          baseType: 'void',
          qualifier: {
            passBy: CPlusPlus.TypePassBy.Value,
            is_const: false,
          },
        },
        is_const: false,
        params: [],
      };

      const renderedOutput: string = CppRenderer.renderFunction(funct).join(
        '\n',
      );

      const expectedOutput = 'void MyFunction();';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('emits a function declaration with return type and params', function() {
      const renderedOutput: string = CppRenderer.renderFunction(
        complexFunc,
      ).join('\n');

      const expectedOutput =
        'Foobar *MyFunction(const MyStruct &param1, int param2);';

      expect(renderedOutput).toEqualJSON(expectedOutput);
    });

    it('emits a full class', function() {
      let klass: CPlusPlus.Class = {
        name: 'MyClass',
        sections: [
          {
            visibility: CPlusPlus.ClassSectionVisibility.Public,
            methods: [
              <CPlusPlus.ClassMethod>{
                kind: 'constructor',
                name: 'MyClass',
                default: CPlusPlus.ConstructorDefault.Default,
              },
              <CPlusPlus.ClassMethod>{
                kind: 'constructor',
                name: 'MyClass',
                params: [
                  {
                    name: 'input',
                    type: {
                      baseType: 'FBFoobar',
                      qualifier: {
                        passBy: CPlusPlus.TypePassBy.Pointer,
                        is_const: false,
                      },
                    },
                  },
                ],
                initializers: [
                  {
                    memberName: 'field1_',
                    expression: 'input.intValue',
                  },
                  {
                    memberName: 'text_',
                    expression: 'input.text',
                  },
                ],
              },

              complexFunc,
            ],
            members: [],
          },
          {
            visibility: CPlusPlus.ClassSectionVisibility.Private,
            methods: [],
            members: [
              {
                name: 'field1_',
                type: {
                  baseType: 'int',
                  qualifier: {
                    passBy: CPlusPlus.TypePassBy.Value,
                    is_const: false,
                  },
                },
              },
              {
                name: 'text_',
                type: {
                  baseType: 'NSString',
                  qualifier: {
                    passBy: CPlusPlus.TypePassBy.Pointer,
                    is_const: false,
                  },
                },
              },
            ],
          },
        ],
      };

      const renderedOutput: string = CppRenderer.renderClass(klass).join('\n');

      const expectedOutput =
        'class MyClass {\n' +
        'public:\n' +
        '  MyClass() = default;\n' +
        '  MyClass(FBFoobar *input) :\n' +
        '    field1_(input.intValue),\n' +
        '    text_(input.text) {}\n' +
        '  Foobar *MyFunction(const MyStruct &param1, int param2);\n' +
        '\n' +
        'private:\n' +
        '  int field1_;\n' +
        '  NSString *text_;\n' +
        '};';

      expect(renderedOutput).toEqual(expectedOutput);
    });
  });
});
