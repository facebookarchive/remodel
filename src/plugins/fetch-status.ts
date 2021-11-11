/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Code from '../code';
import * as Error from '../error';
import * as FileWriter from '../file-writer';
import * as CLangCommon from '../clang-common';
import * as ObjC from '../objc';
import * as StringUtils from '../string-utils';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecUtils from '../object-spec-utils';

function nameOfFetchStatusForValueTypeWithName(valueTypeName: string): string {
  return valueTypeName + 'FetchStatus';
}

function nameOfFetchStatusAttributeForAttribute(attributeName: string): string {
  return 'hasFetched' + StringUtils.capitalize(attributeName);
}

function isFetchStatusAttribute(
  attribute: ObjectSpec.Attribute,
  objectType: ObjectSpec.Type,
): boolean {
  return (
    attribute.type.name !==
    nameOfFetchStatusForValueTypeWithName(objectType.typeName)
  );
}

function fetchStatusAttributeForAttribute(
  attribute: ObjectSpec.Attribute,
): ObjectSpec.Attribute {
  return {
    annotations: {},
    comments: [],
    name: nameOfFetchStatusAttributeForAttribute(attribute.name),
    nullability: CLangCommon.Nullability.Inherited(),
    type: {
      fileTypeIsDefinedIn: null,
      libraryTypeIsDefinedIn: null,
      name: 'BOOL',
      reference: 'BOOL',
      underlyingType: null,
      conformingProtocol: null,
      referencedGenericTypes: [],
    },
  };
}

function fetchedAttributesForValueType(objectType: ObjectSpec.Type) {
  return objectType.attributes
    .filter(function (attribute: ObjectSpec.Attribute) {
      return isFetchStatusAttribute(attribute, objectType);
    })
    .map(fetchStatusAttributeForAttribute);
}

function fetchStatusValueTypeForValueType(
  objectType: ObjectSpec.Type,
): ObjectSpec.Type {
  return {
    annotations: {},
    attributes: fetchedAttributesForValueType(objectType),
    comments: [],
    excludes: [],
    includes: [],
    libraryName: objectType.libraryName,
    typeLookups: [],
    typeName: nameOfFetchStatusForValueTypeWithName(objectType.typeName),
  };
}

function fetchStatusAttributeForValueType(
  objectType: ObjectSpec.Type,
): ObjectSpec.Attribute {
  const fetchStatusTypeName: string = nameOfFetchStatusForValueTypeWithName(
    objectType.typeName,
  );

  return {
    annotations: {},
    comments: [],
    name: 'fetchStatus',
    nullability: CLangCommon.Nullability.Inherited(),
    type: {
      fileTypeIsDefinedIn: null,
      libraryTypeIsDefinedIn: objectType.libraryName,
      name: fetchStatusTypeName,
      reference:
        ObjectSpecUtils.typeReferenceForValueTypeWithName(fetchStatusTypeName),
      underlyingType: 'NSObject',
      conformingProtocol: null,
      referencedGenericTypes: [],
    },
  };
}

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: function (objectType: ObjectSpec.Type): Code.File[] {
      return [];
    },
    transformBaseFile: function (
      objectType: ObjectSpec.Type,
      baseFile: Code.File,
    ): Code.File {
      return baseFile;
    },
    additionalTypes: function (objectType: ObjectSpec.Type): ObjectSpec.Type[] {
      return [fetchStatusValueTypeForValueType(objectType)];
    },
    attributes: function (objectType: ObjectSpec.Type): ObjectSpec.Attribute[] {
      return [fetchStatusAttributeForValueType(objectType)];
    },
    classMethods: function (objectType: ObjectSpec.Type): ObjC.Method[] {
      return [];
    },
    transformFileRequest: function (
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function (objectType: ObjectSpec.Type): Code.FileType | null {
      return null;
    },
    forwardDeclarations: function (
      objectType: ObjectSpec.Type,
    ): ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function (objectType: ObjectSpec.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function (objectType: ObjectSpec.Type): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function (
      objectType: ObjectSpec.Type,
    ): ObjC.ImplementedProtocol[] {
      return [];
    },
    imports: function (objectType: ObjectSpec.Type): ObjC.Import[] {
      return [];
    },
    instanceMethods: function (objectType: ObjectSpec.Type): ObjC.Method[] {
      return [];
    },
    macros: function (valueType: ObjectSpec.Type): ObjC.Macro[] {
      return [];
    },
    properties: function (objectType: ObjectSpec.Type): ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMFetchStatus'],
    staticConstants: function (objectType: ObjectSpec.Type): ObjC.Constant[] {
      return [];
    },
    validationErrors: function (objectType: ObjectSpec.Type): Error.Error[] {
      return [];
    },
    nullability: function (
      objectType: ObjectSpec.Type,
    ): ObjC.ClassNullability | null {
      return null;
    },
    subclassingRestricted: function (objectType: ObjectSpec.Type): boolean {
      return false;
    },
  };
}
