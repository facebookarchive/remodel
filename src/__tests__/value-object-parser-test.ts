/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import * as CLangCommon from '../clang-common';
import * as Either from '../either';
import * as Error from '../error';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecHelpers from '../object-spec-helpers';
import * as ObjectSpecParser from '../object-spec-parser';

describe('ObjectSpecParser', function () {
  describe('#parse', function () {
    it('parses a value object with two properties that are valid', function () {
      const valueFileContents =
        'RMSomething {\n' +
        'NSArray *someArray\n ' +
        'BOOL someBoolean\n' +
        '}';
      const actualResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        ObjectSpecParser.parse(valueFileContents);
      const expectedFoundType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'someArray',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSArray',
              'NSArray*',
              'NSObject',
            ),
          ).asObject(),
          new ObjectSpecHelpers.AttributeBuilder(
            'someBoolean',
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
      const expectedResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it(
      'parses a value object with two properties and lots of custom ' +
        'information that is valid',
      function () {
        const valueFileContents =
          '%library name=RMSomethingLibrary\n' +
          '%type name=Foo library=Bar file=NSObject+Baz canForwardDeclare=false\n' +
          '%type name=Scumbag library=Steve\n' +
          'RMSomething {\n' +
          '  %import file=RMSomeOtherFile library=RMCustomLibrary\n' +
          '  RMBlah *someBlah\n' +
          '  RMSomeValue(BOOL) someValue\n' +
          '}';
        const actualResult: Either.Either<Error.Error[], ObjectSpec.Type> =
          ObjectSpecParser.parse(valueFileContents);
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
            new ObjectSpecHelpers.AttributeBuilder(
              'someBlah',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMBlah',
                'RMBlah*',
                'NSObject',
              )
                .withFileTypeIsDefinedIn('RMSomeOtherFile')
                .withLibraryTypeIsDefinedIn('RMCustomLibrary'),
            )
              .withAnnotations({
                import: [
                  {
                    properties: {
                      file: 'RMSomeOtherFile',
                      library: 'RMCustomLibrary',
                    },
                  },
                ],
              })
              .asObject(),
            new ObjectSpecHelpers.AttributeBuilder(
              'someValue',
              new ObjectSpecHelpers.AttributeTypeBuilder(
                'RMSomeValue',
                'RMSomeValue',
                'BOOL',
              ),
            ).asObject(),
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
        const expectedResult: Either.Either<Error.Error[], ObjectSpec.Type> =
          Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
        expect(actualResult).toEqualJSON(expectedResult);
      },
    );

    it('parses a value object with two properties with nullability', function () {
      const valueFileContents =
        '%library name=RMSomethingLibrary\n' +
        'RMSomething {\n' +
        '  %nullable\n' +
        '  RMBlah *someBlah\n' +
        '  %nonnull\n' +
        '  RMBlah *someValue\n' +
        '}';
      const actualResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        ObjectSpecParser.parse(valueFileContents);
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
          new ObjectSpecHelpers.AttributeBuilder(
            'someBlah',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'RMBlah',
              'RMBlah*',
              'NSObject',
            ),
          )
            .withAnnotations({
              nullable: [
                {
                  properties: {},
                },
              ],
            })
            .withNullability(CLangCommon.Nullability.Nullable())
            .asObject(),
          new ObjectSpecHelpers.AttributeBuilder(
            'someValue',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'RMBlah',
              'RMBlah*',
              'NSObject',
            ),
          )
            .withAnnotations({
              nonnull: [
                {
                  properties: {},
                },
              ],
            })
            .withNullability(CLangCommon.Nullability.Nonnull())
            .asObject(),
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomethingLibrary',
      };
      const expectedResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object with properties with generics', function () {
      const valueFileContents =
        '%library name=RMSomethingLibrary\n' +
        'RMSomething {\n' +
        '  NSEvolvedDictionary<BOOL, NSFoo *, NSBar *, NSInteger> *multiple\n' +
        '  NSArray<NSDictionary<NSArray<NSString *>, NSString *> *> *nested\n' +
        '  NSDictionary<id<FooProtocol>, NSArray<id<BarProtocol>> *> *protocols\n' +
        '  CKAction<NSDictionary<NSArray<NSString *> *, id<FooProtocol, BarProtocol>> *> ckAction\n' +
        '}';
      const actualResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        ObjectSpecParser.parse(valueFileContents);
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
          new ObjectSpecHelpers.AttributeBuilder(
            'multiple',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSEvolvedDictionary',
              'NSEvolvedDictionary<BOOL, NSFoo *, NSBar *, NSInteger>*',
              'NSObject',
            ).withReferencedGenericTypes([
              {
                name: 'BOOL',
                conformingProtocols: [],
                referencedGenericTypes: [],
              },
              {
                name: 'NSFoo',
                conformingProtocols: [],
                referencedGenericTypes: [],
              },
              {
                name: 'NSBar',
                conformingProtocols: [],
                referencedGenericTypes: [],
              },
              {
                name: 'NSInteger',
                conformingProtocols: [],
                referencedGenericTypes: [],
              },
            ]),
          ).asObject(),
          new ObjectSpecHelpers.AttributeBuilder(
            'nested',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSArray',
              'NSArray<NSDictionary<NSArray<NSString *>, NSString *> *>*',
              'NSObject',
            ).withReferencedGenericTypes([
              {
                name: 'NSDictionary',
                conformingProtocols: [],
                referencedGenericTypes: [
                  {
                    name: 'NSArray',
                    conformingProtocols: [],
                    referencedGenericTypes: [
                      {
                        name: 'NSString',
                        conformingProtocols: [],
                        referencedGenericTypes: [],
                      },
                    ],
                  },
                  {
                    name: 'NSString',
                    conformingProtocols: [],
                    referencedGenericTypes: [],
                  },
                ],
              },
            ]),
          ).asObject(),
          new ObjectSpecHelpers.AttributeBuilder(
            'protocols',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'NSDictionary',
              'NSDictionary<id<FooProtocol>, NSArray<id<BarProtocol>> *>*',
              'NSObject',
            ).withReferencedGenericTypes([
              {
                name: 'id',
                conformingProtocols: ['FooProtocol'],
                referencedGenericTypes: [],
              },
              {
                name: 'NSArray',
                conformingProtocols: [],
                referencedGenericTypes: [
                  {
                    name: 'id',
                    conformingProtocols: ['BarProtocol'],
                    referencedGenericTypes: [],
                  },
                ],
              },
            ]),
          ).asObject(),
          new ObjectSpecHelpers.AttributeBuilder(
            'ckAction',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'CKAction',
              'CKAction<NSDictionary<NSArray<NSString *> *, id<FooProtocol, BarProtocol>> *>',
              'NSObject',
            ).withReferencedGenericTypes([
              {
                name: 'NSDictionary',
                conformingProtocols: [],
                referencedGenericTypes: [
                  {
                    name: 'NSArray',
                    conformingProtocols: [],
                    referencedGenericTypes: [
                      {
                        name: 'NSString',
                        conformingProtocols: [],
                        referencedGenericTypes: [],
                      },
                    ],
                  },
                  {
                    name: 'id',
                    conformingProtocols: ['FooProtocol', 'BarProtocol'],
                    referencedGenericTypes: [],
                  },
                ],
              },
            ]),
          ).asObject(),
        ],
        comments: [],
        typeLookups: [],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: 'RMSomethingLibrary',
      };
      const expectedResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object with a generic type with no parameters', function () {
      const valueFileContents = 'RMSomething {\n  FBFoo<> *foo\n}';
      const actualResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        ObjectSpecParser.parse(valueFileContents);
      const expectedFoundType: ObjectSpec.Type = {
        annotations: {},
        attributes: [
          new ObjectSpecHelpers.AttributeBuilder(
            'foo',
            new ObjectSpecHelpers.AttributeTypeBuilder(
              'FBFoo',
              'FBFoo<>*',
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
      const expectedResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object which is invalid', function () {
      const valueFileContents = 'RMSomething {{}';
      const actualResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        ObjectSpecParser.parse(valueFileContents);
      const expectedResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        Either.Left<Error.Error[], ObjectSpec.Type>([
          Error.Error('(line 1, column 14) expected string matching {}}'),
        ]);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses an empty and valid value object', function () {
      const valueFileContents = 'RMSomething {}';
      const actualResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        ObjectSpecParser.parse(valueFileContents);
      const expectedResult: Either.Either<Error.Error[], ObjectSpec.Type> =
        Either.Right<Error.Error[], ObjectSpec.Type>({
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
