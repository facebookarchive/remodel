/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import AlgebraicType = require('./algebraic-type');
import FunctionUtils = require('./function-utils');
import Maybe = require('./maybe');
import ObjC = require('./objc');
import StringUtils = require('./string-utils');

export interface MatchingBlockType {
  name: string;
  underlyingType: string;
  defaultValue: string;
}

export function nameForInstanceVariableStoringSubtype(): string {
  return 'subtype';
}

export function valueAccessorForInstanceVariableStoringSubtype(): string {
  return '_' + nameForInstanceVariableStoringSubtype();
}

export function attributesFromSubtype(
  subtype: AlgebraicType.Subtype,
): AlgebraicType.SubtypeAttribute[] {
  return subtype.match(
    function(
      namedAttributeCollectionSubtype: AlgebraicType.NamedAttributeCollectionSubtype,
    ) {
      return namedAttributeCollectionSubtype.attributes;
    },
    function(attribute: AlgebraicType.SubtypeAttribute) {
      return [attribute];
    },
  );
}

export function subtypeNameFromSubtype(subtype: AlgebraicType.Subtype): string {
  return subtype.match(
    function(
      namedAttributeCollectionSubtype: AlgebraicType.NamedAttributeCollectionSubtype,
    ) {
      return namedAttributeCollectionSubtype.name;
    },
    function(attribute: AlgebraicType.SubtypeAttribute) {
      return StringUtils.capitalize(attribute.name);
    },
  );
}

function buildAttributesFromSubtype(
  soFar: AlgebraicType.SubtypeAttribute[],
  subtype: AlgebraicType.Subtype,
): AlgebraicType.SubtypeAttribute[] {
  return soFar.concat(attributesFromSubtype(subtype));
}

export function allAttributesFromSubtypes(
  subtypes: AlgebraicType.Subtype[],
): AlgebraicType.SubtypeAttribute[] {
  return subtypes.reduce(buildAttributesFromSubtype, []);
}

export function mapAttributesWithSubtypeFromSubtypes<T>(
  subtypes: AlgebraicType.Subtype[],
  mapper: (
    subtype: AlgebraicType.Subtype,
    attribute: AlgebraicType.SubtypeAttribute,
  ) => T,
): T[] {
  return subtypes.reduce(function(soFar: T[], subtype: AlgebraicType.Subtype) {
    return soFar.concat(
      attributesFromSubtype(subtype).map(
        FunctionUtils.pApplyf2(subtype, mapper),
      ),
    );
  }, []);
}

function typeForUnderlyingType(underlyingType: string): ObjC.Type {
  return {
    name: underlyingType,
    reference: underlyingType === 'NSObject' ? 'NSObject*' : underlyingType,
  };
}

export function computeTypeOfAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
): ObjC.Type {
  return Maybe.match(
    typeForUnderlyingType,
    function(): ObjC.Type {
      return {
        name: attribute.type.name,
        reference: attribute.type.reference,
      };
    },
    attribute.type.underlyingType,
  );
}

export function nameOfInstanceVariableForAttribute(
  subtype: AlgebraicType.Subtype,
  attribute: AlgebraicType.SubtypeAttribute,
): string {
  return subtype.match(
    function(
      namedAttributeCollectionSubtype: AlgebraicType.NamedAttributeCollectionSubtype,
    ) {
      return (
        StringUtils.lowercased(namedAttributeCollectionSubtype.name) +
        '_' +
        StringUtils.lowercased(attribute.name)
      );
    },
    function(attribute: AlgebraicType.SubtypeAttribute) {
      return StringUtils.lowercased(attribute.name);
    },
  );
}

export function valueAccessorForInstanceVariableForAttribute(
  subtype: AlgebraicType.Subtype,
  attribute: AlgebraicType.SubtypeAttribute,
): string {
  return '_' + nameOfInstanceVariableForAttribute(subtype, attribute);
}

export function EnumerationNameForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): string {
  return '_' + algebraicType.name + 'Subtypes';
}

export function EnumerationValueNameForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
): string {
  return (
    EnumerationNameForAlgebraicType(algebraicType) +
    subtypeNameFromSubtype(subtype)
  );
}

function caseStatementForSubtypeWithSubtypeMapper(
  algebraicType: AlgebraicType.Type,
  subtypeMapper: (
    algebraicType: AlgebraicType.Type,
    subtype: AlgebraicType.Subtype,
  ) => string[],
  soFar: string[],
  subtype: AlgebraicType.Subtype,
): string[] {
  const internalCode: string[] = subtypeMapper(algebraicType, subtype);
  const code: string[] = [
    'case ' + EnumerationValueNameForSubtype(algebraicType, subtype) + ': {',
  ]
    .concat(internalCode.map(StringUtils.indent(2)))
    .concat(['  break;', '}']);
  return soFar.concat(code);
}

