/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import * as CLangCommon from '../../clang-common';
import * as ImmutableProperties from '../../plugins/immutable-properties';
import * as ImmutablePropertyUtils from '../../immutable-property-utils';
import * as ObjC from '../../objc';
import * as ObjectSpec from '../../object-spec';
import * as ObjectSpecHelpers from '../../object-spec-helpers';

const Plugin = ImmutableProperties.createPlugin();

describe('Plugins.ImmutableProperties', function () {
  describe('#instanceMethods', function () {
    it('is an empty array when there are no attributes', function () {
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
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'value',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSString',
                'NSString *',
                'NSObject',
              ),
            ).asObject(),
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
                argument: {
                  name: 'value',
                  modifiers: [],
                  type: {
                    name: 'NSString',
                    reference: 'NSString *',
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

        expect(actualMethods).toEqualJSON(expectedMethods);
      },
    );

    it(
      'is an initializer with a single property when one attribute is ' +
        'given and value semantics are turned off',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'value',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSString',
                'NSString *',
                'NSObject',
              ),
            ).asObject(),
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
                argument: {
                  name: 'value',
                  modifiers: [],
                  type: {
                    name: 'NSString',
                    reference: 'NSString *',
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

        expect(actualMethods).toEqualJSON(expectedMethods);
      },
    );

    it(
      'is an initializer with multiple properties when many attribtutes are ' +
        'given',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'value',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSString',
                'NSString *',
                'NSObject',
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'value2',
              new ObjectSpecHelpers.AttributeTypeBuilder('BOOL', 'BOOL', null),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'value3',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMAnotherSomething',
                'RMAnotherSomething *',
                'NSObject',
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'value4',
              new ObjectSpecHelpers.AttributeTypeBuilder('id', 'id', null),
            ).asObject(),
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
                    name: 'RMAnotherSomething',
                    reference: 'RMAnotherSomething *',
                  },
                },
              },
              {
                name: 'value4',
                argument: {
                  name: 'value4',
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
        ];
        expect(actualMethods).toEqualJSON(expectedMethods);
      },
    );

    it(
      'is an initializer with multiple properties when many attribtutes are ' +
        'given and value semantics are off',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'value',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'NSString',
                'NSString *',
                'NSObject',
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'value2',
              new ObjectSpecHelpers.AttributeTypeBuilder('BOOL', 'BOOL', null),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'value3',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMAnotherSomething',
                'RMAnotherSomething *',
                'NSObject',
              ),
            ).asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'value4',
              new ObjectSpecHelpers.AttributeTypeBuilder('id', 'id', null),
            ).asObject(),
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
                    name: 'RMAnotherSomething',
                    reference: 'RMAnotherSomething *',
                  },
                },
              },
              {
                name: 'value4',
                argument: {
                  name: 'value4',
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
        ];

        expect(actualMethods).toEqualJSON(expectedMethods);
      },
    );
  });

  describe('#imports', function () {
    it('includes foundation even when there are no attributes', function () {
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
      function () {
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
      function () {
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

    it('includes an import for referenced type lookups', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'Foo',
              'Foo<Scumbag *> *',
              'NSObject',
            ).withReferencedGenericTypes([
              {
                name: 'Scumbag',
                conformingProtocols: [],
                referencedGenericTypes: [],
              },
            ]),
          ).asObject(),
        ],
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
      function () {
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
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'something',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMSomethingElse',
                'RMSomethingElse *',
                'NSObject',
              ),
            ).asObject(),
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
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'something',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMSomethingElse',
                'RMSomethingElse *',
                'NSObject',
              ),
            ).asObject(),
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
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'something',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMSomethingElse',
                'RMSomethingElse *',
                'NSObject',
              ).withFileTypeIsDefinedIn('RMSomeOtherFile'),
            ).asObject(),
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
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'something',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMSomethingElse',
                'RMSomethingElse *',
                'NSObject',
              )
                .withFileTypeIsDefinedIn('RMSomeOtherFile')
                .withLibraryTypeIsDefinedIn('RMSomeOtherLibrary'),
            ).asObject(),
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
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'something',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMSomethingElse',
                'RMSomethingElse *',
                'NSObject',
              )
                .withFileTypeIsDefinedIn('RMSomeOtherFile')
                .withLibraryTypeIsDefinedIn('RMSomeOtherLibrary'),
            ).asObject(),
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
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'something',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMSomethingElse',
                'RMSomethingElse *',
                'NSObject',
              ).withLibraryTypeIsDefinedIn('RMSomeOtherLibrary'),
            ).asObject(),
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

    it('does not include anything for BOOL type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder('BOOL', 'BOOL', null),
          ).asObject(),
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

    it('does not include anything for double type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'double',
              'double',
              null,
            ),
          ).asObject(),
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

    it('does not include anything for float type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder('float', 'float', null),
          ).asObject(),
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

    it('does not include anything for NSTimeInterval type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSTimeInterval',
              'NSTimeInterval',
              null,
            ),
          ).asObject(),
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

    it('includes CGBase for CGFloat type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'CGFloat',
              'CGFloat',
              null,
            ),
          ).asObject(),
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

    it('includes CGBase for CGRect type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'CGRect',
              'CGRect',
              null,
            ),
          ).asObject(),
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

    it('includes CGBase anything for CGPoint type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'CGPoint',
              'CGPoint',
              null,
            ),
          ).asObject(),
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

    it('does not include anything for SEL type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder('SEL', 'SEL', null),
          ).asObject(),
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

    it('includes CGBase anything for CGSize type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'CGSize',
              'CGSize',
              null,
            ),
          ).asObject(),
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

    it('includes UIGeometry for UIEdgeInsets type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'UIEdgeInsets',
              'UIEdgeInsets',
              null,
            ),
          ).asObject(),
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

    it('does not include anything for int32_t type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'int32_t',
              'int32_t',
              null,
            ),
          ).asObject(),
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

    it('does not include anything for int64_t type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'int64_t',
              'int64_t',
              null,
            ),
          ).asObject(),
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

    it('does not include anything for uint32_t type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'uint32_t',
              'uint32_t',
              null,
            ),
          ).asObject(),
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

    it('does not include anything for uint64_t type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'uint64_t',
              'uint64_t',
              null,
            ),
          ).asObject(),
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

    it('does not include anything for NSUInteger type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSUInteger',
              'NSUInteger',
              null,
            ),
          ).asObject(),
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

    it('does not include anything for NSUInteger type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSInteger',
              'NSInteger',
              null,
            ),
          ).asObject(),
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

    it('does not include anything for NSString type attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'something',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSString',
              'NSString *',
              'NSObject',
            ),
          ).asObject(),
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

  describe('#properties', function () {
    it('includes no properties when there are no attributes', function () {
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

    it('includes readonly nonatomic properties for non object attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'value',
            new ObjectSpecHelpers.AttributeTypeBuilder('BOOL', 'BOOL', null),
          ).asObject(),
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
          preprocessors: [],
        },
      ];

      expect(actualProperties).toEqualJSON(expectedProperties);
    });

    it('includes readonly nonatomic copy properties for object attributes', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'value',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'RMSomething',
              'RMSomething *',
              'NSObject',
            ),
          ).asObject(),
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
          preprocessors: [],
        },
      ];

      expect(actualProperties).toEqualJSON(expectedProperties);
    });

    it(
      'includes readonly nonatomic properties for object attributes when ' +
        'value semantics are off',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'value',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMSomething',
                'RMSomething *',
                'NSObject',
              ),
            ).asObject(),
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
            preprocessors: [],
          },
        ];

        expect(actualProperties).toEqualJSON(expectedProperties);
      },
    );
  });

  describe('#propertyModifiersFromAttribute', function () {
    it('returns a copyable property for an NSObject attribute with value semantics enabled', function () {
      const attribute: ObjectSpec.Attribute =
        new ObjectSpecHelpers.AttributeBuilder(
          'value',
          new ObjectSpecHelpers.AttributeTypeBuilder(
            'RMSomething',
            'RMSomething *',
            'NSObject',
          ),
        ).asObject();

      const modifiers: ObjC.PropertyModifier[] =
        ImmutablePropertyUtils.propertyModifiersFromAttribute(true, attribute);
      expect(modifiers).toContain(ObjC.PropertyModifier.Copy());
    });

    it('returns a copyable property for an NSObject attribute with value semantics disabled', function () {
      const attribute: ObjectSpec.Attribute =
        new ObjectSpecHelpers.AttributeBuilder(
          'value',
          new ObjectSpecHelpers.AttributeTypeBuilder(
            'RMSomething',
            'RMSomething *',
            'NSObject',
          ),
        ).asObject();

      const modifiers: ObjC.PropertyModifier[] =
        ImmutablePropertyUtils.propertyModifiersFromAttribute(false, attribute);
      expect(modifiers).not.toContain(ObjC.PropertyModifier.Copy());
    });

    it('returns a non-copyable property for an NSObject attribute', function () {
      const attribute: ObjectSpec.Attribute =
        new ObjectSpecHelpers.AttributeBuilder(
          'value',
          new ObjectSpecHelpers.AttributeTypeBuilder(
            'Foo',
            'Foo',
            'NSUInteger',
          ),
        ).asObject();

      const modifiers: ObjC.PropertyModifier[] =
        ImmutablePropertyUtils.propertyModifiersFromAttribute(true, attribute);
      expect(modifiers).not.toContain(ObjC.PropertyModifier.Copy());
    });

    it('returns a nonnull property for a nonnull attribute', function () {
      const attribute: ObjectSpec.Attribute =
        new ObjectSpecHelpers.AttributeBuilder(
          'value',
          new ObjectSpecHelpers.AttributeTypeBuilder(
            'RMSomething',
            'RMSomething *',
            'NSObject',
          ),
        )
          .withNullability(CLangCommon.Nullability.Nonnull())
          .asObject();

      const modifiers: ObjC.PropertyModifier[] =
        ImmutablePropertyUtils.propertyModifiersFromAttribute(true, attribute);
      expect(modifiers).toContain(ObjC.PropertyModifier.Nonnull());
    });

    it('returns a nullable property for an nullable attribute', function () {
      const attribute: ObjectSpec.Attribute =
        new ObjectSpecHelpers.AttributeBuilder(
          'value',
          new ObjectSpecHelpers.AttributeTypeBuilder(
            'RMSomething',
            'RMSomething *',
            'NSObject',
          ),
        )
          .withNullability(CLangCommon.Nullability.Nullable())
          .asObject();

      const modifiers: ObjC.PropertyModifier[] =
        ImmutablePropertyUtils.propertyModifiersFromAttribute(true, attribute);
      expect(modifiers).toContain(ObjC.PropertyModifier.Nullable());
    });
  });

  describe('#forwardDeclarations', function () {
    it(
      'returns forward declarations when a type is referenced ' +
        'and UseForwardDeclarations is included',
      function () {
        const objectType: ObjectSpec.Type = {
          annotations: {},
          attributes: [
            new ObjectSpecHelpers.AttributeBuilder(
              'value',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'Foo',
                'Foo *',
                'NSObject',
              ).withConformingProtocols(['Bar']),
            ).asObject(),
          ],
          comments: [],
          typeLookups: [],
          excludes: [],
          includes: ['UseForwardDeclarations'],
          typeName: 'RMSomething',
          libraryName: null,
        };
        const forwardDeclarations: ObjC.ForwardDeclaration[] =
          Plugin.forwardDeclarations(objectType);
        const expectedForwardDeclarations: ObjC.ForwardDeclaration[] = [
          ObjC.ForwardDeclaration.ForwardProtocolDeclaration('Bar'),
          ObjC.ForwardDeclaration.ForwardClassDeclaration('Foo'),
        ];
        expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
      },
    );

    it('returns forward declarations for referenced generic types', function () {
      const objectType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'value',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSDictionary',
              'NSDictionary<Foo<Bar> *, id<Baz>> *',
              'NSObject',
            ).withReferencedGenericTypes([
              {
                name: 'Foo',
                conformingProtocols: ['Bar'],
                referencedGenericTypes: [],
              },
              {
                name: 'id',
                conformingProtocols: ['Baz'],
                referencedGenericTypes: [],
              },
            ]),
          ).asObject(),
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: ['UseForwardDeclarations'],
        typeName: 'RMSomething',
        libraryName: null,
      };
      const forwardDeclarations: ObjC.ForwardDeclaration[] =
        Plugin.forwardDeclarations(objectType);
      const expectedForwardDeclarations: ObjC.ForwardDeclaration[] = [
        ObjC.ForwardDeclaration.ForwardProtocolDeclaration('Bar'),
        ObjC.ForwardDeclaration.ForwardProtocolDeclaration('Baz'),
        ObjC.ForwardDeclaration.ForwardClassDeclaration('Foo'),
      ];
      expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
    });
  });
});
