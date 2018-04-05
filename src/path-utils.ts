/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import File = require('./file');
import path = require('path');

function pathWithoutLastSlash(path:string):string {
  const lastIndex = path.length - 1;
  if (path[lastIndex] === '/') {
    return path.slice(0, lastIndex);
  } else {
    return path;
  }
}

function extraPath(pathPassedIn:string) {
  if (typeof pathPassedIn === 'undefined') {
    return '';
  } else {
    return pathPassedIn;
  }
}

export function getAbsolutePathFromDirectoryAndRelativePath(directoryPath:File.AbsoluteFilePath, relativePath:string):File.AbsoluteFilePath {
  return File.getAbsoluteFilePath(pathWithoutLastSlash(path.join(File.getAbsolutePathString(directoryPath), extraPath(relativePath))));
}

export function getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath(directoryPath:File.AbsoluteFilePath, relativePath:string):File.AbsoluteFilePath {
  return File.getAbsoluteFilePath(pathWithoutLastSlash(path.resolve(File.getAbsolutePathString(directoryPath), extraPath(relativePath))));
}

export function getDirectoryPathFromAbsolutePath(filePath:File.AbsoluteFilePath):File.AbsoluteFilePath {
  return File.getAbsoluteFilePath(path.dirname(File.getAbsolutePathString(filePath)));
}
