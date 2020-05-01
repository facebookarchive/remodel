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
import * as ObjC from '../objc';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecParser from '../object-spec-parser';

describe('ObjectSpecParser', function() {
  describe('#parse', function() {
    it('parses a value object with two properties that are valid', function() {
      const valueFileContents =
        'RMSomething {\n' +
        'NSArray *someArray\n ' +
        'BOOL someBoolean\n' +
        '}';
      const actualResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = ObjectSpecParser.parse(valueFileContents);
      const expectedFoundType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someArray',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'NSArray',
              reference: 'NSArray*',
              underlyingType: 'NSObject',
              conformingProtocol: null,
              referencedGenericTypes: [],
            },
          },
          {
            annotations: {},
            comments: [],
            name: 'someBoolean',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'BOOL',
              reference: 'BOOL',
              underlyingType: null,
              conformingProtocol: null,
              referencedGenericTypes: [],
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
      const expectedResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it(
      'parses a value object with two properties and lots of custom ' +
        'information that is valid',
      function() {
        const valueFileContents =
          '%library name=RMSomethingLibrary\n' +
          '%type name=Foo library=Bar file=NSObject+Baz canForwardDeclare=false\n' +
          '%type name=Scumbag library=Steve\n' +
          'RMSomething {\n' +
          '  %import file=RMSomeOtherFile library=RMCustomLibrary\n' +
          '  RMBlah *someBlah\n' +
          '  RMSomeValue(BOOL) someValue\n' +
          '}';
        const actualResult: Either.Either<
          Error.Error[],
          ObjectSpec.Type
        > = ObjectSpecParser.parse(valueFileContents);
        const expectedFoundType: ObjectSpec.Type = {
          annotations: {
            library: [
              {
                properties: {
                  name: 'RMSomethingLibrary',
                },
              },
            ],
            type: [
              {
                properties: {
                  name: 'Foo',
                  library: 'Bar',
                  file: 'NSObject+Baz',
                  canForwardDeclare: 'false',
                },
              },
              {
                properties: {
                  name: 'Scumbag',
                  library: 'Steve',
                },
              },
            ],
          },
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
                referencedGenericTypes: [],
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
                referencedGenericTypes: [],
              },
            },
          ],
          comments: [],
          typeLookups: [
            {
              name: 'Foo',
              library: 'Bar',
              file: 'NSObject+Baz',
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
          libraryName: 'RMSomethingLibrary',
        };
        const expectedResult: Either.Either<
          Error.Error[],
          ObjectSpec.Type
        > = Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
        expect(actualResult).toEqualJSON(expectedResult);
      },
    );

    it('parses a value object with two properties with nullability', function() {
      const valueFileContents =
        '%library name=RMSomethingLibrary\n' +
        'RMSomething {\n' +
        '  %nullable\n' +
        '  RMBlah *someBlah\n' +
        '  %nonnull\n' +
        '  RMBlah *someValue\n' +
        '}';
      const actualResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = ObjectSpecParser.parse(valueFileContents);
      const expectedFoundType: ObjectSpec.Type = {
        annotations: {
          library: [
            {
              properties: {
                name: 'RMSomethingLibrary',
              },
            },
          ],
        },
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
              referencedGenericTypes: [],
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
              referencedGenericTypes: [],
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomethingLibrary',
      };
      const expectedResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object with properties with generics', function() {
      const valueFileContents =
        '%library name=RMSomethingLibrary\n' +
        'RMSomething {\n' +
        '  NSEvolvedDictionary<BOOL, NSFoo *, NSBar *, NSInteger> *multiple\n' +
        '  NSArray<NSDictionary<NSArray<NSString *>, NSString *> *> *nested\n' +
        '  NSDictionary<id<FooProtocol>, NSArray<id<BarProtocol>> *> *protocols\n' +
        '  CKAction<NSDictionary<NSArray<NSString *> *, id<FooProtocol>> *> ckAction\n' +
        '}';
      const actualResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = ObjectSpecParser.parse(valueFileContents);
      const expectedFoundType: ObjectSpec.Type = {
        annotations: {
          library: [
            {
              properties: {
                name: 'RMSomethingLibrary',
              },
            },
          ],
        },
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
              referencedGenericTypes: [
                {
                  name: 'BOOL',
                  conformingProtocol: null,
                  referencedGenericTypes: [],
                },
                {
                  name: 'NSFoo',
                  conformingProtocol: null,
                  referencedGenericTypes: [],
                },
                {
                  name: 'NSBar',
                  conformingProtocol: null,
                  referencedGenericTypes: [],
                },
                {
                  name: 'NSInteger',
                  conformingProtocol: null,
                  referencedGenericTypes: [],
                },
              ],
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
              referencedGenericTypes: [
                {
                  name: 'NSDictionary',
                  conformingProtocol: null,
                  referencedGenericTypes: [
                    {
                      name: 'NSArray',
                      conformingProtocol: null,
                      referencedGenericTypes: [
                        {
                          name: 'NSString',
                          conformingProtocol: null,
                          referencedGenericTypes: [],
                        },
                      ],
                    },
                    {
                      name: 'NSString',
                      conformingProtocol: null,
                      referencedGenericTypes: [],
                    },
                  ],
                },
              ],
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
              referencedGenericTypes: [
                {
                  name: 'id',
                  conformingProtocol: 'FooProtocol',
                  referencedGenericTypes: [],
                },
                {
                  name: 'NSArray',
                  conformingProtocol: null,
                  referencedGenericTypes: [
                    {
                      name: 'id',
                      conformingProtocol: 'BarProtocol',
                      referencedGenericTypes: [],
                    },
                  ],
                },
              ],
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
              referencedGenericTypes: [
                {
                  name: 'NSDictionary',
                  conformingProtocol: null,
                  referencedGenericTypes: [
                    {
                      name: 'NSArray',
                      conformingProtocol: null,
                      referencedGenericTypes: [
                        {
                          name: 'NSString',
                          conformingProtocol: null,
                          referencedGenericTypes: [],
                        },
                      ],
                    },
                    {
                      name: 'id',
                      conformingProtocol: 'FooProtocol',
                      referencedGenericTypes: [],
                    },
                  ],
                },
              ],
            },
          },
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomethingLibrary',
      };
      const expectedResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object with a generic type with no parameters', function() {
      const valueFileContents = 'RMSomething {\n  FBFoo<> *foo\n}';
      const actualResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = ObjectSpecParser.parse(valueFileContents);
      const expectedFoundType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'foo',
            nullability: ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn: null,
              libraryTypeIsDefinedIn: null,
              name: 'FBFoo',
              reference: 'FBFoo<>*',
              underlyingType: 'NSObject',
              conformingProtocol: null,
              referencedGenericTypes: [],
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
      const expectedResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object which is invalid', function() {
      const valueFileContents = 'RMSomething {{}';
      const actualResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = ObjectSpecParser.parse(valueFileContents);
      const expectedResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = Either.Left<Error.Error[], ObjectSpec.Type>([
        Error.Error('(line 1, column 14) expected string matching {}}'),
      ]);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses an empty and valid value object', function() {
      const valueFileContents = 'RMSomething {}';
      const actualResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = ObjectSpecParser.parse(valueFileContents);
      const expectedResult: Either.Either<
        Error.Error[],
        ObjectSpec.Type
      > = Either.Right<Error.Error[], ObjectSpec.Type>({
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: null,
      });

      expect(actualResult).toEqualJSON(expectedResult);
    });
  });
});
