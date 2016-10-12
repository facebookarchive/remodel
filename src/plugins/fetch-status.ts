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
import ValueObject = require('../value-object');
import ValueObjectUtils = require('../value-object-utils');

function nameOfFetchStatusForValueTypeWithName(valueTypeName: string):string {
  return valueTypeName + 'FetchStatus';
}

function nameOfFetchStatusAttributeForAttribute(attributeName: string): string {
  return 'hasFetched' + StringUtils.capitalize(attributeName);
}

function isFetchStatusAttribute(attribute:ValueObject.Attribute, valueType:ValueObject.Type):boolean {
  return attribute.type.name !== nameOfFetchStatusForValueTypeWithName(valueType.typeName);
}

function fetchStatusAttributeForAttribute(attribute:ValueObject.Attribute):ValueObject.Attribute {
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
      underlyingType:Maybe.Nothing<string>()
    }
  };
}

function fetchedAttributesForValueType(valueType:ValueObject.Type) {
  return valueType.attributes.filter(function(attribute:ValueObject.Attribute) {
      return isFetchStatusAttribute(attribute, valueType);
    }).map(fetchStatusAttributeForAttribute);
}

function fetchStatusValueTypeForValueType(valueType:ValueObject.Type):ValueObject.Type {
  return {
    annotations:{},
    attributes: fetchedAttributesForValueType(valueType),
    comments: [],
    excludes: [],
    includes: [],
    libraryName: valueType.libraryName,
    typeLookups:[],
    typeName: nameOfFetchStatusForValueTypeWithName(valueType.typeName)
  };
}

function fetchStatusAttributeForValueType(valueType:ValueObject.Type):ValueObject.Attribute {
  const fetchStatusTypeName:string = nameOfFetchStatusForValueTypeWithName(valueType.typeName);

  return {
    annotations: {},
    comments: [],
    name: 'fetchStatus',
    nullability:ObjC.Nullability.Inherited(),
    type: {
      fileTypeIsDefinedIn:Maybe.Nothing<string>(),
      libraryTypeIsDefinedIn:valueType.libraryName,
      name:fetchStatusTypeName,
      reference:ValueObjectUtils.typeReferenceForValueTypeWithName(fetchStatusTypeName),
      underlyingType:Maybe.Just<string>('NSObject')
    }
  };
}

export function createPlugin():ValueObject.Plugin {
  return {
    additionalFiles: function(valueType:ValueObject.Type):Code.File[] {
      return [];
    },
    additionalTypes: function(valueType:ValueObject.Type):ValueObject.Type[] {
      return [
        fetchStatusValueTypeForValueType(valueType)
      ];
    },
    attributes: function(valueType:ValueObject.Type):ValueObject.Attribute[] {
      return [
        fetchStatusAttributeForValueType(valueType)
      ];
    },
    fileTransformation: function(request:FileWriter.Request):FileWriter.Request {
      return request;
    },
    fileType: function(valueType:ValueObject.Type):Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(valueType:ValueObject.Type):ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(valueType:ValueObject.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(valueType:ValueObject.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(valueType:ValueObject.Type):ObjC.Protocol[] {
      return [];
    },
    imports: function(valueType:ValueObject.Type):ObjC.Import[] {
      return [];
    },
    instanceMethods: function(valueType:ValueObject.Type):ObjC.Method[] {
      return [];
    },
    properties: function(valueType:ValueObject.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun:['RMFetchStatus'],
    staticConstants: function(valueType:ValueObject.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(valueType:ValueObject.Type):Error.Error[] {
      return [];
    },
    nullability: function(valueType:ValueObject.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    }
  };
}
