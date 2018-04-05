/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AlgebraicType = require('../algebraic-type');
import Code = require('../code');
import Error = require('../error');
import FileWriter = require('../file-writer');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjectSpec = require('../object-spec');

function copyInstanceMethod():ObjC.Method {
  return {
    preprocessors:[],
    belongsToProtocol:Maybe.Just<string>('NSCopying'),
    code: ['return self;'],
    comments:[],
    compilerAttributes:[],
    keywords: [
      {
        name: 'copyWithZone',
        argument: Maybe.Just<ObjC.KeywordArgument>({
          name: 'zone',
          modifiers: [ObjC.KeywordArgumentModifier.Nullable()],
          type: {
            name: 'NSZone',
            reference: 'NSZone *'
          }
        })
      }
    ],
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'id',
        reference: 'id'
      }),
      modifiers: []
    }
  };
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
      return [];
    },
    headerComments: function(objectType:ObjectSpec.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
      return [
        {
          name: 'NSCopying'
        }
      ];
    },
    imports: function(objectType:ObjectSpec.Type):ObjC.Import[] {
      return [];
    },
    instanceMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
      return [copyInstanceMethod()];
    },
    properties: function(objectType:ObjectSpec.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun:['RMCopying'],
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
      return [];
    },
    headerComments: function(algebraicType:AlgebraicType.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(algebraicType:AlgebraicType.Type):ObjC.Protocol[] {
      return [
        {
          name: 'NSCopying'
        }
      ];
    },
    imports: function(algebraicType:AlgebraicType.Type):ObjC.Import[] {
      return [];
    },
    instanceMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      return [copyInstanceMethod()];
    },
    internalProperties: function(algebraicType:AlgebraicType.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMCopying'],
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
