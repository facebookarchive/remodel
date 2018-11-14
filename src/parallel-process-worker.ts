/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Either = require('./either');
import Error = require('./error');
import FileFinder = require('./file-finder');
import ParallelProcess = require('./parallel-process');
import Promise = require('./promise');

function processFoundFileRequest(request: ParallelProcess.FindFilesRequest) {
  const foundFilesFuture: Promise.Future<
    Either.Either<Error.Error, FileFinder.FilesAndDirectories>
  > = FileFinder.findFilesAndDirectories(
    request.directoryToSearch,
    request.fileExtension,
  );
  Promise.then(function(
    either: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
  ) {
    const response: ParallelProcess.Response = Either.match(
      function(error: Error.Error) {
        const errorResponse: ParallelProcess.Response = {
          pid: process.pid,
          responseType: ParallelProcess.ResponseType.findFilesResponse,
          findFilesResponse: {
            didError: true,
            requestId: request.requestId,
            foundFilePaths: [],
            foundDirectoriesToSearch: [],
            fileExtension: request.fileExtension,
          },
        };
        return errorResponse;
      },
      function(information: FileFinder.FilesAndDirectories) {
        const successResponse: ParallelProcess.Response = {
          pid: process.pid,
          responseType: ParallelProcess.ResponseType.findFilesResponse,
          findFilesResponse: {
            didError: false,
            requestId: request.requestId,
            foundFilePaths: information.foundFilePaths,
            foundDirectoriesToSearch: information.foundPotentialDirectories,
            fileExtension: request.fileExtension,
          },
        };
        return successResponse;
      },
      either,
    );
    process.send(response);
  },
  foundFilesFuture);
}

process.on('message', function(request: ParallelProcess.Request) {
  switch (request.requestType) {
    case ParallelProcess.RequestType.findFilesRequest:
      processFoundFileRequest(request.findFilesRequest);
  }
});
