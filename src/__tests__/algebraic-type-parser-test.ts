/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import Either = require('../either');
import Error = require('../error');
import Maybe = require('../maybe');
import AlgebraicType = require('../algebraic-type');
import AlgebraicTypeParser = require('../algebraic-type-parser');
import ObjC = require('../objc');

describe('AlgebraicTypeParser', function() {
  describe('#parseAlgebraicType', function() {
    it('parses an algebraic type with a subtype that has two properties that are valid', function() {
      const fileContents =
        'RMSomething { RMOption { uint64_t someUnsignedInt } }';
      const actualResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = AlgebraicTypeParser.parse(fileContents);

      const expectedADT: AlgebraicType.Type = {
        annotations: {},
        name: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        typeLookups: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            annotations: {},
            name: 'RMOption',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someUnsignedInt',
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>(),
                  reference: 'uint64_t',
                  name: 'uint64_t',
                },
                comments: [],
              },
            ],
          }),
        ],
        libraryName: Maybe.Nothing<string>(),
      };

      const expectedResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = Either.Right<Error.Error[], AlgebraicType.Type>(expectedADT);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses an algebraic type with a single value subtype', function() {
      const fileContents =
        'RMSomething { %singleAttributeSubtype attributeType="RMObject *" rmObjectProperty }';
      const actualResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = AlgebraicTypeParser.parse(fileContents);

      const expectedADT: AlgebraicType.Type = {
        annotations: {},
        name: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        typeLookups: [],
        subtypes: [
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
            annotations: {},
            name: 'rmObjectProperty',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just('NSObject'),
              conformingProtocol: Maybe.Nothing<string>(),
              reference: 'RMObject*',
              name: 'RMObject',
            },
            comments: [],
          }),
        ],
        libraryName: Maybe.Nothing<string>(),
      };

      const expectedResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = Either.Right<Error.Error[], AlgebraicType.Type>(expectedADT);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses an algebraic type with a single value subtype that has lots of custom information', function() {
      const fileContents =
        '%type name=Scumbag library=Steve\n' +
        'RMSomething { #comment\n' +
        ' %singleAttributeSubtype attributeType="RMObject *"\n' +
        ' %import file=RMSomeOtherFile library=RMCustomLibrary\n' +
        ' rmObjectProperty }';
      const actualResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = AlgebraicTypeParser.parse(fileContents);

      const expectedADT: AlgebraicType.Type = {
        annotations: {
          type: [
            {
              properties: {
                name: 'Scumbag',
                library: 'Steve',
              },
            },
          ],
        },
        name: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        typeLookups: [
          {
            name: 'Scumbag',
            library: Maybe.Just<string>('Steve'),
            file: Maybe.Nothing<string>(),
            canForwardDeclare: true,
          },
        ],
        subtypes: [
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition({
            annotations: {
              import: [
                {
                  properties: {
                    file: 'RMSomeOtherFile',
                    library: 'RMCustomLibrary',
                  },
                },
              ],
            },
            name: 'rmObjectProperty',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: Maybe.Just('RMSomeOtherFile'),
              libraryTypeIsDefinedIn: Maybe.Just('RMCustomLibrary'),
              underlyingType: Maybe.Just('NSObject'),
              conformingProtocol: Maybe.Nothing<string>(),
              reference: 'RMObject*',
              name: 'RMObject',
            },
            comments: ['comment'],
          }),
        ],
        libraryName: Maybe.Nothing<string>(),
      };

      const expectedResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = Either.Right<Error.Error[], AlgebraicType.Type>(expectedADT);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it(
      'parses an ADT with two subtypes and lots of custom ' +
        'information that are valid',
      function() {
        const fileContents =
          '#My warm something\n' +
          '%library name=RMSomethingLibrary \n' +
          'RMSomething includes(A) excludes(B) {\n' +
          '  RMOption {\n' +
          '  %import file=RMSomeOtherFile library=RMCustomLibrary\n' +
          '   RMBlah *someBlah\n RMSomeValue(BOOL) someValue\n' +
          ' }\n' +
          '}';
        const actualResult: Either.Either<
          Error.Error[],
          AlgebraicType.Type
        > = AlgebraicTypeParser.parse(fileContents);
        const expectedADT: AlgebraicType.Type = {
          annotations: {
            library: [
              {
                properties: {
                  name: 'RMSomethingLibrary',
                },
              },
            ],
          },
          name: 'RMSomething',
          comments: ['My warm something'],
          includes: ['A'],
          excludes: ['B'],
          typeLookups: [],
          subtypes: [
            AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
              annotations: {},
              name: 'RMOption',
              comments: [],
              attributes: [
                {
                  annotations: {
                    import: [
                      {
                        properties: {
                          file: 'RMSomeOtherFile',
                          library: 'RMCustomLibrary',
                        },
                      },
                    ],
                  },
                  comments: [],
                  name: 'someBlah',
                  nullability: ObjC.Nullability.Inherited(),
                  type: {
                    fileTypeIsDefinedIn: Maybe.Just('RMSomeOtherFile'),
                    libraryTypeIsDefinedIn: Maybe.Just('RMCustomLibrary'),
                    name: 'RMBlah',
                    reference: 'RMBlah*',
                    underlyingType: Maybe.Just<string>('NSObject'),
                    conformingProtocol: Maybe.Nothing<string>(),
                  },
                },
                {
                  annotations: {},
                  comments: [],
                  name: 'someValue',
                  nullability: ObjC.Nullability.Inherited(),
                  type: {
                    fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                    libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                    name: 'RMSomeValue',
                    reference: 'RMSomeValue',
                    underlyingType: Maybe.Just('BOOL'),
                    conformingProtocol: Maybe.Nothing<string>(),
                  },
                },
              ],
            }),
          ],
          libraryName: Maybe.Just('RMSomethingLibrary'),
        };
        const expectedResult: Either.Either<
          Error.Error[],
          AlgebraicType.Type
        > = Either.Right<Error.Error[], AlgebraicType.Type>(expectedADT);
        expect(actualResult).toEqualJSON(expectedResult);
      },
    );

    it('parses an ADT with two subtypes and nullability attributes', function() {
      const fileContents =
        'RMSomething {\n' +
        '  RMOption {\n' +
        '  %nullable\n' +
        '   RMBlah *someBlah\n %nonnull\n RMBlah *someValue\n' +
        ' }\n' +
        '}';
      const actualResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = AlgebraicTypeParser.parse(fileContents);
      const expectedADT: AlgebraicType.Type = {
        annotations: {},
        name: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        typeLookups: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            annotations: {},
            name: 'RMOption',
            comments: [],
            attributes: [
              {
                annotations: {
                  nullable: [
                    {
                      properties: {},
                    },
                  ],
                },
                comments: [],
                name: 'someBlah',
                nullability: ObjC.Nullability.Nullable(),
                type: {
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  name: 'RMBlah',
                  reference: 'RMBlah*',
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>(),
                },
              },
              {
                annotations: {
                  nonnull: [
                    {
                      properties: {},
                    },
                  ],
                },
                comments: [],
                name: 'someValue',
                nullability: ObjC.Nullability.Nonnull(),
                type: {
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  name: 'RMBlah',
                  reference: 'RMBlah*',
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>(),
                },
              },
            ],
          }),
        ],
        libraryName: Maybe.Nothing<string>(),
      };
      const expectedResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = Either.Right<Error.Error[], AlgebraicType.Type>(expectedADT);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses an ADT with subtypes with generics', function() {
      const fileContents =
        'RMSomething {\n' +
        '  RMOption {\n' +
        '    NSEvolvedDictionary<BOOL, NSFoo *, NSBar *, NSInteger> *multiple\n' +
        '    NSArray<NSDictionary<NSArray<NSString *>, NSString *> *> *nested\n' +
        '    NSDictionary<id<FooProtocol>, NSArray<id<BarProtocol>> *> *protocols\n' +
        '    CKAction<NSDictionary<NSArray<NSString *> *, id<FooProtocol>> *> ckAction\n' +
        '  }\n' +
        '}';
      const actualResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = AlgebraicTypeParser.parse(fileContents);
      const expectedADT: AlgebraicType.Type = {
        annotations: {},
        name: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        typeLookups: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            annotations: {},
            name: 'RMOption',
            comments: [],
            attributes: [
              {
                annotations: {},
                comments: [],
                name: 'multiple',
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  name: 'NSEvolvedDictionary',
                  reference:
                    'NSEvolvedDictionary<BOOL, NSFoo *, NSBar *, NSInteger>*',
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>(),
                },
              },
              {
                annotations: {},
                comments: [],
                name: 'nested',
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  name: 'NSArray',
                  reference:
                    'NSArray<NSDictionary<NSArray<NSString *>, NSString *> *>*',
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>(),
                },
              },
              {
                annotations: {},
                comments: [],
                name: 'protocols',
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  name: 'NSDictionary',
                  reference:
                    'NSDictionary<id<FooProtocol>, NSArray<id<BarProtocol>> *>*',
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>(),
                },
              },
              {
                annotations: {},
                comments: [],
                name: 'ckAction',
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  name: 'CKAction',
                  reference:
                    'CKAction<NSDictionary<NSArray<NSString *> *, id<FooProtocol>> *>',
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>(),
                },
              },
            ],
          }),
        ],
        libraryName: Maybe.Nothing<string>(),
      };
      const expectedResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = Either.Right<Error.Error[], AlgebraicType.Type>(expectedADT);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object which is invalid', function() {
      const valueFileContents = 'RMSomething {{}';
      const actualResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = AlgebraicTypeParser.parse(valueFileContents);
      const expectedResult: Either.Either<
        Error.Error[],
        AlgebraicType.Type
      > = Either.Left<Error.Error[], AlgebraicType.Type>([
        Error.Error('(line 1, column 16) expected string matching {}}'),
      ]);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses annotations on named attribute collection subtypes', function() {
      const fileContents = [
        'RMADT {',
        '  %testAnnotation key=value',
        '  subtype {',
        '    %innerAnnotation',
        '    NSString *string',
        '  }',
        '}',
      ].join('\n');

      const actualResult = AlgebraicTypeParser.parse(fileContents);
      const expectedResult = Either.Right({
        annotations: {},
        comments: [],
        name: 'RMADT',
        includes: [],
        excludes: [],
        libraryName: Maybe.Nothing(),
        typeLookups: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'subtype',
            comments: [],
            annotations: {
              testAnnotation: [
                {
                  properties: {key: 'value'},
                },
              ],
            },
            attributes: [
              {
                annotations: {
                  innerAnnotation: [{properties: {}}],
                },
                name: 'string',
                comments: [],
                type: {
                  fileTypeIsDefinedIn: Maybe.Nothing(),
                  libraryTypeIsDefinedIn: Maybe.Nothing(),
                  name: 'NSString',
                  reference: 'NSString*',
                  underlyingType: Maybe.Just('NSObject'),
                  conformingProtocol: Maybe.Nothing(),
                },
                nullability: ObjC.Nullability.Inherited(),
              },
            ],
          }),
        ],
      });

      expect(actualResult).toEqualJSON(expectedResult);
    });
  });
});
