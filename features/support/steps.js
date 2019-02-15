/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var {Given, Then, When} = require('cucumber');
var CommandLine = require('../../bin/dist/commandline');
var colors = require('cli-color');
var diff = require('diff');
var exec = require('child_process').exec;
var fs = require('fs');
var main = require('../../bin/dist/main');
var mkdirp = require('mkdirp');
var Promise = require('../../bin/dist/promise');

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

function fastrun(args, tmpDirectoryPath, callback) {
  var curdir = process.cwd();
  process.chdir(tmpDirectoryPath);
  var promise;
  try {
    promise = main.main(CommandLine.parseArgs(args), true);
  } catch (err) {
    process.chdir(curdir);
    callback('error running subprocess: ' + err + '\n' + err.stack);
    return;
  }
  // If you try to delete this, you'll get lots of errors
  // about missing output files. Need to sequence inspecting the
  // output of the tool *after* the promises finish resolving! (and
  // yes, it did take me way too long to realize I needed to do this.)
  if (promise) {
    Promise.then(() => {
      process.chdir(curdir);
      callback();
    }, promise);
  }
}

function run(cmd, tmpDirectoryPath, callback) {
  var localCommand = 'cd ' + tmpDirectoryPath + ' && ' + cmd;

  exec(localCommand, function(error, stdout, stderr) {
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

function toFeatureFileDocstring(s) {
  const sixSpaces = '      ';
  return (
    `${sixSpaces}"""\n` +
    s
      .split('\n')
      .map(line => (line === '' ? line : `${sixSpaces}${line}`))
      .join('\n') +
    `\n${sixSpaces}"""`
  );
}

function fixFeature(testCase, expected, actual) {
  const uri = testCase.sourceLocation.uri;
  const featureContents = fs.readFileSync(uri, 'utf8');
  const expectedDocstring = toFeatureFileDocstring(expected);
  const actualDocstring = toFeatureFileDocstring(actual);
  const patched = featureContents.replace(expectedDocstring, actualDocstring);
  fs.writeFileSync(uri, patched);
}

Given(/^a file named "([^"]*)" with:$/, function(
  fileName,
  fileContent,
  callback,
) {
  writeFile(fileName, fileContent, this.tmpDirectoryPath);
  callback();
});

When(/^I run `([^`]*)`$/, function(cmd, callback) {
  cmd = unescape(cmd);
  const knownCommand = '../../bin/generate ';
  if (cmd.indexOf(knownCommand) === 0) {
    fastrun(cmd.split(' ').slice(1), this.tmpDirectoryPath, callback);
  } else {
    run(unescape(cmd), this.tmpDirectoryPath, callback);
  }
});

Given(/^a directory named "([^"]*)":$/, function(dirName, callback) {
  mkdirp.sync(this.tmpDirectoryPath + '/' + dirName);
  callback();
});

Then(/^the file "([^"]*)" should contain:$/, function(
  fileName,
  expectedContents,
  callback,
) {
  var fileLocation = this.tmpDirectoryPath + '/' + fileName;
  var actualContents = fs.readFileSync(fileLocation, 'utf8');
  if (this.parameters.forceResnapshot) {
    fixFeature(this.testCase, expectedContents, actualContents);
    callback();
    return;
  }
  if (actualContents.indexOf(expectedContents) !== -1) {
    callback();
  } else {
    if (this.parameters.resnapshot) {
      fixFeature(this.testCase, expectedContents, actualContents);
    }
    var differences = diff
      .diffLines(actualContents, expectedContents)
      .map(displayDiff)
      .join('\n');
    callback(
      'Within "' +
        this.tmpDirectoryPath +
        ' the file "' +
        fileName +
        ' did had the following differences: \n' +
        differences,
    );
  }
});

Then(/^the file "([^"]*)" should not exist$/, function(fileName, callback) {
  var fileLocation = this.tmpDirectoryPath + '/' + fileName;
  if (!fs.existsSync(fileLocation)) {
    callback();
  } else {
    callback(colors.red('File "' + fileName + '" should not exist'));
  }
});
