/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='js/require-plugin/require-plugin.d.ts'/>

import * as AlgebraicType from './algebraic-type';
import * as Either from './either';
import * as Error from './error';
import * as File from './file';
import * as Maybe from './maybe';
import * as requireJsPlugin from './js/require-plugin/require-plugin';
import * as ObjectSpec from './object-spec';

function requiredModuleForPath(
  absolutePath: File.AbsoluteFilePath,
): any | null {
  try {
    return Maybe.Just(
      requireJsPlugin.requirePlugin(File.getAbsolutePathString(absolutePath)),
    );
  } catch (e) {
    return null;
  }
}

function requirePlugin<T>(
  absolutePath: File.AbsoluteFilePath,
  loadPlugin: (requiredModule: any) => T | null,
): Either.Either<Error.Error[], T | null> {
  const requiredModule: any | null = requiredModuleForPath(absolutePath);
  return Maybe.match(
    function just(value: any): Either.Either<Error.Error[], T | null> {
      return Either.Right<Error.Error[], T | null>(loadPlugin(value));
    },
    function nothing(): Either.Either<Error.Error[], T | null> {
      return Either.Left<Error.Error[], T | null>([
        Error.Error(
          'Plugin registered at ' +
            File.getAbsolutePathString(absolutePath) +
            ' does not exist',
        ),
      ]);
    },
    requiredModule,
  );
}

function valueObjectPluginFromModule(module: any): ObjectSpec.Plugin | null {
  return module.createPlugin !== undefined
    ? Maybe.Just<ObjectSpec.Plugin>(module.createPlugin())
    : Maybe.Nothing<ObjectSpec.Plugin>();
}

function algebraicTypePluginFromModule(
  module: any,
): AlgebraicType.Plugin | null {
  return module.createAlgebraicTypePlugin !== undefined
    ? Maybe.Just<AlgebraicType.Plugin>(module.createAlgebraicTypePlugin())
    : Maybe.Nothing<AlgebraicType.Plugin>();
}

export function requireObjectSpecPlugin(
  absolutePath: File.AbsoluteFilePath,
): Either.Either<Error.Error[], ObjectSpec.Plugin | null> {
  return requirePlugin<ObjectSpec.Plugin>(
    absolutePath,
    valueObjectPluginFromModule,
  );
}

export function requireAlgebraicTypePlugin(
  absolutePath: File.AbsoluteFilePath,
): Either.Either<Error.Error[], AlgebraicType.Plugin | null> {
  return requirePlugin<AlgebraicType.Plugin>(
    absolutePath,
    algebraicTypePluginFromModule,
  );
}
