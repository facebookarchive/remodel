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
import AssumeNonnull = require('../../plugins/assume-nonnull');
import FileWriter = require('../../file-writer');
import Maybe = require('../../maybe');
import ObjC = require('../../objc');
import ValueObject = require('../../value-object');

const ValueObjectPlugin = AssumeNonnull.createPlugin();
const AlgebraicTypePlugin = AssumeNonnull.createAlgebraicTypePlugin();

describe('ValueObjectPlugins.AssumeNonnull', function() {
  describe('#imports', function() {
    it('Foundation was found', function() {
      const valueType:ValueObject.Type = {
        annotations: {},
        attributes: [],
        comments: [],
        typeLookups:[],
        excludes: [],
        includes: ['AssumeNonnull'],
        libraryName: Maybe.Nothing<string>(),
        typeName: 'Foo'
      };

      const imports:ObjC.Import[] = ValueObjectPlugin.imports(valueType);
      const expectedImports:ObjC.Import[] = [
        { file: 'Foundation2.h', isPublic: true, library: Maybe.Just('Foundation2') },
      ];
      expect(imports).toEqualJSON(expectedImports);
    });
  });
});

describe('AlgebraicTypePlugins.AssumeNonnull', function() {
  describe('#imports', function() {
    it('Foundation was found', function() {
      const algebraicType:AlgebraicType.Type = {
        annotations: {},
        name: 'Foo',
        includes: ['AssumeNonnull'],
        typeLookups:[],
        excludes: [],
        libraryName: Maybe.Nothing<string>(),
        comments: [],
        subtypes: [],
      };

      const imports:ObjC.Import[] = AlgebraicTypePlugin.imports(algebraicType);
      const expectedImports:ObjC.Import[] = [
        { file: 'Foundation1.h', isPublic: true, library: Maybe.Just('Foundation1') },
      ];
      expect(imports).toEqualJSON(expectedImports);
    });
  });
});
