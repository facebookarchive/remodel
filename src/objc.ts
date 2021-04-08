/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface Type {
  name: string;
  reference: string;
}

enum ForwardDeclarationType {
  class,
  protocol,
  struct,
}

export class ForwardDeclaration {
  private name: string;
  private declarationType: ForwardDeclarationType;

  constructor(type: ForwardDeclarationType, name: string) {
    this.name = name;
    this.declarationType = type;
  }

  static ForwardClassDeclaration(name: string) {
    return new ForwardDeclaration(ForwardDeclarationType.class, name);
  }

  static ForwardProtocolDeclaration(name: string) {
    return new ForwardDeclaration(ForwardDeclarationType.protocol, name);
  }

  static ForwardStructDeclaration(name: string) {
    return new ForwardDeclaration(ForwardDeclarationType.struct, name);
  }

  match<T>(
    classDeclaration: (name: string) => T,
    protocolDeclaration: (name: string) => T,
    structDeclaration: (name: string) => T,
  ) {
    switch (this.declarationType) {
      case ForwardDeclarationType.class:
        return classDeclaration(this.name);
      case ForwardDeclarationType.protocol:
        return protocolDeclaration(this.name);
      case ForwardDeclarationType.struct:
        return structDeclaration(this.name);
    }
  }
}

export interface Import {
  file: string;
  isPublic: boolean;
  library: string | null;
  // guard with #ifdef __cplusplus
  requiresCPlusPlus: boolean;
}

enum KeywordArgumentModifierType {
  nonnull,
  nullable,
  noescape,
  unsafe_unretained,
}

export class KeywordArgumentModifier {
  private modifierType: KeywordArgumentModifierType;
  constructor(type: KeywordArgumentModifierType) {
    this.modifierType = type;
  }

  static Nonnull() {
    return new KeywordArgumentModifier(KeywordArgumentModifierType.nonnull);
  }

  static Nullable() {
    return new KeywordArgumentModifier(KeywordArgumentModifierType.nullable);
  }

  static Noescape() {
    return new KeywordArgumentModifier(KeywordArgumentModifierType.noescape);
  }

  static UnsafeUnretained() {
    return new KeywordArgumentModifier(
      KeywordArgumentModifierType.unsafe_unretained,
    );
  }

  match<T>(
    nonnull: () => T,
    nullable: () => T,
    noescape: () => T,
    unsafe_unretained: () => T,
  ) {
    switch (this.modifierType) {
      case KeywordArgumentModifierType.nonnull:
        return nonnull();
      case KeywordArgumentModifierType.nullable:
        return nullable();
      case KeywordArgumentModifierType.noescape:
        return noescape();
      case KeywordArgumentModifierType.unsafe_unretained:
        return unsafe_unretained();
    }
  }
}

export interface KeywordArgument {
  name: string;
  modifiers: KeywordArgumentModifier[];
  type: Type;
}

export interface Keyword {
  argument: KeywordArgument | null;
  name: string;
}

export interface ReturnType {
  type: Type | null;
  modifiers: KeywordArgumentModifier[];
}

export interface Preprocessor {
  openingCode: string;
  closingCode: string;
}

export interface Method {
  preprocessors: Preprocessor[];
  belongsToProtocol: string | null;
  code: string[] | null;
  comments: Comment[];
  compilerAttributes: string[];
  keywords: Keyword[];
  returnType: ReturnType;
}

export interface FunctionParameter {
  name: string;
  type: Type;
  modifiers?: KeywordArgumentModifier[];
}

export interface Function {
  comments: Comment[];
  name: string;
  parameters: FunctionParameter[];
  returnType: ReturnType;
  code: string[];
  isPublic: boolean;
  isInline: boolean;
  compilerAttributes: string[];
  trailingMacros?: string[];
}

export interface Macro {
  comments: Comment[];
  name: string;
  parameters: String[];
  code: string;
}

export interface BlockTypeParameter {
  name: string;
  type: Type;
  nullability: Nullability;
  trailingMacros?: string[];
}

