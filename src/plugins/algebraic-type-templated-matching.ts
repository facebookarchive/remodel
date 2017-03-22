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
import CPlusPlus = require('../cplusplus');
import Code = require('../code');
import Error = require('../error');
import FileWriter = require('../file-writer');
import FunctionUtils = require('../function-utils');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjCRenderer = require('../objc-renderer');
import StringUtils = require('../string-utils');

function matchingFileNameForAlgebraicType(algebraicType:AlgebraicType.Type):string {
  return algebraicType.name + 'TemplatedMatchingHelpers';
}

function matchBlockNameForSubtype(subtype:AlgebraicType.Subtype):string {
  return StringUtils.lowercased(AlgebraicTypeUtils.subtypeNameFromSubtype(subtype)) + 'MatchHandler';
}

function matcherFunctionBlockTypeForAttribute(attribute:AlgebraicType.SubtypeAttribute):string {
  return ObjCRenderer.renderableTypeReferenceNestingSubsequentToken(attribute.type.reference) + attribute.name;
}

function matcherFunctionParameterValueForSubtype(subtype:AlgebraicType.Subtype):string {
  return 'T(^' + matchBlockNameForSubtype(subtype) + ')(' + AlgebraicTypeUtils.attributesFromSubtype(subtype).map(matcherFunctionBlockTypeForAttribute).join(', ') + ')';
}

function matcherFunctionParameterNameForAlgebraicType(algebraicType:AlgebraicType.Type):string {
  return StringUtils.lowercased(StringUtils.stringRemovingCapitalizedPrefix(algebraicType.name));
}

function matcherFunctionParameterForAlgebraicType(algebraicType:AlgebraicType.Type):string {
  return algebraicType.name + ' *' + matcherFunctionParameterNameForAlgebraicType(algebraicType);
}

function nameOfBlockTypeParameter(parameter:ObjC.BlockTypeParameter):string {
  return parameter.name;
}

function localFunctionBlockDefinitionNameForSubtype(subtype:AlgebraicType.Subtype):string {
  return 'match' + AlgebraicTypeUtils.subtypeNameFromSubtype(subtype);
}

function buildLocalFunctionBlockDefinitionsForSubtype(algebraicType:AlgebraicType.Type, soFar:string[], subtype:AlgebraicType.Subtype):string[] {
  const blockType:ObjC.BlockType = AlgebraicTypeUtils.blockTypeForSubtype(algebraicType, subtype);
  const start:string = blockType.name + ' ' + localFunctionBlockDefinitionNameForSubtype(subtype) + ' = ^(' + blockType.parameters.map(ObjCRenderer.toBlockTypeParameterString).join(', ') + ') {';
  const blockBody:string = 'result = std::make_shared<T>(' + matchBlockNameForSubtype(subtype) + '(' + blockType.parameters.map(nameOfBlockTypeParameter).join(', ') + '));';
  const end:string[] = ['};', ''];
  const blockCode:string[] = [start].concat(StringUtils.indent(2)(blockBody)).concat(end);
  return soFar.concat(blockCode);
}

function keywordForInvokingMatchMethodForSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype, index:number):ObjC.Keyword {
  if (index === 0) {
    return AlgebraicTypeUtils.firstKeywordForMatchMethodFromSubtype(algebraicType, subtype);
  } else {
    return AlgebraicTypeUtils.keywordForMatchMethodFromSubtype(algebraicType, subtype);
  }
}

function buildKeywordPartsForInvokingMatchMethodForSubtype(algebraicType:AlgebraicType.Type, soFar:string[], subtype:AlgebraicType.Subtype, index:number):string[] {
  const keyword:ObjC.Keyword = keywordForInvokingMatchMethodForSubtype(algebraicType, subtype, index);
  const code:string = keyword.name + ':' + localFunctionBlockDefinitionNameForSubtype(subtype);
  return soFar.concat(code);
}

function functionParameterProviderWithAlgebraicTypeFirst(algebraicType:AlgebraicType.Type):string[] {
  return [matcherFunctionParameterForAlgebraicType(algebraicType)].concat(algebraicType.subtypes.map(matcherFunctionParameterValueForSubtype));
}

