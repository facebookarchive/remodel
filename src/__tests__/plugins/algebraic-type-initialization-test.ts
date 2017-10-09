/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

///<reference path='../../type-defs/jasmine.d.ts'/>
///<reference path='../../type-defs/jasmine-test-additions.d.ts'/>

import AlgebraicType = require('../../algebraic-type');
import AlgebraicTypeInitialization = require('../../plugins/algebraic-type-initialization');
import Code = require('../../code');
import Error = require('../../error');
import Maybe = require('../../maybe');
import ObjC = require('../../objc');

const AlgebraicTypePlugin = AlgebraicTypeInitialization.createAlgebraicTypePlugin();

describe('AlgebraicTypePlugins.AlgebraicTypeInitialization', function() {
  describe('#imports', function() {
    it('includes a public import for Foundation/Foundation.h', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'ASubType',
            comments: [],
            attributes: []
          })
        ]
      };

      const imports:ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImport:ObjC.Import = {
        library:Maybe.Just<string>('Foundation'),
        file:'Foundation.h',
        isPublic:true
      };
      expect(imports).toContain(expectedImport);
    });

    it('includes a private import for its own header', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'ASubType',
            comments: [],
            attributes: []
          })
        ]
      };

      const imports:ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImport:ObjC.Import = {
        library:Maybe.Nothing<string>(),
        file:'Foo.h',
        isPublic:false
      };
      expect(imports).toContain(expectedImport);
    });

    it('does not include a public import for its own type when it is included ' +
       'in a type lookup', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: [],
        excludes: [],
        typeLookups:[
          {
            name: 'Foo',
            library: Maybe.Nothing<string>(),
            file: Maybe.Nothing<string>(),
            canForwardDeclare: true
          }
        ],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'ASubType',
            comments: [],
            attributes: []
          })
        ]
      };

      const imports:ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImport:ObjC.Import = {
        library:Maybe.Nothing<string>(),
        file:'Foo.h',
        isPublic:true
      };
      expect(imports).not.toContain(expectedImport);
    });

    it('includes the public imports for some of its attributes', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someFoo',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someBool',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'BOOL',
                  reference: 'BOOL',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Just('SomeLib'),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const imports:ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImports:ObjC.Import[] = [
        {
          library:Maybe.Just<string>('Foundation'),
          file:'Foundation.h',
          isPublic:true
        },
        {
          library:Maybe.Nothing<string>(),
          file:'Test.h',
          isPublic:false
        },
        {
          library:Maybe.Nothing<string>(),
          file:'Foo.h',
          isPublic:true
        },
        {
          library:Maybe.Just<string>('SomeLib'),
          file:'SingleAttributeType.h',
          isPublic:true
        }
      ];
      expect(imports).toEqualJSON(expectedImports);
    });

    it('includes for an attribute that is an NSObject but does not have a ' +
       'specified library and the algebraic type is in a library', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Just<string>('RMSomeLibrary'),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'someFoo',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'Foo',
              reference: 'Foo *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const imports:ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImport:ObjC.Import = {
        library:Maybe.Just<string>('RMSomeLibrary'),
        file:'Foo.h',
        isPublic:true
      };
      expect(imports).toContain(expectedImport);
    });
  });

  describe('#classMethods', function() {
    it('returns a single class method when there is one subtype ' +
       'with no attributes', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'SomeSubtype',
            comments: [],
            attributes: []
          })
        ]
      };

      const classMethods:ObjC.Method[] = AlgebraicTypePlugin.classMethods(algebraicType);
      const expectedClassMethods:ObjC.Method[] = [
        {
          belongsToProtocol:Maybe.Nothing<string>(),
          code: [
            'Foo *object = [[Foo alloc] init];',
            'object->_subtype = _FooSubtypesSomeSubtype;',
            'return object;'
          ],
          comments: [],
          compilerAttributes:[],
          keywords: [
            {
              name: 'someSubtype',
              argument: Maybe.Nothing<ObjC.KeywordArgument>()
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'instancetype',
            reference: 'instancetype'
          }), modifiers:[] }
        }
      ];
      expect(classMethods).toEqualJSON(expectedClassMethods);
    });

    it('returns two class methods when there are two subtypes ' +
       'with some attributes', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const classMethods:ObjC.Method[] = AlgebraicTypePlugin.classMethods(algebraicType);
      const expectedClassMethods:ObjC.Method[] = [
        {
          belongsToProtocol:Maybe.Nothing<string>(),
          code: [
            'Test *object = [[Test alloc] init];',
            'object->_subtype = _TestSubtypesSomeSubtype;',
            'object->_someSubtype_someString = someString;',
            'object->_someSubtype_someUnsignedInteger = someUnsignedInteger;',
            'return object;'
          ],
          comments: [],
          compilerAttributes:[],
          keywords: [
            {
              name: 'someSubtypeWithSomeString',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'someString',
                modifiers: [],
                type: {
                  name: 'NSString',
                  reference: 'NSString *'
                }
              })
            },
            {
              name: 'someUnsignedInteger',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'someUnsignedInteger',
                modifiers: [],
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger'
                }
              })
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'instancetype',
            reference: 'instancetype'
          }), modifiers:[] }
        },
        {
          belongsToProtocol:Maybe.Nothing<string>(),
          code: [
            'Test *object = [[Test alloc] init];',
            'object->_subtype = _TestSubtypesSingleAttributeSubtype;',
            'object->_singleAttributeSubtype = singleAttributeSubtype;',
            'return object;'
          ],
          comments: [],
          compilerAttributes:[],
          keywords: [
            {
              name: 'singleAttributeSubtype',
              argument: Maybe.Just<ObjC.KeywordArgument>({
                name: 'singleAttributeSubtype',
                modifiers: [],
                type: {
                  name: 'SingleAttributeType',
                  reference: 'SingleAttributeType *'
                }
              })
            }
          ],
          returnType:{ type:Maybe.Just<ObjC.Type>({
            name: 'instancetype',
            reference: 'instancetype'
          }), modifiers:[] }
        }
      ];
      expect(classMethods).toEqualJSON(expectedClassMethods);
    });
  });

  describe('#internalProperties', function() {
    it('returns internal properties for storing the subtypes attributes as well ' +
       'as the type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const internalProperties:ObjC.Property[] = AlgebraicTypePlugin.internalProperties(algebraicType);
      const expectedInternalProperties:ObjC.Property[] = [
        {
          comments:[],
          name:'subtype',
          returnType: {
            name:'_TestSubtypes',
            reference: '_TestSubtypes'
          },
          modifiers:[],
          access: ObjC.PropertyAccess.Private()
        },
        {
          comments:[],
          name:'someSubtype_someString',
          returnType: {
            name:'NSString',
            reference: 'NSString *'
          },
          modifiers:[],
          access: ObjC.PropertyAccess.Private()
        },
        {
          comments:[],
          name:'someSubtype_someUnsignedInteger',
          returnType: {
            name:'NSUInteger',
            reference: 'NSUInteger'
          },
          modifiers:[],
          access: ObjC.PropertyAccess.Private()
        },
        {
          comments: [],
          name:'singleAttributeSubtype',
          returnType: {
            name:'SingleAttributeType',
            reference: 'SingleAttributeType *'
          },
          modifiers:[],
          access: ObjC.PropertyAccess.Private()
        }
      ];
      expect(internalProperties).toEqualJSON(expectedInternalProperties);
    });
  });

  describe('#enumerations', function() {
    it('returns an enumeration for its subtypes', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someString',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSString',
                  reference: 'NSString *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Just<string>('NSObject'),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              },
              {
                annotations: {},
                name: 'someUnsignedInteger',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'NSUInteger',
                  reference: 'NSUInteger',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'singleAttributeSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'SingleAttributeType',
              reference: 'SingleAttributeType *',
              libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType: Maybe.Just<string>('NSObject'),
              conformingProtocol: Maybe.Nothing<string>()
            }
          })
        ]
      };

      const enumerations = AlgebraicTypePlugin.enumerations(algebraicType);

      const expectedEnumeration:ObjC.Enumeration = {
        name: '_FooSubtypes',
        underlyingType: 'NSUInteger',
        values: ['_FooSubtypesSomeSubtype', '_FooSubtypesSingleAttributeSubtype'],
        isPublic: false,
        comments: []
      };

      expect(enumerations).toContain(expectedEnumeration);
    });
  });

  describe('#validationErrors', function() {
    it('returns no validation errors when there are no attributes on the provided subtypes', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'ASubType',
            comments: [],
            attributes: []
          }),
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
            name: 'AnotherSubtype',
            comments: [],
            attributes: []
          })
        ]
      };

      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      expect(errors).toEqualJSON([]);
    });

    it('returns a validation error when there are two subtypes with the same name', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someFoo',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
          {
            name: 'SomeSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'anotherFoo',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Foo',
                  reference: 'Foo *',
                  libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                  fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                  underlyingType: Maybe.Nothing<string>(),
                  conformingProtocol: Maybe.Nothing<string>()
                }
              }
            ]
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('Algebraic types cannot have two subtypes with the same name, but found two or more subtypes with the name SomeSubtype')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when there are two single attribute subtypes with the same name', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
        AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
        {
          annotations: {},
          name: 'singleAttributeSubtype',
          comments: [],
          nullability:ObjC.Nullability.Inherited(),
          type: {
            name: 'SingleAttributeType',
            reference: 'SingleAttributeType *',
            libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
            fileTypeIsDefinedIn: Maybe.Nothing<string>(),
            underlyingType: Maybe.Just<string>('NSObject'),
            conformingProtocol: Maybe.Nothing<string>()
          }
        }),
        AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
        {
          annotations: {},
          name: 'singleAttributeSubtype',
          comments: [],
          nullability:ObjC.Nullability.Inherited(),
          type: {
            name: 'SingleAttributeType',
            reference: 'SingleAttributeType *',
            libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
            fileTypeIsDefinedIn: Maybe.Nothing<string>(),
            underlyingType: Maybe.Just<string>('NSObject'),
            conformingProtocol: Maybe.Nothing<string>()
          }
        })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('Algebraic types cannot have two subtypes with the same name, but found two or more subtypes with the name SingleAttributeSubtype')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });

    it('returns a validation error when one single attribute subtype and one named subtype have same name', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
        AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
        {
          name: 'SomeSubtype',
          comments: [],
          attributes: [
            {
              annotations: {},
              name: 'someFoo',
              comments: [],
              nullability:ObjC.Nullability.Inherited(),
              type: {
                name: 'Foo',
                reference: 'Foo *',
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                underlyingType: Maybe.Nothing<string>(),
                conformingProtocol: Maybe.Nothing<string>()
              }
            }
          ]
        }),
        AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
        {
          annotations: {},
          name: 'someSubtype',
          comments: [],
          nullability:ObjC.Nullability.Inherited(),
          type: {
            name: 'NSString',
            reference: 'NSString *',
            libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
            fileTypeIsDefinedIn: Maybe.Nothing<string>(),
            underlyingType: Maybe.Nothing<string>(),
            conformingProtocol: Maybe.Nothing<string>()
          }
        })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('Algebraic types cannot have two subtypes with the same name, but found two or more subtypes with the name SomeSubtype')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });

  describe('#forwardDeclarations', function() {
    it('returns a forward declaration when the same type being generated ' +
       'is being used as an attribute type', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
        AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
        {
          name: 'SomeSubtype',
          comments: [],
          attributes: [
            {
              annotations: {},
              name: 'someFoo',
              comments: [],
              nullability:ObjC.Nullability.Inherited(),
              type: {
                name: 'Test',
                reference: 'Test *',
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                underlyingType: Maybe.Nothing<string>(),
                conformingProtocol: Maybe.Nothing<string>()
              }
            }
          ]
        })
        ]
      };
      const forwardDeclarations:ObjC.ForwardDeclaration[] = AlgebraicTypePlugin.forwardDeclarations(algebraicType);
      const expectedForwardDeclarations:ObjC.ForwardDeclaration[] = [
        ObjC.ForwardDeclaration.ForwardClassDeclaration('Test')
      ];
      expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
    });

    it('returns a forward declaration when the same type being generated ' +
       'is being used in a type lookup', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[
          {
            name: 'Test',
            library: Maybe.Nothing<string>(),
            file: Maybe.Nothing<string>(),
            canForwardDeclare: true
          }
        ],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
        AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
        {
          name: 'SomeSubtype',
          comments: [],
          attributes: [
            {
              annotations: {},
              name: 'someFoo',
              comments: [],
              nullability:ObjC.Nullability.Inherited(),
              type: {
                name: 'Foo',
                reference: 'Foo *',
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                underlyingType: Maybe.Nothing<string>(),
                conformingProtocol: Maybe.Nothing<string>()
              }
            }
          ]
        })
        ]
      };
      const forwardDeclarations:ObjC.ForwardDeclaration[] = AlgebraicTypePlugin.forwardDeclarations(algebraicType);
      const expectedForwardDeclarations:ObjC.ForwardDeclaration[] = [
        ObjC.ForwardDeclaration.ForwardClassDeclaration('Test')
      ];
      expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
    });

    it('returns no forward declarations when the same type being generated ' +
       'is not being referenced in a subtype', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Test',
        includes: [],
        excludes: [],
        typeLookups:[],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [
        AlgebraicType.Subtype.NamedAttributeCollectionDefinition(
        {
          name: 'SomeSubtype',
          comments: [],
          attributes: [
            {
              annotations: {},
              name: 'someFoo',
              comments: [],
              nullability:ObjC.Nullability.Inherited(),
              type: {
                name: 'AnotherTest',
                reference: 'AnotherTest *',
                libraryTypeIsDefinedIn: Maybe.Nothing<string>(),
                fileTypeIsDefinedIn: Maybe.Nothing<string>(),
                underlyingType: Maybe.Nothing<string>(),
                conformingProtocol: Maybe.Nothing<string>()
              }
            }
          ]
        })
        ]
      };
      const forwardDeclarations:ObjC.ForwardDeclaration[] = AlgebraicTypePlugin.forwardDeclarations(algebraicType);
      const expectedForwardDeclarations:ObjC.ForwardDeclaration[] = [];
      expect(forwardDeclarations).toEqualJSON(expectedForwardDeclarations);
    });
  });
});
