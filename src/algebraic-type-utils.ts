/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import AlgebraicType = require('./algebraic-type');
import FunctionUtils = require('./function-utils');
import Maybe = require('./maybe');
import ObjC = require('./objc');
import StringUtils = require('./string-utils');

export function nameForInternalPropertyStoringSubtype():string {
  return 'subtype';
}

export function valueAccessorForInternalPropertyStoringSubtype():string {
  return '_' + nameForInternalPropertyStoringSubtype();
}

export function attributesFromSubtype(subtype:AlgebraicType.Subtype):AlgebraicType.SubtypeAttribute[] {
  return subtype.match(
    function(namedAttributeCollectionSubtype:AlgebraicType.NamedAttributeCollectionSubtype) {
      return namedAttributeCollectionSubtype.attributes;
    },
    function(attribute:AlgebraicType.SubtypeAttribute) {
      return [attribute];
    });
}

export function subtypeNameFromSubtype(subtype:AlgebraicType.Subtype):string {
  return subtype.match(
    function(namedAttributeCollectionSubtype:AlgebraicType.NamedAttributeCollectionSubtype) {
      return namedAttributeCollectionSubtype.name;
    },
    function(attribute:AlgebraicType.SubtypeAttribute) {
      return StringUtils.capitalize(attribute.name);
    });
}

function buildAttributesFromSubtype(soFar:AlgebraicType.SubtypeAttribute[], subtype:AlgebraicType.Subtype):AlgebraicType.SubtypeAttribute[] {
  return soFar.concat(attributesFromSubtype(subtype));
}

export function allAttributesFromSubtypes(subtypes:AlgebraicType.Subtype[]):AlgebraicType.SubtypeAttribute[] {
  return subtypes.reduce(buildAttributesFromSubtype, []);
}

export function mapAttributesWithSubtypeFromSubtypes<T>(subtypes:AlgebraicType.Subtype[], mapper:(subtype: AlgebraicType.Subtype, attribute: AlgebraicType.SubtypeAttribute) => T):T[] {
  return subtypes.reduce(function(soFar:T[], subtype:AlgebraicType.Subtype) {
    return soFar.concat(attributesFromSubtype(subtype).map(FunctionUtils.pApplyf2(subtype, mapper)));
  }, []);
}

function typeForUnderlyingType(underlyingType:string):ObjC.Type {
  return {
    name: underlyingType,
    reference: underlyingType === 'NSObject' ? 'NSObject*' : underlyingType
  };
}

export function computeTypeOfAttribute(attribute:AlgebraicType.SubtypeAttribute):ObjC.Type {
  return Maybe.match(typeForUnderlyingType, function():ObjC.Type {
    return {
      name: attribute.type.name,
      reference: attribute.type.reference
    };
  }, attribute.type.underlyingType);
}

export function nameOfInternalPropertyForAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):string {
  return subtype.match(
    function(namedAttributeCollectionSubtype:AlgebraicType.NamedAttributeCollectionSubtype) {
      return StringUtils.lowercased(namedAttributeCollectionSubtype.name) + '_' + StringUtils.lowercased(attribute.name);
    },
    function(attribute:AlgebraicType.SubtypeAttribute) {
      return StringUtils.lowercased(attribute.name);
    });
}

export function valueAccessorForInternalPropertyForAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):string {
  return '_' + nameOfInternalPropertyForAttribute(subtype, attribute);
}

export function EnumerationNameForAlgebraicType(algebraicType:AlgebraicType.Type):string {
  return '_' + algebraicType.name + 'Subtypes';
}

export function EnumerationValueNameForSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):string {
  return EnumerationNameForAlgebraicType(algebraicType) + subtypeNameFromSubtype(subtype);
}

function caseStatementForSubtypeWithSubtypeMapper(algebraicType:AlgebraicType.Type, subtypeMapper:(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype) => string[], soFar:string[], subtype:AlgebraicType.Subtype):string[] {
  const internalCode:string[] = subtypeMapper(algebraicType, subtype);
  const code:string[] = ['case ' + EnumerationValueNameForSubtype(algebraicType, subtype) + ': {'].concat(internalCode.map(StringUtils.indent(2))).concat(['  break;', '}']);
  return soFar.concat(code);
}

export function codeForSwitchingOnSubtypeWithSubtypeMapper(algebraicType:AlgebraicType.Type, subtypeValueAccessor:string, subtypeMapper:(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype) => string[]):string[] {
  const caseStatements:string[] = algebraicType.subtypes.reduce(FunctionUtils.pApply2f4(algebraicType, subtypeMapper, caseStatementForSubtypeWithSubtypeMapper), []);
  return ['switch (' + subtypeValueAccessor + ') {'].concat(caseStatements.map(StringUtils.indent(2))).concat('}');
}

function blockTypeNameForSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):string {
  return algebraicType.name + StringUtils.capitalize(subtypeNameFromSubtype(subtype)) + 'MatchHandler';
}

function blockTypeParameterForSubtypeAttribute(attribute:AlgebraicType.SubtypeAttribute):ObjC.BlockTypeParameter {
  return {
    name: attribute.name,
    type: {
      name: attribute.type.name,
      reference: attribute.type.reference
    },
    nullability: attribute.nullability
  };
}

export function blockTypeForSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):ObjC.BlockType {
  return {
    comments: [],
    name: blockTypeNameForSubtype(algebraicType, subtype),
    parameters: attributesFromSubtype(subtype).map(blockTypeParameterForSubtypeAttribute),
    returnType: Maybe.Nothing<ObjC.Type>(),
    isPublic: true,
    nullability: algebraicType.includes.indexOf('RMAssumeNonnull') >= 0 ? ObjC.ClassNullability.assumeNonnull : ObjC.ClassNullability.default 
  };
}

export function blockParameterNameForMatchMethodFromSubtype(subtype:AlgebraicType.Subtype):string {
  return StringUtils.lowercased(subtypeNameFromSubtype(subtype) + 'MatchHandler');
}

export function keywordForMatchMethodFromSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):ObjC.Keyword {
  const blockType:ObjC.BlockType = blockTypeForSubtype(algebraicType, subtype);
  return {
    name: StringUtils.lowercased(subtypeNameFromSubtype(subtype)),
    argument: Maybe.Just({
      name: blockParameterNameForMatchMethodFromSubtype(subtype),
      modifiers: [],
      type: {
        name: blockType.name,
        reference: blockType.name
      }
    })
  };
}

export function firstKeywordForMatchMethodFromSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):ObjC.Keyword {
  const normalKeyword:ObjC.Keyword = keywordForMatchMethodFromSubtype(algebraicType, subtype);
  return {
    argument: normalKeyword.argument,
    name: 'match' + StringUtils.capitalize(normalKeyword.name)
  };
}
