/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import LazySequence = require('./lazy-sequence');
import Logging = require('./logging');
import Promise = require('./promise');

function performanceLog<T>(name:string, startTime:Date, stopTime:Date, value:T) {
  return Logging.Performance(10, name + ': ' + (stopTime.getTime() - startTime.getTime()), value);
}

function toAsyncLoggingPipelineForm<T,U>(f:(t:T) => Promise.Future<Logging.Context<U>>):(future:Promise.Future<Logging.Context<T>>) => Promise.Future<Logging.Context<U>> {
  return function(future:Promise.Future<Logging.Context<T>>) {
    return Promise.mbind(function(context:Logging.Context<T>) {
      const value:T = Logging.getValue(context);
      const beforeTime = new Date();
      const result:Promise.Future<Logging.Context<U>> = f(value);
      return Promise.map(function(resultContext:Logging.Context<U>) {
        const afterTime = new Date();
        const func:any = f;
        const combinedContext = Logging.mbind(function(t:T) {
          return resultContext;
          }, context);
          return Logging.mbind(function(u:U) {
            return performanceLog(func.name, beforeTime, afterTime, u);
            }, combinedContext);
      }, result);
    }, future);
  };
}

export function mapLoggedSequence<T,U>(seq:LazySequence.Sequence<Promise.Future<Logging.Context<T>>>, f:(t:T) => Promise.Future<Logging.Context<U>>):LazySequence.Sequence<Promise.Future<Logging.Context<U>>> {
  return seq.map(toAsyncLoggingPipelineForm(f));
}

export function mapLoggedSequence3<T,U,V>(seq:LazySequence.Sequence<Promise.Future<Logging.Context<T>>>, f:(t:T) => Promise.Future<Logging.Context<U>>, g:(u:U) => Promise.Future<Logging.Context<V>>):LazySequence.Sequence<Promise.Future<Logging.Context<V>>> {
  return seq.map(toAsyncLoggingPipelineForm(f))
             .map(toAsyncLoggingPipelineForm(g));
}

function evaluateFutureLoggingForLogger<T>(logger:Logging.Logger):(future:Promise.Future<Logging.Context<T>>) => Promise.Future<Logging.Context<T>> {
  return function(future:Promise.Future<Logging.Context<T>>) {
    return Promise.map(function(context:Logging.Context<T>) {
      return Logging.evaluate(logger, context);
      }, future);
  };
}

export function evaluatedLoggedSequence<T>(logger:Logging.Logger, seq:LazySequence.Sequence<Promise.Future<Logging.Context<T>>>):LazySequence.Sequence<Promise.Future<Logging.Context<T>>> {
  const evaluateLoggingContext = evaluateFutureLoggingForLogger<T>(logger);
  return seq.map(evaluateLoggingContext);
}
