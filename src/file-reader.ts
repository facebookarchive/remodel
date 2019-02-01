/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='./type-defs/node-0.11.d.ts'/>

import * as Either from './either';
import * as Error from './error';
import * as File from './file';
import * as fs from 'fs';
import * as Promise from './promise';

export function read(
  path: File.AbsoluteFilePath,
): Promise.Future<Either.Either<Error.Error[], File.Contents>> {
  const promise = Promise.pending<
    Either.Either<Error.Error[], File.Contents>
  >();
  fs.readFile(File.getAbsolutePathString(path), 'utf8', function(err, data) {
    if (err) {
      promise.setValue(
        Either.Left<Error.Error[], File.Contents>([Error.Error(err.message)]),
      );
    } else {
      promise.setValue(
        Either.Right<Error.Error[], File.Contents>(File.Contents(data)),
      );
    }
  });
  return promise.getFuture();
}
