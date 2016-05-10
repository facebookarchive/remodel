/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import Code = require('./code');
import Error = require('./error');
import FileWriter = require('./file-writer');
import Maybe = require('./maybe');
import ObjC = require('./objc');
import ObjectGeneration = require('./object-generation');

export interface AttributeType {
  fileTypeIsDefinedIn:Maybe.Maybe<string>;
  libraryTypeIsDefinedIn:Maybe.Maybe<string>;
  name:string;
  reference:string;
  underlyingType:Maybe.Maybe<string>;
}

export interface Attribute {
  annotations: {[name:string] : ObjectGeneration.Annotation[];};
  comments: string[];
  name: string;
  nullability: ObjC.Nullability;
  type: AttributeType;
}

export interface Type {
  annotations: {[name:string]: ObjectGeneration.Annotation[];};
  attributes: Attribute[];
  comments: string[];
  excludes: string[];
  includes: string[];
  libraryName:Maybe.Maybe<string>;
  typeLookups:ObjectGeneration.TypeLookup[];
  typeName: string;
}

export interface Plugin {
  additionalFiles: (valueType:Type) => Code.File[];
  additionalTypes: (valueType:Type) => Type[];
  attributes: (valueType:Type) => Attribute[];
  fileTransformation:(writeRequest:FileWriter.Request) => FileWriter.Request;
  fileType: (valueType:Type) => Maybe.Maybe<Code.FileType>;
  forwardDeclarations: (valueType:Type) => ObjC.ForwardDeclaration[];
  functions: (valueType:Type) => ObjC.Function[];
  headerComments: (valueType:Type) => ObjC.Comment[];
  imports: (valueType:Type) => ObjC.Import[];
  implementedProtocols: (valueType:Type) => ObjC.Protocol[];
  instanceMethods: (valueType:Type) => ObjC.Method[];
  properties: (valueType:Type) => ObjC.Property[];
  requiredIncludesToRun:string[];
  staticConstants: (valueType:Type) => ObjC.Constant[];
  validationErrors: (valueType:Type) => Error.Error[];
}
