/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function Just<T>(val: T) {
  return new Maybe<T>(val);
}

export function Nothing<T>() {
  return new Maybe<T>(null);
}

export class Maybe<T> {
  public value: T;

  constructor(value: T) {
    this.value = value;
  }
}

export function match<T, U>(
  just: (t: T) => U,
  nothing: () => U,
  maybe: Maybe<T>,
): U {
  if (maybe.value === null) {
    return nothing();
  } else {
    return just(maybe.value);
  }
}

export function catMaybes<T>(maybes: Maybe<T>[]): T[] {
  return maybes.reduce(function(soFar: T[], thisVal: Maybe<T>) {
    return match(
      function(val: T) {
        return soFar.concat(val);
      },
      function() {
        return soFar;
      },
      thisVal,
    );
  }, []);
}

export function map<T, U>(f: (t: T) => U, maybe: Maybe<T>): Maybe<U> {
  const just = function(t: T) {
    return Just(f(t));
  };
  const nothing = function() {
    return Nothing<U>();
  };
  return match(just, nothing, maybe);
}

export function munit<T>(t: T) {
  return Just(t);
}

export function mbind<T, U>(f: (t: T) => Maybe<U>, maybe: Maybe<T>): Maybe<U> {
  const nothing = function() {
    return Nothing<U>();
  };
  return match(f, nothing, maybe);
}

export function and<A, B>(a: Maybe<A>, b: Maybe<B>): Maybe<[A, B]> {
  if (a.value !== null && b.value !== null) {
    return Just<[A, B]>([a.value, b.value]);
  } else {
    return Nothing<[A, B]>();
  }
}
