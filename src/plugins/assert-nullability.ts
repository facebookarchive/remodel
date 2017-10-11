/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import AlgebraicType = require('../algebraic-type');
import AlgebraicTypeUtils = require('../algebraic-type-utils');
import Code = require('../code');
import Error = require('../error');
import FileWriter = require('../file-writer');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjCNullabilityUtils = require('../objc-nullability-utils');
import ObjectSpec = require('../object-spec');
import ObjectSpecCodeUtils = require('../object-spec-code-utils');

function parameterAssertFunction():ObjC.Function {
  return {
    comments: [],
    name: 'RMParameterAssert',
    parameters: [
      {
        type: {
          name: 'BOOL',
          reference: 'BOOL'
        },
        name: 'condition'
      }
    ],
    returnType: {
      type: Maybe.Nothing<ObjC.Type>(),
      modifiers: []
    },
    code: [
      'NSParameterAssert(condition);'
    ],
    isPublic: false
  };
}

function canAssertExistenceForTypeOfObjectSpecAttribute(attribute:ObjectSpec.Attribute) {
  return ObjCNullabilityUtils.canAssertExistenceForType(ObjectSpecCodeUtils.computeTypeOfAttribute(attribute));
}

function canAssertExistenceForTypeOfAlgebraicTypeSubtypeAttribute(attribute:AlgebraicType.SubtypeAttribute) {
  return ObjCNullabilityUtils.canAssertExistenceForType(AlgebraicTypeUtils.computeTypeOfAttribute(attribute));
}

function parameterAssertFunctionArray(assumeNonnull:boolean, attributeNullabilities:ObjC.Nullability[]):ObjC.Function[] {
  if (ObjCNullabilityUtils.nullabilityRequiresNonnullProtection(assumeNonnull, attributeNullabilities)) {
    return [parameterAssertFunction()];
  } else {
    return [];
  }
}

export function createPlugin():ObjectSpec.Plugin {
  return {
    additionalFiles: function(objectType:ObjectSpec.Type):Code.File[] {
      return [];
    },
    additionalTypes: function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
      return [];
    },
    attributes: function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
      return [];
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
      const assumeNonnull:boolean = objectType.includes.indexOf('RMAssumeNonnull') >= 0;
      const attributeNullabilities = objectType.attributes.filter(canAssertExistenceForTypeOfObjectSpecAttribute).map(attribute => attribute.nullability);
      return parameterAssertFunctionArray(assumeNonnull, attributeNullabilities);
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
    requiredIncludesToRun:['RMAssertNullability'],
    staticConstants: function(objectType:ObjectSpec.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
      return [];
    },
    nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
      return false;
    },
  };
}

export function createAlgebraicTypePlugin():AlgebraicType.Plugin {
  return {
    additionalFiles: function(algebraicType:AlgebraicType.Type):Code.File[] {
      return [];
    },
    blockTypes: function(algebraicType:AlgebraicType.Type):ObjC.BlockType[] {
      return [];
    },
    classMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      return [];
    },
    enumerations: function(algebraicType:AlgebraicType.Type):ObjC.Enumeration[] {
      return [];
    },
    fileTransformation: function(request:FileWriter.Request):FileWriter.Request {
      return request;
    },
    fileType: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(algebraicType:AlgebraicType.Type):ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(algebraicType:AlgebraicType.Type):ObjC.Function[] {
      const assumeNonnull:boolean = algebraicType.includes.indexOf('RMAssumeNonnull') >= 0;
      const attributeNullabilities = AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes).filter(canAssertExistenceForTypeOfAlgebraicTypeSubtypeAttribute).map(attribute => attribute.nullability);
      return parameterAssertFunctionArray(assumeNonnull, attributeNullabilities);
    },
    headerComments: function(algebraicType:AlgebraicType.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(algebraicType:AlgebraicType.Type):ObjC.Protocol[] {
      return [];
    },
    imports: function(algebraicType:AlgebraicType.Type):ObjC.Import[] {
      return [];
    },
    instanceMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      return [];
    },
    internalProperties: function(algebraicType:AlgebraicType.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMAssertNullability'],
    staticConstants: function(algebraicType:AlgebraicType.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(algebraicType:AlgebraicType.Type):Error.Error[] {
      return [];
    },
    nullability: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(algebraicType:AlgebraicType.Type):boolean {
      return false;
    },
  };
}
