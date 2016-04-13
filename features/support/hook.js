/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var remove = require('remove');
var mkdirp = require('mkdirp');
var fs = require('fs');

var TMP_DIR_PATH = __dirname + '/../../tmp';
var iterationNumber = 0;

function tmpDirectoryPath(sessionGuid) {
  return TMP_DIR_PATH + '/' + sessionGuid;
}

function isFirstBeforeRun() {
  if (!global.finishedFirstRun) {
    global.finishedFirstRun = true;
    return true;
  } else {
    return false;
  }
}

module.exports = function() {
  this.Before(function(callback) {
    if (isFirstBeforeRun() && fs.existsSync(TMP_DIR_PATH)) {
      remove.removeSync(TMP_DIR_PATH);
    }
    iterationNumber += 1;
    this.tmpDirectoryPath = tmpDirectoryPath(iterationNumber);
    mkdirp.sync(this.tmpDirectoryPath);
    callback();
  });
};
