/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='js/require-plugin/require-plugin.d.ts'/>

import AlgebraicType = require('./algebraic-type');
import Either = require('./either');
import Error = require('./error');
import File = require('./file');
import Maybe = require('./maybe');
import requireJsPlugin = require('./js/require-plugin/require-plugin');
import ObjectSpec = require('./object-spec');

function requiredModuleForPath(absolutePath:File.AbsoluteFilePath):Maybe.Maybe<any> {
  try {
    return Maybe.Just(requireJsPlugin.requirePlugin(File.getAbsolutePathString(absolutePath)));
  } catch(e) {
    return Maybe.Nothing();
  }
}

function requirePlugin<T>(absolutePath:File.AbsoluteFilePath, loadPlugin:(requiredModule:any) => Maybe.Maybe<T>):Either.Either<Error.Error[], Maybe.Maybe<T>> {
  const requiredModule:Maybe.Maybe<any> = requiredModuleForPath(absolutePath);
  return Maybe.match(
    function just(value:any):Either.Either<Error.Error[], Maybe.Maybe<T>> {
      return Either.Right<Error.Error[], Maybe.Maybe<T>>(loadPlugin(value));
    },
    function nothing():Either.Either<Error.Error[], Maybe.Maybe<T>> {
      return Either.Left<Error.Error[], Maybe.Maybe<T>>([Error.Error('Plugin registered at ' + File.getAbsolutePathString(absolutePath) + ' does not exist')]);
    },
    requiredModule
  );
}

function valueObjectPluginFromModule(module:any): Maybe.Maybe<ObjectSpec.Plugin> {
  return module.createPlugin !== undefined ?
    Maybe.Just<ObjectSpec.Plugin>(module.createPlugin()) :
    Maybe.Nothing<ObjectSpec.Plugin>();
}

function algebraicTypePluginFromModule(module:any): Maybe.Maybe<AlgebraicType.Plugin> {
  return module.createAlgebraicTypePlugin !== undefined ?
    Maybe.Just<AlgebraicType.Plugin>(module.createAlgebraicTypePlugin()) :
    Maybe.Nothing<AlgebraicType.Plugin>();
}

export function requireObjectSpecPlugin(absolutePath:File.AbsoluteFilePath):Either.Either<Error.Error[], Maybe.Maybe<ObjectSpec.Plugin>> {
  return requirePlugin<ObjectSpec.Plugin>(absolutePath, valueObjectPluginFromModule);
}

export function requireAlgebraicTypePlugin(absolutePath:File.AbsoluteFilePath):Either.Either<Error.Error[], Maybe.Maybe<AlgebraicType.Plugin>> {
  return requirePlugin<AlgebraicType.Plugin>(absolutePath, algebraicTypePluginFromModule);
}
