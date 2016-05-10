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
import Description = require('../../plugins/description');
import Error = require('../../error');
import Maybe = require('../../maybe');
import ObjC = require('../../objc');
import ValueObject = require('../../value-object');

const AlgebraicTypePlugin = Description.createAlgebraicTypePlugin();
const ValueObjectPlugin = Description.createPlugin();

describe('ValueObjectPlugins.Description', function() {
  describe('Value Object', function() {
    describe('#validationErrors', function() {
      it('returns no validation errors when there are no attributes on the found type', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };
        const errors:Error.Error[] = ValueObjectPlugin.validationErrors(valueType);
        expect(errors).toEqualJSON([]);
      });

      it('returns a validation error when there is an attribute with an unknown type', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'name',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'NSString',
                reference: 'NSString *',
                underlyingType:Maybe.Just<string>('NSObject')
              }
            },
            {
              annotations: {},
              comments: [],
              name: 'likeStatus',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'LikeStatus',
                reference: 'LikeStatus',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };
        const errors:Error.Error[] = ValueObjectPlugin.validationErrors(valueType);
        const expectedErrors:Error.Error[] = [
          Error.Error('The Description plugin does not know how to format the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?')
        ];
        expect(errors).toEqualJSON(expectedErrors);
      });

      it('returns two validation errors when there are two attributes with unknown types', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'name',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'Name',
                reference: 'Name',
                underlyingType:Maybe.Nothing<string>()
              }
            },
            {
              annotations: {},
              comments: [],
              name: 'likeStatus',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'LikeStatus',
                reference: 'LikeStatus',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };
        const errors:Error.Error[] = ValueObjectPlugin.validationErrors(valueType);
        const expectedErrors:Error.Error[] = [
          Error.Error('The Description plugin does not know how to format the type "Name" from Foo.name. Did you forget to declare a backing type?'),
          Error.Error('The Description plugin does not know how to format the type "LikeStatus" from Foo.likeStatus. Did you forget to declare a backing type?')
        ];
        expect(errors).toEqualJSON(expectedErrors);
      });

      it('returns a validation error when there is an attribute with an unknown underlying type', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'name',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'FooBar',
                reference: 'FooBar',
                underlyingType:Maybe.Just<string>('Baz')
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };
        const errors:Error.Error[] = ValueObjectPlugin.validationErrors(valueType);
        const expectedErrors:Error.Error[] = [
          Error.Error('The Description plugin does not know how to format the backing type "Baz" from Foo.name. Did you declare the wrong backing type?')
        ];
        expect(errors).toEqualJSON(expectedErrors);
      });
    });

    describe('#imports', function() {
      it('correctly finds imports for description functions that require them', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'rect',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'CGRect',
                reference: 'CGRect',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };
        const imports:ObjC.Import[] = ValueObjectPlugin.imports(valueType);
        const expectedImports:ObjC.Import[] = [{
          file:'UIGeometry.h',
          isPublic:false,
          library:Maybe.Just('UIKit')
        }];
        expect(imports).toEqualJSON(expectedImports);
      });
    });

    describe('#instanceMethods', function() {
      it('returns no instance methods when there are no attributes on the found type', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };
        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);
        expect(instanceMethods).toEqualJSON([]);
      });

      it('returns an instance method which will output a BOOL attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'doesUserLike',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'BOOL',
                reference: 'BOOL',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t doesUserLike: %@; \\n", [super description], _doesUserLike ? @"YES" : @"NO"];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSString* attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'name',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'NSString',
                reference: 'NSString *',
                underlyingType:Maybe.Just<string>('NSObject')
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t name: %@; \\n", [super description], _name];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an id attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'something',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'id',
                reference: 'id',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t something: %@; \\n", [super description], _something];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSInteger attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'NSInteger',
                reference: 'NSInteger',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %zd; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSUInteger attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'NSUInteger',
                reference: 'NSUInteger',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %tu; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a double attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'double',
                reference: 'double',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %lf; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a float attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'float',
                reference: 'float',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %f; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a CGFloat attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'CGFloat',
                reference: 'CGFloat',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %f; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSTimeInterval attribute when called', function() {
        const valueType:ValueObject.Type = {
        annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'NSTimeInterval',
                reference: 'NSTimeInterval',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %lf; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a uintptr_t attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'uintptr_t',
                reference: 'uintptr_t',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %ld; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an uint64_t attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'uint64_t',
                reference: 'uint64_t',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %llu; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an int32_t attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'int32_t',
                reference: 'int32_t',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %d; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an int64_t attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'int64_t',
                reference: 'int64_t',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %lld; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSUInteger attribute ' +
         'when called and the attribute type has an underlying type of NSUInteger', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'age',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'SomeEnum',
                reference: 'SomeEnum',
                underlyingType:Maybe.Just('NSUInteger')
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t age: %tu; \\n", [super description], _age];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a selector attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'action',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'SEL',
                reference: 'SEL',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t action: %@; \\n", [super description], NSStringFromSelector(_action)];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output an NSRange attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'range',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'NSRange',
                reference: 'NSRange',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t range: %@; \\n", [super description], NSStringFromRange(_range)];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a CGRect attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'rect',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'CGRect',
                reference: 'CGRect',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t rect: %@; \\n", [super description], NSStringFromCGRect(_rect)];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a CGPoint attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'origin',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'CGPoint',
                reference: 'CGPoint',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t origin: %@; \\n", [super description], NSStringFromCGPoint(_origin)];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a CGSize attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'size',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'CGSize',
                reference: 'CGSize',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };

        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t size: %@; \\n", [super description], NSStringFromCGSize(_size)];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });

      it('returns an instance method which will output a UIEdgeInsets attribute when called', function() {
        const valueType:ValueObject.Type = {
          annotations: {},
          attributes: [
            {
              annotations: {},
              comments: [],
              name: 'insets',
              nullability:ObjC.Nullability.Inherited(),
              type: {
                fileTypeIsDefinedIn:Maybe.Nothing<string>(),
                libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
                name: 'UIEdgeInsets',
                reference: 'UIEdgeInsets',
                underlyingType:Maybe.Nothing<string>()
              }
            }
          ],
          comments: [],
          excludes: [],
          includes: [],
          libraryName: Maybe.Nothing<string>(),
          typeLookups:[],
          typeName: 'Foo'
        };
        const instanceMethods:ObjC.Method[] = ValueObjectPlugin.instanceMethods(valueType);

        const expectedInstanceMethods:ObjC.Method[] = [
          {
            belongsToProtocol:Maybe.Just('NSObject'),
            code: [
              'return [NSString stringWithFormat:@"%@ - \\n\\t insets: %@; \\n", [super description], NSStringFromUIEdgeInsets(_insets)];'
            ],
            comments: [],
            keywords: [
              {
                name: 'description',
                argument: Maybe.Nothing<ObjC.KeywordArgument>()
              }
            ],
            returnType: Maybe.Just({
              name: 'NSString',
              reference: 'NSString *'
            })
          }
        ];

        expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
      });
    });
  });
});
describe('AlgebraicTypePlugins.Description', function() {
  describe('#imports', function() {
    it('correctly finds imports for description functions that require them', function() {
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
                  underlyingType: Maybe.Just<string>('NSObject')
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
                  underlyingType: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'coolSingleAttributeRectSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'CGRect',
              reference: 'CGRect',
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType:Maybe.Nothing<string>()
            }
          })
        ]
      };

      const imports:ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImports:ObjC.Import[] = [{
        file:'UIGeometry.h',
        isPublic:false,
        library:Maybe.Just('UIKit')
      }];
      expect(imports).toEqualJSON(expectedImports);
    });
  });
  describe('#instanceMethods', function() {
    it('returns an instance method which will output a different description ' +
       'depending on which subtype is being represented', function() {
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
                  underlyingType: Maybe.Just<string>('NSObject')
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
                  underlyingType: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'coolSingleAttributeBoolSubtype',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'BOOL',
              reference: 'BOOL',
              libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
              fileTypeIsDefinedIn: Maybe.Nothing<string>(),
              underlyingType:Maybe.Nothing<string>()
            }
          })
        ]
      };

      const instanceMethods:ObjC.Method[] = AlgebraicTypePlugin.instanceMethods(algebraicType);

      const expectedInstanceMethods:ObjC.Method[] = [
        {
          belongsToProtocol:Maybe.Just('NSObject'),
          code: [
            'switch (_subtype) {',
            '  case _TestSubtypesSomeSubtype: {',
            '    return [NSString stringWithFormat:@"%@ - SomeSubtype \\n\\t someString: %@; \\n\\t someUnsignedInteger: %tu; \\n", [super description], _someSubtype_someString, _someSubtype_someUnsignedInteger];',
            '    break;',
            '  }',
            '  case _TestSubtypesCoolSingleAttributeBoolSubtype: {',
            '    return [NSString stringWithFormat:@"%@ - \\n\\t coolSingleAttributeBoolSubtype: %@; \\n", [super description], _coolSingleAttributeBoolSubtype ? @"YES" : @"NO"];',
            '    break;',
            '  }',
            '}'
          ],
          comments: [],
          keywords: [
            {
              name: 'description',
              argument: Maybe.Nothing<ObjC.KeywordArgument>()
            }
          ],
          returnType: Maybe.Just({
            name: 'NSString',
            reference: 'NSString *'
          })
        }
      ];

      expect(instanceMethods).toEqualJSON(expectedInstanceMethods);
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
    it('returns a validation error when there is an attribute with an unknown type', function() {
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
                  underlyingType: Maybe.Nothing<string>()
                }
              }
            ]
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Description plugin does not know how to format the type "Foo" from Test.someFoo. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
    it('returns two validation errors when there are two attributes with unknown types', function() {
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
                  underlyingType: Maybe.Nothing<string>()
                }
              }
            ]
          }),
          AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
          {
            annotations: {},
            name: 'someFerr',
            comments: [],
            nullability:ObjC.Nullability.Inherited(),
            type: {
              name: 'Ferr',
              reference: 'Ferr',
              libraryTypeIsDefinedIn: Maybe.Just<string>('SomeLib'),
              fileTypeIsDefinedIn: Maybe.Just<string>('SomethingElse'),
              underlyingType: Maybe.Nothing<string>()
            }
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Description plugin does not know how to format the type "Foo" from Test.someFoo. Did you forget to declare a backing type?'),
        Error.Error('The Description plugin does not know how to format the type "Ferr" from Test.someFerr. Did you forget to declare a backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
    it('returns a validation error when there is an attribute with an unknown underlying type', function() {
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
            name: 'AnotherSubtype',
            comments: [],
            attributes: [
              {
                annotations: {},
                name: 'someFerr',
                comments: [],
                nullability:ObjC.Nullability.Inherited(),
                type: {
                  name: 'Ferr',
                  reference: 'Ferr',
                  libraryTypeIsDefinedIn: Maybe.Just<string>('SomeLib'),
                  fileTypeIsDefinedIn: Maybe.Just<string>('SomethingElse'),
                  underlyingType: Maybe.Just<string>('SomethingRandom')
                }
              }
            ]
          })
        ]
      };
      const errors:Error.Error[] = AlgebraicTypePlugin.validationErrors(algebraicType);
      const expectedErrors:Error.Error[] = [
        Error.Error('The Description plugin does not know how to format the backing type "SomethingRandom" from Test.someFerr. Did you declare the wrong backing type?')
      ];
      expect(errors).toEqualJSON(expectedErrors);
    });
  });
});
