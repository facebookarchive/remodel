/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface OutputFlags {
  emitHeaders: boolean;
  emitImplementations: boolean;
  // empty implies emit object and all additional files
  outputList: string[];
}

export function ShouldEmitObject(flags:OutputFlags) {
  return flags.outputList.length == 0 || (flags.outputList.indexOf('object') !== -1);
}

export function ShouldEmitPluginFile(flags:OutputFlags, pluginName:string) {
  return flags.outputList.length == 0 || (flags.outputList.indexOf(pluginName) !== -1);
}
