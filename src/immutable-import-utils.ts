/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Maybe from './maybe';
import * as ObjC from './objc';
import * as ObjCImportUtils from './objc-import-utils';
import * as ObjectGeneration from './object-generation';
import * as ObjectSpec from './object-spec';
import * as ObjectSpecCodeUtils from './object-spec-code-utils';

function isImportRequiredForAttribute(
  typeLookups: ObjectGeneration.TypeLookup[],
  attribute: ObjectSpec.Attribute,
): boolean {
  const shouldIncludeImportForTypeName = ObjCImportUtils.shouldIncludeImportForType(
    typeLookups,
    attribute.type.name,
  );
  return Maybe.match(
    function(protocol) {
      return (
        shouldIncludeImportForTypeName ||
        ObjCImportUtils.shouldIncludeImportForType(typeLookups, protocol)
      );
    },
    function() {
      return shouldIncludeImportForTypeName;
    },
    attribute.type.conformingProtocol,
  );
}

function isImportRequiredForTypeLookup(
  objectType: ObjectSpec.Type,
  typeLookup: ObjectGeneration.TypeLookup,
): boolean {
  return typeLookup.name !== objectType.typeName;
}

function importForTypeLookup(
  objectLibrary: string | null,
  isPublic: boolean,
  typeLookup: ObjectGeneration.TypeLookup,
): ObjC.Import {
  return ObjCImportUtils.importForTypeLookup(
    objectLibrary,
    isPublic || !typeLookup.canForwardDeclare,
    typeLookup,
  );
}

function importForAttribute(
  objectLibrary: string | null,
  isPublic: boolean,
  attribute: ObjectSpec.Attribute,
): ObjC.Import {
  const builtInImportMaybe: Maybe.Maybe<
    ObjC.Import
  > = ObjCImportUtils.typeDefinitionImportForKnownSystemType(
    attribute.type.name,
  );

  return Maybe.match(
    function(builtInImport: ObjC.Import) {
      return builtInImport;
    },
    function() {
      const requiresPublicImport =
        isPublic ||
        ObjCImportUtils.requiresPublicImportForType(
          attribute.type.name,
          ObjectSpecCodeUtils.computeTypeOfAttribute(attribute),
        );
      return {
        library: ObjCImportUtils.libraryForImport(
          attribute.type.libraryTypeIsDefinedIn,
          objectLibrary,
        ),
        file: ObjCImportUtils.fileForImport(
          attribute.type.fileTypeIsDefinedIn,
          attribute.type.name,
        ),
        isPublic: requiresPublicImport,
        requiresCPlusPlus: false,
      };
    },
    builtInImportMaybe,
  );
}

function makePublicImportsForValueType(objectType: ObjectSpec.Type): boolean {
  return objectType.includes.indexOf('UseForwardDeclarations') === -1;
}

function SkipImportsInImplementationForValueType(
  objectType: ObjectSpec.Type,
): boolean {
  return objectType.includes.indexOf('SkipImportsInImplementation') !== -1;
}

function isForwardDeclarationRequiredForTypeLookup(
  objectType: ObjectSpec.Type,
  typeLookup: ObjectGeneration.TypeLookup,
): boolean {
  return (
    typeLookup.name === objectType.typeName || typeLookup.canForwardDeclare
  );
}

function forwardDeclarationForTypeLookup(
  typeLookup: ObjectGeneration.TypeLookup,
): ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(typeLookup.name);
}

function forwardClassDeclarationForAttribute(
  attribute: ObjectSpec.Attribute,
): ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(attribute.type.name);
}

function protocolForwardDeclarationsForReferencedGenericType(
  ref: ObjectSpec.ReferencedGenericType,
): ObjC.ForwardDeclaration[] {
  return (ref.conformingProtocol == null
    ? []
    : [
        ObjC.ForwardDeclaration.ForwardProtocolDeclaration(
          ref.conformingProtocol,
        ),
      ]
  ).concat(
    ...ref.referencedGenericTypes.map(
      protocolForwardDeclarationsForReferencedGenericType,
    ),
  );
}

