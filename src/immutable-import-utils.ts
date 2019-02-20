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
  objectLibrary: Maybe.Maybe<string>,
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
  objectLibrary: Maybe.Maybe<string>,
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
    typeLookup.name === objectType.typeName ||
    (typeLookup.canForwardDeclare && !makePublicImportsForValueType(objectType))
  );
}

function forwardDeclarationForTypeLookup(
  typeLookup: ObjectGeneration.TypeLookup,
): ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(typeLookup.name);
}

function typeLookupPreventsForwardDeclarationForAttribute(
  typeLookup: ObjectGeneration.TypeLookup,
  attribute: ObjectSpec.Attribute,
): boolean {
  return (
    !typeLookup.canForwardDeclare && typeLookup.name === attribute.type.name
  );
}

function typeLookupsAllowForwardDeclarationForAttribute(
  typeLookups: ObjectGeneration.TypeLookup[],
  attribute: ObjectSpec.Attribute,
): boolean {
  return !typeLookups.some(typeLookup =>
    typeLookupPreventsForwardDeclarationForAttribute(typeLookup, attribute),
  );
}

function shouldForwardClassDeclareAttribute(
  valueTypeName: string,
  typeLookups: ObjectGeneration.TypeLookup[],
  makePublicImports: boolean,
  attribute: ObjectSpec.Attribute,
): boolean {
  const shouldExplicitlyForwardDeclare =
    !makePublicImports &&
    typeLookupsAllowForwardDeclarationForAttribute(typeLookups, attribute) &&
    ObjCImportUtils.canForwardDeclareTypeForAttribute(attribute);
  const attributeTypeReferencesObjectType =
    valueTypeName == attribute.type.name;
  return shouldExplicitlyForwardDeclare || attributeTypeReferencesObjectType;
}

function forwardClassDeclarationForAttribute(
  attribute: ObjectSpec.Attribute,
): ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(attribute.type.name);
}

export function forwardClassDeclarationsForObjectType(
  objectType: ObjectSpec.Type,
): ObjC.ForwardDeclaration[] {
  const makePublicImports = makePublicImportsForValueType(objectType);
  const typeLookupForwardDeclarations = objectType.typeLookups
    .filter(typeLookup =>
      isForwardDeclarationRequiredForTypeLookup(objectType, typeLookup),
    )
    .map(forwardDeclarationForTypeLookup);
  const attributeForwardClassDeclarations = objectType.attributes
    .filter(attribute =>
      shouldForwardClassDeclareAttribute(
        objectType.typeName,
        objectType.typeLookups,
        makePublicImports,
        attribute,
      ),
    )
    .map(forwardClassDeclarationForAttribute);
  const attributeForwardProtocolDeclarations = makePublicImports
    ? []
    : objectType.attributes
        .filter(ObjCImportUtils.shouldForwardProtocolDeclareAttribute)
        .map(ObjCImportUtils.forwardProtocolDeclarationForAttribute);
  return []
    .concat(typeLookupForwardDeclarations)
    .concat(attributeForwardClassDeclarations)
    .concat(attributeForwardProtocolDeclarations);
}

export function importsForObjectType(
  objectType: ObjectSpec.Type,
): ObjC.Import[] {
  const baseImports: ObjC.Import[] = [
    {
      file: 'Foundation.h',
      isPublic: true,
      requiresCPlusPlus: false,
      library: Maybe.Just('Foundation'),
    },
    {
      file: objectType.typeName + '.h',
      isPublic: false,
      requiresCPlusPlus: false,
      library: Maybe.Nothing<string>(),
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
