/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Either from './either';
import * as Error from './error';
import * as CLangCommon from './clang-common';
import * as Maybe from './maybe';
import * as ObjectGeneration from './object-generation';

export function possiblyUndefinedStringToMaybe(
  str: string | null,
): string | null {
  if (str == null) {
    return null;
  } else {
    return str;
  }
}

function annotationValuesFromAnnotations(
  annotations: {[name: string]: {[key: string]: string}[]},
  annotationName: string,
): {[key: string]: string}[] | null {
  if (annotations !== undefined && annotations[annotationName] != null) {
    return annotations[annotationName];
  } else {
    return null;
  }
}

function libraryNameFromAnnotation(annotation: {
  [key: string]: string;
}): string | null {
  if (annotation != null && annotation['name'] != null) {
    return annotation['name'];
  } else {
    return null;
  }
}

export function libraryNameFromAnnotations(annotations: {
  [name: string]: {[key: string]: string}[];
}): string | null {
  const libraryDefinitions = annotationValuesFromAnnotations(
    annotations,
    'library',
  );
  return Maybe.match(
    function (annotationValues: {[key: string]: string}[]) {
      return libraryNameFromAnnotation(
        annotationValues[annotationValues.length - 1],
      );
    },
    function () {
      return null;
    },
    libraryDefinitions,
  );
}

export function nullabilityFromParseResultAnnotations(annotations: {
  [name: string]: {[key: string]: string}[];
}): CLangCommon.Nullability {
  if (annotations['nonnull'] !== undefined) {
    return CLangCommon.Nullability.Nonnull();
  } else if (annotations['nullable'] !== undefined) {
    return CLangCommon.Nullability.Nullable();
  } else {
    return CLangCommon.Nullability.Inherited();
  }
}

function importAnnotationFromAnnotations(annotations: {
  [name: string]: {[key: string]: string}[];
}): {[key: string]: string} | null {
  const importDefinitions = annotationValuesFromAnnotations(
    annotations,
    'import',
  );
  return Maybe.map(function (annotationValues: {[key: string]: string}[]) {
    return annotationValues[annotationValues.length - 1];
  }, importDefinitions);
}

export function valueFromImportAnnotationFromAnnotations(
  annotations: {[name: string]: {[key: string]: string}[]},
  key: string,
): string | null {
  const importAnnotation = importAnnotationFromAnnotations(annotations);
  return Maybe.match(
    function (annotation: {[key: string]: string}) {
      return annotation[key] != null ? annotation[key] : null;
    },
    function () {
      return null;
    },
    importAnnotation,
  );
}

const STRING_VALUES_TO_CONVERT_TO_FALSE: string[] = ['false', '0'];

function booleanFromString(s: string, defaultValue: boolean): boolean {
  if (s != null) {
    return STRING_VALUES_TO_CONVERT_TO_FALSE.indexOf(s) === -1;
  } else {
    return defaultValue;
  }
}

function collectTypeLookups(
  soFar: Either.Either<Error.Error[], ObjectGeneration.TypeLookup[]>,
  typeDefinition: {[key: string]: string},
): Either.Either<Error.Error[], ObjectGeneration.TypeLookup[]> {
  if (typeDefinition['name'] != null) {
    return Either.map(function (typeLookups: ObjectGeneration.TypeLookup[]) {
      return typeLookups.concat({
        name: typeDefinition['name'],
        library: possiblyUndefinedStringToMaybe(typeDefinition['library']),
        file: possiblyUndefinedStringToMaybe(typeDefinition['file']),
        canForwardDeclare: booleanFromString(
          typeDefinition['canForwardDeclare'],
          true,
        ),
      });
    }, soFar);
  } else {
    return Either.match(
      function (errors: Error.Error[]) {
        return Either.Left<Error.Error[], ObjectGeneration.TypeLookup[]>(
          errors.concat(Error.Error('Invalid type annotation')),
        );
      },
      function (typeLookups: ObjectGeneration.TypeLookup[]) {
        return Either.Left<Error.Error[], ObjectGeneration.TypeLookup[]>([
          Error.Error('Invalid type annotation'),
        ]);
      },
      soFar,
    );
  }
}

export function typeLookupsFromRawAnnotations(annotations: {
  [name: string]: {[key: string]: string}[];
}): Either.Either<Error.Error[], ObjectGeneration.TypeLookup[]> {
  const typeDefinitions = annotationValuesFromAnnotations(annotations, 'type');
  return Maybe.match(
    function (annotationValues: {[key: string]: string}[]) {
      return annotationValues.reduce(
        collectTypeLookups,
        Either.Right<Error.Error[], ObjectGeneration.TypeLookup[]>([]),
      );
    },
    function () {
      return Either.Right<Error.Error[], ObjectGeneration.TypeLookup[]>([]);
    },
    typeDefinitions,
  );
}

export function typeLookupsFromAnnotations(
  annotations: ObjectGeneration.Annotation[] | null,
): Either.Either<Error.Error[], ObjectGeneration.TypeLookup[]> {
  return Maybe.match(
    function (annotations: ObjectGeneration.Annotation[]) {
      const annotationProperties = annotations.map(function (
        annotation: ObjectGeneration.Annotation,
      ): {[key: string]: string} {
        return annotation.properties;
      });
      return annotationProperties.reduce(
        collectTypeLookups,
        Either.Right<Error.Error[], ObjectGeneration.TypeLookup[]>([]),
      );
    },
    function () {
      return Either.Right<Error.Error[], ObjectGeneration.TypeLookup[]>([]);
    },
    annotations,
  );
}

export function foundAnnotationFromParsedAnnotations(parsedAnnotations: {
  [name: string]: {[key: string]: string}[];
}): {[key: string]: ObjectGeneration.Annotation[]} {
  const foundAnnotations: {[key: string]: ObjectGeneration.Annotation[]} = {};
  for (const parsedAnnotationName in parsedAnnotations) {
    foundAnnotations[parsedAnnotationName] = parsedAnnotations[
      parsedAnnotationName
    ].map(function (parsedInstance: {
      [key: string]: string;
    }): ObjectGeneration.Annotation {
      return {
        properties: parsedInstance,
      };
    });
  }
  return foundAnnotations;
}
