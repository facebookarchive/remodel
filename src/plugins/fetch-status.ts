/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import Code = require('../code');
import Error = require('../error');
import FileWriter = require('../file-writer');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import StringUtils = require('../string-utils');
import ObjectSpec = require('../object-spec');
import ObjectSpecUtils = require('../object-spec-utils');

function nameOfFetchStatusForValueTypeWithName(valueTypeName: string):string {
  return valueTypeName + 'FetchStatus';
}

function nameOfFetchStatusAttributeForAttribute(attributeName: string): string {
  return 'hasFetched' + StringUtils.capitalize(attributeName);
}

function isFetchStatusAttribute(attribute:ObjectSpec.Attribute, objectType:ObjectSpec.Type):boolean {
  return attribute.type.name !== nameOfFetchStatusForValueTypeWithName(objectType.typeName);
}

function fetchStatusAttributeForAttribute(attribute:ObjectSpec.Attribute):ObjectSpec.Attribute {
  return {
    annotations: {},
    comments: [],
    name: nameOfFetchStatusAttributeForAttribute(attribute.name),
    nullability:ObjC.Nullability.Inherited(),
    type: {
      fileTypeIsDefinedIn:Maybe.Nothing<string>(),
      libraryTypeIsDefinedIn:Maybe.Nothing<string>(),
      name:'BOOL',
      reference:'BOOL',
      underlyingType:Maybe.Nothing<string>(),
      conformingProtocol:Maybe.Nothing<string>()
    }
  };
}

function fetchedAttributesForValueType(objectType:ObjectSpec.Type) {
  return objectType.attributes.filter(function(attribute:ObjectSpec.Attribute) {
      return isFetchStatusAttribute(attribute, objectType);
    }).map(fetchStatusAttributeForAttribute);
}

function fetchStatusValueTypeForValueType(objectType:ObjectSpec.Type):ObjectSpec.Type {
  return {
    annotations:{},
    attributes: fetchedAttributesForValueType(objectType),
    comments: [],
    excludes: [],
    includes: [],
    libraryName: objectType.libraryName,
    typeLookups:[],
    typeName: nameOfFetchStatusForValueTypeWithName(objectType.typeName)
  };
}

function fetchStatusAttributeForValueType(objectType:ObjectSpec.Type):ObjectSpec.Attribute {
  const fetchStatusTypeName:string = nameOfFetchStatusForValueTypeWithName(objectType.typeName);

  return {
    annotations: {},
    comments: [],
    name: 'fetchStatus',
    nullability:ObjC.Nullability.Inherited(),
    type: {
      fileTypeIsDefinedIn:Maybe.Nothing<string>(),
      libraryTypeIsDefinedIn:objectType.libraryName,
      name:fetchStatusTypeName,
      reference:ObjectSpecUtils.typeReferenceForValueTypeWithName(fetchStatusTypeName),
      underlyingType:Maybe.Just<string>('NSObject'),
      conformingProtocol:Maybe.Nothing<string>()
    }
  };
}

export function createPlugin():ObjectSpec.Plugin {
  return {
    additionalFiles: function(objectType:ObjectSpec.Type):Code.File[] {
      return [];
    },
    additionalTypes: function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
      return [
        fetchStatusValueTypeForValueType(objectType)
      ];
    },
    attributes: function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
      return [
        fetchStatusAttributeForValueType(objectType)
      ];
    },
    classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
      return [];
    },
    fileTransformation: function(request:FileWriter.Request):FileWriter.Request {
      return request;
    },
    fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(objectType:ObjectSpec.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(objectType:ObjectSpec.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
      return [];
    },
    imports: function(objectType:ObjectSpec.Type):ObjC.Import[] {
      return [];
    },
    instanceMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
      return [];
    },
    properties: function(objectType:ObjectSpec.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun:['RMFetchStatus'],
    staticConstants: function(objectType:ObjectSpec.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
      return [];
    },
    nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    }
  };
}
