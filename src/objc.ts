/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import Maybe = require('./maybe');

export interface Type {
  name:string;
  reference:string;
}

enum ForwardDeclarationType {
  class,
  protocol
}

export class ForwardDeclaration {
  private name:string;
  private declarationType:ForwardDeclarationType;

  constructor(type:ForwardDeclarationType, name:string) {
    this.name = name;
    this.declarationType = type;
  }

  static ForwardClassDeclaration(name:string) {
    return new ForwardDeclaration(ForwardDeclarationType.class ,name);
  }

  static ForwardProtocolDeclaration(name:string) {
    return new ForwardDeclaration(ForwardDeclarationType.protocol ,name);
  }

  match<T>(classDeclaration:(name:string) => T, protocolDeclaration:(name:string) => T) {
    switch(this.declarationType) {
      case ForwardDeclarationType.class:
        return classDeclaration(this.name);
      case ForwardDeclarationType.protocol:
        return protocolDeclaration(this.name);
    }
  }
}

export interface Import {
  file:string;
  isPublic:boolean;
  library:Maybe.Maybe<string>;
}

enum KeywordArgumentModifierType {
  nonnull,
  nullable,
}

export class KeywordArgumentModifier {
  private modifierType;
  constructor(type:KeywordArgumentModifierType) {
    this.modifierType = type;
  }

  static Nonnull() {
    return new KeywordArgumentModifier(KeywordArgumentModifierType.nonnull);
  }

  static Nullable() {
    return new KeywordArgumentModifier(KeywordArgumentModifierType.nullable);
  }

  match<T>(nonnull:() => T, nullable:() => T) {
    switch(this.modifierType) {
      case KeywordArgumentModifierType.nonnull:
        return nonnull();
      case KeywordArgumentModifierType.nullable:
        return nullable();
    }
  }
}

export interface KeywordArgument {
  name:string;
  modifiers:KeywordArgumentModifier[];
  type:Type;
}

export interface Keyword {
  argument:Maybe.Maybe<KeywordArgument>;
  name:string;
}

export interface Method {
  belongsToProtocol:Maybe.Maybe<string>;
  code:string[];
  comments:Comment[];
  keywords:Keyword[];
  returnType:Maybe.Maybe<Type>;
}

export interface FunctionParameter {
  name:string;
  type:Type;
}

export interface Function {
  comments:Comment[];
  name:string;
  parameters:FunctionParameter[];
  returnType:Maybe.Maybe<Type>;
  code:string[];
  isPublic:boolean;
}

export interface BlockTypeParameter {
  name:string;
  type:Type;
}

export interface BlockType {
  comments:Comment[];
  name:string;
  parameters:BlockTypeParameter[];
  returnType:Maybe.Maybe<Type>;
  isPublic:boolean;
}

export interface Enumeration {
  comments:Comment[];
  name:string;
  underlyingType:string;
  values:string[];
  isPublic:boolean;
}

enum NullabilityType {
  inherited,
  nonnull,
  nullable
}

export class Nullability {
  private nullabilityType;

  constructor(type:NullabilityType) {
    this.nullabilityType = type;
  }

  static Inherited() {
    return new Nullability(NullabilityType.inherited);
  }

  static Nonnull() {
    return new Nullability(NullabilityType.nonnull);
  }

  static Nullable() {
    return new Nullability(NullabilityType.nullable);
  }

  match<T>(inherited:() => T, nonnull:() => T, nullable:() => T) {
    switch (this.nullabilityType) {
      case NullabilityType.inherited:
        return inherited();
      case NullabilityType.nonnull:
        return nonnull();
      case NullabilityType.nullable:
        return nullable();
    }
  }
}

enum MemorySemanticType {
  assign,
  copy,
  strong,
  unsafeUnretained,
  weak
}

export class MemorySemantic {
  private memoryType;
  constructor(type:MemorySemanticType) {
    this.memoryType = type;
  }

  static Assign() {
    return new MemorySemantic(MemorySemanticType.assign);
  }

  static Copy() {
    return new MemorySemantic(MemorySemanticType.copy);
  }

  static Strong() {
    return new MemorySemantic(MemorySemanticType.strong);
  }

  static UnsafeUnretained() {
    return new MemorySemantic(MemorySemanticType.unsafeUnretained);
  }

  static Weak() {
    return new MemorySemantic(MemorySemanticType.weak);
  }

