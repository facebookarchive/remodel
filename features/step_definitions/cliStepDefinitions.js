/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var colors = require('cli-color');
var diff = require('diff');
var exec = require('child_process').exec
var fs = require('fs');
var mkdirp = require('mkdirp');


function pathToFile(fileName) {
  if (fileName.indexOf('/') == -1) {
    return '';
  } else {
    var splitArray = fileName.split('/');
    splitArray.pop();
    return splitArray.join('/');
  }
}

function writeFile(fileName, fileContent, tmpDirectoryPath) {
  var filePath = tmpDirectoryPath + '/' + pathToFile(fileName);
  var fileLocation = tmpDirectoryPath + '/' + fileName;
  mkdirp.sync(filePath);
  fs.writeFileSync(fileLocation, fileContent, 'utf8');
}

function run(cmd, tmpDirectoryPath, callback) {
  var localCommand = 'cd ' + tmpDirectoryPath + ' && ' + cmd;

  exec(localCommand, function (error, stdout, stderr) {
    callback();
  });
}

function displayDiff(diff) {
  if (diff.added != null) {
    return colors.green(diff.value);
  } else if (diff.removed != null) {
    return colors.red(diff.value);
  } else {
    return colors.white(diff.value);
  }
}

module.exports = function() {
  this.Given(/^a file named "([^"]*)" with:$/, function(fileName, fileContent, callback) {
    writeFile(fileName, fileContent, this.tmpDirectoryPath);
    callback();
  });

  this.When(/^I run `([^`]*)`$/, function(cmd, callback) {
    run(unescape(cmd), this.tmpDirectoryPath, callback);
  });

  this.Then(/^the file "([^"]*)" should contain:$/, function(fileName, expectedContents, callback) {
    var fileLocation = this.tmpDirectoryPath + '/' + fileName;
    var actualContents = fs.readFileSync(fileLocation, 'utf8');
    if (actualContents.indexOf(expectedContents) !== -1) {
      callback();
    } else {
      var differences = diff.diffLines(actualContents, expectedContents).map(displayDiff).join('\n');
      callback.fail('Within "' + this.tmpDirectoryPath + ' the file \"' + fileName + ' did had the following differences: \n'  + differences);
    }
  });

  this.Then(/^the file "([^"]*)" should not exist$/, function(fileName, callback) {
    var fileLocation = this.tmpDirectoryPath + '/' + fileName;
    if (!fs.existsSync(fileLocation)) {
      callback();
    } else {
      callback.fail(colors.red('File "' + fileName + '" should not exist'));
    }
  });
};
