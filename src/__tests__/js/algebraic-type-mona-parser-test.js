/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const parser = require('object-mona-parser');

describe('albegraicTypeParser', function() {
  it('parses a basic algebraic type', function() {
    const valueFileContents = 'RMSomething { RMOption { uint64_t someUnsignedInt } }';
    const actualValueObject = parser.parseAlgebraicType(valueFileContents);
    const expectedValueObject = {
      errorReason: null,
      isValid: true,
      type: {
        typeName: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        annotations: {},
        subtypes: [
        {
          namedCollectionValue:
          {
            typeName: 'RMOption',
            comments: [],
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
        }
        ]
      }
    };
    expect(actualValueObject).toEqualJSON(expectedValueObject);
  });

  it('parses an algebraic type with two sub-types', function() {
    const valueFileContents = 'RMSomething{ RMOptionA { uint64_t someUnsignedInt }, RMOptionB { uint64_t someUnsignedInt } }';
    const actualValueObject = parser.parseAlgebraicType(valueFileContents);
    const expectedValueObject = {
      errorReason: null,
      isValid: true,
      type: {
        typeName: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        annotations: {},
        subtypes: [
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionA',
            comments: [],
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
        },
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionB',
            comments: [],
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
        }
        ]
      }
    };
    expect(actualValueObject).toEqualJSON(expectedValueObject);
  });

  it('parses an algebraic type with two sub-types separated by a newline', function() {
    const valueFileContents = 'RMSomething{ RMOptionA { uint64_t someUnsignedInt }\n RMOptionB { uint64_t someUnsignedInt } }';
    const actualValueObject = parser.parseAlgebraicType(valueFileContents);
    const expectedValueObject = {
      errorReason: null,
      isValid: true,
      type: {
        typeName: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        annotations: {},
        subtypes: [
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionA',
            comments: [],
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
        },
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionB',
            comments: [],
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
        }
        ]
      }
    };
    expect(actualValueObject).toEqualJSON(expectedValueObject);
  });

  it('parses an algebraic type with three sub-types with one being empty followed by a comma', function() {
    const valueFileContents = 'RMSomething{ RMOptionA { uint64_t someUnsignedInt }, RMOptionB, RMOptionC { uint64_t someUnsignedInt } }';
    const actualValueObject = parser.parseAlgebraicType(valueFileContents);
    const expectedValueObject = {
      errorReason: null,
      isValid: true,
      type: {
        typeName: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        annotations: {},
        subtypes: [
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionA',
            comments: [],
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
        },
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionB',
            comments: [],
            annotations: {},
            attributes: []
          }
        },
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionC',
            comments: [],
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
        }
        ]
      }
    };
    expect(actualValueObject).toEqualJSON(expectedValueObject);
  });

  it('parses an algebraic type with three sub-types with one being empty followed by a new line', function() {
    const valueFileContents = 'RMSomething{ RMOptionA { uint64_t someUnsignedInt }, RMOptionB\n RMOptionC { uint64_t someUnsignedInt } }';
    const actualValueObject = parser.parseAlgebraicType(valueFileContents);
    const expectedValueObject = {
      errorReason: null,
      isValid: true,
      type: {
        typeName: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        annotations: {},
        subtypes: [
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionA',
            comments: [],
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
        },
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionB',
            comments: [],
            annotations: {},
            attributes: []
          }
        },
        {
          namedCollectionValue:
          {
            typeName: 'RMOptionC',
            comments: [],
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
        }
        ]
      }
    };
    expect(actualValueObject).toEqualJSON(expectedValueObject);
  });

  it('parses comments for a sub value type of an algebraic type', function() {
    const valueFileContents = 'RMSomething{ ' +
    '\n  # First line\n' +
    '# Second line\n' +
    'RMOption { uint64_t someUnsignedInt } }';
    const actualValueObject = parser.parseAlgebraicType(valueFileContents);
    const expectedValueObject = {
      errorReason: null,
      isValid: true,
      type: {
        typeName: 'RMSomething',
        comments: [],
        includes: [],
        excludes: [],
        annotations: {},
        subtypes: [
        {
          namedCollectionValue:
          {
            typeName: 'RMOption',
            comments: [' First line', ' Second line'],
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
        }
        ]
      }
    };
    expect(actualValueObject).toEqualJSON(expectedValueObject);
  });

  it('parses an algebraic value with a library name annotation', function() {
    const valueFileContents = '%library name=RMSomethingLibrary\n'+
    'RMSomething { RMOption { uint64_t someUnsignedInt } }';
    const actualValueObject = parser.parseAlgebraicType(valueFileContents);
    const expectedValueObject = {
      errorReason: null,
      isValid: true,
      type: {
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
        subtypes: [
        {
          namedCollectionValue:
          {
            typeName: 'RMOption',
            comments: [],
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
        }
        ]
      }
    };
    expect(actualValueObject).toEqualJSON(expectedValueObject);
  });

  describe('singleAttributeType', function() {
    it('parses a basic algebraic type with single attribute subtype', function() {
      const valueFileContents = 'RMSomething { %singleAttributeSubtype attributeType=uint64_t someUnsignedInt }';
      const actualValueObject = parser.parseAlgebraicType(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        type: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          subtypes: [
          {
            attributeValue:
            {
              name: 'someUnsignedInt',
              type: {
                reference: 'uint64_t',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a basic algebraic type with single attribute subtype that has comments', function() {
      const valueFileContents = 'RMSomething {' +
      '\n  # First line\n' +
      '# Second line\n' +
      '%singleAttributeSubtype attributeType=' +
      'uint64_t someUnsignedInt }';
      const actualValueObject = parser.parseAlgebraicType(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        type: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          subtypes: [
          {
            attributeValue:
            {
              name: 'someUnsignedInt',
              type: {
                reference: 'uint64_t',
                underlyingType: undefined,
              },
              comments: [' First line', ' Second line'],
              annotations: {}
            }
          }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a basic algebraic type with single attribute subtype that follows a named attribute collection subtype ', function() {
      const valueFileContents = 'RMSomething { RMOption { uint64_t someUnsignedInt } %singleAttributeSubtype attributeType=uint64_t someUnsignedInt }';
      const actualValueObject = parser.parseAlgebraicType(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        type: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          subtypes: [
          {
            namedCollectionValue:
            {
              typeName: 'RMOption',
              comments: [],
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
          },
          {
            attributeValue:
            {
              name: 'someUnsignedInt',
              type: {
                reference: 'uint64_t',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a basic algebraic type with single attribute subtype that is in quotes', function() {
      const valueFileContents = 'RMSomething { %singleAttributeSubtype attributeType="uint64_t" someUnsignedInt }';
      const actualValueObject = parser.parseAlgebraicType(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        type: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          subtypes: [
          {
            attributeValue:
            {
              name: 'someUnsignedInt',
              type: {
                reference: 'uint64_t',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });

    it('parses a basic algebraic type with single attribute subtype that is in quotes and is a pointer type', function() {
      const valueFileContents = 'RMSomething { %singleAttributeSubtype attributeType="RMOptionType *" option }';
      const actualValueObject = parser.parseAlgebraicType(valueFileContents);
      const expectedValueObject = {
        errorReason: null,
        isValid: true,
        type: {
          typeName: 'RMSomething',
          comments: [],
          includes: [],
          excludes: [],
          annotations: {},
          subtypes: [
          {
            attributeValue:
            {
              name: 'option',
              type: {
                reference: 'RMOptionType*',
                underlyingType: undefined,
              },
              comments: [],
              annotations: {}
            }
          }
          ]
        }
      };
      expect(actualValueObject).toEqualJSON(expectedValueObject);
    });
  })
});
