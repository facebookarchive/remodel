/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export interface Contents {
  contents: string;
}

export function Contents(contents: string) {
  return {contents: contents};
}

export function getContents(contents: Contents) {
  return contents.contents;
}

export interface AbsoluteFilePath {
  absolutePath: string;
}

export function getAbsoluteFilePath(path: string) {
  return {absolutePath: path};
}

export function getAbsolutePathString(path: AbsoluteFilePath): string {
  return path.absolutePath;
}
