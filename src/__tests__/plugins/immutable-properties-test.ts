/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as ImmutableProperties from '../../plugins/immutable-properties';
import * as ImmutablePropertyUtils from '../../immutable-property-utils';
import * as Maybe from '../../maybe';
import * as ObjC from '../../objc';
import * as ObjectSpec from '../../object-spec';

const Plugin = ImmutableProperties.createPlugin();

describe('Plugins.ImmutableProperties', function() {
  describe('#instanceMethods', function() {
    it('is an empty array when there are no attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: null,
      };

      const actualMethods = Plugin.instanceMethods(objectType);

      const expectedMethods = [];

      expect(actualMethods).toEqualJSON(expectedMethods);
    });

    it(
      'is an initializer with a single property when one attribute is ' +
        'given',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'value',
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
          includes: ['RMValueObjectSemantics'],
          typeName: 'RMSomething',
          libraryName: null,
        };

        const actualMethods = Plugin.instanceMethods(objectType);

        const expectedMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: null,
            code: [
              'if ((self = [super init])) {',
              '  _value = [value copy];',
              '}',
              '',
              'return self;',
            ],
            comments: [],
            compilerAttributes: ['NS_DESIGNATED_INITIALIZER'],
            keywords: [
              {
                name: 'initWithValue',
                argument: Maybe.Just({
                  name: 'value',
                  modifiers: [],
                  type: {
                    name: 'NSString',
                    reference: 'NSString *',
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
        ];

        expect(actualMethods).toEqualJSON(expectedMethods);
      },
    );

    it(
      'is an initializer with a single property when one attribute is ' +
        'given and value semantics are turned off',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'value',
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
          typeName: 'RMSomething',
          libraryName: null,
        };

        const actualMethods = Plugin.instanceMethods(objectType);

        const expectedMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: null,
            code: [
              'if ((self = [super init])) {',
              '  _value = value;',
              '}',
              '',
              'return self;',
            ],
            comments: [],
            compilerAttributes: ['NS_DESIGNATED_INITIALIZER'],
            keywords: [
              {
                name: 'initWithValue',
                argument: Maybe.Just({
                  name: 'value',
                  modifiers: [],
                  type: {
                    name: 'NSString',
                    reference: 'NSString *',
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
        ];

        expect(actualMethods).toEqualJSON(expectedMethods);
      },
    );

    it(
      'is an initializer with multiple properties when many attribtutes are ' +
        'given',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'value',
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
              name: 'value2',
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
              name: 'value3',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'RMAnotherSomething',
                reference: 'RMAnotherSomething *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
            {
              annotations: {},
              comments: [],
              name: 'value4',
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
          includes: ['RMValueObjectSemantics'],
          typeName: 'RMSomething',
          libraryName: null,
        };

        const actualMethods = Plugin.instanceMethods(objectType);

        const expectedMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: null,
            code: [
              'if ((self = [super init])) {',
              '  _value = [value copy];',
              '  _value2 = value2;',
              '  _value3 = [value3 copy];',
              '  _value4 = [value4 copy];',
              '}',
              '',
              'return self;',
            ],
            comments: [],
            compilerAttributes: ['NS_DESIGNATED_INITIALIZER'],
            keywords: [
              {
                name: 'initWithValue',
                argument: Maybe.Just({
                  name: 'value',
                  modifiers: [],
                  type: {
                    name: 'NSString',
                    reference: 'NSString *',
                  },
                }),
              },
              {
                name: 'value2',
                argument: Maybe.Just({
                  name: 'value2',
                  modifiers: [],
                  type: {
                    name: 'BOOL',
                    reference: 'BOOL',
                  },
                }),
              },
              {
                name: 'value3',
                argument: Maybe.Just({
                  name: 'value3',
                  modifiers: [],
                  type: {
                    name: 'RMAnotherSomething',
                    reference: 'RMAnotherSomething *',
                  },
                }),
              },
              {
                name: 'value4',
                argument: Maybe.Just({
                  name: 'value4',
                  modifiers: [],
                  type: {
                    name: 'id',
                    reference: 'id',
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
        ];

        expect(actualMethods).toEqualJSON(expectedMethods);
      },
    );

    it(
      'is an initializer with multiple properties when many attribtutes are ' +
        'given and value semantics are off',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'value',
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
              name: 'value2',
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
              name: 'value3',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'RMAnotherSomething',
                reference: 'RMAnotherSomething *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
            {
              annotations: {},
              comments: [],
              name: 'value4',
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
          typeName: 'RMSomething',
          libraryName: null,
        };

        const actualMethods = Plugin.instanceMethods(objectType);

        const expectedMethods: ObjC.Method[] = [
          {
            preprocessors: [],
            belongsToProtocol: null,
            code: [
              'if ((self = [super init])) {',
              '  _value = value;',
              '  _value2 = value2;',
              '  _value3 = value3;',
              '  _value4 = value4;',
              '}',
              '',
              'return self;',
            ],
            comments: [],
            compilerAttributes: ['NS_DESIGNATED_INITIALIZER'],
            keywords: [
              {
                name: 'initWithValue',
                argument: Maybe.Just({
                  name: 'value',
                  modifiers: [],
                  type: {
                    name: 'NSString',
                    reference: 'NSString *',
                  },
                }),
              },
              {
                name: 'value2',
                argument: Maybe.Just({
                  name: 'value2',
                  modifiers: [],
                  type: {
                    name: 'BOOL',
                    reference: 'BOOL',
                  },
                }),
              },
              {
                name: 'value3',
                argument: Maybe.Just({
                  name: 'value3',
                  modifiers: [],
                  type: {
                    name: 'RMAnotherSomething',
                    reference: 'RMAnotherSomething *',
                  },
                }),
              },
              {
                name: 'value4',
                argument: Maybe.Just({
                  name: 'value4',
                  modifiers: [],
                  type: {
                    name: 'id',
                    reference: 'id',
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
        ];

        expect(actualMethods).toEqualJSON(expectedMethods);
      },
    );
  });

  describe('#imports', function() {
    it('includes foundation even when there are no attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: null,
      };

      const actualImports = Plugin.imports(objectType);

      const expectedImport: ObjC.Import = {
        file: 'Foundation.h',
        isPublic: true,
        library: 'Foundation',
        requiresCPlusPlus: false,
      };

      expect(actualImports).toContain(expectedImport);
    });

    it(
      'includes an import for itself locally when the type is not inside ' +
        'of a library',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: null,
        };

        const actualImports = Plugin.imports(objectType);

        const expectedImport: ObjC.Import = {
          file: 'RMSomething.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        };

        expect(actualImports).toContain(expectedImport);
      },
    );

    it(
      'includes an import for itself in a library when the type itself is ' +
        'inside of a library',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: 'RMSomeLibrary',
        };

        const actualImports = Plugin.imports(objectType);

        const expectedImport: ObjC.Import = {
          file: 'RMSomething.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        };

        expect(actualImports).toContain(expectedImport);
      },
    );

    it('includes an import for the provided type lookups', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [
          {
            name: 'Foo',
            library: 'Bar',
            file: 'Baz',
            canForwardDeclare: false,
          },
          {
            name: 'Scumbag',
            library: 'Steve',
            file: null,
            canForwardDeclare: true,
          },
        ],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      expect(actualImports).toContain({
        file: 'Baz.h',
        isPublic: true,
        library: 'Bar',
        requiresCPlusPlus: false,
      });

      expect(actualImports).toContain({
        file: 'Scumbag.h',
        isPublic: true,
        library: 'Steve',
        requiresCPlusPlus: false,
      });
    });

    it(
      'does not include a public import for itself when it is provided with ' +
        'a type lookup for itself',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          typeLookups: [
            {
              name: 'RMSomething',
              library: null,
              file: null,
              canForwardDeclare: true,
            },
          ],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: 'RMSomeLibrary',
        };

        const actualImports = Plugin.imports(objectType);

        expect(actualImports).not.toContain({
          file: 'RMSomething.h',
          isPublic: true,
          library: 'RMSomeLibrary',
        });
      },
    );

    it(
      'includes for an attribute that is an NSObject but does not have a ' +
        'specified library and the value object is in a library',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'something',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'RMSomethingElse',
                reference: 'RMSomethingElse *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: 'RMSomeLibrary',
        };

        const actualImports = Plugin.imports(objectType);

        const expectedImport: ObjC.Import = {
          file: 'RMSomethingElse.h',
          isPublic: true,
          library: 'RMSomeLibrary',
          requiresCPlusPlus: false,
        };

        expect(actualImports).toContain(expectedImport);
      },
    );

    it(
      'includes for an attribute that is an NSObject but does not have a ' +
        'specified library and the value object is not in a library',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'something',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'RMSomethingElse',
                reference: 'RMSomethingElse *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: null,
        };

        const actualImports = Plugin.imports(objectType);

        const expectedImport: ObjC.Import = {
          file: 'RMSomethingElse.h',
          isPublic: true,
          library: null,
          requiresCPlusPlus: false,
        };

        expect(actualImports).toContain(expectedImport);
      },
    );

    it(
      'includes for an attribute that is an NSObject but specifies which file ' +
        'it should be without a library and the value object is not in a library',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'something',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: 'RMSomeOtherFile',
                libraryTypeIsDefinedIn: null,
                name: 'RMSomethingElse',
                reference: 'RMSomethingElse *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: null,
        };

        const actualImports = Plugin.imports(objectType);

        const expectedImport: ObjC.Import = {
          file: 'RMSomeOtherFile.h',
          isPublic: true,
          library: null,
          requiresCPlusPlus: false,
        };

        expect(actualImports).toContain(expectedImport);
      },
    );

    it(
      'includes for an attribute that is an NSObject but specifies which file ' +
        'it should be with a library and the value object is not in a library',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'something',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: 'RMSomeOtherFile',
                libraryTypeIsDefinedIn: 'RMSomeOtherLibrary',
                name: 'RMSomethingElse',
                reference: 'RMSomethingElse *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: null,
        };

        const actualImports = Plugin.imports(objectType);

        const expectedImport: ObjC.Import = {
          file: 'RMSomeOtherFile.h',
          isPublic: true,
          library: 'RMSomeOtherLibrary',
          requiresCPlusPlus: false,
        };

        expect(actualImports).toContain(expectedImport);
      },
    );

    it(
      'includes for an attribute that is an NSObject but specifies which file ' +
        'it should be with a library and the value object is in a library',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'something',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: 'RMSomeOtherFile',
                libraryTypeIsDefinedIn: 'RMSomeOtherLibrary',
                name: 'RMSomethingElse',
                reference: 'RMSomethingElse *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: 'RMSomeLibrary',
        };

        const actualImports = Plugin.imports(objectType);

        const expectedImport: ObjC.Import = {
          file: 'RMSomeOtherFile.h',
          isPublic: true,
          library: 'RMSomeOtherLibrary',
          requiresCPlusPlus: false,
        };

        expect(actualImports).toContain(expectedImport);
      },
    );

    it(
      'includes for an attribute that is an NSObject but specifies which library ' +
        'it should be and the value object is in a library',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'something',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: 'RMSomeOtherLibrary',
                name: 'RMSomethingElse',
                reference: 'RMSomethingElse *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: 'RMSomeLibrary',
        };

        const actualImports = Plugin.imports(objectType);

        const expectedImport: ObjC.Import = {
          file: 'RMSomethingElse.h',
          isPublic: true,
          library: 'RMSomeOtherLibrary',
          requiresCPlusPlus: false,
        };

        expect(actualImports).toContain(expectedImport);
      },
    );

    it('does not include anything for BOOL type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
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
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for double type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'double',
              reference: 'double',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for float type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'float',
              reference: 'float',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for NSTimeInterval type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'NSTimeInterval',
              reference: 'NSTimeInterval',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('includes CGBase for CGFloat type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'CGFloat',
              reference: 'CGFloat',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
        {
          file: 'CGBase.h',
          isPublic: true,
          library: 'CoreGraphics',
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('includes CGBase for CGRect type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'CGRect',
              reference: 'CGRect',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
        {
          file: 'CGGeometry.h',
          isPublic: true,
          library: 'CoreGraphics',
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('includes CGBase anything for CGPoint type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'CGPoint',
              reference: 'CGPoint',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
        {
          file: 'CGGeometry.h',
          isPublic: true,
          library: 'CoreGraphics',
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for SEL type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'SEL',
              reference: 'SEL',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('includes CGBase anything for CGSize type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
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
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
        {
          file: 'CGGeometry.h',
          isPublic: true,
          library: 'CoreGraphics',
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('includes UIGeometry for UIEdgeInsets type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'UIEdgeInsets',
              reference: 'UIEdgeInsets',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
        {
          file: 'UIGeometry.h',
          isPublic: true,
          library: 'UIKit',
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for int32_t type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'int32_t',
              reference: 'int32_t',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for int64_t type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'int64_t',
              reference: 'int64_t',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for uint32_t type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'uint32_t',
              reference: 'uint32_t',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for uint64_t type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'uint64_t',
              reference: 'uint64_t',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for NSUInteger type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
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
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for NSUInteger type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'NSInteger',
              reference: 'NSInteger',
              underlyingType: null,
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });

    it('does not include anything for NSString type attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'something',
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
        typeName: 'RMSomething',
        libraryName: 'RMSomeLibrary',
      };

      const actualImports = Plugin.imports(objectType);

      const baseImports: ObjC.Import[] = [
        {
          file: 'Foundation.h',
          isPublic: true,
          library: 'Foundation',
          requiresCPlusPlus: false,
        },
        {
          file: objectType.typeName + '.h',
          isPublic: false,
          library: null,
          requiresCPlusPlus: false,
        },
      ];

      expect(actualImports).toEqualJSON(baseImports);
    });
  });

  describe('#properties', function() {
    it('includes no properties when there are no attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: null,
      };

      const actualImports = Plugin.properties(objectType);

      expect(actualImports).toEqualJSON([]);
    });

    it('includes readonly nonatomic properties for non object attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'value',
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
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: null,
      };

      const actualProperties = Plugin.properties(objectType);

      const expectedProperties: ObjC.Property[] = [
        {
          comments: [],
          modifiers: [
            ObjC.PropertyModifier.Nonatomic(),
            ObjC.PropertyModifier.Readonly(),
          ],
          access: ObjC.PropertyAccess.Public(),
          name: 'value',
          returnType: {
            name: 'BOOL',
            reference: 'BOOL',
          },
        },
      ];

      expect(actualProperties).toEqualJSON(expectedProperties);
    });

    it('includes readonly nonatomic copy properties for object attributes', function() {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'value',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'RMSomething',
              reference: 'RMSomething *',
              underlyingType: 'NSObject',
              conformingProtocol: null,
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: ['RMValueObjectSemantics'],
        typeName: 'RMSomething',
        libraryName: null,
      };

      const actualProperties = Plugin.properties(objectType);

      const expectedProperties: ObjC.Property[] = [
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
            name: 'RMSomething',
            reference: 'RMSomething *',
          },
        },
      ];

      expect(actualProperties).toEqualJSON(expectedProperties);
    });

    it(
      'includes readonly nonatomic properties for object attributes when ' +
        'value semantics are off',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'value',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'RMSomething',
                reference: 'RMSomething *',
                underlyingType: 'NSObject',
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: null,
        };

        const actualProperties = Plugin.properties(objectType);

        const expectedProperties: ObjC.Property[] = [
          {
            comments: [],
            modifiers: [
              ObjC.PropertyModifier.Nonatomic(),
              ObjC.PropertyModifier.Readonly(),
            ],
            access: ObjC.PropertyAccess.Public(),
            name: 'value',
            returnType: {
              name: 'RMSomething',
              reference: 'RMSomething *',
            },
          },
        ];

        expect(actualProperties).toEqualJSON(expectedProperties);
      },
    );
  });

  describe('#propertyModifiersFromAttribute', function() {
    it('returns a copyable property for an NSObject attribute with value semantics enabled', function() {
      const attribute: ObjectSpec.Attribute = {
        annotations: {},
        comments: [],
        name: 'value',
        nullability: ObjC.Nullability.Inherited(),
        type: {
          fileTypeIsDefinedIn: null,
          libraryTypeIsDefinedIn: null,
          name: 'RMSomething',
          reference: 'RMSomething *',
          underlyingType: 'NSObject',
          conformingProtocol: null,
        },
      };

      const modifiers: ObjC.PropertyModifier[] = ImmutablePropertyUtils.propertyModifiersFromAttribute(
        true,
        attribute,
      );
      expect(modifiers).toContain(ObjC.PropertyModifier.Copy());
    });

    it('returns a copyable property for an NSObject attribute with value semantics disabled', function() {
      const attribute: ObjectSpec.Attribute = {
        annotations: {},
        comments: [],
        name: 'value',
        nullability: ObjC.Nullability.Inherited(),
        type: {
          fileTypeIsDefinedIn: null,
          libraryTypeIsDefinedIn: null,
          name: 'RMSomething',
          reference: 'RMSomething *',
          underlyingType: 'NSObject',
          conformingProtocol: null,
        },
      };

      const modifiers: ObjC.PropertyModifier[] = ImmutablePropertyUtils.propertyModifiersFromAttribute(
        false,
        attribute,
      );
      expect(modifiers).not.toContain(ObjC.PropertyModifier.Copy());
    });

    it('returns a non-copyable property for an NSObject attribute', function() {
      const attribute: ObjectSpec.Attribute = {
        annotations: {},
        comments: [],
        name: 'value',
        nullability: ObjC.Nullability.Inherited(),
        type: {
          fileTypeIsDefinedIn: null,
          libraryTypeIsDefinedIn: null,
          name: 'Foo',
          reference: 'Foo',
          underlyingType: 'NSUInteger',
          conformingProtocol: null,
        },
      };

      const modifiers: ObjC.PropertyModifier[] = ImmutablePropertyUtils.propertyModifiersFromAttribute(
        true,
        attribute,
      );
      expect(modifiers).not.toContain(ObjC.PropertyModifier.Copy());
    });

    it('returns a nonnull property for a nonnull attribute', function() {
      const attribute: ObjectSpec.Attribute = {
        annotations: {},
        comments: [],
        name: 'value',
        nullability: ObjC.Nullability.Nonnull(),
        type: {
          fileTypeIsDefinedIn: null,
          libraryTypeIsDefinedIn: null,
          name: 'RMSomething',
          reference: 'RMSomething *',
          underlyingType: 'NSObject',
          conformingProtocol: null,
        },
      };

      const modifiers: ObjC.PropertyModifier[] = ImmutablePropertyUtils.propertyModifiersFromAttribute(
        true,
        attribute,
      );
      expect(modifiers).toContain(ObjC.PropertyModifier.Nonnull());
    });

    it('returns a nullable property for an nullable attribute', function() {
      const attribute: ObjectSpec.Attribute = {
        annotations: {},
        comments: [],
        name: 'value',
        nullability: ObjC.Nullability.Nullable(),
        type: {
          fileTypeIsDefinedIn: null,
          libraryTypeIsDefinedIn: null,
          name: 'RMSomething',
          reference: 'RMSomething *',
          underlyingType: 'NSObject',
          conformingProtocol: null,
        },
      };

      const modifiers: ObjC.PropertyModifier[] = ImmutablePropertyUtils.propertyModifiersFromAttribute(
        true,
        attribute,
      );
      expect(modifiers).toContain(ObjC.PropertyModifier.Nullable());
    });
  });

  describe('#forwardDeclarations', function() {
    it(
      'returns a forward declaration when the same type being generated ' +
        'is being used as an attribute type',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'value',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'RMSomething',
                reference: 'RMSomething *',
                underlyingType: null,
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: null,
        };
        const forwardDeclarations: ObjC.ForwardDeclaration[] = Plugin.forwardDeclarations(
          objectType,
        );
        const expectedForwardDeclarations: ObjC.ForwardDeclaration[] = [
          ObjC.ForwardDeclaration.ForwardClassDeclaration('RMSomething'),
        ];
        expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
      },
    );

    it(
      'returns a forward declaration when the same type being generated ' +
        'is being used in a type lookup',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'value',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'Foo',
                reference: 'Foo *',
                underlyingType: null,
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [
            {
              name: 'RMSomething',
              library: null,
              file: null,
              canForwardDeclare: true,
            },
          ],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: null,
        };
        const forwardDeclarations: ObjC.ForwardDeclaration[] = Plugin.forwardDeclarations(
          objectType,
        );
        const expectedForwardDeclarations: ObjC.ForwardDeclaration[] = [
          ObjC.ForwardDeclaration.ForwardClassDeclaration('RMSomething'),
        ];
        expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
      },
    );

    it(
      'returns no forward declarations when the same type being generated ' +
        'is not being referenced in a subtype',
      function() {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'value',
              nullability: ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn: null,
                libraryTypeIsDefinedIn: null,
                name: 'Foo',
                reference: 'Foo *',
                underlyingType: null,
                conformingProtocol: null,
              },
            },
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: [],
          typeName: 'RMSomething',
          libraryName: null,
        };
        const forwardDeclarations: ObjC.ForwardDeclaration[] = Plugin.forwardDeclarations(
          objectType,
        );
        const expectedForwardDeclarations: ObjC.ForwardDeclaration[] = [];
        expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
      },
    );
  });
});
