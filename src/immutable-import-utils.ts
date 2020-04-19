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

function isImportRequiredForTypeLookup(
  objectType: ObjectSpec.Type,
  typeLookup: ObjectGeneration.TypeLookup,
): boolean {
  return typeLookup.name !== objectType.typeName;
}

export function forwardClassDeclarationsForObjectType(
  objectType: ObjectSpec.Type,
): ObjC.ForwardDeclaration[] {
  return ([] as ObjC.ForwardDeclaration[]).concat(
    ...objectType.attributes.map(a =>
      ObjCImportUtils.forwardDeclarationsForAttributeType(
        a.type.name,
        a.type.underlyingType,
        a.type.conformingProtocol,
        a.type.referencedGenericTypes,
        objectType.typeLookups,
      ),
    ),
  );
}

export function importsForObjectType(
  objectType: ObjectSpec.Type,
): ObjC.Import[] {
  const makePublicImports =
    objectType.includes.indexOf('UseForwardDeclarations') === -1;
  const skipAttributeImports =
    !makePublicImports &&
    objectType.includes.indexOf('SkipImportsInImplementation') !== -1;

  return [
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
  ].concat(
    ...objectType.attributes.map(a =>
      ObjCImportUtils.importsForAttributeType(
        a.type.name,
        a.type.underlyingType,
        a.type.conformingProtocol,
        a.type.referencedGenericTypes,
        a.type.libraryTypeIsDefinedIn,
        a.type.fileTypeIsDefinedIn,
        objectType.libraryName,
        makePublicImports
          ? ObjCImportUtils.ObjectImportMode.public
          : skipAttributeImports
          ? ObjCImportUtils.ObjectImportMode.none
          : ObjCImportUtils.ObjectImportMode.private,
        objectType.typeLookups,
      ),
    ),
  );
}
