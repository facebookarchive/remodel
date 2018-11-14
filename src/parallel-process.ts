/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import File = require('./file');
import List = require('./list');

export enum RequestType {
  findFilesRequest,
}

export enum ResponseType {
  findFilesResponse,
}

export interface FindFilesRequest {
  requestId: number;
  directoryToSearch: File.AbsoluteFilePath;
  fileExtension: string;
}

export interface FindFilesResponse {
  didError: boolean;
  requestId: number;
  foundFilePaths: File.AbsoluteFilePath[];
  foundDirectoriesToSearch: File.AbsoluteFilePath[];
  fileExtension: string;
}

export interface Request {
  requestType: RequestType;
  findFilesRequest: FindFilesRequest;
}

export interface Response {
  pid: number;
  responseType: ResponseType;
  findFilesResponse: FindFilesResponse;
}
