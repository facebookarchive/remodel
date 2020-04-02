/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from '../algebraic-type';
import * as AlgebraicTypeUtils from '../algebraic-type-utils';
import * as AlgebraicTypeUtilsForMatching from '../algebraic-type-utils-for-matching';
import * as CPlusPlus from '../cplusplus';
import * as Code from '../code';
import * as Error from '../error';
import * as FileWriter from '../file-writer';
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjCRenderer from '../objc-renderer';
import * as StringUtils from '../string-utils';

function matchingFileNameForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): string {
  return algebraicType.name + 'TemplatedMatchingHelpers';
}

function matchBlockNameForSubtype(subtype: AlgebraicType.Subtype): string {
  return (
    StringUtils.lowercased(AlgebraicTypeUtils.subtypeNameFromSubtype(subtype)) +
    'MatchHandler'
  );
}

function matcherFunctionBlockTypeForAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
): string {
  return (
    ObjCRenderer.renderableTypeReferenceNestingSubsequentToken(
      attribute.type.reference,
    ) + attribute.name
  );
}

function matcherFunctionParameterValueForSubtype(
  subtype: AlgebraicType.Subtype,
): string {
  return (
    'T(^' +
    matchBlockNameForSubtype(subtype) +
    ')(' +
    AlgebraicTypeUtils.attributesFromSubtype(subtype)
      .map(matcherFunctionBlockTypeForAttribute)
      .join(', ') +
    ')'
  );
}

function matcherFunctionParameterNameForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): string {
  return StringUtils.lowercased(
    StringUtils.stringRemovingCapitalizedPrefix(algebraicType.name),
  );
}

function matcherFunctionParameterForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): string {
  return (
    algebraicType.name +
    ' *' +
    matcherFunctionParameterNameForAlgebraicType(algebraicType)
  );
}

function blockInvocationWrapper(blockInvocation: string): string {
  return 'result = std::make_unique<T>(' + blockInvocation + ');';
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

function functionParameterProviderWithAlgebraicTypeFirst(
  algebraicType: AlgebraicType.Type,
): string[] {
  return [matcherFunctionParameterForAlgebraicType(algebraicType)].concat(
    algebraicType.subtypes.map(matcherFunctionParameterValueForSubtype),
  );
}

function functionParameterProviderWithAlgebraicTypeLast(
  algebraicType: AlgebraicType.Type,
): string[] {
  return algebraicType.subtypes
    .map(matcherFunctionParameterValueForSubtype)
    .concat(matcherFunctionParameterForAlgebraicType(algebraicType));
}

function matcherFunctionCodeForAlgebraicType(
  algebraicType: AlgebraicType.Type,
  functionParameterProvider: (algebraicType: AlgebraicType.Type) => string[],
): string[] {
  const functionDeclaration: string =
    'static T match(' +
    functionParameterProvider(algebraicType).join(', ') +
    ') {';
  const matcherFunctionParameterName: string = matcherFunctionParameterNameForAlgebraicType(
    algebraicType,
  );
  const assertionCode: string =
    'NSCAssert(' +
    matcherFunctionParameterName +
    ' != nil, @"The ADT object ' +
    matcherFunctionParameterName +
    ' is nil");';
  const resultDeclaration: string = '__block std::unique_ptr<T> result;';

  const blockCode: string[] = algebraicType.subtypes.reduce(
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
  const matchInvocationCode: string =
    '[' +
    matcherFunctionParameterName +
    ' ' +
    keywordPartsForMatchInvocation.join(' ') +
    '];';
  const returnCode: string = 'return *result;';
  const functionCode: string[] = [assertionCode, resultDeclaration, '']
    .concat(blockCode)
    .concat(matchInvocationCode)
    .concat(returnCode);

  const endFunctionDeclaration = '}';
  return [functionDeclaration]
    .concat(functionCode.map(StringUtils.indent(2)))
    .concat(endFunctionDeclaration);
}

function matcherFunctionShimCodeForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): string[] {
  const functionDeclaration: string =
    'static T match(' +
    functionParameterProviderWithAlgebraicTypeLast(algebraicType).join(', ') +
    ') {';
  return [
    functionDeclaration,
    `  return match(${matcherFunctionParameterNameForAlgebraicType(
      algebraicType,
    )}, ${algebraicType.subtypes.map(matchBlockNameForSubtype).join(', ')});`,
    '}',
  ];
}

function templateForMatchingAlgebraicTypeWithCode(
  code: string[],
): CPlusPlus.Template {
  return {
    templatedTypes: [
      {
        type: CPlusPlus.TemplateType.Typename(),
        value: 'T',
      },
    ],
    code: code,
  };
}

function structForMatchingAlgebraicType(
  algebraicType: AlgebraicType.Type,
): Code.Struct {
  return Code.Struct.ObjectiveCPlusPlusStruct({
    name: algebraicType.name + 'Matcher',
    templates: [templateForMatchingAlgebraicTypeWithCode([])],
    code: [
      matcherFunctionCodeForAlgebraicType(
        algebraicType,
        functionParameterProviderWithAlgebraicTypeFirst,
      ),
      matcherFunctionShimCodeForAlgebraicType(algebraicType),
    ],
  });
}

function conditionallyAddToSpread<T>(addIt: boolean, value: T): T[] {
  return addIt ? [value] : [];
}

function generateImports(
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
      file: matchingFileNameForAlgebraicType(algebraicType) + '.h',
      isPublic: false,
      requiresCPlusPlus: false,
      library: null,
    }),
    {
      file: 'memory',
      isPublic: true,
      requiresCPlusPlus: true,
      library: null,
    },
  ];
}

function matchingFileForAlgebraicType(
  algebraicType: AlgebraicType.Type,
  forBaseFile: boolean,
): Code.File {
  return {
    name: matchingFileNameForAlgebraicType(algebraicType),
    type: Code.FileType.ObjectiveCPlusPlus,
    imports: generateImports(algebraicType, forBaseFile),
    enumerations: [],
    blockTypes: [],
    comments: [],
    forwardDeclarations: AlgebraicTypeUtilsForMatching.forwardDeclarationsForAlgebraicType(
      algebraicType,
    ),
    staticConstants: [],
    functions: [],
    classes: [],
    diagnosticIgnores: [],
    structs: [structForMatchingAlgebraicType(algebraicType)],
    cppClasses: [],
    namespaces: [],
    macros: [],
  };
}

export function createAlgebraicTypePlugin(): AlgebraicType.Plugin {
  return {
    additionalFiles: function(algebraicType: AlgebraicType.Type): Code.File[] {
      return [matchingFileForAlgebraicType(algebraicType, false)];
    },
    transformBaseFile: function(
      algebraicType: AlgebraicType.Type,
      baseFile: Code.File,
    ): Code.File {
      baseFile.imports = baseFile.imports.concat(
        generateImports(algebraicType, true),
      );
      baseFile.structs.push(structForMatchingAlgebraicType(algebraicType));
      return baseFile;
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
    transformFileRequest: function(
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function(
      algebraicType: AlgebraicType.Type,
    ): Code.FileType | null {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations:
      AlgebraicTypeUtilsForMatching.forwardDeclarationsForAlgebraicType,
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
    requiredIncludesToRun: ['TemplatedMatching'],
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
    ): ObjC.ClassNullability | null {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(
      algebraicType: AlgebraicType.Type,
    ): boolean {
      return false;
    },
  };
}
