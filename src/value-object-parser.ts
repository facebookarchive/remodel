/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

///<reference path='js/object-mona-parser/object-mona-parser.d.ts'/>

import Either = require('./either');
import Error = require('./error');
import Maybe = require('./maybe');
import ValueObject = require('./value-object');
import ObjC = require('./objc');
import ObjectGeneration = require('./object-generation');
import ObjectGenerationParsingUtils = require('./object-generation-parsing-utils');
import ObjectMonaParser = require('./js/object-mona-parser/object-mona-parser');

function underlyingTypeForType(providedUnderlyingType:string, typeReference:string):Maybe.Maybe<string> {
  const underlyingType:Maybe.Maybe<string> = ObjectGenerationParsingUtils.possiblyUndefinedStringToMaybe(providedUnderlyingType);
  return Maybe.match(function Just(type:string) {
                       return underlyingType;
                     },
                     function Nothing() {
                       return typeReference.indexOf('*') !== -1 ? Maybe.Just<string>('NSObject') : Maybe.Nothing<string>();
                     },
                     underlyingType);
}

/* tslint:disable:max-line-length */
function foundAttributeTypeFromParsedAttributeType(type:ObjectMonaParser.ParsedAttributeType, annotations:{[name:string]: {[key:string]: string}[]}):ValueObject.AttributeType {
/* tsline:enable:max-line-length */
  return {
    fileTypeIsDefinedIn:ObjectGenerationParsingUtils.valueFromImportAnnotationFromAnnotations(annotations, 'file'),
    libraryTypeIsDefinedIn:ObjectGenerationParsingUtils.valueFromImportAnnotationFromAnnotations(annotations, 'library'),
    name:type.reference.replace('*',''),
    reference:type.reference,
    underlyingType:underlyingTypeForType(type.underlyingType, type.reference)
  };
}

function foundAttributeFromParseResultAttribute(attribute:ObjectMonaParser.ParsedAttribute):ValueObject.Attribute {
  return {
   annotations:foundAnnotationFromParsedAnnotations(attribute.annotations),
   comments:attribute.comments,
   name:attribute.name,
   nullability:ObjectGenerationParsingUtils.nullabilityFromParseResultAnnotations(attribute.annotations),
   type:foundAttributeTypeFromParsedAttributeType(attribute.type, attribute.annotations)
  };
}

function foundAnnotationFromParsedAnnotations(parsedAnnotations:{[name:string]: {[key:string]: string}[]}):{[key:string]:ValueObject.Annotation[]} {
  const foundAnnotations:{[key:string]:ValueObject.Annotation[]} = {};
  for (const parsedAnnotationName in parsedAnnotations) {
    foundAnnotations[parsedAnnotationName] = parsedAnnotations[parsedAnnotationName].map(function(parsedInstance:{[key:string]: string}):ValueObject.Annotation {
      return {
        properties:parsedInstance,
      };
    });
  }
  return foundAnnotations;
}

function foundTypeFromParsedType(foundType:ObjectMonaParser.ValueObjectParsedType):ValueObject.Type {
  return {
    annotations:foundAnnotationFromParsedAnnotations(foundType.annotations),
    attributes:foundType.attributes.map(foundAttributeFromParseResultAttribute),
    comments:foundType.comments,
    typeName:foundType.typeName,
    includes:foundType.includes,
    excludes:foundType.excludes,
    typeLookups:Either.match(
      function(errors:Error.Error[]) {
        return [];
      },
      function(typeLookups:ObjectGeneration.TypeLookup[]) {
        return typeLookups;
      },
      ObjectGenerationParsingUtils.typeLookupsFromRawAnnotations(foundType.annotations)
    ),
    libraryName:ObjectGenerationParsingUtils.libraryNameFromAnnotations(foundType.annotations)
  };
}

export function parse(input:string):Either.Either<Error.Error[], ValueObject.Type> {
  const result:ObjectMonaParser.ValueObjectParseResult = ObjectMonaParser.parseValueObject(input);

  if (result.isValid) {
    const foundType:ValueObject.Type = foundTypeFromParsedType(result.foundType);
    return Either.Right<Error.Error[], ValueObject.Type>(foundType);
  } else {
    return Either.Left<Error.Error[], ValueObject.Type>([Error.Error(result.errorReason)]);
  }
}
