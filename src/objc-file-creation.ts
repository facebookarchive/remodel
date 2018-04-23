/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Code = require('./code');
import Either = require('./either');
import Error = require('./error');
import File = require('./file');
import FileWriter = require('./file-writer');
import List = require('./list');
import Maybe = require('./maybe');
import ObjCRenderer = require('./objc-renderer');
import path = require('path');

function fileRequest(containingFolderPath:File.AbsoluteFilePath, fileName:string, contents:Maybe.Maybe<string>):Maybe.Maybe<FileWriter.Request> {
  return Maybe.mbind(function(fileContents:string):Maybe.Maybe<FileWriter.Request> {
    return Maybe.Just<FileWriter.Request>(FileWriter.Request(File.getAbsoluteFilePath(path.join(File.getAbsolutePathString(containingFolderPath), fileName)), fileContents));
  }, contents);
}

function fileNameIncludingExtension(file:Code.File, extension:string):string {
  return file.name + '.' + extension;
}

function requestsMaybeContainingRequest(existingRequests:List.List<FileWriter.Request>, request:Maybe.Maybe<FileWriter.Request>):List.List<FileWriter.Request> {
  return Maybe.match(function(fileRequest:FileWriter.Request):List.List<FileWriter.Request> {
    return List.cons(fileRequest, existingRequests);
  }, function() {
    return existingRequests;
  }, request);
}

function implementationFileExtensionForFileType(fileType:Code.FileType):string {
  return fileType.match(function objectiveC():string {
    return 'm';
  }, function objectiveCPlusPlus():string {
    return 'mm';
  });
}

export function fileCreationRequest(containingFolderPath: File.AbsoluteFilePath, file:Code.File, renderHeader:boolean, renderImpl:boolean):Either.Either<Error.Error, FileWriter.FileWriteRequest> {
  const headerContents:Maybe.Maybe<string> = renderHeader ? ObjCRenderer.renderHeader(file) : Maybe.Nothing<string>();
  const headerRequest:Maybe.Maybe<FileWriter.Request> = fileRequest(containingFolderPath, fileNameIncludingExtension(file, 'h'), headerContents);

  const implementationContents:Maybe.Maybe<string> = renderImpl ? ObjCRenderer.renderImplementation(file) : Maybe.Nothing<string>();
  const implementationRequest:Maybe.Maybe<FileWriter.Request> = fileRequest(containingFolderPath, fileNameIncludingExtension(file, implementationFileExtensionForFileType(file.type)), implementationContents);

  const baseRequests:List.List<FileWriter.Request> = List.of<FileWriter.Request>();
  const requests = requestsMaybeContainingRequest(requestsMaybeContainingRequest(baseRequests, headerRequest), implementationRequest);

  const writeRequest = {
    name: file.name,
    requests: List.reverse(requests)
  };
  return Either.Right<Error.Error, FileWriter.FileWriteRequest>(writeRequest);
}
