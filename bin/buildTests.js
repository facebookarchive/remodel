/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const exec = require('child_process').exec;
function build(alwaysBuild, callback) {
  exec('./node_modules/typescript/bin/tsc ' + '-p ' + __dirname + '/../src/__tests__ ' + '--outDir ' + __dirname + '/dist', callback);
}

module.exports = {
  build: build
};
