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

export enum FileType {
  ObjectiveC,
  ObjectiveCPlusPlus,
}

export class Struct {
  private cppStruct: CPlusPlus.Struct | null;
  private objCStruct: ObjC.Struct | null;
  private langType: LanguageType;

  constructor(
    langType: LanguageType,
    cppStruct: CPlusPlus.Struct | null,
    objCStruct: ObjC.Struct | null,
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
        return objectiveC(this.objCStruct!);
      case LanguageType.objectiveCPlusPlus:
        return objectiveCPlusPlus(this.cppStruct!);
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
  globalVariables: ObjC.GlobalVariable[];
  macros: ObjC.Macro[];
  functions: ObjC.Function[];
  classes: ObjC.Class[];
  diagnosticIgnores: string[];
  structs: Struct[];
  cppClasses: CPlusPlus.Class[];
  nullability?: ObjC.ClassNullability;
  namespaces: CPlusPlus.Namespace[];
  protocols?: ObjC.Protocol[];
}
