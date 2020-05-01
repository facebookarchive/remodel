/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Code from './code';
import * as Either from './either';
import * as Error from './error';
import * as File from './file';
import * as FileWriter from './file-writer';
import * as List from './list';
import * as Maybe from './maybe';
import * as ObjCRenderer from './objc-renderer';
import * as path from 'path';

function fileRequest(
  containingFolderPath: File.AbsoluteFilePath,
  fileName: string,
  contents: string | null,
): FileWriter.Request | null {
  return Maybe.mbind(function(fileContents: string): FileWriter.Request | null {
    return FileWriter.Request(
      File.getAbsoluteFilePath(
        path.join(File.getAbsolutePathString(containingFolderPath), fileName),
      ),
      fileContents,
    );
  }, contents);
}

function fileNameIncludingExtension(
  file: Code.File,
  extension: string,
): string {
  return file.name + '.' + extension;
}

function requestsMaybeContainingRequest(
  existingRequests: List.List<FileWriter.Request>,
  request: FileWriter.Request | null,
): List.List<FileWriter.Request> {
  return Maybe.match(
    function(fileRequest: FileWriter.Request): List.List<FileWriter.Request> {
      return List.cons(fileRequest, existingRequests);
    },
    function() {
      return existingRequests;
    },
    request,
  );
}

function implementationFileExtensionForFileType(
  fileType: Code.FileType,
): string {
  switch (fileType) {
    case Code.FileType.ObjectiveC:
      return 'm';
    case Code.FileType.ObjectiveCPlusPlus:
      return 'mm';
  }
}

export function fileCreationRequest(
  containingFolderPath: File.AbsoluteFilePath,
  file: Code.File,
  renderHeader: boolean,
  renderImpl: boolean,
): Either.Either<Error.Error, FileWriter.FileWriteRequest> {
  const headerContents: string | null = renderHeader
    ? ObjCRenderer.renderHeader(file)
    : null;
  const headerRequest: FileWriter.Request | null = fileRequest(
    containingFolderPath,
    fileNameIncludingExtension(file, 'h'),
    headerContents,
  );

  const implementationContents: string | null = renderImpl
    ? ObjCRenderer.renderImplementation(file)
    : null;
  const implementationRequest: FileWriter.Request | null = fileRequest(
    containingFolderPath,
    fileNameIncludingExtension(
      file,
      implementationFileExtensionForFileType(file.type),
    ),
    implementationContents,
  );

  const baseRequests: List.List<FileWriter.Request> = List.of<
    FileWriter.Request
  >();
  const requests = requestsMaybeContainingRequest(
    requestsMaybeContainingRequest(baseRequests, headerRequest),
    implementationRequest,
  );

  const writeRequest = {
    name: file.name,
    requests: List.reverse(requests),
  };
  return Either.Right<Error.Error, FileWriter.FileWriteRequest>(writeRequest);
}
