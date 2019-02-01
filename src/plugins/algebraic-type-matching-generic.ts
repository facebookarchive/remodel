/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from '../algebraic-type';
import * as AlgebraicTypeUtils from '../algebraic-type-utils';
import * as AlgebraicTypeUtilsForMatching from '../algebraic-type-utils-for-matching';
import * as Code from '../code';
import * as Error from '../error';
import * as FileWriter from '../file-writer';
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as StringUtils from '../string-utils';

function matchingBlockTypeForPlugin(): Maybe.Maybe<
  AlgebraicTypeUtils.MatchingBlockType
> {
  return Maybe.Just<AlgebraicTypeUtils.MatchingBlockType>({
    name: 'ObjectType',
    underlyingType: 'ObjectType',
    defaultValue: 'nil',
  });
}

function fileNameForAlgebraicType(algebraicType: AlgebraicType.Type): string {
  return algebraicType.name + 'Matcher';
}

function parameterNameForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): string {
  return StringUtils.lowercased(
    StringUtils.stringRemovingCapitalizedPrefix(algebraicType.name),
  );
}

//////// Imports

function genericMatcherImportsForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): ObjC.Import[] {
  return [
    {file: 'Foundation.h', isPublic: true, library: Maybe.Just('Foundation')},
    {
      file: algebraicType.name + '.h',
      isPublic: true,
      library: algebraicType.libraryName,
    },
    {
      file: fileNameForAlgebraicType(algebraicType) + '.h',
      isPublic: false,
      library: Maybe.Nothing<string>(),
    },
  ];
}

//////// Matching Implementation

function blockInvocationWrapper(blockInvocation: string): string {
  return 'result = ' + blockInvocation + ';';
}

function buildLocalFunctionBlockDefinitionsForSubtype(
  algebraicType: AlgebraicType.Type,
  soFar: string[],
  subtype: AlgebraicType.Subtype,
): string[] {
  return soFar.concat(
    AlgebraicTypeUtilsForMatching.buildLocalFunctionBlockDefinitionsForSubtype(
      algebraicType,
      subtype,
      blockInvocationWrapper,
    ),
  );
}

function genericMatchingCodeForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): string[] {
  const localVariableDeclaration: string[] = ['__block id result = nil;', ''];

  const matchingBlockCode: string[] = algebraicType.subtypes.reduce(
    (soFar, subtype) =>
      buildLocalFunctionBlockDefinitionsForSubtype(
        algebraicType,
        soFar,
        subtype,
      ),
    [],
  );

  const keywordPartsForMatchInvocation: string[] = algebraicType.subtypes.reduce(
    (soFar, subtype, idx) =>
      AlgebraicTypeUtilsForMatching.buildKeywordPartsForInvokingMatchMethodForSubtype(
        algebraicType,
        soFar,
        subtype,
        idx,
      ),
    [],
  );
  const matchInvocation: string[] = [
    '[' +
      parameterNameForAlgebraicType(algebraicType) +
      ' ' +
      keywordPartsForMatchInvocation.join(' ') +
      '];',
  ];

  const returnStatement: string[] = ['', 'return result;'];

  return localVariableDeclaration
    .concat(matchingBlockCode)
    .concat(matchInvocation)
    .concat(returnStatement);
}

//////// Matching Class Method

function firstKeywordForGenericMatchMethod(
  algebraicType: AlgebraicType.Type,
): ObjC.Keyword {
  return {
    name: 'match',
    argument: Maybe.Just({
      name: parameterNameForAlgebraicType(algebraicType),
      modifiers: [],
      type: {
        name: algebraicType.name,
        reference: algebraicType.name + '*',
      },
    }),
  };
}

