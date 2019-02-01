/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as List from './list';

interface SharedState<T> {
  value?: T;
  thenHandlers: {(val: T): void}[];
}

export function pending<T>(): Promise<T> {
  return new Promise<T>({value: undefined, thenHandlers: []});
}

export function resolved<T>(val: T): Promise<T> {
  return new Promise<T>({value: val, thenHandlers: []});
}

export class Promise<T> {
  private sharedState: SharedState<T>;

  constructor(sharedState: SharedState<T>) {
    this.sharedState = sharedState;
  }

  getFuture(): Future<T> {
    return new Future<T>(this.sharedState);
  }

  setValue(val: T) {
    this.sharedState.value = val;
    this.sharedState.thenHandlers.forEach(function(f) {
      f(val);
    });
  }
}

export class Future<T> {
  /**
    The state that is shared between the future and the promise. You would
    really like this ot be "friend" for the exported functions but there is
    no way to do this inside of typescript. Nobody should touch it, hence the
    `_` indicating that this should be treated as an implementation detail.
  */
  public _sharedState: SharedState<T>;

  /**
    A Future<T> should never be allocated apart from reading one from a promise
    using getFuture or a combinator from another future. Ideally this
    constructor could be marked private for the module but typescript does not
    allow for that.
  */
  constructor(sharedState: SharedState<T>) {
    this._sharedState = sharedState;
  }

  map<U>(f: (v: T) => U): Future<U> {
    return map(f, this);
  }
}

export function then<T>(f: (v: T) => void, future: Future<T>): void {
  if (future._sharedState.value === undefined) {
    future._sharedState.thenHandlers.push(f);
  } else {
    f(future._sharedState.value);
  }
}

export function map<T, U>(f: (v: T) => U, future: Future<T>): Future<U> {
  const pendingPromise = pending<U>();
  then(function(val: T) {
    pendingPromise.setValue(f(val));
  }, future);
  return pendingPromise.getFuture();
}

export function mbind<T, U>(
  f: (v: T) => Future<U>,
  future: Future<T>,
): Future<U> {
  const pendingPromise: Promise<U> = pending<U>();
  then(function(val: T) {
    then(function(val2: U) {
      pendingPromise.setValue(val2);
    }, f(val));
  }, future);
  return pendingPromise.getFuture();
}

export function munit<T>(t: T): Future<T> {
  return resolved(t).getFuture();
}

export function aapply<T, U>(
  futureFunc: Future<(a: T) => U>,
  futureVal: Future<T>,
): Future<U> {
  return mbind(function(t: T) {
    return map(function(f: (a: T) => U) {
      return f(t);
    }, futureFunc);
  }, futureVal);
}

export function all<T>(futures: List.List<Future<T>>): Future<List.List<T>> {
  const partialFutures = List.map(function(future: Future<T>) {
    return map(function(val: T) {
      return (result: List.List<T>) => List.cons(val, result);
    }, future);
  }, futures);
  return List.foldr(
    function(
      soFarFuture: Future<List.List<T>>,
      thisFuture: Future<(list: List.List<T>) => List.List<T>>,
    ) {
      return aapply(thisFuture, soFarFuture);
    },
    resolved<List.List<T>>(List.of<T>()).getFuture(),
    partialFutures,
  );
}