function functionParameterProviderWithAlgebraicTypeLast(algebraicType:AlgebraicType.Type):string[] {
  return algebraicType.subtypes.map(matcherFunctionParameterValueForSubtype).concat(matcherFunctionParameterForAlgebraicType(algebraicType));
}

function matcherFunctionCodeForAlgebraicType(algebraicType:AlgebraicType.Type, functionParameterProvider:(algebraicType:AlgebraicType.Type) => string[]):string[] {
  const functionDeclaration:string = 'static T match(' + functionParameterProvider(algebraicType).join(', ') + ') {';
  const matcherFunctionParameterName:string = matcherFunctionParameterNameForAlgebraicType(algebraicType);
  const assertionCode:string = 'NSCAssert(' + matcherFunctionParameterName + ' != nil, @"The ADT object ' + matcherFunctionParameterName + ' is nil");';
  const resultDeclaration:string = '__block std::shared_ptr<T> result;';

  const blockCode:string[] = algebraicType.subtypes.reduce(FunctionUtils.pApplyf3(algebraicType, buildLocalFunctionBlockDefinitionsForSubtype), []);

  const keywordPartsForMatchInvocation:string[] = algebraicType.subtypes.reduce(FunctionUtils.pApplyf4(algebraicType, buildKeywordPartsForInvokingMatchMethodForSubtype), []);
  const matchInvocationCode:string = '[' + matcherFunctionParameterName + ' ' + keywordPartsForMatchInvocation.join(' ') +'];';
  const returnCode:string = 'return *result;';
  const functionCode:string[] = [assertionCode, resultDeclaration, ''].concat(blockCode).concat(matchInvocationCode).concat(returnCode);

  const endFunctionDeclaration = '}';
  return [functionDeclaration].concat(functionCode.map(StringUtils.indent(2))).concat(endFunctionDeclaration);
}

function templateForMatchingAlgebraicTypeWithCode(code:string[]):CPlusPlus.Template {
  return {
    templatedTypes: [
      {
        type: CPlusPlus.TemplateType.Typename(),
        value: 'T'
      }
    ],
    code: code
  };
}

function structForMatchingAlgebraicType(algebraicType:AlgebraicType.Type):CPlusPlus.Struct {
  return {
    name: algebraicType.name + 'Matching',
    templates: [
      templateForMatchingAlgebraicTypeWithCode([])
    ],
    code: [
      matcherFunctionCodeForAlgebraicType(algebraicType, functionParameterProviderWithAlgebraicTypeFirst),
      matcherFunctionCodeForAlgebraicType(algebraicType, functionParameterProviderWithAlgebraicTypeLast)
    ]
  };
}

function matchingFileForAlgebraicType(algebraicType:AlgebraicType.Type):Code.File {
  return {
    name: matchingFileNameForAlgebraicType(algebraicType),
    type: Code.FileType.ObjectiveCPlusPlus(),
    imports:[
      {file:'Foundation.h', isPublic:true, library:Maybe.Just<string>('Foundation')},
      {file:algebraicType.name + '.h', isPublic:true, library:Maybe.Nothing<string>()},
      {file:matchingFileNameForAlgebraicType(algebraicType) + '.h', isPublic:false, library:Maybe.Nothing<string>()},
      {file:'memory', isPublic:true, library:Maybe.Nothing<string>()}
    ],
    enumerations: [],
    blockTypes: [],
    comments: [],
    forwardDeclarations: [],
    staticConstants: [],
    functions: [],
    classes: [],
    diagnosticIgnores:[],
    structs: [structForMatchingAlgebraicType(algebraicType)],
    namespaces: []
  };
}

export function createAlgebraicTypePlugin():AlgebraicType.Plugin {
  return {
    additionalFiles: function(algebraicType:AlgebraicType.Type):Code.File[] {
      return [matchingFileForAlgebraicType(algebraicType)];
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
    requiredIncludesToRun: ['TemplatedMatching'],
    staticConstants: function(algebraicType:AlgebraicType.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(algebraicType:AlgebraicType.Type):Error.Error[] {
      return [];
    },
    nullability: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    }
  };
}
