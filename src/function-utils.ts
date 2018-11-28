/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function pApplyf2<T, U, V>(val: T, f: (a: T, b: U) => V): (b: U) => V {
  return function(b: U): V {
    return f(val, b);
  };
}

export function pApplyf3<T, U, V, W>(
  val: T,
  f: (a: T, b: U, c: V) => W,
): (b: U, c: V) => W {
  return function(b: U, c: V): W {
    return f(val, b, c);
  };
}

export function pApplyf4<T, U, V, W, X>(
  val: T,
  f: (a: T, b: U, c: V, d: W) => X,
): (b: U, c: V, d: W) => X {
  return function(b: U, c: V, d: W): X {
    return f(val, b, c, d);
  };
}

export function pApplyf5<T, U, V, W, X, Y>(
  val: T,
  f: (a: T, b: U, c: V, d: W, e: X) => Y,
): (b: U, c: V, d: W, e: X) => Y {
  return function(b: U, c: V, d: W, e: X): Y {
    return f(val, b, c, d, e);
  };
}

export function pApply2f3<T, U, V, W>(
  val1: T,
  val2: U,
  f: (a: T, b: U, c: V) => W,
): (c: V) => W {
  return pApplyf2(val2, pApplyf3(val1, f));
}

export function pApply2f4<T, U, V, W, X>(
  val1: T,
  val2: U,
  f: (a: T, b: U, c: V, d: W) => X,
): (c: V, d: W) => X {
  return pApplyf3(val2, pApplyf4(val1, f));
}

export function pApply3f4<T, U, V, W, Y>(
  val1: T,
  val2: U,
  val3: V,
  f: (a: T, b: U, c: V, d: W) => Y,
): (d: W) => Y {
  return pApplyf2(val3, pApplyf3(val2, pApplyf4(val1, f)));
}

export function pApply3f5<T, U, V, W, X, Y>(
  val1: T,
  val2: U,
  val3: V,
  f: (a: T, b: U, c: V, d: W, e: X) => Y,
): (d: W, e: X) => Y {
  return pApplyf3(val3, pApplyf4(val2, pApplyf5(val1, f)));
}

export function zip2<A, B>(a: A[], b: B[]): [A, B][] {
  const length = Math.min(a.length, b.length);
  const result = [];
  for (let i = 0; i < length; i++) {
    result.push([a[i], b[i]]);
  }
  return result;
}

export function flatMap<T, R>(array: T[], func: (T) => R[]): R[] {
  return array.reduce((current, next) => current.concat(func(next)), []);
}
