/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

const exec = require('child_process').exec;
const fs = require('fs');
const Promise = require('promise');
const ncp = require('ncp');
const fsExtra = require('fs-extra');

const OUTPUT_DIR_COMMAND = '--outDir ' + __dirname + '/dist ';
const TSC_PROJECT_LOCATION_TAG = '-p ' + __dirname + '/../src ';
const TSC = __dirname + '/../node_modules/typescript/bin/tsc ';

const SOURCE_JS_DIR = __dirname + '/../src/js';
const TARGET_JS_DIR = __dirname + '/dist/js';
const NO_BUILD_CHECK_FILE = __dirname + '/../.nobuildcheck';
const BUILT_ON_REVISION_FILE = __dirname + '/../.built_on_revision';

const noBuildCheckPromise = new Promise(function(resolve, reject) {
  fs.exists(NO_BUILD_CHECK_FILE, function(exists) {
    resolve({
      value: exists,
      error: null,
      stdout: null,
      stderr: null,
    });
  });
});

const builtOnRevisionPromise = new Promise(function(resolve, reject) {
  fs.exists(BUILT_ON_REVISION_FILE, function(exists) {
    if (exists) {
      fs.readFile(BUILT_ON_REVISION_FILE, 'utf8', function(error, data) {
        if (error === null) {
          resolve({
            value: data,
            error: null,
            stdout: null,
            stderr: null,
          });
        } else {
          reject({
            value: null,
            error: error,
            stdout: null,
            stderr: null,
          });
        }
      });
    } else {
      resolve({
        value: null,
        error: null,
        stdout: null,
        stderr: null,
      });
    }
  });
});

const activeRevisionPromise = new Promise(function(resolve, reject) {
  exec('git rev-parse HEAD -- ' + __dirname + '/../', function(error, stdout, stderr) {
    if (error === null) {
      resolve({
        value: stdout.split('\n')[0],
        error: null,
        stdout: null,
        stderr: stderr,
      });
    } else {
      reject({
        value: null,
        error: error,
        stdout: stdout,
        stderr: stderr,
      });
    }
  });
});

function combineOutputValues(outputType, values) {
  return values.map(function(value) {
    return value[outputType];
  }).filter(function(value) {
    return value != null && value.length > 0;
  }).join('\n');
}

function hasRevisionChanged(callback) {
  Promise.all(
    [noBuildCheckPromise, builtOnRevisionPromise, activeRevisionPromise]
  ).done(
    function onFulfilled(res) {
      callback({
        hasChanged: res[0].value || res[1].value != res[2].value,
        revision: res[2].value,
        error: null,
        stdout: combineOutputValues('stdout', res),
        stderr: combineOutputValues('stderr', res),
      });
    },
    function onRejected(error) {
      callback({
        hasChanged: true,
        revision: null,
        error: error,
        stdout: error && error.stdout,
        stderr: error && error.stderr,
      });
    }
  );
}

function buildPromise() {
  const command = TSC + TSC_PROJECT_LOCATION_TAG + OUTPUT_DIR_COMMAND;
  return new Promise(function(resolve, reject) {
    exec(command, function(error, stdout, stderr) {
      if (error == null) {
        resolve({
          value: null,
          error: null,
          stdout: stdout,
          stderr: stderr,
        });
      } else {
        resolve({
          value: null,
          error: error,
          stdout: stdout,
          stderr: stderr,
        });
      }
    });
  });
}

function copyJSPromise() {
  return new Promise(function(resolve, reject) {
    ncp.limit = 16;

    fsExtra.removeSync(TARGET_JS_DIR);

    ncp(SOURCE_JS_DIR,
        TARGET_JS_DIR,
        {
          filter: function(name) {
            // only copy over .js files
            const regEx = /\/((\w|-)+)(\.js)?$/;
            return regEx.test(name);
          }
        },
        function (error) {
          if (error == null) {
            resolve({
              value: null,
              error: null,
              stdout: null,
              stderr: null,
            });
          } else {
            reject({
              value: null,
              error: error,
              stdout: combineOutputValues('code', error),
              stderr: combineOutputValues('code', error),
            });
          }
        });
  });
}

function revisionToWritePromise(revision) {
  if (revision != null) {
    return Promise.resolve({
      value: revision
    });
  } else {
    return activeRevisionPromise;
  }
}

function writeBuiltOnRevisionPromise(revision) {
  return revisionToWritePromise(revision).then(
    function onFulfilled(res) {
      return new Promise(function(resolve, reject) {
        fs.writeFile(BUILT_ON_REVISION_FILE, res.value, 'utf8', function(error) {
          if (error == null) {
            resolve({
              value: null,
              error: null,
              stdout: res.stdout,
              stderr: res.stderr,
            });
          } else {
            reject({
              value: null,
              error: error,
              stdout: res.stdout,
              stderr: res.stderr,
            });
          }
        });
      });
    },
    function onRejected(error) {
      return Promise.reject({
        value: null,
        error: error,
        stdout: error && error.stdout,
        stderr: error && error.stderr,
      });
    }
  );
}

function writeBuiltOnRevisionIfNeededPromise(revision) {
  return noBuildCheckPromise.then(function(result) {
    const hasNoBuildCheckFile = result.value;
    if (!hasNoBuildCheckFile) {
      return writeBuiltOnRevisionPromise(revision);
    } else {
      return Promise.resolve({});
    }
  })
}

function runBuild(revision, callback) {
  Promise.all(
    [buildPromise(), copyJSPromise(), writeBuiltOnRevisionIfNeededPromise(revision)]
  ).then(
    function onFulfilled(res) {
      callback(null, combineOutputValues('stdout', res), combineOutputValues('stderr', res));
    },
    function onRejected(error) {
      callback(error[0].error, error[0].stdout, error[0].stderr);
    });
}

function build(alwaysBuild, callback) {
  if (alwaysBuild) {
    runBuild(null, callback);
  } else {
    hasRevisionChanged(function(result) {
      if (result.hasChanged && result.error == null) {
        runBuild(result.revision, callback);
      } else {
        callback(result.error, result.stdout, result.stderr);
      }
    });
  }
}

module.exports = {
  build: build
};
