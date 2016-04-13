/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
  functions:ObjC.Function[];
  classes:ObjC.Class[];
  diagnosticIgnores:string[];
  namespaces:CPlusPlus.Namespace[];
}
