/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function Just<T>(t: T): T | null {
  return t;
}

export function Nothing<T>(): T | null {
  return null;
}

export function match<T, U>(
  just: (t: T) => U,
  nothing: () => U,
  maybe: T | null | undefined,
): U {
  if (maybe == null) {
    return nothing();
  } else {
    return just(maybe);
  }
}

export function catMaybes<T>(maybes: (T | null | undefined)[]): T[] {
  return maybes.reduce((soFar, thisVal) => {
    return match(
      function(val: T) {
        return soFar.concat(val);
      },
      function() {
        return soFar;
      },
      thisVal,
    );
  }, [] as T[]);
}

export function map<T, U>(
  f: (t: T) => U,
  maybe: T | null | undefined,
): U | null {
  return match(f, () => null, maybe);
}

export function mbind<T, U>(
  f: (t: T) => U | null,
  maybe: T | null | undefined,
): U | null {
  return match(f, () => null, maybe);
}

export function and<A, B>(
  a: A | null | undefined,
  b: B | null | undefined,
): [A, B] | null {
  if (a == null) {
    return null;
  } else if (b == null) {
    return null;
  } else {
    return [a, b];
  }
}

export function or<T>(a: T | null, b: T | null): T | null {
  return match(
    aValue => aValue,
    () => b,
    a,
  );
}
