/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const exec = require('child_process').exec;
function build(alwaysBuild, callback) {
  exec('./node_modules/typescript/bin/tsc ' + '-p ' + __dirname + '/../src/__tests__ ' + '--outDir ' + __dirname + '/dist', callback);
}

module.exports = {
  build: build
};
