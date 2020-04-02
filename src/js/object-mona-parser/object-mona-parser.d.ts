/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Value object parse result types
export interface ObjectSpecParsedType {
  annotations: {[name: string]: {[key: string]: string}[]};
  attributes: ParsedAttribute[];
  comments: string[];
  typeName: string;
  includes: string[];
  excludes: string[];
}

export interface ObjectSpecParseResult {
  errorReason: string;
  isValid: boolean;
  foundType: ObjectSpecParsedType;
}

// Algebraic type parse result types

export interface AlgebraicParsedNamedCollectionSubtype {
  annotations: {[name: string]: {[key: string]: string}[]};
  attributes: ParsedAttribute[];
  comments: string[];
  typeName: string;
  libraryName: string;
}

export interface AlgebraicParsedSubtype {
  attributeValue: ParsedAttribute;
  namedCollectionValue: AlgebraicParsedNamedCollectionSubtype;
}

export interface AlgebraicParsedType {
  annotations: {[name: string]: {[key: string]: string}[]};
  comments: string[];
  excludes: string[];
  includes: string[];
  typeName: string;
  subtypes: AlgebraicParsedSubtype[];
}

export interface AlgebraicTypeParseResult {
  errorReason: string;
  isValid: boolean;
  type: AlgebraicParsedType;
}

// shared parse result types

export interface ParsedAttributeType {
  name: string;
  reference: string;
  underlyingType: string;
  conformingProtocol: string;
  referencedGenericTypes: ParsedReferencedGenericType[];
}

export interface ParsedReferencedGenericType {
  name: string;
  conformingProtocol: string;
  referencedGenericTypes: ParsedReferencedGenericType[];
}

export interface ParsedAttribute {
  annotations: {[name: string]: {[key: string]: string}[]};
  comments: string[];
  name: string;
  type: ParsedAttributeType;
}

export function parseObjectSpec(input: string): ObjectSpecParseResult;
export function parseAlgebraicType(input: string): AlgebraicTypeParseResult;
