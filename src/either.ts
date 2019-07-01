/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export function Left<T, U>(val: T) {
  return new Either<T, U>(val);
}

export function Right<T, U>(val: U) {
  return new Either<T, U>(undefined, val);
}

export class Either<T, U> {
  left?: T;
  right?: U;
  constructor(left?: T, right?: U) {
    this.left = left;
    this.right = right;
  }

  map<V>(f: (u: U) => V): Either<T, V> {
    return map(f, this);
  }

  mbind<V>(f: (u: U) => Either<T, V>): Either<T, V> {
    return mbind(f, this);
  }
}

export function match<T, U, V>(
  left: (t: T) => V,
  right: (u: U) => V,
  either: Either<T, U>,
): V {
  if (either.left != undefined) {
    return left(either.left!);
  } else {
    return right(either.right!);
  }
}

export function map<T, U, V>(
  f: (u: U) => V,
  either: Either<T, U>,
): Either<T, V> {
  const left = function(t: T) {
    return Left<T, V>(either.left!);
  };
  const right = function(u: U) {
    return Right<T, V>(f(either.right!));
  };
  return match(left, right, either);
}

export function mbind<T, U, V>(
  f: (u: U) => Either<T, V>,
  either: Either<T, U>,
): Either<T, V> {
  const left = function(t: T) {
    return Left<T, V>(either.left!);
  };
  const right = function(u: U) {
    return f(either.right!);
  };
  return match(left, right, either);
}

export function munit<T, U>(u: U): Either<T, U> {
  return Right<T, U>(u);
}

export function and<T, A, B>(
  a: Either<T, A>,
  b: Either<T, B>,
): Either<T, [A, B]> {
  return mbind(
    rightA => mbind(rightB => Right<T, [A, B]>([rightA, rightB]), b),
    a,
  );
}
