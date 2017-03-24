/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

enum TemplateTypeType {
  typenameTemplate,
  classTemplate
}

export class TemplateType {
  private templateType;
  constructor(type:TemplateTypeType) {
    this.templateType = type;
  }

  static Typename() {
    return new TemplateType(TemplateTypeType.typenameTemplate);
  }

  static Class() {
    return new TemplateType(TemplateTypeType.classTemplate);
  }

  match<T>(typenameTemplate:() => T, classTemplate:() =>T):T {
    switch(this.templateType) {
      case TemplateTypeType.typenameTemplate:
        return typenameTemplate();
      case TemplateTypeType.classTemplate:
        return classTemplate();
    }
  }
}

export interface TemplatedType {
  type:TemplateType;
  value:string;
}

export interface Template {
  templatedTypes:TemplatedType[];
  code:string[];
}

export interface Struct {
  name:string;
  templates:Template[];
  code:string[][];
}

export interface Namespace {
  name:string;
  templates:Template[];
}
