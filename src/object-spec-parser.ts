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
import * as ObjC from './objc';
import * as ObjectSpec from './object-spec';
import * as ObjectGeneration from './object-generation';
import * as ObjectGenerationParsingUtils from './object-generation-parsing-utils';
import * as ObjectMonaParser from './js/object-mona-parser/object-mona-parser';

export function underlyingTypeForType(
  providedUnderlyingType: string | null,
  typeReference: string,
): string | null {
  const underlyingType =
    ObjectGenerationParsingUtils.possiblyUndefinedStringToMaybe(
      providedUnderlyingType,
    );
  return Maybe.match(
    function Just(type: string) {
      return underlyingType;
    },
    function Nothing() {
      return typeReference.indexOf('*') !== -1 ? 'NSObject' : null;
    },
    underlyingType,
  );
}

/* tslint:disable:max-line-length */
function foundAttributeTypeFromParsedAttributeType(
  type: ObjectMonaParser.ParsedAttributeType,
  annotations: {[name: string]: {[key: string]: string}[]},
): ObjectSpec.AttributeType {
  /* tsline:enable:max-line-length */
  return {
    fileTypeIsDefinedIn:
      ObjectGenerationParsingUtils.valueFromImportAnnotationFromAnnotations(
        annotations,
        'file',
      ),
    libraryTypeIsDefinedIn:
      ObjectGenerationParsingUtils.valueFromImportAnnotationFromAnnotations(
        annotations,
        'library',
      ),
    name: type.name,
    reference: type.reference,
    underlyingType: underlyingTypeForType(type.underlyingType, type.reference),
    conformingProtocol:
      ObjectGenerationParsingUtils.possiblyUndefinedStringToMaybe(
        type.conformingProtocol,
      ),
    referencedGenericTypes: type.referencedGenericTypes.map(
      referencedGenericTypeFromParsedAttributeType,
    ),
  };
}

/**
 * Very similar to foundAttributeTypeFromParsedAttributeType,
 * but referenced generic types do not have annotations or underlying types.
 */
function referencedGenericTypeFromParsedAttributeType(
  type: ObjectMonaParser.ParsedAttributeType,
): ObjC.ReferencedGenericType {
  return {
    name: type.name,
    conformingProtocol:
      ObjectGenerationParsingUtils.possiblyUndefinedStringToMaybe(
        type.conformingProtocol,
      ),
    referencedGenericTypes: type.referencedGenericTypes.map(
      referencedGenericTypeFromParsedAttributeType,
    ),
  };
}

function foundAttributeFromParseResultAttribute(
  attribute: ObjectMonaParser.ParsedAttribute,
): ObjectSpec.Attribute {
  return {
    annotations:
      ObjectGenerationParsingUtils.foundAnnotationFromParsedAnnotations(
        attribute.annotations,
      ),
    comments: attribute.comments,
    name: attribute.name,
    nullability:
      ObjectGenerationParsingUtils.nullabilityFromParseResultAnnotations(
        attribute.annotations,
      ),
    type: foundAttributeTypeFromParsedAttributeType(
      attribute.type,
      attribute.annotations,
    ),
  };
}

function foundTypeFromParsedType(
  foundType: ObjectMonaParser.ObjectSpecParsedType,
): ObjectSpec.Type {
  return {
    annotations:
      ObjectGenerationParsingUtils.foundAnnotationFromParsedAnnotations(
        foundType.annotations,
      ),
    attributes: foundType.attributes.map(
      foundAttributeFromParseResultAttribute,
    ),
    comments: foundType.comments,
    typeName: foundType.typeName,
    includes: foundType.includes,
    excludes: foundType.excludes,
    typeLookups: Either.match(
      function (errors: Error.Error[]) {
        return [];
      },
      function (typeLookups: ObjectGeneration.TypeLookup[]) {
        return typeLookups;
      },
      ObjectGenerationParsingUtils.typeLookupsFromRawAnnotations(
        foundType.annotations,
      ),
    ),
    libraryName: ObjectGenerationParsingUtils.libraryNameFromAnnotations(
      foundType.annotations,
    ),
  };
}

export function parse(
  input: string,
): Either.Either<Error.Error[], ObjectSpec.Type> {
  const result: ObjectMonaParser.ObjectSpecParseResult =
    ObjectMonaParser.parseObjectSpec(input);

  if (result.isValid) {
    const foundType: ObjectSpec.Type = foundTypeFromParsedType(
      result.foundType,
    );
    return Either.Right<Error.Error[], ObjectSpec.Type>(foundType);
  } else {
    return Either.Left<Error.Error[], ObjectSpec.Type>([
      Error.Error(result.errorReason),
    ]);
  }
}
