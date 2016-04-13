/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export interface Contents {
  contents:string;
}

export function Contents(contents:string) {
  return {contents:contents};
}

export function getContents(contents:Contents) {
  return contents.contents;
}

export interface AbsoluteFilePath {
  absolutePath:string;
}

export function getAbsoluteFilePath(path:string) {
  return {absolutePath:path};
}

export function getAbsolutePathString(path:AbsoluteFilePath):string {
  return path.absolutePath;
}