  match<T>(assign:() => T, copy:() => T, strong:() => T, unsafeUnretained:() => T, weak:() => T) {
    switch(this.memoryType) {
      case MemorySemanticType.assign:
        return assign();
      case MemorySemanticType.copy:
        return copy();
      case MemorySemanticType.strong:
        return strong();
      case MemorySemanticType.unsafeUnretained:
        return unsafeUnretained();
      case MemorySemanticType.weak:
        return weak();
    }
  }
}

export interface Constant {
  comments:Comment[];
  memorySemantic:MemorySemantic;
  name:string;
  type:Type;
  value:string;
}

enum PropertyModifierType {
  assign,
  atomic,
  copy,
  nonnull,
  nonatomic,
  nullable,
  readonly,
  readwrite,
  strong,
  weak,
  unsafeUnretained
}

export class PropertyModifier {
  private modifierType;
  constructor(type:PropertyModifierType) {
    this.modifierType = type;
  }

  static Assign() {
    return new PropertyModifier(PropertyModifierType.assign);
  }

  static Atomic() {
    return new PropertyModifier(PropertyModifierType.atomic);
  }

  static Copy() {
    return new PropertyModifier(PropertyModifierType.copy);
  }

  static Nonatomic() {
    return new PropertyModifier(PropertyModifierType.nonatomic);
  }

  static Nonnull() {
    return new PropertyModifier(PropertyModifierType.nonnull);
  }

  static Nullable() {
    return new PropertyModifier(PropertyModifierType.nullable);
  }

  static Readonly() {
    return new PropertyModifier(PropertyModifierType.readonly);
  }

  static Readwrite() {
    return new PropertyModifier(PropertyModifierType.readwrite);
  }

  static Strong() {
    return new PropertyModifier(PropertyModifierType.strong);
  }

  static Weak() {
    return new PropertyModifier(PropertyModifierType.weak);
  }

  static UnsafeUnretained() {
    return new PropertyModifier(PropertyModifierType.unsafeUnretained);
  }

  match<T>(assign:() => T, atomic:() => T, copy:() => T, nonatomic:() => T, nonnull:() => T, nullable:() => T, readonly:() => T, readwrite:() => T, strong:() => T, weak:() => T, unsafeUnretained:() => T) {
    switch(this.modifierType) {
      case PropertyModifierType.assign:
        return assign();
      case PropertyModifierType.atomic:
        return atomic();
      case PropertyModifierType.copy:
        return copy();
      case PropertyModifierType.nonatomic:
        return nonatomic();
      case PropertyModifierType.nonnull:
        return nonnull();
      case PropertyModifierType.nullable:
        return nullable();
      case PropertyModifierType.readonly:
        return readonly();
      case PropertyModifierType.readwrite:
        return readwrite();
      case PropertyModifierType.strong:
        return strong();
      case PropertyModifierType.weak:
        return weak();
      case PropertyModifierType.unsafeUnretained:
        return unsafeUnretained();
    }
  }
}

enum PropertyAccessType {
  privateAccess,
  packageAccess,
  publicAccess
}

export class PropertyAccess {
  private accessType;
  constructor(type:PropertyAccessType) {
    this.accessType = type;
  }

  static Private() {
    return new PropertyAccess(PropertyAccessType.privateAccess);
  }

  static Package() {
    return new PropertyAccess(PropertyAccessType.packageAccess);
  }

  static Public() {
    return new PropertyAccess(PropertyAccessType.publicAccess);
  }

  match<T>(privateAccess:() => T, packageAccess:() => T, publicAccess:() => T) {
    switch(this.accessType) {
      case PropertyAccessType.privateAccess:
        return privateAccess();
      case PropertyAccessType.packageAccess:
        return packageAccess();
      case PropertyAccessType.publicAccess:
        return publicAccess();
    }
  }
}

export interface Property {
  comments:Comment[];
  modifiers:PropertyModifier[];
  access:PropertyAccess;
  name:string;
  returnType:Type;
}

export interface Class {
  baseClassName:string;
  classMethods:Method[];
  comments:Comment[];
  instanceMethods:Method[];
  name:string;
  properties:Property[];
  internalProperties:Property[];
  implementedProtocols:Protocol[];
}

export interface Protocol {
  name:string;
}

export interface Comment {
  content:string
}
