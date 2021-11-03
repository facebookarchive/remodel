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
import * as fs from 'fs';
import * as Maybe from '../maybe';
import * as PathUtils from '../path-utils';
import * as RequirePlugin from '../require-plugin';
import * as ObjectSpec from '../object-spec';

const ABSOLUTE_PATH_OF_CURRENT_DIRECTORY = File.getAbsoluteFilePath(__dirname);

describe('requireObjectSpecPlugin', function () {
  describe('#requireObjectSpecPlugin', function () {
    it('correctly imports a valid plugin', function () {
      const pluginFileContents =
        'function createPlugin() {\n' +
        '    return {\n' +
        '        additionalFiles: function() { return []; },\n' +
        '        functions: function() { return []; },\n' +
        '        headerComments: function() { return []; },\n' +
        '        implementedProtocols: function() { return []; },\n' +
        '        imports: function() { return []; },\n' +
        '        instanceMethods: function() { return []; },\n' +
        '        properties: function() { return []; },\n' +
        '        requiredIncludesToRun: [],\n' +
        '        staticConstants: function() { return []; }\n' +
        '    };\n' +
        '}\n' +
        'exports.createPlugin = createPlugin;';

      fs.mkdirSync(__dirname + '/tmp');
      fs.writeFileSync(__dirname + '/tmp/somePlugin.js', pluginFileContents);

      const either: Either.Either<Error.Error[], ObjectSpec.Plugin | null> =
        RequirePlugin.requireObjectSpecPlugin(
          PathUtils.getAbsolutePathFromDirectoryAndRelativePath(
            ABSOLUTE_PATH_OF_CURRENT_DIRECTORY,
            '/tmp/somePlugin',
          ),
        );

      Either.match(
        function (errors: Error.Error[]) {
          expect(true).toBe(false); // should not be an error
        },
        function (maybePlugin: ObjectSpec.Plugin | null) {
          Maybe.match(
            function (plugin: ObjectSpec.Plugin) {
              const typeInformation: ObjectSpec.Type = {
                annotations: {},
                attributes: [],
                comments: [],
                typeLookups: [],
                excludes: [],
                includes: [],
                libraryName: null,
                typeName: 'Something',
              };

              expect(plugin.additionalFiles(typeInformation)).toEqualJSON([]);
              expect(plugin.functions(typeInformation)).toEqualJSON([]);
              expect(plugin.headerComments(typeInformation)).toEqualJSON([]);
              expect(plugin.implementedProtocols(typeInformation)).toEqualJSON(
                [],
              );
              expect(plugin.imports(typeInformation)).toEqualJSON([]);
              expect(plugin.instanceMethods(typeInformation)).toEqualJSON([]);
              expect(plugin.properties(typeInformation)).toEqualJSON([]);
              expect(plugin.requiredIncludesToRun).toEqualJSON([]);
              expect(plugin.staticConstants(typeInformation)).toEqualJSON([]);
            },
            function () {
              expect(true).toBe(false); // should not be an empty maybe
            },
            maybePlugin,
          );
        },
        either,
      );

      fs.unlinkSync(__dirname + '/tmp/somePlugin.js');
      fs.rmdirSync(__dirname + '/tmp');
    });
    it(
      'returns an empty maybe when the module does implement createPlugin' +
        'method',
      function () {
        const pluginFileContents =
          'function createSomethingElse() {\n' +
          '    return { };\n' +
          '}\n' +
          'exports.createSomethingElse = createSomethingElse;';

        fs.mkdirSync(__dirname + '/tmp');
        fs.writeFileSync(__dirname + '/tmp/somePlugin1.js', pluginFileContents);

        const either: Either.Either<Error.Error[], ObjectSpec.Plugin | null> =
          RequirePlugin.requireObjectSpecPlugin(
            PathUtils.getAbsolutePathFromDirectoryAndRelativePath(
              ABSOLUTE_PATH_OF_CURRENT_DIRECTORY,
              '/tmp/somePlugin1',
            ),
          );

        Either.match(
          function (errors: Error.Error[]) {
            expect(errors).toBe(false);
          },
          function (maybePlugin: ObjectSpec.Plugin | null) {
            Maybe.match(
              function (plugin: ObjectSpec.Plugin) {
                expect('should not be an real value').toBe(false);
              },
              function () {},
              maybePlugin,
            );
          },
          either,
        );

        fs.unlinkSync(__dirname + '/tmp/somePlugin1.js');
        fs.rmdirSync(__dirname + '/tmp');
      },
    );
    it('returns an error when the module does not actually exist', function () {
      const plugin: Either.Either<Error.Error[], ObjectSpec.Plugin | null> =
        RequirePlugin.requireObjectSpecPlugin(
          PathUtils.getAbsolutePathFromDirectoryAndRelativePath(
            ABSOLUTE_PATH_OF_CURRENT_DIRECTORY,
            '/tmp/somePlugin2',
          ),
        );

      const expectedPlugin = Either.Left<
        Error.Error[],
        ObjectSpec.Plugin | null
      >([
        Error.Error(
          'Plugin registered at ' +
            __dirname +
            '/tmp/somePlugin2 does not exist',
        ),
      ]);

      expect(plugin).toEqualJSON(expectedPlugin);
    });
  });
});
