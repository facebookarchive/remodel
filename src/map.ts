/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../node_modules/immutable/dist/immutable.d.ts'/>

import * as Immutable from 'immutable';
import * as Maybe from './maybe';

export interface Map<K, V> {
  map: Immutable.Map<K, V>;
}

export function Empty<K, V>(): Map<K, V> {
  return {map: Immutable.Map<K, V>()};
}

export function Map<K, V>(array: Array</*[K,V]*/ Array<any>>): Map<K, V> {
  return {map: Immutable.Map<K, V>(array)};
}

export function get<K, V>(key: K, map: Map<K, V>): Maybe.Maybe<V> {
  const immutableMap: Immutable.Map<K, V> = map.map;
  const value = immutableMap.get(key);
  return value ? Maybe.Just(value) : Maybe.Nothing<V>();
}

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}

export function containsKey<K, V>(key: K, map: Map<K, V>): boolean {
  return Maybe.match(returnTrue, returnFalse, get(key, map));
}

export function insert<K, V>(key: K, value: V, map: Map<K, V>): Map<K, V> {
  const newMap: Immutable.Map<K, V> = map.map.set(key, value);
  return {map: newMap};
}

export function remove<K, V>(key: K, map: Map<K, V>): Map<K, V> {
  const newMap: Immutable.Map<K, V> = map.map.remove(key);
  return {map: newMap};
}

export function foldl<K, V, R>(
  f: (soFar: R, key: K, value: V) => R,
  initialValue: R,
  map: Map<K, V>,
): R {
  var currentValue: R = initialValue;
  const immutableMap: Immutable.Map<K, V> = map.map;
  immutableMap.forEach(function(value?: V, key?: K) {
    if (value != undefined && key != undefined) {
      currentValue = f(currentValue, key, value);
    }
  });
  return currentValue;
}
