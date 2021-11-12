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
import * as ObjC from '../objc';
import * as StringUtils from '../string-utils';

function matchingBlockTypeForPlugin(
  assumeNonnull: boolean,
): AlgebraicTypeUtils.MatchingBlockType | null {
  return {
    name: 'ObjectType',
    underlyingType: 'ObjectType',
    modifiers: assumeNonnull ? [ObjC.KeywordArgumentModifier.Nullable()] : [],
    defaultValue: 'nil',
  };
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

function conditionallyAddToSpread<T>(addIt: boolean, value: T): T[] {
  return addIt ? [value] : [];
}

function genericMatcherImportsForAlgebraicType(
  algebraicType: AlgebraicType.Type,
  forBaseFile: boolean,
): ObjC.Import[] {
  return [
    {
      file: 'Foundation.h',
      isPublic: true,
      requiresCPlusPlus: false,
      library: 'Foundation',
    },
    {
      file: algebraicType.name + '.h',
      isPublic: true,
      requiresCPlusPlus: false,
      library: algebraicType.libraryName,
    },
    ...conditionallyAddToSpread(!forBaseFile, {
      file: fileNameForAlgebraicType(algebraicType) + '.h',
      isPublic: false,
      requiresCPlusPlus: false,
      library: null,
    }),
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

  const keywordPartsForMatchInvocation: string[] =
    algebraicType.subtypes.reduce(
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
    argument: {
      name: parameterNameForAlgebraicType(algebraicType),
      modifiers: [],
      type: {
        name: algebraicType.name,
        reference: algebraicType.name + '*',
      },
    },
  };
}

function keywordsForGenericAlgebraicTypeMatcher(
  algebraicType: AlgebraicType.Type,
  matchingBlockType: AlgebraicTypeUtils.MatchingBlockType | null,
): ObjC.Keyword[] {
  const firstKeyword: ObjC.Keyword =
    firstKeywordForGenericMatchMethod(algebraicType);
  const subtypeKeywords: ObjC.Keyword[] = algebraicType.subtypes.map(
    (subtype) =>
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
  const matchingBlockType = matchingBlockTypeForPlugin(
    algebraicType.includes.indexOf('RMAssumeNonnull') > -1,
  );

  return {
    preprocessors: [],
    belongsToProtocol: null,
    code: genericMatchingCodeForAlgebraicType(algebraicType),
    comments: [],
    compilerAttributes: [],
    keywords: keywordsForGenericAlgebraicTypeMatcher(
      algebraicType,
      matchingBlockType,
    ),
    returnType:
      AlgebraicTypeUtils.returnTypeForMatchingBlockType(matchingBlockType),
  };
}

function blockTypesForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): ObjC.BlockType[] {
  const matchingBlockType = matchingBlockTypeForPlugin(
    algebraicType.includes.indexOf('RMAssumeNonnull') > -1,
  );
  return algebraicType.subtypes.map((subtype) =>
    AlgebraicTypeUtils.blockTypeForSubtype(
      algebraicType,
      matchingBlockType,
      subtype,
    ),
  );
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
    inlineBlockTypedefs: blockTypesForAlgebraicType(algebraicType),
    instanceMethods: [],
    name: fileNameForAlgebraicType(algebraicType),
    properties: [],
    instanceVariables: [],
    implementedProtocols: [],
    nullability:
      algebraicType.includes.indexOf('RMAssumeNonnull') > -1
        ? ObjC.ClassNullability.assumeNonnull
        : ObjC.ClassNullability.default,
    subclassingRestricted: true,
  };
}

function genericMatchingFileForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): Code.File {
  return {
    name: fileNameForAlgebraicType(algebraicType),
    type: Code.FileType.ObjectiveC,
    imports: genericMatcherImportsForAlgebraicType(algebraicType, false),
    forwardDeclarations:
      AlgebraicTypeUtilsForMatching.forwardDeclarationsForAlgebraicType(
        algebraicType,
      ),
    comments: [],
    enumerations: [],
    blockTypes: [],
    staticConstants: [],
    globalVariables: [],
    functions: [],
    classes: [genericMatchingClassForAlgebraicType(algebraicType)],
    diagnosticIgnores: [],
    structs: [],
    cppClasses: [],
    namespaces: [],
    macros: [],
  };
}

export function createAlgebraicTypePlugin(): AlgebraicType.Plugin {
  return {
    additionalFiles: function (algebraicType: AlgebraicType.Type): Code.File[] {
      return [genericMatchingFileForAlgebraicType(algebraicType)];
    },
    transformBaseFile: function (
      algebraicType: AlgebraicType.Type,
      baseFile: Code.File,
    ): Code.File {
      baseFile.imports = baseFile.imports.concat(
        genericMatcherImportsForAlgebraicType(algebraicType, true),
      );
      baseFile.classes.push(
        genericMatchingClassForAlgebraicType(algebraicType),
      );
      return baseFile;
    },
    blockTypes: function (algebraicType: AlgebraicType.Type): ObjC.BlockType[] {
      return [];
    },
    classMethods: function (algebraicType: AlgebraicType.Type): ObjC.Method[] {
      return [];
    },
    enumerations: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.Enumeration[] {
      return [];
    },
    transformFileRequest: function (
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function (
      algebraicType: AlgebraicType.Type,
    ): Code.FileType | null {
      return null;
    },
    forwardDeclarations:
      AlgebraicTypeUtilsForMatching.forwardDeclarationsForAlgebraicType,
    functions: function (algebraicType: AlgebraicType.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.ImplementedProtocol[] {
      return [];
    },
    imports: function (algebraicType: AlgebraicType.Type): ObjC.Import[] {
      return [];
    },
    instanceMethods: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.Method[] {
      return [];
    },
    instanceVariables: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return [];
    },
    macros: function (algebraicType: AlgebraicType.Type): ObjC.Macro[] {
      return [];
    },
    requiredIncludesToRun: ['GenericMatching'],
    staticConstants: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.Constant[] {
      return [];
    },
    validationErrors: function (
      algebraicType: AlgebraicType.Type,
    ): Error.Error[] {
      return [];
    },
    nullability: function (
      algebraicType: AlgebraicType.Type,
    ): ObjC.ClassNullability | null {
      return null;
    },
    subclassingRestricted: function (
      algebraicType: AlgebraicType.Type,
    ): boolean {
      return false;
    },
  };
}
