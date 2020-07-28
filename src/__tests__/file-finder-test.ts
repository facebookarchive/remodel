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
import * as FileFinder from '../file-finder';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as Maybe from '../maybe';
import * as Promise from '../promise';

describe('FileFinder', function() {
  describe('#findFilesAndDirectories', function() {
    it('returns a promise for empty when given a directory that is empty', function(finished) {
      fsExtra.removeSync(__dirname + '/tmp');
      fs.mkdirSync(__dirname + '/tmp');
      const future: Promise.Future<Either.Either<
        Error.Error,
        FileFinder.FilesAndDirectories
      >> = FileFinder.findFilesAndDirectories(
        File.getAbsoluteFilePath(__dirname + '/tmp'),
        'value',
      );
      Promise.then(function(
        result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
      ) {
        const expectedResult: Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        > = Either.Right<Error.Error, FileFinder.FilesAndDirectories>({
          foundPotentialDirectories: [],
          foundFilePaths: [],
        });
        expect(result).toEqualJSON(expectedResult);
        fs.rmdirSync(__dirname + '/tmp');
        finished();
      },
      future);
    });

    it(
      'returns a promise for only a single value when given a path that contains' +
        'that one value',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/test.value', '');
        const future: Promise.Future<Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        >> = FileFinder.findFilesAndDirectories(
          File.getAbsoluteFilePath(__dirname + '/tmp/test.value'),
          'value',
        );
        Promise.then(function(
          result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
        ) {
          const expectedResult: Either.Either<
            Error.Error,
            FileFinder.FilesAndDirectories
          > = Either.Right<Error.Error, FileFinder.FilesAndDirectories>({
            foundPotentialDirectories: [],
            foundFilePaths: [{absolutePath: __dirname + '/tmp/test.value'}],
          });
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );

    it(
      'returns a promise for only a single value when given a path that contains' +
        'that one value and a substring of the suffix',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/suf-test.suf', '');
        const future: Promise.Future<Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        >> = FileFinder.findFilesAndDirectories(
          File.getAbsoluteFilePath(__dirname + '/tmp/suf-test.suf'),
          'suf',
        );
        Promise.then(function(
          result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
        ) {
          const expectedResult: Either.Either<
            Error.Error,
            FileFinder.FilesAndDirectories
          > = Either.Right<Error.Error, FileFinder.FilesAndDirectories>({
            foundPotentialDirectories: [],
            foundFilePaths: [{absolutePath: __dirname + '/tmp/suf-test.suf'}],
          });
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );

    it(
      'returns a promise for an error when given a path that contains' +
        'that one value but that value does not exist',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        const future: Promise.Future<Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        >> = FileFinder.findFilesAndDirectories(
          File.getAbsoluteFilePath(__dirname + '/tmp/test.value'),
          'value',
        );
        Promise.then(function(
          result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
        ) {
          const expectedResult = Either.Left<
            Error.Error,
            FileFinder.FilesAndDirectories
          >(Error.Error(__dirname + '/tmp/test.value does not exist'));
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );

    it(
      'returns a promise for only a single value when given a directory that only ' +
        'contains one value and no other directories',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/test.value', '');
        const future: Promise.Future<Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        >> = FileFinder.findFilesAndDirectories(
          File.getAbsoluteFilePath(__dirname + '/tmp'),
          'value',
        );
        Promise.then(function(
          result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
        ) {
          const expectedResult: Either.Either<
            Error.Error,
            FileFinder.FilesAndDirectories
          > = Either.Right<Error.Error, FileFinder.FilesAndDirectories>({
            foundPotentialDirectories: [],
            foundFilePaths: [{absolutePath: __dirname + '/tmp/test.value'}],
          });
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );

    it(
      'returns a promise for only a single value when given a directory that ' +
        'contains one value and one file that contains the text .value, but not as its suffix',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/test.value', '');
        fs.writeFileSync(__dirname + '/tmp/test.value_ignore', '');
        const future: Promise.Future<Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        >> = FileFinder.findFilesAndDirectories(
          File.getAbsoluteFilePath(__dirname + '/tmp'),
          'value',
        );
        Promise.then(function(
          result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
        ) {
          const expectedResult: Either.Either<
            Error.Error,
            FileFinder.FilesAndDirectories
          > = Either.Right<Error.Error, FileFinder.FilesAndDirectories>({
            foundPotentialDirectories: [],
            foundFilePaths: [{absolutePath: __dirname + '/tmp/test.value'}],
          });
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );

    it(
      'returns a promise for multiple values when given a directory that only ' +
        'contains value and no other directories',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/test.value', '');
        fs.writeFileSync(__dirname + '/tmp/test2.value', '');
        const future: Promise.Future<Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        >> = FileFinder.findFilesAndDirectories(
          File.getAbsoluteFilePath(__dirname + '/tmp'),
          'value',
        );
        Promise.then(function(
          result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
        ) {
          const expectedResult: Either.Either<
            Error.Error,
            FileFinder.FilesAndDirectories
          > = Either.Right<Error.Error, FileFinder.FilesAndDirectories>({
            foundPotentialDirectories: [],
            foundFilePaths: [
              {absolutePath: __dirname + '/tmp/test.value'},
              {absolutePath: __dirname + '/tmp/test2.value'},
            ],
          });
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );

    it(
      'returns a promise for one value when given a directory that only ' +
        'contains one value and no other directories but other files',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/test.value', '');
        fs.writeFileSync(__dirname + '/tmp/test2.enumValue', '');
        const future: Promise.Future<Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        >> = FileFinder.findFilesAndDirectories(
          File.getAbsoluteFilePath(__dirname + '/tmp'),
          'value',
        );
        Promise.then(function(
          result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
        ) {
          const expectedResult: Either.Either<
            Error.Error,
            FileFinder.FilesAndDirectories
          > = Either.Right<Error.Error, FileFinder.FilesAndDirectories>({
            foundPotentialDirectories: [],
            foundFilePaths: [{absolutePath: __dirname + '/tmp/test.value'}],
          });
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );

    it(
      'returns a promise for multiple values and directories when given a ' +
        'directory that contains values and other directories',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/test.value', '');
        fs.writeFileSync(__dirname + '/tmp/test2.value', '');
        fs.writeFileSync(__dirname + '/tmp/README', '');
        fs.mkdirSync(__dirname + '/tmp/tmp2');
        fs.mkdirSync(__dirname + '/tmp/tmp3');
        const future: Promise.Future<Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        >> = FileFinder.findFilesAndDirectories(
          File.getAbsoluteFilePath(__dirname + '/tmp'),
          'value',
        );
        Promise.then(function(
          result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
        ) {
          const expectedResult: Either.Either<
            Error.Error,
            FileFinder.FilesAndDirectories
          > = Either.Right<Error.Error, FileFinder.FilesAndDirectories>({
            foundPotentialDirectories: [
              {absolutePath: __dirname + '/tmp/README'},
              {absolutePath: __dirname + '/tmp/tmp2'},
              {absolutePath: __dirname + '/tmp/tmp3'},
            ],
            foundFilePaths: [
              {absolutePath: __dirname + '/tmp/test.value'},
              {absolutePath: __dirname + '/tmp/test2.value'},
            ],
          });
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );

    it(
      'returns a promise for an error when given a something that is not a ' +
        'directory',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/README', '');
        const future: Promise.Future<Either.Either<
          Error.Error,
          FileFinder.FilesAndDirectories
        >> = FileFinder.findFilesAndDirectories(
          File.getAbsoluteFilePath(__dirname + '/tmp/README'),
          'value',
        );
        Promise.then(function(
          result: Either.Either<Error.Error, FileFinder.FilesAndDirectories>,
        ) {
          const isError = Either.match(
            function() {
              return true;
            },
            function() {
              return false;
            },
            result,
          );
          expect(isError).toBe(true);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        },
        future);
      },
    );
  });

  describe('#searchForConfig', function() {
    it(
      'returns just the path to the file when it is in the given working ' +
        'directory',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/.valueObjectConfig', '');
        const future: Promise.Future<File.AbsoluteFilePath | null> = FileFinder.searchForConfig(
          '.valueObjectConfig',
          File.getAbsoluteFilePath(__dirname + '/tmp'),
        );
        Promise.then(function(result: File.AbsoluteFilePath | null) {
          const expectedResult = File.getAbsoluteFilePath(
            __dirname + '/tmp/.valueObjectConfig',
          );
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        }, future);
      },
    );

    it(
      'returns just the path to the file when it is in the directory one level above ' +
        'the working directory',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/.valueObjectConfig', '');
        const future: Promise.Future<File.AbsoluteFilePath | null> = FileFinder.searchForConfig(
          '.valueObjectConfig',
          File.getAbsoluteFilePath(__dirname + '/tmp'),
        );
        Promise.then(function(result: File.AbsoluteFilePath | null) {
          const expectedResult = File.getAbsoluteFilePath(
            __dirname + '/.valueObjectConfig',
          );
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        }, future);
      },
    );

    it(
      'returns just the path to the file when it is in the directory two levels above ' +
        'the working directory',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp/tmp2');
        fs.writeFileSync(__dirname + '/.valueObjectConfig', '');
        const future: Promise.Future<File.AbsoluteFilePath | null> = FileFinder.searchForConfig(
          '.valueObjectConfig',
          File.getAbsoluteFilePath(__dirname + '/tmp/tmp2'),
        );
        Promise.then(function(result: File.AbsoluteFilePath | null) {
          const expectedResult = File.getAbsoluteFilePath(
            __dirname + '/.valueObjectConfig',
          );
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        }, future);
      },
    );
    it(
      'returns nothing when the object does not exist all the way up to the ' +
        'root of the file system',
      function(finished) {
        fsExtra.removeSync(__dirname + '/tmp');
        fs.mkdirSync(__dirname + '/tmp');
        const future: Promise.Future<File.AbsoluteFilePath | null> = FileFinder.searchForConfig(
          '.someCrazyFileThatDoesntExist',
          File.getAbsoluteFilePath(__dirname + '/tmp'),
        );
        Promise.then(function(result: File.AbsoluteFilePath | null) {
          const expectedResult = null;
          expect(result).toEqualJSON(expectedResult);
          fsExtra.removeSync(__dirname + '/tmp');
          finished();
        }, future);
      },
    );
  });

  describe('#findConfigAtPath', function() {
    it('returns just the path to the file when we specify the path exactly', function(finished) {
      fsExtra.removeSync(__dirname + '/tmp');
      fs.mkdirSync(__dirname + '/tmp');
      fs.writeFileSync(__dirname + '/tmp/.valueObjectConfig', '');
      const future: Promise.Future<File.AbsoluteFilePath | null> = FileFinder.findConfigAtPath(
        File.getAbsoluteFilePath(__dirname + '/tmp/.valueObjectConfig'),
      );
      Promise.then(function(result: File.AbsoluteFilePath | null) {
        const expectedResult = File.getAbsoluteFilePath(
          __dirname + '/tmp/.valueObjectConfig',
        );
        expect(result).toEqualJSON(expectedResult);
        fsExtra.removeSync(__dirname + '/tmp');
        finished();
      }, future);
    });

    it('Does not return path if not at location', function(finished) {
      fsExtra.removeSync(__dirname + '/tmp');
      fs.mkdirSync(__dirname + '/tmp');
      fs.writeFileSync(__dirname + '/.valueObjectConfig', '');
      const future: Promise.Future<File.AbsoluteFilePath | null> = FileFinder.findConfigAtPath(
        File.getAbsoluteFilePath(__dirname + '/tmp/.valueObjectConfig'),
      );
      Promise.then(function(result: File.AbsoluteFilePath | null) {
        const expectedResult = null;
        expect(result).toEqualJSON(expectedResult);
        fsExtra.removeSync(__dirname + '/tmp');
        fsExtra.writeFileSync(__dirname + '/.valueObjectConfig', '');
        finished();
      }, future);
    });
  });
});
