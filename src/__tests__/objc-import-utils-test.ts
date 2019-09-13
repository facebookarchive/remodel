/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjCImportUtils from '../objc-import-utils';
import * as ObjectGeneration from '../object-generation';
import * as ObjectSpec from '../object-spec';

describe('ObjCImportUtils', function() {
  describe('#importForTypeLookup', function() {
    it('creates an import', function() {
      const typeLookup: ObjectGeneration.TypeLookup = {
        name: 'RMSomeType',
        library: null,
        file: 'RMSomeFile',
        canForwardDeclare: true,
      };

      const importValue: ObjC.Import = ObjCImportUtils.importForTypeLookup(
        null,
        true,
        typeLookup,
      );

      const expectedImport: ObjC.Import = {
        file: 'RMSomeFile.h',
        isPublic: true,
        library: null,
        requiresCPlusPlus: false,
      };

      expect(importValue).toEqualJSON(expectedImport);
    });

    it('creates a different import', function() {
      const typeLookup: ObjectGeneration.TypeLookup = {
        name: 'RMSomeType',
        library: null,
        file: null,
        canForwardDeclare: true,
      };

      const importValue: ObjC.Import = ObjCImportUtils.importForTypeLookup(
        null,
        false,
        typeLookup,
      );

      const expectedImport: ObjC.Import = {
        file: 'RMSomeType.h',
        isPublic: false,
        library: null,
        requiresCPlusPlus: false,
      };

      expect(importValue).toEqualJSON(expectedImport);
    });

    it('creates an import containing a library', function() {
      const typeLookup: ObjectGeneration.TypeLookup = {
        name: 'RMSomeOtherType',
        library: 'RMSomeLibrary',
        file: null,
        canForwardDeclare: true,
      };

      const importValue: ObjC.Import = ObjCImportUtils.importForTypeLookup(
        null,
        true,
        typeLookup,
      );

      const expectedImport: ObjC.Import = {
        file: 'RMSomeOtherType.h',
        isPublic: true,
        library: 'RMSomeLibrary',
        requiresCPlusPlus: false,
      };

      expect(importValue).toEqualJSON(expectedImport);
    });

    it(
      'creates an import containing the default library when it is provided ' +
        'and the type lookup does not contain a library',
      function() {
        const typeLookup: ObjectGeneration.TypeLookup = {
          name: 'RMSomeOtherType',
          library: null,
          file: null,
          canForwardDeclare: true,
        };

        const importValue: ObjC.Import = ObjCImportUtils.importForTypeLookup(
          'DefaultLibrary',
          true,
          typeLookup,
        );

        const expectedImport: ObjC.Import = {
          file: 'RMSomeOtherType.h',
          isPublic: true,
          library: 'DefaultLibrary',
          requiresCPlusPlus: false,
        };

        expect(importValue).toEqualJSON(expectedImport);
      },
    );
  });

  describe('#shouldForwardProtocolDeclareAttribute', function() {
    it('should return false for the empty protocol', function() {
      const attributeType: ObjectSpec.AttributeType = {
        fileTypeIsDefinedIn: null,
        libraryTypeIsDefinedIn: null,
        name: 'NSArray',
        reference: 'NSArray*',
        underlyingType: 'NSObject',
        conformingProtocol: '',
      };
      const attribute: ObjectSpec.Attribute = {
        annotations: {},
        comments: [],
        name: 'someArray',
        nullability: ObjC.Nullability.Inherited(),
        type: attributeType,
      };

      const shouldDeclare: boolean = ObjCImportUtils.shouldForwardProtocolDeclareAttribute(
        attribute,
      );
      expect(shouldDeclare).toEqual(false);
    });
  });
});
