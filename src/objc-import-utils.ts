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
  bool: Maybe.Nothing<ObjC.Import>(),
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
  int: Maybe.Nothing<ObjC.Import>(),
  int32_t: Maybe.Nothing<ObjC.Import>(),
  int64_t: Maybe.Nothing<ObjC.Import>(),
  long: Maybe.Nothing<ObjC.Import>(),
  SEL: Maybe.Nothing<ObjC.Import>(),
  UIColor: Maybe.Just({
    file: 'UIKit.h',
    isPublic: true,
    requiresCPlusPlus: false,
    library: 'UIKit',
  }),
  UIEdgeInsets: Maybe.Just({
    file: 'UIGeometry.h',
    isPublic: true,
    requiresCPlusPlus: false,
    library: 'UIKit',
  }),
  UIFont: Maybe.Just({
    file: 'UIKit.h',
    isPublic: true,
    requiresCPlusPlus: false,
    library: 'UIKit',
  }),
  UIImage: Maybe.Just({
    file: 'UIKit.h',
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

export function isSystemType(typeName: string): boolean {
  return (
    isFoundationType(typeName) ||
    (typeName in KNOWN_SYSTEM_TYPE_IMPORT_INFO &&
      KNOWN_SYSTEM_TYPE_IMPORT_INFO[typeName] == null)
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
    !isSystemType(typeName) &&
    typeLookups.filter(lookup => typeLookupHasName(typeName, lookup)).length ==
      0
  );
}

function typeDefinitionImportForKnownSystemType(
  typeName: string,
): ObjC.Import | null {
  return typeName in KNOWN_SYSTEM_TYPE_IMPORT_INFO
    ? KNOWN_SYSTEM_TYPE_IMPORT_INFO[typeName]
    : null;
}

function* protocolForwardDeclarations(
  conformingProtocol: string | null,
  referencedGenericTypes: ObjC.ReferencedGenericType[],
): Generator<ObjC.ForwardDeclaration> {
  if (conformingProtocol != null) {
    yield ObjC.ForwardDeclaration.ForwardProtocolDeclaration(
      conformingProtocol,
    );
  }
  for (const t of referencedGenericTypes) {
    yield* protocolForwardDeclarations(
      t.conformingProtocol,
      t.referencedGenericTypes,
    );
  }
}

function* classForwardDeclarations(
  typeName: string,
  referencedGenericTypes: ObjC.ReferencedGenericType[],
  typeLookups: ObjectGeneration.TypeLookup[],
): Generator<ObjC.ForwardDeclaration> {
  if (!isSystemType(typeName)) {
    if (!typeLookups.some(t => t.name === typeName && !t.canForwardDeclare)) {
      yield ObjC.ForwardDeclaration.ForwardClassDeclaration(typeName);
    }
  }
  for (const t of referencedGenericTypes) {
    yield* classForwardDeclarations(
      t.name,
      t.referencedGenericTypes,
      typeLookups,
    );
  }
}

export function forwardDeclarationsForAttributeType(
  typeName: string,
  underlyingType: string | null,
  conformingProtocol: string | null,
  referencedGenericTypes: ObjC.ReferencedGenericType[],
  typeLookups: ObjectGeneration.TypeLookup[],
): ObjC.ForwardDeclaration[] {
  const forwardDeclarations: ObjC.ForwardDeclaration[] = [
    // Protocols are always forward declared.
    ...protocolForwardDeclarations(conformingProtocol, referencedGenericTypes),
  ];
  // We can only forward-declare classes that we assume to be NSObjects:
  if (underlyingType === 'NSObject') {
    forwardDeclarations.push(
      ...classForwardDeclarations(
        typeName,
        referencedGenericTypes,
        typeLookups,
      ),
    );
  }
  return forwardDeclarations;
}

/**
 * Applies only to attributes with underlyingType of NSObject that are not
 * system types. System types and non-NSObjects are always publicly imported.
 */
export enum ObjectImportMode {
  /** Generate imports in the header file. */
  public,
  /**
   * Generate imports in the implementation file.
   * Used if you forward-declare the type in the header.
   */
  private,
  /** Generate no import at all, unless it's a system type. */
  none,
}

function* classImports(
  typeName: string,
  underlyingType: string | null,
  conformingProtocol: string | null,
  referencedGenericTypes: ObjC.ReferencedGenericType[],
  libraryTypeIsDefinedIn: string | null,
  fileTypeIsDefinedIn: string | null,
  objectLibrary: string | null,
  importMode: ObjectImportMode,
  typeLookups: ObjectGeneration.TypeLookup[],
): Generator<ObjC.Import> {
  // Protocols are imported only when there is a matching type lookup.
  // Otherwise, they are forward declared only.
  if (conformingProtocol != null && importMode != ObjectImportMode.none) {
    const lookup = typeLookups.find(t => t.name === conformingProtocol);
    if (lookup != null) {
      yield {
        library: lookup?.library ?? objectLibrary,
        file: `${lookup?.file ?? conformingProtocol}.h`,
        isPublic:
          lookup?.canForwardDeclare === false ||
          importMode === ObjectImportMode.public,
        requiresCPlusPlus: false,
      };
    }
  }

  if (isFoundationType(typeName)) {
    // Yield nothing.
  } else if (typeName in KNOWN_SYSTEM_TYPE_IMPORT_INFO) {
    const knownImport = KNOWN_SYSTEM_TYPE_IMPORT_INFO[typeName];
    if (knownImport != null) {
      yield knownImport;
    }
  } else {
    const lookup = typeLookups.find(t => t.name === typeName);
    if (
      underlyingType === 'NSObject' &&
      importMode == ObjectImportMode.none &&
      lookup?.canForwardDeclare !== false
    ) {
      // Yield nothing.
    } else {
      yield {
        library: libraryTypeIsDefinedIn ?? lookup?.library ?? objectLibrary,
        file: `${fileTypeIsDefinedIn ?? lookup?.file ?? typeName}.h`,
        isPublic:
          underlyingType !== 'NSObject' ||
          lookup?.canForwardDeclare === false ||
          importMode === ObjectImportMode.public,
        requiresCPlusPlus: false,
      };
    }
  }
  for (const t of referencedGenericTypes) {
    yield* classImports(
      t.name,
      'NSObject', // Referenced generic types are always assumed to be NSObjects.
      t.conformingProtocol,
      t.referencedGenericTypes,
      // libraryTypeIsDefinedIn and fileTypeIsDefinedIn come from deprecated
      // annotations that cannot be placed on referenced generic types.
      null,
      null,
      objectLibrary,
      importMode,
      typeLookups,
    );
  }
}

/**
 * Returns the imports that should be generated for an attribute, including
 * all referenced generic types. Takes care of looking up each type in
 * typeLookups and adjusting the import accordingly if it's found.
 * */
export function importsForAttributeType(
  typeName: string,
  underlyingType: string | null,
  conformingProtocol: string | null,
  referencedGenericTypes: ObjC.ReferencedGenericType[],
  libraryTypeIsDefinedIn: string | null,
  fileTypeIsDefinedIn: string | null,
  objectLibrary: string | null,
  importMode: ObjectImportMode,
  typeLookups: ObjectGeneration.TypeLookup[],
): ObjC.Import[] {
  return [
    ...classImports(
      typeName,
      underlyingType,
      conformingProtocol,
      referencedGenericTypes,
      libraryTypeIsDefinedIn,
      fileTypeIsDefinedIn,
      objectLibrary,
      importMode,
      typeLookups,
    ),
  ];
}

export function importForAttribute(
  typeName: string,
  underlyingType: string | null,
  libraryTypeIsDefinedIn: string | null,
  fileTypeIsDefinedIn: string | null,
  objectLibrary: string | null,
  isPublic: boolean,
): ObjC.Import {
  const builtInImport = typeDefinitionImportForKnownSystemType(typeName);
  if (builtInImport != null) {
    return builtInImport;
  }

  const requiresPublicImport = isPublic || underlyingType != 'NSObject';
  return {
    library:
      libraryTypeIsDefinedIn != null ? libraryTypeIsDefinedIn : objectLibrary,
    file: `${fileTypeIsDefinedIn != null ? fileTypeIsDefinedIn : typeName}.h`,
    isPublic: requiresPublicImport,
    requiresCPlusPlus: false,
  };
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