export function codeForSwitchingOnSubtypeWithSubtypeMapper(
  algebraicType: AlgebraicType.Type,
  subtypeValueAccessor: string,
  subtypeMapper: (
    algebraicType: AlgebraicType.Type,
    subtype: AlgebraicType.Subtype,
  ) => string[],
): string[] {
  const caseStatements: string[] = algebraicType.subtypes.reduce(
    FunctionUtils.pApply2f4(
      algebraicType,
      subtypeMapper,
      caseStatementForSubtypeWithSubtypeMapper,
    ),
    [],
  );
  return ['switch (' + subtypeValueAccessor + ') {']
    .concat(caseStatements.map(StringUtils.indent(2)))
    .concat('}');
}

function blockTypeNameForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
  matchingBlockType: Maybe.Maybe<MatchingBlockType>,
): string {
  return Maybe.match(
    function Just(matchingBlockType: MatchingBlockType) {
      return (
        algebraicType.name +
        StringUtils.capitalize(matchingBlockType.name) +
        StringUtils.capitalize(subtypeNameFromSubtype(subtype)) +
        'MatchHandler'
      );
    },
    function Nothing() {
      return (
        algebraicType.name +
        StringUtils.capitalize(subtypeNameFromSubtype(subtype)) +
        'MatchHandler'
      );
    },
    matchingBlockType,
  );
}

function blockTypeParameterForSubtypeAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
): ObjC.BlockTypeParameter {
  return {
    name: attribute.name,
    type: {
      name: attribute.type.name,
      reference: attribute.type.reference,
    },
    nullability: attribute.nullability,
  };
}

function voidBlockParameter(): ObjC.BlockTypeParameter {
  return {
    name: null,
    type: null,
    nullability: ObjC.Nullability.Inherited(),
  };
}

function blockParametersForSubtype(
  subtype: AlgebraicType.Subtype,
): ObjC.BlockTypeParameter[] {
  const attributes: AlgebraicType.SubtypeAttribute[] = attributesFromSubtype(
    subtype,
  );
  if (attributes.length > 0) {
    return attributes.map(blockTypeParameterForSubtypeAttribute);
  } else {
    return [voidBlockParameter()];
  }
}

export function returnTypeForMatchingBlockType(
  matchingBlockType: Maybe.Maybe<MatchingBlockType>,
): ObjC.ReturnType {
  return Maybe.match(
    function Just(matchingBlockType: MatchingBlockType) {
      return {
        type: Maybe.Just<ObjC.Type>(
          typeForUnderlyingType(matchingBlockType.underlyingType),
        ),
        modifiers: [],
      };
    },
    function Nothing() {
      return {
        type: Maybe.Nothing<ObjC.Type>(),
        modifiers: [],
      };
    },
    matchingBlockType,
  );
}

export function blockTypeForSubtype(
  algebraicType: AlgebraicType.Type,
  matchingBlockType: Maybe.Maybe<MatchingBlockType>,
  isInlined: boolean,
  subtype: AlgebraicType.Subtype,
): ObjC.BlockType {
  return {
    comments: [],
    name: blockTypeNameForSubtype(algebraicType, subtype, matchingBlockType),
    parameters: blockParametersForSubtype(subtype),
    returnType: returnTypeForMatchingBlockType(matchingBlockType),
    isPublic: true,
    isInlined: isInlined,
    nullability:
      algebraicType.includes.indexOf('RMAssumeNonnull') >= 0
        ? ObjC.ClassNullability.assumeNonnull
        : ObjC.ClassNullability.default,
  };
}

export function blockParameterNameForMatchMethodFromSubtype(
  subtype: AlgebraicType.Subtype,
): string {
  return StringUtils.lowercased(
    subtypeNameFromSubtype(subtype) + 'MatchHandler',
  );
}

export function keywordForMatchMethodFromSubtype(
  algebraicType: AlgebraicType.Type,
  matchingBlockType: Maybe.Maybe<MatchingBlockType>,
  assumesNonnull: boolean,
  subtype: AlgebraicType.Subtype,
): ObjC.Keyword {
  const blockType: ObjC.BlockType = blockTypeForSubtype(
    algebraicType,
    matchingBlockType,
    false,
    subtype,
  );
  return {
    name: StringUtils.lowercased(subtypeNameFromSubtype(subtype)),
    argument: Maybe.Just({
      name: blockParameterNameForMatchMethodFromSubtype(subtype),
      modifiers: (assumesNonnull
        ? [ObjC.KeywordArgumentModifier.Nullable()]
        : []
      ).concat(ObjC.KeywordArgumentModifier.Noescape()),
      type: {
        name: blockType.name,
        reference: blockType.name,
      },
    }),
  };
}

