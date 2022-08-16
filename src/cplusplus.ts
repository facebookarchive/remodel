/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as CLangCommon from './clang-common';

enum TemplateTypeType {
  typenameTemplate,
  classTemplate,
}

export class TemplateType {
  private templateType: TemplateTypeType;
  constructor(type: TemplateTypeType) {
    this.templateType = type;
  }

  static Typename() {
    return new TemplateType(TemplateTypeType.typenameTemplate);
  }

  static Class() {
    return new TemplateType(TemplateTypeType.classTemplate);
  }

  match<T>(typenameTemplate: () => T, classTemplate: () => T): T {
    switch (this.templateType) {
      case TemplateTypeType.typenameTemplate:
        return typenameTemplate();
      case TemplateTypeType.classTemplate:
        return classTemplate();
    }
  }
}

export interface TemplatedType {
  type: TemplateType;
  value: string;
}

export interface Template {
  templatedTypes: TemplatedType[];
  code: string[];
}

export interface Struct {
  name: string;
  nullability: ClassNullability;
  templates: Template[];
  code: string[][];
}

export interface Namespace {
  name: string;
  templates: Template[];
}

export enum ClassSectionVisibility {
  Public,
  Private,
}

export enum TypePassBy {
  Value,
  Reference,
  Pointer,
}

export interface TypeQualifier {
  passBy: TypePassBy;
  nullability: CLangCommon.Nullability;
  is_const: boolean;
}

export interface Type {
  baseType: string;
  qualifier: TypeQualifier;
}

export interface ClassMember {
  type: Type;
  name: string;
}

export interface FunctionParam {
  type: Type;
  name: string;
}

export enum ConstructorDefault {
  Default,
  Delete,
}

export interface ConstructorInitializer {
  memberName: string;
  expression: string;
}

export interface ClassConstructor {
  name: string;
  default?: ConstructorDefault;
  params: FunctionParam[];
  initializers: ConstructorInitializer[];
}

export interface Function {
  name: string;
  returnType: Type;
  params: FunctionParam[];
  is_const: boolean;
  code?: string[];
}

export interface ClassSection {
  visibility: ClassSectionVisibility;
  members: ClassMember[];
  constructors: ClassConstructor[];
  methods: Function[];
}

export enum ClassNullability {
  default,
  assumeNonnull,
}

export interface Class {
  name: string;
  nullability: ClassNullability;
  sections: ClassSection[];
}
