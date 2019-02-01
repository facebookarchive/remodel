/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Promise from './promise';

interface SharedState<T> {
  isFinished: boolean;
  pendingPromises: Promise.Promise<T[]>[];
  thenHandlers: {(val: T): void}[];
  valuesSoFar: T[];
}

export function source<T>(): Source<T> {
  return new Source<T>({
    isFinished: false,
    pendingPromises: [],
    thenHandlers: [],
    valuesSoFar: [],
  });
}

export class Source<T> {
  private sharedState: SharedState<T>;
  constructor(sharedState: SharedState<T>) {
    this.sharedState = sharedState;
  }

  getSequence(): Sequence<T> {
    return new Sequence<T>(this.sharedState);
  }

  finished(): void {
    const allValues = this.sharedState.valuesSoFar;
    this.sharedState.pendingPromises.forEach(function(
      promise: Promise.Promise<T[]>,
    ) {
      promise.setValue(allValues);
    });
    this.sharedState.isFinished = true;
  }

  nextValue(val: T): void {
    if (this.sharedState.isFinished) {
      throw 'You cannot have a `nextValue` after finishing';
    }

    this.sharedState.valuesSoFar.push(val);
    this.sharedState.thenHandlers.forEach(function(f) {
      f(val);
    });
  }
}

export class Sequence<T> {
  public _sharedState: SharedState<T>;

  constructor(sharedState: SharedState<T>) {
    this._sharedState = sharedState;
  }

  map<U>(f: (val: T) => U): Sequence<U> {
    return map(f, this);
  }
}

export function evaluate<T>(seq: Sequence<T>): Promise.Future<T[]> {
  const promise: Promise.Promise<T[]> = Promise.pending<T[]>();
  if (seq._sharedState.isFinished) {
    promise.setValue(seq._sharedState.valuesSoFar);
  } else {
    seq._sharedState.pendingPromises.push(promise);
  }
  return promise.getFuture();
}

export function forEach<T>(f: (val: T) => void, seq: Sequence<T>): void {
  seq._sharedState.valuesSoFar.forEach(f);
  seq._sharedState.thenHandlers.push(f);
}

export function map<T, U>(f: (val: T) => U, seq: Sequence<T>): Sequence<U> {
  const newSource: Source<U> = source<U>();
  forEach(function(val: T) {
    newSource.nextValue(f(val));
  }, seq);
  Promise.then(function() {
    newSource.finished();
  }, evaluate(seq));
  return newSource.getSequence();
}

export function foldl<T, U>(
  f: (soFar: U, currentVal: T) => U,
  initialValue: U,
  sequence: Sequence<T>,
): Promise.Future<U> {
  const promise = Promise.pending<U>();
  var soFar = initialValue;
  forEach(function(val: T) {
    soFar = f(soFar, val);
  }, sequence);
  Promise.then(function() {
    promise.setValue(soFar);
  }, evaluate(sequence));
  return promise.getFuture();
}
