/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import Either = require('../either');
import Error = require('../error');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjectSpec = require('../object-spec');
import ObjectSpecParser = require('../object-spec-parser');

describe('ObjectSpecParser', function() {
  describe('#parse', function() {
    it('parses a value object with two properties that are valid', function() {
      const valueFileContents = 'RMSomething {\n' +
                                'NSArray *someArray\n '+
                                'BOOL someBoolean\n' +
                              '}';
      const actualResult:Either.Either<Error.Error[], ObjectSpec.Type> = ObjectSpecParser.parse(valueFileContents);
      const expectedFoundType:ObjectSpec.Type = {
        annotations: {},
        attributes: [
          {
            annotations: {},
            comments: [],
            name: 'someArray',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name:'NSArray',
              reference: 'NSArray*',
              underlyingType:Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someBoolean',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name:'BOOL',
              reference: 'BOOL',
              underlyingType:Maybe.Nothing<string>(),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: Maybe.Nothing<string>()
      };
      const expectedResult:Either.Either<Error.Error[], ObjectSpec.Type> = Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object with two properties and lots of custom ' +
       'information that is valid', function() {
      const valueFileContents = '%library name=RMSomethingLibrary\n' +
                              '%type name=Foo library=Bar file=NSObject+Baz canForwardDeclare=false\n' +
                              '%type name=Scumbag library=Steve\n' +
                              'RMSomething {\n' +
                              '  %import file=RMSomeOtherFile library=RMCustomLibrary\n' +
                              '  RMBlah *someBlah\n' +
                              '  RMSomeValue(BOOL) someValue\n' +
                              '}';
      const actualResult:Either.Either<Error.Error[], ObjectSpec.Type> = ObjectSpecParser.parse(valueFileContents);
      const expectedFoundType:ObjectSpec.Type = {
        annotations: {
          library: [{
            properties: {
              name: 'RMSomethingLibrary'
            }
          }],
          type: [{
            properties: {
              name: 'Foo',
              library: 'Bar',
              file: 'NSObject+Baz',
              canForwardDeclare: 'false'
            }
          },
          {
            properties: {
              name: 'Scumbag',
              library: 'Steve'
            }
          }]
        },
        attributes: [
          {
            annotations: {
              import: [{
                properties: {
                  file: 'RMSomeOtherFile',
                  library: 'RMCustomLibrary'
                }
              }]
            },
            comments: [],
            name: 'someBlah',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Just('RMSomeOtherFile'),
              libraryTypeIsDefinedIn:Maybe.Just('RMCustomLibrary'),
              name:'RMBlah',
              reference: 'RMBlah*',
              underlyingType:Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {},
            comments: [],
            name: 'someValue',
            nullability:ObjC.Nullability.Inherited(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name:'RMSomeValue',
              reference: 'RMSomeValue',
              underlyingType:Maybe.Just('BOOL'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        typeLookups:[
          {
            name:'Foo',
            library:Maybe.Just<string>('Bar'),
            file:Maybe.Just<string>('NSObject+Baz'),
            canForwardDeclare: false,
          },
          {
            name:'Scumbag',
            library:Maybe.Just<string>('Steve'),
            file:Maybe.Nothing<string>(),
            canForwardDeclare: true,
          }
        ],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: Maybe.Just('RMSomethingLibrary')
      };
      const expectedResult:Either.Either<Error.Error[], ObjectSpec.Type> = Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object with two properties with nullability', function() {
      const valueFileContents = '%library name=RMSomethingLibrary\n' +
                              'RMSomething {\n' +
                              '  %nullable\n' +
                              '  RMBlah *someBlah\n' +
                              '  %nonnull\n' +
                              '  RMBlah *someValue\n' +
                              '}';
      const actualResult:Either.Either<Error.Error[], ObjectSpec.Type> = ObjectSpecParser.parse(valueFileContents);
      const expectedFoundType:ObjectSpec.Type = {
        annotations: {
          library: [{
            properties: {
              name: 'RMSomethingLibrary'
            }
          }]
        },
        attributes: [
          {
            annotations: {
              nullable: [{
                properties: {}
              }]
            },
            comments: [],
            name: 'someBlah',
            nullability:ObjC.Nullability.Nullable(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name:'RMBlah',
              reference: 'RMBlah*',
              underlyingType:Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          },
          {
            annotations: {
              nonnull: [{
                properties: {}
              }]
            },
            comments: [],
            name: 'someValue',
            nullability:ObjC.Nullability.Nonnull(),
            type: {
              fileTypeIsDefinedIn:Maybe.Nothing<string>(),
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              name:'RMBlah',
              reference: 'RMBlah*',
              underlyingType:Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          }
        ],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: [],
        typeName: 'RMSomething',
        libraryName: Maybe.Just('RMSomethingLibrary')
      };
      const expectedResult:Either.Either<Error.Error[], ObjectSpec.Type> = Either.Right<Error.Error[], ObjectSpec.Type>(expectedFoundType);
      expect(actualResult).toEqualJSON(expectedResult);
    });

    it('parses a value object which is invalid', function() {
      const valueFileContents = 'RMSomething {{}';
      const actualResult:Either.Either<Error.Error[], ObjectSpec.Type> = ObjectSpecParser.parse(valueFileContents);
      const expectedResult:Either.Either<Error.Error[], ObjectSpec.Type> = Either.Left<Error.Error[], ObjectSpec.Type>(
                            [Error.Error('(line 1, column 14) expected string matching {}}')]);
      expect(actualResult).toEqualJSON(expectedResult);
    });
  });
});