function keywordsForGenericAlgebraicTypeMatcher(
  algebraicType: AlgebraicType.Type,
  matchingBlockType: Maybe.Maybe<AlgebraicTypeUtils.MatchingBlockType>,
): ObjC.Keyword[] {
  const firstKeyword: ObjC.Keyword = firstKeywordForGenericMatchMethod(
    algebraicType,
  );
  const subtypeKeywords: ObjC.Keyword[] = algebraicType.subtypes.map(subtype =>
    AlgebraicTypeUtils.keywordForMatchMethodFromSubtype(
      algebraicType,
      matchingBlockType,
      false,
      subtype,
    ),
  );
  return [firstKeyword].concat(subtypeKeywords);
}

function classMethodForGenericMatchingOfAlgebraicType(
  algebraicType: AlgebraicType.Type,
): ObjC.Method {
  const matchingBlockType: Maybe.Maybe<
    AlgebraicTypeUtils.MatchingBlockType
  > = matchingBlockTypeForPlugin();
  return {
    preprocessors: [],
    belongsToProtocol: Maybe.Nothing<string>(),
    code: genericMatchingCodeForAlgebraicType(algebraicType),
    comments: [],
    compilerAttributes: [],
    keywords: keywordsForGenericAlgebraicTypeMatcher(
      algebraicType,
      matchingBlockType,
    ),
    returnType: AlgebraicTypeUtils.returnTypeForMatchingBlockType(
      matchingBlockType,
    ),
  };
}

//////// Matcher File / Class

function genericMatchingClassForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): ObjC.Class {
  return {
    baseClassName: 'NSObject',
    covariantTypes: ['ObjectType'],
    classMethods: [classMethodForGenericMatchingOfAlgebraicType(algebraicType)],
    comments: [],
    instanceMethods: [],
    name: fileNameForAlgebraicType(algebraicType),
    properties: [],
    instanceVariables: [],
    implementedProtocols: [],
    nullability: ObjC.ClassNullability.default,
    subclassingRestricted: true,
  };
}

function genericMatchingFileForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): Code.File {
  const matchingBlockType = matchingBlockTypeForPlugin();
  return {
    name: fileNameForAlgebraicType(algebraicType),
    type: Code.FileType.ObjectiveC(),
    imports: genericMatcherImportsForAlgebraicType(algebraicType),
    forwardDeclarations: [],
    comments: [],
    enumerations: [],
    blockTypes: algebraicType.subtypes.map(subtype =>
      AlgebraicTypeUtils.blockTypeForSubtype(
        algebraicType,
        matchingBlockType,
        true,
        subtype,
      ),
    ),
    staticConstants: [],
    functions: [],
    classes: [genericMatchingClassForAlgebraicType(algebraicType)],
    diagnosticIgnores: [],
    structs: [],
    namespaces: [],
    macros: [],
  };
}

export function createAlgebraicTypePlugin(): AlgebraicType.Plugin {
  return {
    additionalFiles: function(algebraicType: AlgebraicType.Type): Code.File[] {
      return [genericMatchingFileForAlgebraicType(algebraicType)];
    },
    blockTypes: function(algebraicType: AlgebraicType.Type): ObjC.BlockType[] {
      return [];
    },
    classMethods: function(algebraicType: AlgebraicType.Type): ObjC.Method[] {
      return [];
    },
    enumerations: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Enumeration[] {
      return [];
    },
    fileTransformation: function(
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function(
      algebraicType: AlgebraicType.Type,
    ): Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(algebraicType: AlgebraicType.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Protocol[] {
      return [];
    },
    imports: function(algebraicType: AlgebraicType.Type): ObjC.Import[] {
      return [];
    },
    instanceMethods: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Method[] {
      return [];
    },
    instanceVariables: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return [];
    },
    macros: function(algebraicType: AlgebraicType.Type): ObjC.Macro[] {
      return [];
    },
    requiredIncludesToRun: ['GenericMatching'],
    staticConstants: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Constant[] {
      return [];
    },
    validationErrors: function(
      algebraicType: AlgebraicType.Type,
    ): Error.Error[] {
      return [];
    },
    nullability: function(
      algebraicType: AlgebraicType.Type,
    ): Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(
      algebraicType: AlgebraicType.Type,
    ): boolean {
      return false;
    },
  };
}