export interface BlockType {
  comments: Comment[];
  name: string;
  parameters: BlockTypeParameter[];
  returnType: ReturnType;
  isPublic: boolean;
  nullability: ClassNullability;
}

export interface Enumeration {
  comments: Comment[];
  name: string;
  underlyingType: string;
  values: string[];
  isPublic: boolean;
}

enum NullabilityType {
  inherited,
  nonnull,
  nullable,
}

export enum ClassNullability {
  default,
  assumeNonnull,
}

export enum ClassVisibility {
  default, /// use "default" visibility (usually means public)
  hidden, /// use "hidden" visibility
}

export class Nullability {
  private nullabilityType: NullabilityType;

  constructor(type: NullabilityType) {
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

  match<T>(inherited: () => T, nonnull: () => T, nullable: () => T) {
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
  weak,
}

export class MemorySemantic {
  private memoryType: MemorySemanticType;
  constructor(type: MemorySemanticType) {
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

  match<T>(
    assign: () => T,
    copy: () => T,
    strong: () => T,
    unsafeUnretained: () => T,
    weak: () => T,
  ) {
    switch (this.memoryType) {
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
  comments: Comment[];
  memorySemantic: MemorySemantic;
  name: string;
  type: Type;
  value: string;
}

export interface GlobalVariable {
  comments: Comment[];
  name: string;
  type: Type;
  value: string;
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
  setter,
  strong,
  weak,
  unsafeUnretained,
}

export class PropertyModifier {
  private modifierType: PropertyModifierType;
  private selector: string | null;
  constructor(type: PropertyModifierType, selector: string | null) {
    this.modifierType = type;
    this.selector = selector;
  }

  static Assign() {
    return new PropertyModifier(PropertyModifierType.assign, null);
  }

  static Atomic() {
    return new PropertyModifier(PropertyModifierType.atomic, null);
  }

  static Copy() {
    return new PropertyModifier(PropertyModifierType.copy, null);
  }

  static Nonatomic() {
    return new PropertyModifier(PropertyModifierType.nonatomic, null);
  }

  static Nonnull() {
    return new PropertyModifier(PropertyModifierType.nonnull, null);
  }

  static Nullable() {
    return new PropertyModifier(PropertyModifierType.nullable, null);
  }

  static Readonly() {
    return new PropertyModifier(PropertyModifierType.readonly, null);
  }

  static Readwrite() {
    return new PropertyModifier(PropertyModifierType.readwrite, null);
  }

  static Setter(selector: string) {
    return new PropertyModifier(PropertyModifierType.setter, selector);
  }

  static Strong() {
    return new PropertyModifier(PropertyModifierType.strong, null);
  }

  static Weak() {
    return new PropertyModifier(PropertyModifierType.weak, null);
  }

  static UnsafeUnretained() {
    return new PropertyModifier(PropertyModifierType.unsafeUnretained, null);
  }

  match<T>(
    assign: () => T,
    atomic: () => T,
    copy: () => T,
    nonatomic: () => T,
    nonnull: () => T,
    nullable: () => T,
    readonly: () => T,
    readwrite: () => T,
    setter: (selector) => T,
    strong: () => T,
    weak: () => T,
    unsafeUnretained: () => T,
  ) {
    switch (this.modifierType) {
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
      case PropertyModifierType.setter:
        return setter(this.selector);
      case PropertyModifierType.strong:
        return strong();
      case PropertyModifierType.weak:
        return weak();
      case PropertyModifierType.unsafeUnretained:
        return unsafeUnretained();
    }
  }
}

enum InstanceVariableModifierType {
  nonnull,
  nullable,
  strong,
  weak,
  unsafeUnretained,
}

export class InstanceVariableModifier {
  private modifierType: InstanceVariableModifierType;
  constructor(type: InstanceVariableModifierType) {
    this.modifierType = type;
  }

  static Nonnull() {
    return new InstanceVariableModifier(InstanceVariableModifierType.nonnull);
  }

  static Nullable() {
    return new InstanceVariableModifier(InstanceVariableModifierType.nullable);
  }

  static Strong() {
    return new InstanceVariableModifier(InstanceVariableModifierType.strong);
  }

  static Weak() {
    return new InstanceVariableModifier(InstanceVariableModifierType.weak);
  }

  static UnsafeUnretained() {
    return new InstanceVariableModifier(
      InstanceVariableModifierType.unsafeUnretained,
    );
  }

  match<T>(
    nonnull: () => T,
    nullable: () => T,
    strong: () => T,
    weak: () => T,
    unsafeUnretained: () => T,
  ) {
    switch (this.modifierType) {
      case InstanceVariableModifierType.nonnull:
        return nonnull();
      case InstanceVariableModifierType.nullable:
        return nullable();
      case InstanceVariableModifierType.strong:
        return strong();
      case InstanceVariableModifierType.weak:
        return weak();
      case InstanceVariableModifierType.unsafeUnretained:
        return unsafeUnretained();
    }
  }
}

enum InstanceVariableAccessType {
  privateAccess,
  packageAccess,
  publicAccess,
}

export class InstanceVariableAccess {
  private accessType: InstanceVariableAccessType;
  constructor(type: InstanceVariableAccessType) {
    this.accessType = type;
  }

  static Private() {
    return new InstanceVariableAccess(InstanceVariableAccessType.privateAccess);
  }

  static Package() {
    return new InstanceVariableAccess(InstanceVariableAccessType.packageAccess);
  }

  static Public() {
    return new InstanceVariableAccess(InstanceVariableAccessType.publicAccess);
  }

  match<T>(
    privateAccess: () => T,
    packageAccess: () => T,
    publicAccess: () => T,
  ) {
    switch (this.accessType) {
      case InstanceVariableAccessType.privateAccess:
        return privateAccess();
      case InstanceVariableAccessType.packageAccess:
        return packageAccess();
      case InstanceVariableAccessType.publicAccess:
        return publicAccess();
    }
  }
}

enum PropertyAccessType {
  privateAccess,
  publicAccess,
}

export class PropertyAccess {
  private accessType: PropertyAccessType;
  constructor(type: PropertyAccessType) {
    this.accessType = type;
  }

  static Private() {
    return new PropertyAccess(PropertyAccessType.privateAccess);
  }

  static Public() {
    return new PropertyAccess(PropertyAccessType.publicAccess);
  }

  match<T>(privateAccess: () => T, publicAccess: () => T) {
    switch (this.accessType) {
      case PropertyAccessType.privateAccess:
        return privateAccess();
      case PropertyAccessType.publicAccess:
        return publicAccess();
    }
  }
}

export interface Property {
  comments: Comment[];
  modifiers: PropertyModifier[];
  access: PropertyAccess;
  name: string;
  returnType: Type;
  preprocessors: Preprocessor[];
}

export interface InstanceVariable {
  comments: Comment[];
  modifiers: InstanceVariableModifier[];
  access: InstanceVariableAccess;
  name: string;
  returnType: Type;
}

export interface Class {
  baseClassName: string;
  covariantTypes: string[];
  classMethods: Method[];
  comments: Comment[];
  functions?: Function[];
  inlineBlockTypedefs: BlockType[];
  instanceMethods: Method[];
  name: string;
  properties: Property[];
  instanceVariables: InstanceVariable[];
  implementedProtocols: ImplementedProtocol[];
  nullability: ClassNullability;
  subclassingRestricted: boolean;
  visibility?: ClassVisibility;
}

export interface ImplementedProtocol {
  name: string;
}

export interface Comment {
  content: string;
}

export interface StructMember {
  comments: Comment[];
  name: string;
  type: Type;
  nullability: Nullability;
  trailingMacros?: string[];
}

export interface Struct {
  name: string;
  comments: Comment[];
  members: StructMember[];
}

export interface BaseClass {
  className: string;
  libraryName: string | null;
}

export interface ReferencedGenericType {
  name: string;
  conformingProtocol: string | null;
  referencedGenericTypes: ReferencedGenericType[];
}

export interface Protocol {
  name: String;
  comments: Comment[];
  implementedProtocols: ImplementedProtocol[];
  instanceMethods: Method[];
  classMethods: Method[];
  properties: Property[];
  nullability: ClassNullability;
}
