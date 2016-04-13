/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const parser = require('object-mona-parser');

describe('ValueObjectMonaParser', function() {
  describe('#parse', function() {
    it('parses a uint64_t which has a numeric value and underscore in the type name', function() {
      const valueFileContents = 'RMSomething { uint64_t someUnsignedInt }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someUnsignedInt',
              type: {
                reference: 'uint64_t',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a variable name with an underscore', function() {
      const valueFileContents = 'RMSomething { uint64_t some_UnsignedInt }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'some_UnsignedInt',
              type: {
                reference: 'uint64_t',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with two properties one an NSArray and the other' +
       ' a BOOL', function() {
      const valueFileContents = 'RMSomething {\n NSArray *someArray\n BOOL someBoolean\n}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someArray',
              type: {
                reference: 'NSArray*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            },
            {
              name: 'someBoolean',
              type: {
                reference: 'BOOL',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {},
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with a single property that is an NSArray but ' +
       'has the pointer on the side of the type name', function() {
      const valueFileContents = 'RMSomething{NSArray* someArray }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someArray',
              type: {
                reference: 'NSArray*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with a single property that is a generic type', function() {
      const valueFileContents = 'RMSomething{NSDictionary<NSString *, NSArray *> *someArray }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someArray',
              type: {
                reference: 'NSDictionary<NSString *, NSArray *>*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with a single property that is an id', function() {
      const valueFileContents = 'RMSomething{ id someValue }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someValue',
              type: {
                reference: 'id',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with a single property that is an NSArray but ' +
       'has a semi-colon at the end of the definition', function() {
      const valueFileContents = 'RMSomething{NSArray* someArray; }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someArray',
              type: {
                reference: 'NSArray*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with a single property that is an NSArray but ' +
       'has no new lines and no spaces', function() {
      const valueFileContents = 'RMSomething{NSArray *someArray }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someArray',
              type: {
                reference: 'NSArray*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with two properties but no spaces', function() {
      const valueFileContents = 'RMSomething{NSArray *someArray BOOL someBoolean }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someArray',
              type: {
                reference: 'NSArray*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            },
            {
              name: 'someBoolean',
              type: {
                reference: 'BOOL',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with a single property that is a custom non-' +
       'object type', function() {
      const valueFileContents = 'RMSomething{ RMSomeEnum someEnum }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someEnum',
              type: {
                reference: 'RMSomeEnum',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with a single property that is a custom non-' +
       'object type with a backing type of BOOL', function() {
      const valueFileContents = 'RMSomething { RMSomeValue(BOOL) someValue }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someValue',
              type: {
                reference: 'RMSomeValue',
                underlyingType: 'BOOL',
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with a single property that is a custom non-' +
       'object type with a backing type of uintptr_t', function() {
      const valueFileContents = 'RMSomething { RMSomeValue(uintptr_t) someValue }';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someValue',
              type: {
                reference: 'RMSomeValue',
                underlyingType: 'uintptr_t',
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses comments for an empty type', function() {
      const valueFileContents = '\n  # First line\n' +
                              '# Second line\n' +
                              'RMSomething {}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [' First line', ' Second line'],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses comments for an empty type with symbols marks in them', function() {
      const valueFileContents = '\n  # "-}*^@#:;\n' +
                              '# Second line\n' +
                              'RMSomething {}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [' "-}*^@#:;', ' Second line'],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with two properties each of which have some ' +
       'comments', function() {
      const valueFileContents = 'RMSomething {\n' +
                              '  # First comment line 1\n' +
                              '  # First comment line 2\n' +
                              '  NSArray *someArray\n' +
                              '  # Second comment line 1\n' +
                              '  # Second comment line 2\n' +
                              '  BOOL someBoolean\n' +
                              '}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'someArray',
              type: {
                reference: 'NSArray*',
                underlyingType: undefined,
              },
              comments: [' First comment line 1', ' First comment line 2'],
              annotations: {}
            },
            {
              name: 'someBoolean',
              type: {
                reference: 'BOOL',
                underlyingType: undefined,
              },
              comments: [' Second comment line 1', ' Second comment line 2'],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with an attribute with an annotation for ' +
       'importing from a different file', function() {
      const valueFileContents = 'RMSomething {\n' +
                              '  %import file=RMSomeOtherFile\n' +
                              '  RMLibType *customLibObject\n' +
                              '}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'customLibObject',
              type: {
                reference: 'RMLibType*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {
                import: [
                  {
                    file: 'RMSomeOtherFile'
                  }
                ]
              }
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with an attribute with an annotation for ' +
       'importing from a different library', function() {
      const valueFileContents = 'RMSomething {\n' +
                              '  %import library=RMCustomLibrary\n' +
                              '  RMLibType *customLibObject\n' +
                              '}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'customLibObject',
              type: {
                reference: 'RMLibType*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {
                import: [
                  {
                    library: 'RMCustomLibrary'
                  }
                ]
              }
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with an attribute with an annotation for ' +
       'importing from a different library and file location', function() {
      const valueFileContents = 'RMSomething {\n' +
                              '  %import library=RMCustomLibrary file=RMSomeOtherFile\n' +
                              '  RMLibType *customLibObject\n' +
                              '}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'customLibObject',
              type: {
                reference: 'RMLibType*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {
                import: [
                  {
                    library: 'RMCustomLibrary',
                    file: 'RMSomeOtherFile'
                  }
                ]
              }
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with an attribute with an annotation for ' +
       'importing from a different library and file location where that file ' +
       'location starts with an underscore', function() {
      const valueFileContents = 'RMSomething {\n' +
                              '  %import library=RMCustomLibrary file=_RMSomeOtherFile\n' +
                              '  RMLibType *customLibObject\n' +
                              '}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'customLibObject',
              type: {
                reference: 'RMLibType*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {
                import: [
                  {
                    library: 'RMCustomLibrary',
                    file: '_RMSomeOtherFile'
                  }
                ]
              }
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with an attribute with an annotation for ' +
       'importing from a different library and file location and a comment ' +
       'all at the same time', function() {
      const valueFileContents = 'RMSomething {\n' +
                              '  # Some comment\n' +
                              '  %import library=RMCustomLibrary file=RMSomeOtherFile\n' +
                              '  RMLibType *customLibObject\n' +
                              '}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'customLibObject',
              type: {
                reference: 'RMLibType*',
                underlyingType: undefined,
              },
              comments: [' Some comment'],
              annotations: {
                import: [
                  {
                    library: 'RMCustomLibrary',
                    file: 'RMSomeOtherFile'
                  }
                ]
              }
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with an annotation specifying the library of the value class', function() {
      const valueFileContents = '%library name=RMSomethingLibrary\n' +
                              'RMSomething {\n' +
                              '  RMLibType *customLibObject\n' +
                              '}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {
            library: [
              {
                name: 'RMSomethingLibrary'
              }
            ]
          },
          attributes: [
            {
              name: 'customLibObject',
              type: {
                reference: 'RMLibType*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a value object with an annotation', function() {
      const valueFileContents = 'RMSomething {\n' +
                              '  %foo\n' +
                              '  RMLibType *customLibObject\n' +
                              '}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          attributes: [
            {
              name: 'customLibObject',
              type: {
                reference: 'RMLibType*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {
                'foo': [
                  {}
                ]
              }
            }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses an empty type which excludes builders', function() {
      const valueFileContents = 'RMSomething excludes(Builder) {}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          annotations: {},
          attributes: [],
          includes: [],
          excludes: ['Builder'],
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses an empty type which excludes builders and something', function() {
      const valueFileContents = 'RMSomething excludes(Builder, Something) {}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          annotations: {},
          attributes: [],
          includes: [],
          excludes: ['Builder', 'Something'],
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses an empty type which excludes builders and includes something else', function() {
      const valueFileContents = 'RMSomething includes(FetchStatus) excludes(Builder) {}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          annotations: {},
          attributes: [],
          includes: ['FetchStatus'],
          excludes: ['Builder']
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses an empty type which includes fetch status', function() {
      const valueFileContents = 'RMSomething includes(FetchStatus) {}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          annotations: {},
          attributes: [
          ],
          includes: ['FetchStatus'],
          excludes: []
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses an empty type which includes fetch status and something ' +
       'else', function() {
      const valueFileContents = 'RMSomething includes(FetchStatus, Coding) {}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          annotations: {},
          attributes: [
          ],
          includes: ['FetchStatus', 'Coding'],
          excludes: []
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses an empty type which includes fetch status and something ' +
       'else with no spaces', function() {
      const valueFileContents = 'RMSomething includes(FetchStatus,AnotherValue) {}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        foundType: {
          typeName: 'RMSomething',
          comments: [],
          annotations: {},
          attributes: [
          ],
          includes: ['FetchStatus', 'AnotherValue'],
          excludes: []
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('catches an error in parsing and reports it', function() {
      const valueFileContents = 'RMSomething {{}';
      const actualValueObject = parser.parseValueObject(valueFileContents);
      const expectedValueObject = {
        errorReason: '(line 1, column 14) expected string matching {}}',
        isValid: false,
        foundType:null
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });
  });
});
