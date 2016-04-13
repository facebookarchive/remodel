/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

// Value object parse result types
export interface ValueObjectParsedType {
  annotations:{[name:string]: {[key:string]: string}[];};
  attributes:ParsedAttribute[];
  comments:string[];
  typeName:string;
  includes:string[];
  excludes:string[];
}

export interface ValueObjectParseResult {
  errorReason:string;
  isValid:boolean;
  foundType:ValueObjectParsedType;
}

// Algebraic type parse result types

export interface AlgebraicParsedNamedCollectionSubtype {
  attributes:ParsedAttribute[];
  comments:string[];
  typeName:string;
  libraryName:string;
}

export interface AlgebraicParsedSubtype {
  attributeValue:ParsedAttribute;
  namedCollectionValue:AlgebraicParsedNamedCollectionSubtype;
}

export interface AlgebraicParsedType {
  annotations:{[name:string]: {[key:string]: string;}[];};
  comments: string[];
  excludes: string[];
  includes: string[];
  typeName: string;
  subtypes: AlgebraicParsedSubtype[]
}

export interface AlgebraicTypeParseResult {
  errorReason:string;
  isValid:boolean;
  type:AlgebraicParsedType;
}

// shared parse result types

export interface ParsedAttributeType {
  isNSObject:boolean;
  reference:string;
  underlyingType:string;
}

export interface ParsedAttribute {
  annotations:{[name:string]: {[key:string]: string;}[];};
  comments:string[];
  name:string;
  type:ParsedAttributeType;
}

export function parseValueObject(input:string):ValueObjectParseResult;
export function parseAlgebraicType(input:string):AlgebraicTypeParseResult;
