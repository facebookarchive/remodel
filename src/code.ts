/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as CPlusPlus from './cplusplus';
import * as ObjC from './objc';

enum LanguageType {
  objectiveC,
  objectiveCPlusPlus,
}

export class FileType {
  private fileType: LanguageType;
  constructor(type: LanguageType) {
    this.fileType = type;
  }

  static ObjectiveC() {
    return new FileType(LanguageType.objectiveC);
  }

  static ObjectiveCPlusPlus() {
    return new FileType(LanguageType.objectiveCPlusPlus);
  }

  match<T>(objectiveC: () => T, objectiveCPlusPlus: () => T): T {
    switch (this.fileType) {
      case LanguageType.objectiveC:
        return objectiveC();
      case LanguageType.objectiveCPlusPlus:
        return objectiveCPlusPlus();
    }
  }
}

export class Struct {
  private cppStruct: CPlusPlus.Struct;
  private objCStruct: ObjC.Struct;
  private langType: LanguageType;

  constructor(
    langType: LanguageType,
    cppStruct: CPlusPlus.Struct,
    objCStruct: ObjC.Struct,
  ) {
    this.langType = langType;
    this.cppStruct = cppStruct;
    this.objCStruct = objCStruct;
  }

  static ObjectiveCStruct(objCStruct: ObjC.Struct) {
    return new Struct(LanguageType.objectiveC, null, objCStruct);
  }

  static ObjectiveCPlusPlusStruct(cppStruct: CPlusPlus.Struct) {
    return new Struct(LanguageType.objectiveCPlusPlus, cppStruct, null);
  }

  match<T>(
    objectiveC: (objCStruct: ObjC.Struct) => T,
    objectiveCPlusPlus: (cppStruct: CPlusPlus.Struct) => T,
  ): T {
    switch (this.langType) {
      case LanguageType.objectiveC:
        return objectiveC(this.objCStruct);
      case LanguageType.objectiveCPlusPlus:
        return objectiveCPlusPlus(this.cppStruct);
    }
  }
}

export interface File {
  name: string;
  type: FileType;
  comments: ObjC.Comment[];
  imports: ObjC.Import[];
  forwardDeclarations: ObjC.ForwardDeclaration[];
  enumerations: ObjC.Enumeration[];
  blockTypes: ObjC.BlockType[];
  staticConstants: ObjC.Constant[];
  macros: ObjC.Macro[];
  functions: ObjC.Function[];
  classes: ObjC.Class[];
  diagnosticIgnores: string[];
  structs: Struct[];
  nullability?: ObjC.ClassNullability;
  namespaces: CPlusPlus.Namespace[];
}
