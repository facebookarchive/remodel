/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import PathUtils = require('../path-utils');
import File = require('../file');

describe('PathUtils', function() {
  describe('#getAbsolutePathFromDirectoryAndRelativePath', function() {
    it('is the combination of the current directory and the passed in ' +
       'location when there is a location passed in', function() {
      const currentDirectoryAbsolutePath = File.getAbsoluteFilePath('/Something/Else');
      const passedInRelativePath = 'somewhere/in/here';

      const expectedPath = File.getAbsoluteFilePath('/Something/Else/somewhere/in/here');
      const requestedPath = PathUtils.getAbsolutePathFromDirectoryAndRelativePath(currentDirectoryAbsolutePath, passedInRelativePath);
      expect(requestedPath).toEqualJSON(expectedPath);
    });

    it('doesn\'t double up on the slashes when the passed in path starts ' +
       'with a slash', function() {
      const currentDirectoryAbsolutePath = File.getAbsoluteFilePath('/Something/Else');
      const passedInRelativePath = '/somewhere/in/here';

      const expectedPath = File.getAbsoluteFilePath('/Something/Else/somewhere/in/here');
      const requestedPath = PathUtils.getAbsolutePathFromDirectoryAndRelativePath(currentDirectoryAbsolutePath, passedInRelativePath);
      expect(requestedPath).toEqualJSON(expectedPath);
    });

    it('doesn\'t double up on the slashes when the passed in path ends ' +
       'with a slash', function() {
      const currentDirectoryAbsolutePath = File.getAbsoluteFilePath('/Something/Else');
      const passedInRelativePath = 'somewhere/in/here/';

      const expectedPath = File.getAbsoluteFilePath('/Something/Else/somewhere/in/here');
      const requestedPath = PathUtils.getAbsolutePathFromDirectoryAndRelativePath(currentDirectoryAbsolutePath, passedInRelativePath);
      expect(requestedPath).toEqualJSON(expectedPath);
    });

    it('doesn\'t double up on the slashes when the passed in path ends ' +
       'with a slash and starts with a slash', function() {
      const currentDirectoryAbsolutePath = File.getAbsoluteFilePath('/Something/Else');
      const passedInRelativePath = '/somewhere/in/here/';

      const expectedPath = File.getAbsoluteFilePath('/Something/Else/somewhere/in/here');
      const requestedPath = PathUtils.getAbsolutePathFromDirectoryAndRelativePath(currentDirectoryAbsolutePath, passedInRelativePath);
      expect(requestedPath).toEqualJSON(expectedPath);
    });

    it('is strictly the current directory when the passed in location is ' +
       'undefined', function() {
      const currentDirectoryAbsolutePath = File.getAbsoluteFilePath('/Something/Else');

      const expectedPath = File.getAbsoluteFilePath('/Something/Else');
      const requestedPath = PathUtils.getAbsolutePathFromDirectoryAndRelativePath(currentDirectoryAbsolutePath, undefined);
      expect(requestedPath).toEqualJSON(expectedPath);
    });
  });

  describe('#getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath', function() {
    it('is the combination of the current directory and the passed in ' +
        'location when there is a location passed in', function() {
      const currentDirectoryAbsolutePath = File.getAbsoluteFilePath('/Something/Else');
      const passedInRelativePath = 'somewhere/in/here';

      const expectedPath = File.getAbsoluteFilePath('/Something/Else/somewhere/in/here');
      const requestedPath = PathUtils.getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath(currentDirectoryAbsolutePath, passedInRelativePath);
      expect(requestedPath).toEqualJSON(expectedPath);
    });

    it('accepts absolute path when path starts with a leading slash', function() {
      const currentDirectoryAbsolutePath = File.getAbsoluteFilePath('/Something/Else');
      const passedInRelativePath = '/somewhere/in/here';

      const expectedPath = File.getAbsoluteFilePath('/somewhere/in/here');
      const requestedPath = PathUtils.getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath(currentDirectoryAbsolutePath, passedInRelativePath);
      expect(requestedPath).toEqualJSON(expectedPath);
    });

    it('doesn\'t double up on the slashes when the passed in path ends ' +
        'with a slash', function() {
      const currentDirectoryAbsolutePath = File.getAbsoluteFilePath('/Something/Else');
      const passedInRelativePath = 'somewhere/in/here/';

      const expectedPath = File.getAbsoluteFilePath('/Something/Else/somewhere/in/here');
      const requestedPath = PathUtils.getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath(currentDirectoryAbsolutePath, passedInRelativePath);
      expect(requestedPath).toEqualJSON(expectedPath);
    });

    it('is strictly the current directory when the passed in location is ' +
        'undefined', function() {
      const currentDirectoryAbsolutePath = File.getAbsoluteFilePath('/Something/Else');

      const expectedPath = File.getAbsoluteFilePath('/Something/Else');
      const requestedPath = PathUtils.getAbsolutePathFromDirectoryAndAbsoluteOrRelativePath(currentDirectoryAbsolutePath, undefined);
      expect(requestedPath).toEqualJSON(expectedPath);
    });
  });

  describe('#getDirectoryPathFromAbsolutePath', function() {
    it('finds the last slash to remove', function() {
      const directoryPath = PathUtils.getDirectoryPathFromAbsolutePath(File.getAbsoluteFilePath('/Something/Else'));

      expect(directoryPath).toEqualJSON(File.getAbsoluteFilePath('/Something'));
    });
  });
});
