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

import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjCImportUtils = require('../objc-import-utils');
import ObjectGeneration = require('../object-generation');

describe('ObjCImportUtils', function() {
  describe('#importForTypeLookup', function() {
    it('creates an import', function() {
      const typeLookup:ObjectGeneration.TypeLookup = {
        name: 'RMSomeType',
        library: Maybe.Nothing<string>(),
        file: Maybe.Just<string>('RMSomeFile'),
        canForwardDeclare: true
      };

      const importValue:ObjC.Import = ObjCImportUtils.importForTypeLookup(Maybe.Nothing<string>(), true, typeLookup);

      const expectedImport:ObjC.Import = {
        file:'RMSomeFile.h',
        isPublic:true,
        library:Maybe.Nothing<string>()
      };

      expect(importValue).toEqualJSON(expectedImport);
    });

    it('creates a different import', function() {
      const typeLookup:ObjectGeneration.TypeLookup = {
        name: 'RMSomeType',
        library: Maybe.Nothing<string>(),
        file: Maybe.Nothing<string>(),
        canForwardDeclare: true
      };

      const importValue:ObjC.Import = ObjCImportUtils.importForTypeLookup(Maybe.Nothing<string>(), false, typeLookup);

      const expectedImport:ObjC.Import = {
        file:'RMSomeType.h',
        isPublic:false,
        library:Maybe.Nothing<string>()
      };

      expect(importValue).toEqualJSON(expectedImport);
    });

    it('creates an import containing a library', function() {
      const typeLookup:ObjectGeneration.TypeLookup = {
        name: 'RMSomeOtherType',
        library: Maybe.Just<string>('RMSomeLibrary'),
        file: Maybe.Nothing<string>(),
        canForwardDeclare: true
      };

      const importValue:ObjC.Import = ObjCImportUtils.importForTypeLookup(Maybe.Nothing<string>(), true, typeLookup);

      const expectedImport:ObjC.Import = {
        file:'RMSomeOtherType.h',
        isPublic:true,
        library:Maybe.Just<string>('RMSomeLibrary')
      };

      expect(importValue).toEqualJSON(expectedImport);
    });

    it('creates an import containing the default library when it is provided ' +
       'and the type lookup does not contain a library', function() {
      const typeLookup:ObjectGeneration.TypeLookup = {
        name: 'RMSomeOtherType',
        library: Maybe.Nothing<string>(),
        file: Maybe.Nothing<string>(),
        canForwardDeclare: true
      };

      const importValue:ObjC.Import = ObjCImportUtils.importForTypeLookup(Maybe.Just<string>('DefaultLibrary'), true, typeLookup);

      const expectedImport:ObjC.Import = {
        file:'RMSomeOtherType.h',
        isPublic:true,
        library:Maybe.Just<string>('DefaultLibrary')
      };

      expect(importValue).toEqualJSON(expectedImport);
    });
  });
});
