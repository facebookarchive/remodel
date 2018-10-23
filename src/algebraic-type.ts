/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Code = require('./code');
import Error = require('./error');
import FileWriter = require('./file-writer');
import Maybe = require('./maybe');
import ObjC = require('./objc');
import ObjectGeneration = require('./object-generation');

export interface SubtypeAttributeType {
  fileTypeIsDefinedIn:Maybe.Maybe<string>;
  libraryTypeIsDefinedIn:Maybe.Maybe<string>;
  name:string;
  reference:string;
  underlyingType:Maybe.Maybe<string>;
  conformingProtocol:Maybe.Maybe<string>;
}

export interface SubtypeAttribute {
  annotations: ObjectGeneration.AnnotationMap;
  comments:string[];
  name:string;
  nullability:ObjC.Nullability;
  type:SubtypeAttributeType;
}

export enum SubtypeDefinitionType {
  namedAttributeCollection,
  singleAttribute,
}

export interface NamedAttributeCollectionSubtype {
  name:string;
  comments:string[];
  attributes:SubtypeAttribute[];
}

export class Subtype {
  private attributeCollectionSubtype:NamedAttributeCollectionSubtype;
  private singleAttribute:SubtypeAttribute;
  private definitionType:SubtypeDefinitionType;

  constructor(definitionType:SubtypeDefinitionType, singleAttribute:SubtypeAttribute, attributeCollectionSubtype:NamedAttributeCollectionSubtype) {
    this.definitionType = definitionType;
    this.singleAttribute = singleAttribute;
    this.attributeCollectionSubtype = attributeCollectionSubtype;
  }

  static NamedAttributeCollectionDefinition(namedAttributeCollectionType:NamedAttributeCollectionSubtype):Subtype {
    return new Subtype(SubtypeDefinitionType.namedAttributeCollection, null, namedAttributeCollectionType);
  }

  static SingleAttributeSubtypeDefinition(attribute:SubtypeAttribute):Subtype {
    return new Subtype(SubtypeDefinitionType.singleAttribute, attribute, null);
  }

  match<T>(namedAttributeCollection:(namedAttributeCollectionSubtype:NamedAttributeCollectionSubtype) => T, singleAttributeSubtype:(attribute:SubtypeAttribute) => T) {
    switch(this.definitionType) {
      case SubtypeDefinitionType.namedAttributeCollection:
        return namedAttributeCollection(this.attributeCollectionSubtype);
      case SubtypeDefinitionType.singleAttribute:
        return singleAttributeSubtype(this.singleAttribute);
    }
  }
}

export interface Type {
  annotations: ObjectGeneration.AnnotationMap,
  comments:string[];
  includes:string[];
  excludes:string[];
  libraryName:Maybe.Maybe<string>;
  name:string;
  typeLookups:ObjectGeneration.TypeLookup[];
  subtypes:Subtype[];
}

export interface Plugin {
  additionalFiles: (algebraicType:Type) => Code.File[];
  blockTypes: (algebraicType:Type) => ObjC.BlockType[];
  classMethods: (algebraicType:Type) => ObjC.Method[];
  enumerations: (algebraicType:Type) => ObjC.Enumeration[];
  fileTransformation:(writeRequest:FileWriter.Request) => FileWriter.Request;
  fileType:(algebraicType:Type) => Maybe.Maybe<Code.FileType>;
  forwardDeclarations:(algebraicType:Type) => ObjC.ForwardDeclaration[];
  functions: (algebraicType:Type) => ObjC.Function[];
  headerComments: (algebraicType:Type) => ObjC.Comment[];
  implementedProtocols: (algebraicType:Type) => ObjC.Protocol[];
  imports: (algebraicType:Type) => ObjC.Import[];
  instanceMethods: (algebraicType:Type) => ObjC.Method[];
  instanceVariables: (algebraicType:Type) => ObjC.InstanceVariable[];
  macros: (algebraicType:Type) => ObjC.Macro[];
  requiredIncludesToRun:string[];
  staticConstants: (algebraicType:Type) => ObjC.Constant[];
  validationErrors: (algebraicType:Type) => Error.Error[];
  nullability: (algebraicType:Type) => Maybe.Maybe<ObjC.ClassNullability>;
  subclassingRestricted: (algebraicType:Type) => boolean;
}
