/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import * as Error from '../error';
import * as File from '../file';
import * as FileWriter from '../file-writer';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as Maybe from '../maybe';
import * as Promise from '../promise';

function nullFunc() {
  return null;
}

describe('FileWriter', function() {
  describe('#write', function() {
    it(
      'gives a future for the write information and actually does write ' +
        'the contents of the request to disk',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        const path: File.AbsoluteFilePath = File.getAbsoluteFilePath(
          __dirname + '/tmp/test.value',
        );
        const request: FileWriter.Request = FileWriter.Request(
          path,
          'some contents',
        );
        const future: Promise.Future<
          Maybe.Maybe<Error.Error>
        > = FileWriter.write(request);
        Promise.then(function(result: Maybe.Maybe<Error.Error>) {
          const val = Maybe.match(Error.getReason, nullFunc, result);

          expect(val).toBe(null);

          fs.readFile(__dirname + '/tmp/test.value', 'utf8', function(
            err,
            data,
          ) {
            expect(data).toEqualJSON('some contents');
            fsExtra.removeSync(__dirname + '/tmp');
            finished();
          });
        }, future);
      },
    );

    it(
      'gives a future for the write information and gives back an actual ' +
        'error when the write to disk fails',
      function(finished) {
        const path: File.AbsoluteFilePath = File.getAbsoluteFilePath(
          __dirname + '/tmp/test.value',
        );
        const request: FileWriter.Request = FileWriter.Request(
          path,
          'some contents',
        );
        const future: Promise.Future<
          Maybe.Maybe<Error.Error>
        > = FileWriter.write(request);
        Promise.then(function(result: Maybe.Maybe<Error.Error>) {
          const val: string = Maybe.match(Error.getReason, nullFunc, result)!;

          expect(
            val.indexOf('ENOENT') != -1 &&
              val.indexOf(__dirname + "/tmp/test.value'"),
          ).toBeTruthy();

          finished();
        }, future);
      },
    );
  });
});
