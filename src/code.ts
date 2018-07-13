/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import CPlusPlus = require('./cplusplus');
import ObjC = require('./objc');

enum FileTypeValue {
  objectiveC,
  objectiveCPlusPlus
}

export class FileType {
  private fileType;
  constructor(type:FileTypeValue) {
    this.fileType = type;
  }

  static ObjectiveC() {
    return new FileType(FileTypeValue.objectiveC);
  }

  static ObjectiveCPlusPlus() {
    return new FileType(FileTypeValue.objectiveCPlusPlus);
  }

  match<T>(objectiveC:() => T, objectiveCPlusPlus:() => T):T {
    switch(this.fileType) {
      case FileTypeValue.objectiveC:
        return objectiveC();
      case FileTypeValue.objectiveCPlusPlus:
        return objectiveCPlusPlus();
    }
  }
}

export interface File {
  name:string;
  type:FileType;
  comments:ObjC.Comment[];
  imports:ObjC.Import[];
  forwardDeclarations:ObjC.ForwardDeclaration[];
  enumerations:ObjC.Enumeration[];
  blockTypes:ObjC.BlockType[];
  staticConstants:ObjC.Constant[];
  macros: ObjC.Macro[];
  functions:ObjC.Function[];
  classes:ObjC.Class[];
  diagnosticIgnores:string[];
  structs:CPlusPlus.Struct[];
  namespaces:CPlusPlus.Namespace[];
}
