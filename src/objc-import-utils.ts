/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Maybe from './maybe';
import * as ObjC from './objc';
import * as ObjCTypeUtils from './objc-type-utils';
import * as ObjectGeneration from './object-generation';
import * as ObjectSpec from './object-spec';
import * as ObjectSpecCodeUtils from './object-spec-code-utils';

const KNOWN_SYSTEM_TYPE_IMPORT_INFO: {
  [id: string]: ObjC.Import | null;
} = {
  BOOL: Maybe.Nothing<ObjC.Import>(),
  double: Maybe.Nothing<ObjC.Import>(),
  float: Maybe.Nothing<ObjC.Import>(),
  id: Maybe.Nothing<ObjC.Import>(),
  CGFloat: Maybe.Just({
    file: 'CGBase.h',
    isPublic: true,
    requiresCPlusPlus: false,
    library: 'CoreGraphics',
  }),
  CGPoint: Maybe.Just({
    file: 'CGGeometry.h',
    isPublic: true,
    requiresCPlusPlus: false,
    library: 'CoreGraphics',
  }),
  CGRect: Maybe.Just({
    file: 'CGGeometry.h',
    isPublic: true,
    requiresCPlusPlus: false,
    library: 'CoreGraphics',
  }),
  CGSize: Maybe.Just({
    file: 'CGGeometry.h',
    isPublic: true,
    requiresCPlusPlus: false,
    library: 'CoreGraphics',
  }),
  int32_t: Maybe.Nothing<ObjC.Import>(),
  int64_t: Maybe.Nothing<ObjC.Import>(),
  SEL: Maybe.Nothing<ObjC.Import>(),
  UIEdgeInsets: Maybe.Just({
    file: 'UIGeometry.h',
    isPublic: true,
    requiresCPlusPlus: false,
    library: 'UIKit',
  }),
  uint64_t: Maybe.Nothing<ObjC.Import>(),
  uint32_t: Maybe.Nothing<ObjC.Import>(),
  uintptr_t: Maybe.Nothing<ObjC.Import>(),
  Class: Maybe.Nothing<ObjC.Import>(),
  dispatch_block_t: Maybe.Nothing<ObjC.Import>(),
};

function isFoundationType(typeName: string): boolean {
  return typeName.indexOf('NS') === 0;
}

function isImportPresent(knownTypeImport: ObjC.Import | null): boolean {
  return Maybe.match(
    function(impt: ObjC.Import) {
      return true;
    },
    function() {
      return false;
    },
    knownTypeImport,
  );
}

export function isImportRequiredForTypeWithName(typeName: string): boolean {
  return !(
    isFoundationType(typeName) ||
    (typeName in KNOWN_SYSTEM_TYPE_IMPORT_INFO &&
      !isImportPresent(KNOWN_SYSTEM_TYPE_IMPORT_INFO[typeName]))
  );
}

function typeLookupHasName(
  typeName: string,
  typeLookup: ObjectGeneration.TypeLookup,
): boolean {
  return typeName === typeLookup.name;
}

export function shouldIncludeImportForType(
  typeLookups: ObjectGeneration.TypeLookup[],
  typeName: string,
) {
  return (
    isImportRequiredForTypeWithName(typeName) &&
    typeLookups.filter(lookup => typeLookupHasName(typeName, lookup)).length ==
      0
  );
}

export function libraryForImport(
  libraryTypeIsDefinedIn: string | null,
  objectLibrary: string | null,
): string | null {
  return Maybe.match(
    function(libraryName: string) {
      return libraryName;
    },
    function() {
      return objectLibrary;
    },
    libraryTypeIsDefinedIn,
  );
}

export function fileForImport(
  fileTypeIsDefinedIn: string | null,
  typeName: string,
): string {
  return Maybe.match(
    function(file: string) {
      return file + '.h';
    },
    function() {
      return typeName + '.h';
    },
    fileTypeIsDefinedIn,
  );
}

export function typeDefinitionImportForKnownSystemType(
  typeName: string,
): ObjC.Import | null {
  return typeName in KNOWN_SYSTEM_TYPE_IMPORT_INFO
    ? KNOWN_SYSTEM_TYPE_IMPORT_INFO[typeName]
    : Maybe.Nothing<ObjC.Import>();
}

function canForwardDeclareTypeName(typeName: string): boolean {
  return ObjCTypeUtils.matchTypeName(
    {
      id: function() {
        return false;
      },
      NSObject: function() {
        return true;
      },
      BOOL: function() {
        return false;
      },
      NSInteger: function() {
        return false;
      },
      NSUInteger: function() {
        return false;
      },
      double: function() {
        return false;
      },
      float: function() {
        return false;
      },
      CGFloat: function() {
        return false;
      },
      NSTimeInterval: function() {
        return false;
      },
      uintptr_t: function() {
        return false;
      },
      uint32_t: function() {
        return false;
      },
      uint64_t: function() {
        return false;
      },
      int32_t: function() {
        return false;
      },
      int64_t: function() {
        return false;
      },
      SEL: function() {
        return false;
      },
      NSRange: function() {
        return false;
      },
      CGRect: function() {
        return false;
      },
      CGPoint: function() {
        return false;
      },
      CGSize: function() {
        return false;
      },
      UIEdgeInsets: function() {
        return false;
      },
      Class: function() {
        return false;
      },
      dispatch_block_t: function() {
        return false;
      },
      unmatchedType: function() {
        return false;
      },
    },
    typeName,
  );
}

export function shouldForwardProtocolDeclareAttribute(
  attribute: ObjectSpec.Attribute,
): boolean {
  return Maybe.match(
    function(protocol) {
      return protocol !== '';
    },
    function() {
      return false;
    },
    attribute.type.conformingProtocol,
  );
}

export function forwardProtocolDeclarationForAttribute(
  attribute: ObjectSpec.Attribute,
): ObjC.ForwardDeclaration | null {
  return Maybe.match(
    function(protocol) {
      return ObjC.ForwardDeclaration.ForwardProtocolDeclaration(protocol);
    },
    function() {
      return null;
    },
    attribute.type.conformingProtocol,
  );
}

export function requiresPublicImportForType(
  typeName: string,
  computedType: ObjC.Type,
): boolean {
  return (
    isImportRequiredForTypeWithName(typeName) &&
    !canForwardDeclareTypeName(computedType.name)
  );
}

export function canForwardDeclareType(
  typeName: string,
  computedType: ObjC.Type,
): boolean {
  return (
    isImportRequiredForTypeWithName(typeName) &&
    canForwardDeclareTypeName(computedType.name)
  );
}

export function importForTypeLookup(
  defaultLibrary: string | null,
  isPublic: boolean,
  typeLookup: ObjectGeneration.TypeLookup,
): ObjC.Import {
  return {
    file: Maybe.match(
      function Just(file: string): string {
        return file + '.h';
      },
      function Nothing() {
        return typeLookup.name + '.h';
      },
      typeLookup.file,
    ),
    isPublic: isPublic,
    requiresCPlusPlus: false,
    library: Maybe.match(
      function Just(library: string): string | null {
        return typeLookup.library;
      },
      function Nothing(): string | null {
        return defaultLibrary;
      },
      typeLookup.library,
    ),
  };
}