export function firstKeywordForMatchMethodFromSubtype(
  algebraicType: AlgebraicType.Type,
  matchingBlockType: Maybe.Maybe<MatchingBlockType>,
  assumesNonnull: boolean,
  subtype: AlgebraicType.Subtype,
): ObjC.Keyword {
  const normalKeyword: ObjC.Keyword = keywordForMatchMethodFromSubtype(
    algebraicType,
    matchingBlockType,
    assumesNonnull,
    subtype,
  );
  return {
    argument: normalKeyword.argument,
    name: Maybe.match(
      function Just(matchingBlockType: MatchingBlockType) {
        return (
          'match' +
          StringUtils.capitalize(matchingBlockType.name) +
          StringUtils.capitalize(normalKeyword.name)
        );
      },
      function Nothing() {
        return 'match' + StringUtils.capitalize(normalKeyword.name);
      },
      matchingBlockType,
    ),
  };
}

function swiftNameForAlgebraicTypeMatcher(
  algebraicType: AlgebraicType.Type,
): string {
  const keywords = algebraicType.subtypes
    .map(
      subtype => StringUtils.lowercased(subtypeNameFromSubtype(subtype)) + ':',
    )
    .join('');

  return `NS_SWIFT_NAME(match(${keywords}))`;
}

function instanceMethodKeywordsForMatchingSubtypesOfAlgebraicType(
  algebraicType: AlgebraicType.Type,
  matchingBlockType: Maybe.Maybe<MatchingBlockType>,
  nullable: boolean,
): ObjC.Keyword[] {
  const firstKeyword: ObjC.Keyword = firstKeywordForMatchMethodFromSubtype(
    algebraicType,
    matchingBlockType,
    nullable,
    algebraicType.subtypes[0],
  );
  const additionalKeywords: ObjC.Keyword[] = algebraicType.subtypes
    .slice(1)
    .map(
      FunctionUtils.pApply3f4(
        algebraicType,
        matchingBlockType,
        nullable,
        keywordForMatchMethodFromSubtype,
      ),
    );
  return [firstKeyword].concat(additionalKeywords);
}

function blockInvocationWithNilCheckForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
): string[] {
  return [
    'if (' + blockParameterNameForMatchMethodFromSubtype(subtype) + ') {',
    StringUtils.indent(2)(blockInvocationForSubtype(algebraicType, subtype)),
    '}',
  ];
}

function resultReturningBlockInvocationWithNilCheckForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
): string[] {
  return [
    'if (' + blockParameterNameForMatchMethodFromSubtype(subtype) + ') {',
    StringUtils.indent(2)(
      'result = ' + blockInvocationForSubtype(algebraicType, subtype),
    ),
    '}',
  ];
}

function blockInvocationForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
): string {
  return (
    blockParameterNameForMatchMethodFromSubtype(subtype) +
    '(' +
    attributesFromSubtype(subtype)
      .map(
        FunctionUtils.pApplyf2(
          subtype,
          valueAccessorForInstanceVariableForAttribute,
        ),
      )
      .join(', ') +
    ');'
  );
}

function matcherCodeForAlgebraicType(
  algebraicType: AlgebraicType.Type,
  matchingBlockType: Maybe.Maybe<MatchingBlockType>,
): string[] {
  return Maybe.match(
    function Just(matchingBlockType: MatchingBlockType) {
      const switchStatement: string[] = codeForSwitchingOnSubtypeWithSubtypeMapper(
        algebraicType,
        valueAccessorForInstanceVariableStoringSubtype(),
        resultReturningBlockInvocationWithNilCheckForSubtype,
      );
      return [
        '__block ' +
          matchingBlockType.underlyingType +
          ' result = ' +
          matchingBlockType.defaultValue +
          ';',
      ]
        .concat(switchStatement)
        .concat('return result;');
    },
    function Nothing() {
      return codeForSwitchingOnSubtypeWithSubtypeMapper(
        algebraicType,
        valueAccessorForInstanceVariableStoringSubtype(),
        blockInvocationWithNilCheckForSubtype,
      );
    },
    matchingBlockType,
  );
}

export function instanceMethodForMatchingSubtypesOfAlgebraicType(
  algebraicType: AlgebraicType.Type,
  matchingBlockType: Maybe.Maybe<MatchingBlockType>,
  assumesNonnull: boolean,
): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: Maybe.Nothing<string>(),
    code: matcherCodeForAlgebraicType(algebraicType, matchingBlockType),
    comments: [],
    compilerAttributes: [swiftNameForAlgebraicTypeMatcher(algebraicType)],
    keywords: instanceMethodKeywordsForMatchingSubtypesOfAlgebraicType(
      algebraicType,
      matchingBlockType,
      assumesNonnull,
    ),
    returnType: returnTypeForMatchingBlockType(matchingBlockType),
  };
}
