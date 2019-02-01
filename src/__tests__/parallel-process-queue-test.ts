/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import * as File from '../file';
import * as ParallelProcessQueue from '../parallel-process-queue';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as LazySequence from '../lazy-sequence';
import * as Promise from '../promise';

describe('ParallelProcessQueue', function() {
  it(
    'should find all the files of a given extension inside of the directory ' +
      'that it is given to scan',
    function(finished) {
      fsExtra.removeSync(__dirname + '/tmp');
      fs.mkdirSync(__dirname + '/tmp');
      fs.writeFileSync(__dirname + '/tmp/test.value', '');
      const sequence: LazySequence.Sequence<
        File.AbsoluteFilePath
      > = ParallelProcessQueue.findFiles(
        File.getAbsoluteFilePath(__dirname + '/tmp'),
        'value',
      );
      const future: Promise.Future<
        File.AbsoluteFilePath[]
      > = LazySequence.evaluate(sequence);
      Promise.then(function(fileLocations: File.AbsoluteFilePath[]) {
        expect(fileLocations).toEqualJSON([
          {absolutePath: __dirname + '/tmp/test.value'},
        ]);
        fs.unlinkSync(__dirname + '/tmp/test.value');
        fs.rmdirSync(__dirname + '/tmp');
        finished();
      }, future);
    },
  );

  it('should find no files when the given extension has no files', function(finished) {
    fsExtra.removeSync(__dirname + '/tmp');
    fs.mkdirSync(__dirname + '/tmp');
    fs.writeFileSync(__dirname + '/tmp/test.value', '');
    const sequence: LazySequence.Sequence<
      File.AbsoluteFilePath
    > = ParallelProcessQueue.findFiles(
      File.getAbsoluteFilePath(__dirname + '/tmp'),
      'enumValue',
    );
    const future: Promise.Future<
      File.AbsoluteFilePath[]
    > = LazySequence.evaluate(sequence);
    Promise.then(function(fileLocations: File.AbsoluteFilePath[]) {
      expect(fileLocations).toEqualJSON([]);
      fs.unlinkSync(__dirname + '/tmp/test.value');
      fs.rmdirSync(__dirname + '/tmp');
      finished();
    }, future);
  });

  it(
    'returns a promise for multiple values and directories when given a ' +
      'directory that contains values and other directories',
    function(finished) {
      fsExtra.removeSync(__dirname + '/tmp');
      fs.mkdirSync(__dirname + '/tmp');
      fs.writeFileSync(__dirname + '/tmp/test.value', '');
      fs.writeFileSync(__dirname + '/tmp/test2.value', '');
      fs.mkdirSync(__dirname + '/tmp/tmp2');
      fs.writeFileSync(__dirname + '/tmp/tmp2/test.value', '');
      fs.writeFileSync(__dirname + '/tmp/tmp2/test2.enum', '');
      fs.mkdirSync(__dirname + '/tmp/tmp3');
      fs.writeFileSync(__dirname + '/tmp/tmp3/test.value', '');
      fs.mkdirSync(__dirname + '/tmp/tmp3/tmp4');
      fs.writeFileSync(__dirname + '/tmp/tmp3/tmp4/test2.value', '');
      const sequence: LazySequence.Sequence<
        File.AbsoluteFilePath
      > = ParallelProcessQueue.findFiles(
        File.getAbsoluteFilePath(__dirname + '/tmp'),
        'value',
      );
      const future: Promise.Future<
        File.AbsoluteFilePath[]
      > = LazySequence.evaluate(sequence);
      Promise.then(function(fileLocations: File.AbsoluteFilePath[]) {
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/test.value',
        });
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/test2.value',
        });
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/tmp2/test.value',
        });
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/tmp3/test.value',
        });
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/tmp3/tmp4/test2.value',
        });
        fs.unlinkSync(__dirname + '/tmp/tmp3/tmp4/test2.value');
        fs.rmdirSync(__dirname + '/tmp/tmp3/tmp4');
        fs.unlinkSync(__dirname + '/tmp/tmp3/test.value');
        fs.rmdirSync(__dirname + '/tmp/tmp3');
        fs.unlinkSync(__dirname + '/tmp/tmp2/test2.enum');
        fs.unlinkSync(__dirname + '/tmp/tmp2/test.value');
        fs.rmdirSync(__dirname + '/tmp/tmp2');
        fs.unlinkSync(__dirname + '/tmp/test2.value');
        fs.unlinkSync(__dirname + '/tmp/test.value');
        fs.rmdirSync(__dirname + '/tmp');
        finished();
      }, future);
    },
  );

  it(
    'returns a promise for multiple values and directories when given a ' +
      'directory that contains values and other directories but does not contain ' +
      'files that look like directories but are not',
    function(finished) {
      fsExtra.removeSync(__dirname + '/tmp');
      fs.mkdirSync(__dirname + '/tmp');
      fs.writeFileSync(__dirname + '/tmp/README', '');
      fs.writeFileSync(__dirname + '/tmp/test.value', '');
      fs.writeFileSync(__dirname + '/tmp/test2.value', '');
      fs.mkdirSync(__dirname + '/tmp/tmp2');
      fs.writeFileSync(__dirname + '/tmp/tmp2/test.value', '');
      fs.writeFileSync(__dirname + '/tmp/tmp2/test2.enum', '');
      fs.mkdirSync(__dirname + '/tmp/tmp3');
      fs.writeFileSync(__dirname + '/tmp/tmp3/test.value', '');
      fs.mkdirSync(__dirname + '/tmp/tmp3/tmp4');
      fs.writeFileSync(__dirname + '/tmp/tmp3/tmp4/test2.value', '');
      const sequence: LazySequence.Sequence<
        File.AbsoluteFilePath
      > = ParallelProcessQueue.findFiles(
        File.getAbsoluteFilePath(__dirname + '/tmp'),
        'value',
      );
      const future: Promise.Future<
        File.AbsoluteFilePath[]
      > = LazySequence.evaluate(sequence);
      Promise.then(function(fileLocations: File.AbsoluteFilePath[]) {
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/test.value',
        });
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/test2.value',
        });
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/tmp2/test.value',
        });
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/tmp3/test.value',
        });
        expect(fileLocations).toContain({
          absolutePath: __dirname + '/tmp/tmp3/tmp4/test2.value',
        });
        fs.unlinkSync(__dirname + '/tmp/tmp3/tmp4/test2.value');
        fs.rmdirSync(__dirname + '/tmp/tmp3/tmp4');
        fs.unlinkSync(__dirname + '/tmp/tmp3/test.value');
        fs.rmdirSync(__dirname + '/tmp/tmp3');
        fs.unlinkSync(__dirname + '/tmp/tmp2/test2.enum');
        fs.unlinkSync(__dirname + '/tmp/tmp2/test.value');
        fs.rmdirSync(__dirname + '/tmp/tmp2');
        fs.unlinkSync(__dirname + '/tmp/test2.value');
        fs.unlinkSync(__dirname + '/tmp/test.value');
        fs.unlinkSync(__dirname + '/tmp/README');
        fs.rmdirSync(__dirname + '/tmp');
        finished();
      }, future);
    },
  );
});
