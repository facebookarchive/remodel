/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from './algebraic-type';
import * as AlgebraicTypeUtils from './algebraic-type-utils';
import * as Maybe from './maybe';
import * as ObjC from './objc';
import * as ObjCRenderer from './objc-renderer';
import * as StringUtils from './string-utils';

function localFunctionBlockDefinitionNameForSubtype(
  subtype: AlgebraicType.Subtype,
): string {
  return (
    'match' +
    StringUtils.capitalize(AlgebraicTypeUtils.subtypeNameFromSubtype(subtype))
  );
}

function matchBlockNameForSubtype(subtype: AlgebraicType.Subtype): string {
  return (
    StringUtils.lowercased(AlgebraicTypeUtils.subtypeNameFromSubtype(subtype)) +
    'MatchHandler'
  );
}

function nameOfBlockTypeParameter(parameter: ObjC.BlockTypeParameter): string {
  return parameter.name;
}

function keywordForInvokingMatchMethodForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
  index: number,
): ObjC.Keyword {
  if (index === 0) {
    return AlgebraicTypeUtils.firstKeywordForMatchMethodFromSubtype(
      algebraicType,
      Maybe.Nothing<AlgebraicTypeUtils.MatchingBlockType>(),
      false,
      subtype,
    );
  } else {
    return AlgebraicTypeUtils.keywordForMatchMethodFromSubtype(
      algebraicType,
      Maybe.Nothing<AlgebraicTypeUtils.MatchingBlockType>(),
      false,
      subtype,
    );
  }
}

export function buildLocalFunctionBlockDefinitionsForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
  blockInvocationWrapper: (blockInvocation: string) => string,
): string[] {
  const blockType: ObjC.BlockType = AlgebraicTypeUtils.blockTypeForSubtype(
    algebraicType,
    Maybe.Nothing<AlgebraicTypeUtils.MatchingBlockType>(),
    subtype,
  );
  const paramList =
    blockType.parameters.length > 0
      ? blockType.parameters
          .map(ObjCRenderer.toBlockTypeParameterString)
          .join(', ')
      : 'void';
  const start: string =
    blockType.name +
    ' ' +
    localFunctionBlockDefinitionNameForSubtype(subtype) +
    ' = ^(' +
    paramList +
    ') {';
  const blockBody: string = blockInvocationWrapper(
    matchBlockNameForSubtype(subtype) +
      '(' +
      blockType.parameters.map(nameOfBlockTypeParameter).join(', ') +
      ')',
  );
  const end: string[] = ['};', ''];
  const blockCode: string[] = [start]
    .concat(StringUtils.indent(2)(blockBody))
    .concat(end);
  return blockCode;
}

export function buildKeywordPartsForInvokingMatchMethodForSubtype(
  algebraicType: AlgebraicType.Type,
  soFar: string[],
  subtype: AlgebraicType.Subtype,
  index: number,
): string[] {
  const keyword: ObjC.Keyword = keywordForInvokingMatchMethodForSubtype(
    algebraicType,
    subtype,
    index,
  );
  const code: string =
    keyword.name + ':' + localFunctionBlockDefinitionNameForSubtype(subtype);
  return soFar.concat(code);
}
