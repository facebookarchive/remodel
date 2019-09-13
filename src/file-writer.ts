/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Error from './error';
import * as File from './file';
import * as fs from 'fs';
import * as List from './list';
import * as Maybe from './maybe';
import * as Promise from './promise';

export interface Request {
  content: string;
  path: File.AbsoluteFilePath;
}

export interface FileWriteRequest {
  name: string;
  requests: List.List<Request>;
}

export function Request(path: File.AbsoluteFilePath, content: string) {
  return {path: path, content: content};
}

export function write(request: Request): Promise.Future<Error.Error | null> {
  const promise = Promise.pending<Error.Error | null>();
  fs.writeFile(
    File.getAbsolutePathString(request.path),
    request.content,
    {encoding: 'utf8'},
    function(err) {
      if (err) {
        promise.setValue(Maybe.Just(Error.Error(err.message)));
      } else {
        promise.setValue(Maybe.Nothing<Error.Error>());
      }
    },
  );

  return promise.getFuture();
}
