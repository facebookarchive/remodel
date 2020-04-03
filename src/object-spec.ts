/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Code from './code';
import * as Error from './error';
import * as FileWriter from './file-writer';
import * as Maybe from './maybe';
import * as ObjC from './objc';
import * as ObjectGeneration from './object-generation';

export interface AttributeType {
  fileTypeIsDefinedIn: string | null;
  libraryTypeIsDefinedIn: string | null;
  name: string;
  reference: string;
  underlyingType: string | null;
  conformingProtocol: string | null;
  referencedGenericTypes: ObjC.ReferencedGenericType[];
}

export interface Attribute {
  annotations: ObjectGeneration.AnnotationMap;
  comments: string[];
  name: string;
  nullability: ObjC.Nullability;
  type: AttributeType;
}

export interface Type {
  annotations: ObjectGeneration.AnnotationMap;
  attributes: Attribute[];
  comments: string[];
  excludes: string[];
  includes: string[];
  libraryName: string | null;
  typeLookups: ObjectGeneration.TypeLookup[];
  typeName: string;
}

export interface Plugin {
  additionalFiles: (objectType: Type) => Code.File[];
  transformBaseFile: (objectType: Type, baseFile: Code.File) => Code.File;
  additionalTypes: (objectType: Type) => Type[];
  attributes: (objectType: Type) => Attribute[];
  classMethods: (objectType: Type) => ObjC.Method[];
  transformFileRequest: (
    writeRequest: FileWriter.Request,
  ) => FileWriter.Request;
  fileType: (objectType: Type) => Code.FileType | null;
  forwardDeclarations: (objectType: Type) => ObjC.ForwardDeclaration[];
  functions: (objectType: Type) => ObjC.Function[];
  headerComments: (objectType: Type) => ObjC.Comment[];
  imports: (objectType: Type) => ObjC.Import[];
  implementedProtocols: (objectType: Type) => ObjC.Protocol[];
  instanceMethods: (objectType: Type) => ObjC.Method[];
  instanceVariables?: (objectType: Type) => ObjC.InstanceVariable[];
  macros: (objectType: Type) => ObjC.Macro[];
  properties: (objectType: Type) => ObjC.Property[];
  requiredIncludesToRun: string[];
  staticConstants: (objectType: Type) => ObjC.Constant[];
  validationErrors: (objectType: Type) => Error.Error[];
  nullability: (objectType: Type) => ObjC.ClassNullability | null;
  subclassingRestricted: (objectType: Type) => boolean;
  structs?: (objectType: Type) => Code.Struct[];
  baseClass?: (objectType: Type) => ObjC.BaseClass | null;
  blockTypes?: (algebraicType: Type) => ObjC.BlockType[];
}
