/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from './algebraic-type';
import * as AlgebraicTypeUtils from './algebraic-type-utils';
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
      null,
      false,
      subtype,
    );
  } else {
    return AlgebraicTypeUtils.keywordForMatchMethodFromSubtype(
      algebraicType,
      null,
      false,
      subtype,
    );
  }
}

function referencedGenericTypeRefersToParentTypeName(
  referencedGenericType: ObjC.ReferencedGenericType,
  parentTypeName: string,
): boolean {
  return (
    referencedGenericType.name == parentTypeName ||
    referencedGenericType.referencedGenericTypes.some((r) =>
      referencedGenericTypeRefersToParentTypeName(r, parentTypeName),
    )
  );
}

function subtypeRefersToParentTypeName(
  type: AlgebraicType.SubtypeAttributeType,
  parentTypeName: string,
): boolean {
  return (
    type.name == parentTypeName ||
    type.referencedGenericTypes.some((r) =>
      referencedGenericTypeRefersToParentTypeName(r, parentTypeName),
    )
  );
}

/**
 * If an algebraic data type refers to itself, we need to forward-declare the
 * type itself so that typedefs for matcher blocks can refer to it.
 */
export function forwardDeclarationsForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): ObjC.ForwardDeclaration[] {
  for (const subtype of algebraicType.subtypes) {
    const refersToParent = subtype.match(
      (collection) =>
        collection.attributes.some((a) =>
          subtypeRefersToParentTypeName(a.type, algebraicType.name),
        ),
      (a) => subtypeRefersToParentTypeName(a.type, algebraicType.name),
    );
    if (refersToParent) {
      return [
        ObjC.ForwardDeclaration.ForwardClassDeclaration(algebraicType.name),
      ];
    }
  }
  return [];
}

/**
 * Builds a MatchHandler local variable for a given subtype, for example:
 *
 * ```
 * SimpleADTFooMatchHandler __unsafe_unretained matchFoo = ^(NSString *someValue) {
 *   result = fooMatchHandler(firstValue, secondValue);
 * };
 * ```
 *
 * @param subtype The subtype of the ADT
 * @param blockType The type for the block; use AlgebraicTypeUtils.blockTypeForSubtype
 * @param blockInvocationWrapper A function used to wrap the expression with the result
 * of invoking the match handler. Usually you want this to store to a local variable.
 */
export function buildLocalFunctionBlockDefinitionsForSubtype(
  subtype: AlgebraicType.Subtype,
  blockType: ObjC.BlockType,
  blockInvocationWrapper: (blockInvocation: string) => string,
): string[] {
  const paramList =
    blockType.parameters.length > 0
      ? blockType.parameters
          .map(ObjCRenderer.toBlockTypeParameterString)
          .join(', ')
      : 'void';
  const start = `${
    blockType.name
  } __unsafe_unretained ${localFunctionBlockDefinitionNameForSubtype(
    subtype,
  )} = ^(${paramList}) {`;
  const blockBody: string = blockInvocationWrapper(
    `${matchBlockNameForSubtype(subtype)}(${blockType.parameters
      .map(nameOfBlockTypeParameter)
      .join(', ')})`,
  );
  const end: string[] = ['};', ''];
  const blockCode: string[] = [start]
    .concat(StringUtils.indent(2)(blockBody))
    .concat(end);
  return blockCode;
}

export function buildCodeForInvokingMatchMethodForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
  index: number,
): string {
  const keyword: ObjC.Keyword = keywordForInvokingMatchMethodForSubtype(
    algebraicType,
    subtype,
    index,
  );
  const code: string =
    keyword.name + ':' + localFunctionBlockDefinitionNameForSubtype(subtype);
  return code;
}
