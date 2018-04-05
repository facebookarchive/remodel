/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

interface Functor<T> {
  map<U>(f: (val: T) => U): Functor<U>
}

export function map<T,U>(f:(val:T) => U, funct:Functor<T>):Functor<U> {
  return funct.map(f);
}

export function pipeline2<T,U,V>(funct:Functor<T>, f:(val:T) => U, g:(val:U) => V):Functor<V> {
  return funct.map(f).map(g);
}

export function pipeline3<T,U,V,W>(funct:Functor<T>, f:(val:T) => U, g:(val:U) => V, h:(val:V) => W):Functor<W> {
  return funct.map(f).map(g).map(h);
}

export function pipeline4<T,U,V,W,X>(funct:Functor<T>, f:(val:T) => U, g:(val:U) => V, h:(val:V) => W, i:(val:W) => X):Functor<X> {
  return funct.map(f).map(g).map(h).map(i);
}

/* tslint:disable:max-line-length */
export function pipeline5<T,U,V,W,X,Y>(funct:Functor<T>, f:(val:T) => U, g:(val:U) => V, h:(val:V) => W, i:(val:W) => X, j:(val:X) => Y):Functor<Y> {
/* tsline:enable:max-line-length */
  return funct.map(f).map(g).map(h).map(i).map(j);
}

/* tslint:disable:max-line-length */
export function pipeline6<T,U,V,W,X,Y,Z>(funct:Functor<T>, f:(val:T) => U, g:(val:U) => V, h:(val:V) => W, i:(val:W) => X, j:(val:X) => Y, k:(val:Y) => Z):Functor<Z> {
/* tsline:enable:max-line-length */
  return funct.map(f).map(g).map(h).map(i).map(j).map(k);
}
