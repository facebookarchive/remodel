/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import * as Either from '../either';
import * as Error from '../error';
import * as Maybe from '../maybe';
import * as AlgebraicType from '../algebraic-type';
import * as AlgebraicTypeParser from '../algebraic-type-parser';
import * as ObjC from '../objc';

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
                  fileTypeIsDefinedIn: null,
                  libraryTypeIsDefinedIn: null,
                  underlyingType: null,
                  conformingProtocol: null,
                  reference: 'uint64_t',
                  name: 'uint64_t',
                },
                comments: [],
              },
            ],
          }),
        ],
        libraryName: null,
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
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              underlyingType: 'NSObject',
              conformingProtocol: null,
              reference: 'RMObject*',
              name: 'RMObject',
            },
            comments: [],
          }),
        ],
        libraryName: null,
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
            library: 'Steve',
            file: null,
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
              fileTypeIsDefinedIn: 'RMSomeOtherFile',
              libraryTypeIsDefinedIn: 'RMCustomLibrary',
              underlyingType: 'NSObject',
              conformingProtocol: null,
              reference: 'RMObject*',
              name: 'RMObject',
            },
            comments: ['comment'],
          }),
        ],
        libraryName: null,
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
                    fileTypeIsDefinedIn: 'RMSomeOtherFile',
                    libraryTypeIsDefinedIn: 'RMCustomLibrary',
                    name: 'RMBlah',
                    reference: 'RMBlah*',
                    underlyingType: 'NSObject',
                    conformingProtocol: null,
                  },
                },
                {
                  annotations: {},
                  comments: [],
                  name: 'someValue',
                  nullability: ObjC.Nullability.Inherited(),
                  type: {
                    fileTypeIsDefinedIn: null,
                    libraryTypeIsDefinedIn: null,
                    name: 'RMSomeValue',
                    reference: 'RMSomeValue',
                    underlyingType: 'BOOL',
                    conformingProtocol: null,
                  },
                },
              ],
            }),
          ],
          libraryName: 'RMSomethingLibrary',
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
                  fileTypeIsDefinedIn: null,
                  libraryTypeIsDefinedIn: null,
                  name: 'RMBlah',
                  reference: 'RMBlah*',
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
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
                  fileTypeIsDefinedIn: null,
                  libraryTypeIsDefinedIn: null,
                  name: 'RMBlah',
                  reference: 'RMBlah*',
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
                },
              },
            ],
          }),
        ],
        libraryName: null,
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
                  fileTypeIsDefinedIn: null,
                  libraryTypeIsDefinedIn: null,
                  name: 'NSEvolvedDictionary',
                  reference:
                    'NSEvolvedDictionary<BOOL, NSFoo *, NSBar *, NSInteger>*',
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
                },
              },
              {
                annotations: {},
                comments: [],
                name: 'nested',
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  fileTypeIsDefinedIn: null,
                  libraryTypeIsDefinedIn: null,
                  name: 'NSArray',
                  reference:
                    'NSArray<NSDictionary<NSArray<NSString *>, NSString *> *>*',
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
                },
              },
              {
                annotations: {},
                comments: [],
                name: 'protocols',
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  fileTypeIsDefinedIn: null,
                  libraryTypeIsDefinedIn: null,
                  name: 'NSDictionary',
                  reference:
                    'NSDictionary<id<FooProtocol>, NSArray<id<BarProtocol>> *>*',
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
                },
              },
              {
                annotations: {},
                comments: [],
                name: 'ckAction',
                nullability: ObjC.Nullability.Inherited(),
                type: {
                  fileTypeIsDefinedIn: null,
                  libraryTypeIsDefinedIn: null,
                  name: 'CKAction',
                  reference:
                    'CKAction<NSDictionary<NSArray<NSString *> *, id<FooProtocol>> *>',
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
                },
              },
            ],
          }),
        ],
        libraryName: null,
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
        libraryName: null,
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
                  fileTypeIsDefinedIn: null,
                  libraryTypeIsDefinedIn: null,
                  name: 'NSString',
                  reference: 'NSString*',
                  underlyingType: 'NSObject',
                  conformingProtocol: null,
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
