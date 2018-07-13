/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AlgebraicType = require('../algebraic-type');
import AlgebraicTypeUtils = require('../algebraic-type-utils');
import AlgebraicTypeUtilsForMatching = require('../algebraic-type-utils-for-matching');
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

function blockInvocationWrapper(blockInvocation:string):string {
  return 'result = std::make_shared<T>(' + blockInvocation + ');';
}

function buildLocalFunctionBlockDefinitionsForSubtype(algebraicType:AlgebraicType.Type, soFar:string[], subtype:AlgebraicType.Subtype):string[] {
  return soFar.concat(AlgebraicTypeUtilsForMatching.buildLocalFunctionBlockDefinitionsForSubtype(algebraicType, subtype, blockInvocationWrapper));
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

  const keywordPartsForMatchInvocation:string[] = algebraicType.subtypes.reduce(FunctionUtils.pApplyf4(algebraicType, AlgebraicTypeUtilsForMatching.buildKeywordPartsForInvokingMatchMethodForSubtype), []);
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
    name: algebraicType.name + 'Matcher',
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
      {file:algebraicType.name + '.h', isPublic:true, library:algebraicType.libraryName},
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
    namespaces: [],
    macros: [],
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
    macros: function(algebraicType:AlgebraicType.Type):ObjC.Macro[] {
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
    },
    subclassingRestricted: function(algebraicType:AlgebraicType.Type):boolean {
      return false;
    },
  };
}
