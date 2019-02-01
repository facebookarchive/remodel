/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='js/object-mona-parser/object-mona-parser.d.ts'/>

import * as Either from './either';
import * as Error from './error';
import * as Maybe from './maybe';
import * as AlgebraicType from './algebraic-type';
import * as ObjC from './objc';
import * as ObjectGeneration from './object-generation';
import * as ObjectGenerationParsingUtils from './object-generation-parsing-utils';
import * as ObjectMonaParser from './js/object-mona-parser/object-mona-parser';

function underlyingTypeForType(
  providedUnderlyingType: string,
  typeReference: string,
): Maybe.Maybe<string> {
  const underlyingType: Maybe.Maybe<
    string
  > = ObjectGenerationParsingUtils.possiblyUndefinedStringToMaybe(
    providedUnderlyingType,
  );
  return Maybe.match(
    function Just(type: string) {
      return underlyingType;
    },
    function Nothing() {
      return typeReference.indexOf('*') !== -1
        ? Maybe.Just<string>('NSObject')
        : Maybe.Nothing<string>();
    },
    underlyingType,
  );
}

/* tslint:disable:max-line-length */
function subtypeAttributeTypeFromParsedAttribtueType(
  type: ObjectMonaParser.ParsedAttributeType,
  annotations: {[name: string]: {[key: string]: string}[]},
): AlgebraicType.SubtypeAttributeType {
  /* tsline:enable:max-line-length */
  return {
    fileTypeIsDefinedIn: ObjectGenerationParsingUtils.valueFromImportAnnotationFromAnnotations(
      annotations,
      'file',
    ),
    libraryTypeIsDefinedIn: ObjectGenerationParsingUtils.valueFromImportAnnotationFromAnnotations(
      annotations,
      'library',
    ),
    name: type.name,
    reference: type.reference,
    underlyingType: underlyingTypeForType(type.underlyingType, type.reference),
    conformingProtocol: ObjectGenerationParsingUtils.possiblyUndefinedStringToMaybe(
      type.conformingProtocol,
    ),
  };
}

function subtypeAttributeFromParseResultAttribute(
  attribute: ObjectMonaParser.ParsedAttribute,
): AlgebraicType.SubtypeAttribute {
  return {
    annotations: ObjectGenerationParsingUtils.foundAnnotationFromParsedAnnotations(
      attribute.annotations,
    ),
    name: attribute.name,
    comments: attribute.comments,
    type: subtypeAttributeTypeFromParsedAttribtueType(
      attribute.type,
      attribute.annotations,
    ),
    nullability: ObjectGenerationParsingUtils.nullabilityFromParseResultAnnotations(
      attribute.annotations,
    ),
  };
}

function subtypeFromParsedSubtype(
  subtype: ObjectMonaParser.AlgebraicParsedSubtype,
): AlgebraicType.Subtype {
  return subtype.attributeValue
    ? AlgebraicType.Subtype.SingleAttributeSubtypeDefinition(
        subtypeAttributeFromParseResultAttribute(subtype.attributeValue),
      )
    : AlgebraicType.Subtype.NamedAttributeCollectionDefinition({
        name: subtype.namedCollectionValue.typeName,
        comments: subtype.namedCollectionValue.comments,
        attributes: subtype.namedCollectionValue.attributes.map(
          subtypeAttributeFromParseResultAttribute,
        ),
        annotations: ObjectGenerationParsingUtils.foundAnnotationFromParsedAnnotations(
          subtype.namedCollectionValue.annotations,
        ),
      });
}

function algebraicTypeFromParsedType(
  type: ObjectMonaParser.AlgebraicParsedType,
): AlgebraicType.Type {
  return {
    annotations: ObjectGenerationParsingUtils.foundAnnotationFromParsedAnnotations(
      type.annotations,
    ),
    comments: type.comments,
    name: type.typeName,
    includes: type.includes,
    excludes: type.excludes,
    libraryName: ObjectGenerationParsingUtils.libraryNameFromAnnotations(
      type.annotations,
    ),
    typeLookups: Either.match(
      function(errors: Error.Error[]) {
        return [];
      },
      function(typeLookups: ObjectGeneration.TypeLookup[]) {
        return typeLookups;
      },
      ObjectGenerationParsingUtils.typeLookupsFromRawAnnotations(
        type.annotations,
      ),
    ),
    subtypes: type.subtypes.map(subtypeFromParsedSubtype),
  };
}

export function parse(
  input: string,
): Either.Either<Error.Error[], AlgebraicType.Type> {
  const result: ObjectMonaParser.AlgebraicTypeParseResult = ObjectMonaParser.parseAlgebraicType(
    input,
  );

  if (result.isValid) {
    const type: AlgebraicType.Type = algebraicTypeFromParsedType(result.type);
    return Either.Right<Error.Error[], AlgebraicType.Type>(type);
  } else {
    return Either.Left<Error.Error[], AlgebraicType.Type>([
      Error.Error(result.errorReason),
    ]);
  }
}