function classForwardDeclarationsForTypeName(
  typeName: string,
  typeLookups: ObjectGeneration.TypeLookup[],
): ObjC.ForwardDeclaration[] {
  if (ObjCImportUtils.isSystemType(typeName)) {
    return []; // No need to forward-declare system types.
  }
  if (typeLookups.some(t => t.name === typeName && !t.canForwardDeclare)) {
    return [];
  }
  return [ObjC.ForwardDeclaration.ForwardClassDeclaration(typeName)];
}

function classForwardDeclarationsForReferencedGenericType(
  ref: ObjectSpec.ReferencedGenericType,
  typeLookups: ObjectGeneration.TypeLookup[],
): ObjC.ForwardDeclaration[] {
  return classForwardDeclarationsForTypeName(ref.name, typeLookups).concat(
    ...ref.referencedGenericTypes.map(t =>
      classForwardDeclarationsForReferencedGenericType(t, typeLookups),
    ),
  );
}

function forwardDeclarationsForAttributeType(
  attributeType: ObjectSpec.AttributeType,
  typeLookups: ObjectGeneration.TypeLookup[],
): ObjC.ForwardDeclaration[] {
  const forwardDeclarations: ObjC.ForwardDeclaration[] = [];

  // Protocols are always forward declared.
  if (attributeType.conformingProtocol != null) {
    forwardDeclarations.push(
      ObjC.ForwardDeclaration.ForwardProtocolDeclaration(
        attributeType.conformingProtocol,
      ),
    );
  }
  for (const r of attributeType.referencedGenericTypes) {
    forwardDeclarations.push(
      ...protocolForwardDeclarationsForReferencedGenericType(r),
    );
  }

  // We can only forward-declare types that we assume to be NSObjects:
  if (attributeType.underlyingType === 'NSObject') {
    forwardDeclarations.push(
      ...classForwardDeclarationsForTypeName(attributeType.name, typeLookups),
    );
    for (const r of attributeType.referencedGenericTypes) {
      forwardDeclarations.push(
        ...classForwardDeclarationsForReferencedGenericType(r, typeLookups),
      );
    }
  }
  return forwardDeclarations;
}

export function forwardClassDeclarationsForObjectType(
  objectType: ObjectSpec.Type,
): ObjC.ForwardDeclaration[] {
  const typeLookupForwardDeclarations = objectType.typeLookups
    .filter(typeLookup =>
      isForwardDeclarationRequiredForTypeLookup(objectType, typeLookup),
    )
    .map(forwardDeclarationForTypeLookup);
  return ([] as ObjC.ForwardDeclaration[])
    .concat(
      ...objectType.attributes.map(a =>
        forwardDeclarationsForAttributeType(a.type, objectType.typeLookups),
      ),
    )
    .concat(typeLookupForwardDeclarations);
}

export function importsForObjectType(
  objectType: ObjectSpec.Type,
): ObjC.Import[] {
  const baseImports: ObjC.Import[] = [
    {
      file: 'Foundation.h',
      isPublic: true,
      requiresCPlusPlus: false,
      library: 'Foundation',
    },
    {
      file: objectType.typeName + '.h',
      isPublic: false,
      requiresCPlusPlus: false,
      library: null,
    },
  ];
  const makePublicImports = makePublicImportsForValueType(objectType);
  const skipAttributeImports =
    !makePublicImports && SkipImportsInImplementationForValueType(objectType);
  const typeLookupImports = objectType.typeLookups
    .filter(typeLookup => isImportRequiredForTypeLookup(objectType, typeLookup))
    .map(typeLookup =>
      importForTypeLookup(
        objectType.libraryName,
        makePublicImports,
        typeLookup,
      ),
    );
  const attributeImports = skipAttributeImports
    ? []
    : objectType.attributes
        .filter(attribute =>
          isImportRequiredForAttribute(objectType.typeLookups, attribute),
        )
        .map(attribute =>
          importForAttribute(
            objectType.libraryName,
            makePublicImports,
            attribute,
          ),
        );
  return baseImports.concat(typeLookupImports).concat(attributeImports);
}
