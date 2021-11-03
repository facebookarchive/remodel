/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import * as Either from '../either';
import * as Error from '../error';
import * as File from '../file';
import * as FileReader from '../file-reader';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as Promise from '../promise';

function concatenatedErrorStringFromErrors(errors: Error.Error[]): string {
  return errors.map(Error.getReason).join(',');
}

describe('FileReader', function () {
  describe('#read', function () {
    it(
      'gives a future with the value of the file in an either when the ' +
        'file exists and the read is successful',
      function (finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/test.value', 'some contents');
        const path: File.AbsoluteFilePath = File.getAbsoluteFilePath(
          __dirname + '/tmp/test.value',
        );
        const future: Promise.Future<
          Either.Either<Error.Error[], File.Contents>
        > = FileReader.read(path);
        Promise.then(function (
          result: Either.Either<Error.Error[], File.Contents>,
        ) {
          const val: string = Either.match(
            function (errors: Error.Error[]): string {
              return errors.join(', ');
            },
            File.getContents,
            result,
          );

          expect(val).toEqualJSON('some contents');

          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );

    it(
      'gives a future with the errorin an either when the file does not ' +
        'exist',
      function (finished) {
        const path: File.AbsoluteFilePath = File.getAbsoluteFilePath(
          __dirname + '/tmp/test.value',
        );
        const future: Promise.Future<
          Either.Either<Error.Error[], File.Contents>
        > = FileReader.read(path);
        Promise.then(function (
          result: Either.Either<Error.Error[], File.Contents>,
        ) {
          const val: string = Either.match(
            concatenatedErrorStringFromErrors,
            File.getContents,
            result,
          );

          expect(
            val.indexOf('ENOENT') != -1 &&
              val.indexOf(__dirname + "/tmp/test.value'"),
          ).toBeTruthy();

          finished();
        },
        future);
      },
    );
  });
});
