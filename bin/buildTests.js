/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const copyJSPromise = require('./build.js').copyJSPromise;
const exec = require('child_process').exec;
const fs = require('fs');
const os = require('os');
const path = require('path');

function build(alwaysBuild, callback) {
  const tempOutputDir = fs.mkdtempSync(os.tmpdir() + path.sep);
  exec(__dirname + '/../node_modules/typescript/bin/tsc -t es2015 ' + '-p ' + __dirname + '/../src/__tests__ ' + '--outDir ' + tempOutputDir, function(error, stdout, stderr) {
    copyJSPromise(tempOutputDir, __dirname + '/dist').then(function(_) {
      callback(error, stdout, stderr);
    })
  });
}

module.exports = {
  build: build
};
