/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

///<reference path='./type-defs/node-0.11.d.ts'/>

import Either = require('./either');
import Error = require('./error');
import File = require('./file');
import fs = require('fs');
import Maybe = require('./maybe');
import path = require('path');
import PathUtils = require('./path-utils');
import Promise = require('./promise');

export interface FilesAndDirectories {
  foundPotentialDirectories:File.AbsoluteFilePath[];
  foundFilePaths:File.AbsoluteFilePath[];
}

function pathIsToFileWithExtensionType(extensionType:string, path:string):boolean {
  return path.indexOf(extensionType) == path.length - extensionType.length;
}

export function findFilesAndDirectories(directoryOrFileToScan:File.AbsoluteFilePath, fileExtension:string):Promise.Future<Either.Either<Error.Error, FilesAndDirectories>> {
  const promise = Promise.pending<Either.Either<Error.Error, FilesAndDirectories>>();
  const fileExtensionPath:string = '\.' + fileExtension;
  const absolutePath:string = File.getAbsolutePathString(directoryOrFileToScan);
  if (pathIsToFileWithExtensionType(fileExtensionPath, absolutePath)) {
    fs.stat(absolutePath, function(err, stats) {
      if (err) {
        const message = absolutePath + ' does not exist';
        promise.setValue(Either.Left<Error.Error, FilesAndDirectories>(Error.Error(message)));
      } else {
        const result:FilesAndDirectories = {
          foundPotentialDirectories:[],
          foundFilePaths:[directoryOrFileToScan]
        };
        promise.setValue(Either.Right<Error.Error, FilesAndDirectories>(result));
      }
    });
  } else {
    fs.readdir(File.getAbsolutePathString(directoryOrFileToScan), function(err, files) {
      if (err) {
        promise.setValue(Either.Left<Error.Error, FilesAndDirectories>(Error.Error(err.message)));
      } else {
        const stats = files.reduce(function(soFar:FilesAndDirectories, str:string):FilesAndDirectories {
          const fullPath:File.AbsoluteFilePath = PathUtils.getAbsolutePathFromDirectoryAndRelativePath(directoryOrFileToScan, str);
          const indexOfPeriod = str.indexOf('\.');
          if (indexOfPeriod === -1) {
            soFar.foundPotentialDirectories.push(fullPath);
            return soFar;
          } else if(indexOfPeriod === 0) {
            return soFar;
          } else {
            if (str.indexOf(fileExtensionPath, str.length - fileExtensionPath.length) !== -1) {
              soFar.foundFilePaths.push(fullPath);
            }
            return soFar;
          }
          }, {foundPotentialDirectories:[], foundFilePaths:[]});
        promise.setValue(Either.Right<Error.Error, FilesAndDirectories>(stats));
      }
    });
  }
  return promise.getFuture();
}

function findFile(fileName:string, directory:string):Promise.Future<Maybe.Maybe<File.AbsoluteFilePath>> {
  const promise = Promise.pending<Maybe.Maybe<File.AbsoluteFilePath>>();
  fs.readdir(directory, function(err, files) {
    if (files != null && files.indexOf(fileName) !== -1) {
      promise.setValue(Maybe.Just(File.getAbsoluteFilePath(directory + '/' + fileName)));
    } else {
      promise.setValue(Maybe.Nothing<File.AbsoluteFilePath>());
    }
  });
  return promise.getFuture();
}

function findConfigForStringPath(fileName:string, currentWorkingDirectoryPathString:string):Promise.Future<Maybe.Maybe<File.AbsoluteFilePath>> {
  return Promise.mbind(function(maybe:Maybe.Maybe<File.AbsoluteFilePath>):Promise.Future<Maybe.Maybe<File.AbsoluteFilePath>> {
    return Maybe.match(function(foundPath:File.AbsoluteFilePath) {
      return Promise.munit(Maybe.Just(foundPath));
    }, function() {
      const nextPath = path.resolve(currentWorkingDirectoryPathString, '../');
      if (nextPath === currentWorkingDirectoryPathString) {
        return Promise.munit(Maybe.Nothing<File.AbsoluteFilePath>());
      } else {
        return findConfigForStringPath(fileName, nextPath);
      }
    }, maybe);
  }, findFile(fileName, currentWorkingDirectoryPathString));
}

export function findConfig(fileName:string, currentWorkingDirectory:File.AbsoluteFilePath):Promise.Future<Maybe.Maybe<File.AbsoluteFilePath>> {
  return findConfigForStringPath(fileName, File.getAbsolutePathString(currentWorkingDirectory));
}
