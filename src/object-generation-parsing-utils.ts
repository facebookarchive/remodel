/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import Either = require('./either');
import Error = require('./error');
import Maybe = require('./maybe');
import ObjC = require('./objc');
import ObjectGeneration = require('./object-generation');
import ValueObject = require('./value-object');

export function possiblyUndefinedStringToMaybe(str:string):Maybe.Maybe<string> {
  if (str === undefined) {
    return Maybe.Nothing<string>();
  } else {
    return Maybe.Just(str);
  }
}

function annotationValuesFromAnnotations(annotations:{[name:string]: {[key:string]: string}[];}, annotationName:string):Maybe.Maybe<{[key:string]: string}[]> {
  if (annotations !== undefined && annotations[annotationName] != null) {
    return Maybe.Just<{[key:string]: string}[]>(annotations[annotationName]);
  } else {
    return Maybe.Nothing<{[key:string]: string}[]>();
  }
}

function libraryNameFromAnnotation(annotation:{[key:string]: string}):Maybe.Maybe<string> {
  if (annotation != null && annotation['name'] != null) {
    return Maybe.Just<string>(annotation['name']);
  } else {
    return Maybe.Nothing<string>();
  }
}

export function libraryNameFromAnnotations(annotations:{[name:string]: {[key:string]: string}[];}):Maybe.Maybe<string> {
  const libraryDefinitions = annotationValuesFromAnnotations(annotations, 'library');
  return Maybe.match(
    function(annotationValues:{[key:string]: string}[]) {
      return libraryNameFromAnnotation(annotationValues[annotationValues.length - 1]);
    },
    function() {
      return Maybe.Nothing<string>();
    },
    libraryDefinitions
  );
}

export function nullabilityFromParseResultAnnotations(annotations:{[name:string]: {[key:string]: string}[]}):ObjC.Nullability {
  if (annotations['nonnull'] !== undefined) {
    return ObjC.Nullability.Nonnull();
  } else if (annotations['nullable'] !== undefined) {
    return ObjC.Nullability.Nullable();
  } else {
    return ObjC.Nullability.Inherited();
  }
}

function importAnnotationFromAnnotations(annotations:{[name:string]: {[key:string]: string}[]}):Maybe.Maybe<{[key:string]: string}> {
  const importDefinitions = annotationValuesFromAnnotations(annotations, 'import');
  return Maybe.map(
    function(annotationValues:{[key:string]: string}[]) {
      return annotationValues[annotationValues.length - 1];
    },
    importDefinitions
  );
}

export function valueFromImportAnnotationFromAnnotations(annotations:{[name:string]: {[key:string]: string}[]}, key:string):Maybe.Maybe<string> {
  const importAnnotation = importAnnotationFromAnnotations(annotations);
  return Maybe.match(
    function(annotation:{[key:string]: string}) {
      return annotation[key] != null ? Maybe.Just<string>(annotation[key]) : Maybe.Nothing<string>();
    },
    function() {
      return Maybe.Nothing<string>();
    },
    importAnnotation
  );
}

const STRING_VALUES_TO_CONVERT_TO_FALSE:string[] = [
  'false',
  '0',
];

function booleanFromString(s:string, defaultValue:boolean):boolean {
  if (s != null) {
    return STRING_VALUES_TO_CONVERT_TO_FALSE.indexOf(s) === -1;
  } else {
    return defaultValue;
  }
}

function collectTypeLookups(soFar:Either.Either<Error.Error[], ObjectGeneration.TypeLookup[]>, typeDefinition:{[key:string]: string}):Either.Either<Error.Error[], ObjectGeneration.TypeLookup[]> {
  if (typeDefinition['name'] != null) {
    return Either.map(
      function(typeLookups:ObjectGeneration.TypeLookup[]) {
        return typeLookups.concat({
          name: typeDefinition['name'],
          library: possiblyUndefinedStringToMaybe(typeDefinition['library']),
          file: possiblyUndefinedStringToMaybe(typeDefinition['file']),
          canForwardDeclare: booleanFromString(typeDefinition['canForwardDeclare'], true)
        });
      },
      soFar
    );
  } else {
    return Either.match(
      function(errors:Error.Error[]) {
        return Either.Left<Error.Error[], ObjectGeneration.TypeLookup[]>(errors.concat(Error.Error('Invalid type annotation')));
      },
      function(typeLookups:ObjectGeneration.TypeLookup[]) {
        return Either.Left<Error.Error[], ObjectGeneration.TypeLookup[]>([Error.Error('Invalid type annotation')]);
      },
      soFar
    );
  }
}

export function typeLookupsFromRawAnnotations(annotations:{[name:string]: {[key:string]: string}[]}):Either.Either<Error.Error[], ObjectGeneration.TypeLookup[]> {
  const typeDefinitions = annotationValuesFromAnnotations(annotations, 'type');
  return Maybe.match(
    function(annotationValues:{[key:string]: string}[]) {
      return annotationValues.reduce(collectTypeLookups, Either.Right<Error.Error[], ObjectGeneration.TypeLookup[]>([]));
    },
    function() {
      return Either.Right<Error.Error[], ObjectGeneration.TypeLookup[]>([]);
    },
    typeDefinitions
  );
}

export function typeLookupsFromAnnotations(annotations:Maybe.Maybe<ObjectGeneration.Annotation[]>):Either.Either<Error.Error[], ObjectGeneration.TypeLookup[]> {
  return Maybe.match(
    function(annotations:ObjectGeneration.Annotation[]) {
      const annotationProperties = annotations.map(
        function(annotation:ObjectGeneration.Annotation):{[key:string]: string} {
          return annotation.properties;
        }
      );
      return annotationProperties.reduce(collectTypeLookups, Either.Right<Error.Error[], ObjectGeneration.TypeLookup[]>([]));
    },
    function() {
      return Either.Right<Error.Error[], ObjectGeneration.TypeLookup[]>([]);
    },
    annotations
  );
}

export function foundAnnotationFromParsedAnnotations(parsedAnnotations:{[name:string]: {[key:string]: string}[]}):{[key:string]:ObjectGeneration.Annotation[]} {
  const foundAnnotations:{[key:string]:ObjectGeneration.Annotation[]} = {};
  for (const parsedAnnotationName in parsedAnnotations) {
    foundAnnotations[parsedAnnotationName] = parsedAnnotations[parsedAnnotationName].map(function(parsedInstance:{[key:string]: string}):ObjectGeneration.Annotation {
      return {
        properties:parsedInstance,
      };
    });
  }
  return foundAnnotations;
}
