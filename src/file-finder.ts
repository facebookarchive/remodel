/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Either from './either';
import * as Error from './error';
import * as File from './file';
import * as fs from 'fs';
import * as Maybe from './maybe';
import * as path from 'path';
import * as PathUtils from './path-utils';
import * as Promise from './promise';

export interface FilesAndDirectories {
  foundPotentialDirectories: File.AbsoluteFilePath[];
  foundFilePaths: File.AbsoluteFilePath[];
}

function pathIsToFileWithExtensionType(
  extensionType: string,
  path: string,
): boolean {
  return path.indexOf(extensionType) == path.length - extensionType.length;
}

export function findFilesAndDirectories(
  directoryOrFileToScan: File.AbsoluteFilePath,
  fileExtension: string,
): Promise.Future<Either.Either<Error.Error, FilesAndDirectories>> {
  const promise = Promise.pending<
    Either.Either<Error.Error, FilesAndDirectories>
  >();
  const fileExtensionPath: string = '.' + fileExtension;
  const absolutePath: string = File.getAbsolutePathString(
    directoryOrFileToScan,
  );
  if (pathIsToFileWithExtensionType(fileExtensionPath, absolutePath)) {
    fs.stat(absolutePath, function(err, stats) {
      if (err) {
        const message = absolutePath + ' does not exist';
        promise.setValue(
          Either.Left<Error.Error, FilesAndDirectories>(Error.Error(message)),
        );
      } else {
        const result: FilesAndDirectories = {
          foundPotentialDirectories: [],
          foundFilePaths: [directoryOrFileToScan],
        };
        promise.setValue(
          Either.Right<Error.Error, FilesAndDirectories>(result),
        );
      }
    });
  } else {
    fs.readdir(File.getAbsolutePathString(directoryOrFileToScan), function(
      err,
      files,
    ) {
      if (err) {
        promise.setValue(
          Either.Left<Error.Error, FilesAndDirectories>(
            Error.Error(err.message),
          ),
        );
      } else {
        const stats = files.reduce(
          function(
            soFar: FilesAndDirectories,
            str: string,
          ): FilesAndDirectories {
            const fullPath: File.AbsoluteFilePath = PathUtils.getAbsolutePathFromDirectoryAndRelativePath(
              directoryOrFileToScan,
              str,
            );
            const indexOfPeriod = str.indexOf('.');
            if (indexOfPeriod === -1) {
              soFar.foundPotentialDirectories.push(fullPath);
              return soFar;
            } else if (indexOfPeriod === 0) {
              return soFar;
            } else {
              if (
                str.indexOf(
                  fileExtensionPath,
                  str.length - fileExtensionPath.length,
                ) !== -1
              ) {
                soFar.foundFilePaths.push(fullPath);
              }
              return soFar;
            }
          },
          {foundPotentialDirectories: [], foundFilePaths: []},
        );
        promise.setValue(Either.Right<Error.Error, FilesAndDirectories>(stats));
      }
    });
  }
  return promise.getFuture();
}

function findFile(
  fileName: string,
  directory: string,
): Promise.Future<File.AbsoluteFilePath | null> {
  const promise = Promise.pending<File.AbsoluteFilePath | null>();
  fs.readdir(directory, function(err, files) {
    if (files != null && files.indexOf(fileName) !== -1) {
      promise.setValue(File.getAbsoluteFilePath(directory + '/' + fileName));
    } else {
      promise.setValue(null);
    }
  });
  return promise.getFuture();
}

function searchForConfigWithStringPath(
  fileName: string,
  searchPath: string,
): Promise.Future<File.AbsoluteFilePath | null> {
  return Promise.mbind(function(
    maybe: File.AbsoluteFilePath | null,
  ): Promise.Future<File.AbsoluteFilePath | null> {
    return Maybe.match(
      function(foundPath: File.AbsoluteFilePath) {
        return Promise.munit(foundPath);
      },
      function() {
        const nextPath = path.resolve(searchPath, '../');
        if (nextPath === searchPath) {
          return Promise.munit(null);
        } else {
          return searchForConfigWithStringPath(fileName, nextPath);
        }
      },
      maybe,
    );
  },
  findFile(fileName, searchPath));
}

/**
 * Searches for a file with the specified name, looking up through parent directories and stopping at the first hit.
 * @param fileName The file name to find.
 * @param startingPath The directory to start at.
 */
export function searchForConfig(
  fileName: string,
  startingPath: File.AbsoluteFilePath,
): Promise.Future<File.AbsoluteFilePath | null> {
  return searchForConfigWithStringPath(
    fileName,
    File.getAbsolutePathString(startingPath),
  );
}

/**
 * Takes a path to a config file, verifies it is present.
 * @param configPath The complete path to the config file we want to open.
 */
export function findConfigAtPath(
  configPath: File.AbsoluteFilePath,
): Promise.Future<File.AbsoluteFilePath | null> {
  const absPath = File.getAbsolutePathString(configPath);
  return findFile(path.basename(absPath), path.resolve(absPath, '../'));
}
