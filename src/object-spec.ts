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

export const VALUE_OBJECT_SEMANTICS:string = 'ValueObjectSemantics';

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
  additionalFiles: (objectType:Type) => Code.File[];
  additionalTypes: (objectType:Type) => Type[];
  attributes: (objectType:Type) => Attribute[];
  fileTransformation:(writeRequest:FileWriter.Request) => FileWriter.Request;
  fileType: (objectType:Type) => Maybe.Maybe<Code.FileType>;
  forwardDeclarations: (objectType:Type) => ObjC.ForwardDeclaration[];
  functions: (objectType:Type) => ObjC.Function[];
  headerComments: (objectType:Type) => ObjC.Comment[];
  imports: (objectType:Type) => ObjC.Import[];
  implementedProtocols: (objectType:Type) => ObjC.Protocol[];
  instanceMethods: (objectType:Type) => ObjC.Method[];
  properties: (objectType:Type) => ObjC.Property[];
  requiredIncludesToRun:string[];
  staticConstants: (objectType:Type) => ObjC.Constant[];
  validationErrors: (objectType:Type) => Error.Error[];
  nullability: (objectType:Type) => Maybe.Maybe<ObjC.ClassNullability>;
}
