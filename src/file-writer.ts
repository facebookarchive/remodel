/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='./type-defs/node-0.11.d.ts'/>

import Error = require('./error');
import File = require('./file');
import fs = require('fs');
import List = require('./list');
import Maybe = require('./maybe');
import Promise = require('./promise');

export interface Request {
  content:string;
  path:File.AbsoluteFilePath;
}

export interface FileWriteRequest {
  name:string;
  requests:List.List<Request>;
}

export function Request(path:File.AbsoluteFilePath, content:string) {
  return {path:path, content:content};
}

export function write(request:Request):Promise.Future<Maybe.Maybe<Error.Error>> {
  const promise = Promise.pending<Maybe.Maybe<Error.Error>>();
  fs.writeFile(File.getAbsolutePathString(request.path), request.content, {encoding: 'utf8'}, function(err) {
    if (err) {
      promise.setValue(Maybe.Just(Error.Error(err.message)));
    } else {
      promise.setValue(Maybe.Nothing<Error.Error>());
    }
  });

  return promise.getFuture();
}
