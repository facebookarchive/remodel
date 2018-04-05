/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Maybe = require('./maybe');

enum ListType {
  nil,
  cons
}

export class List<T> {
  private listType:ListType;
  private value:T;
  private next:List<T>;
  constructor(listType:ListType, value:T, next:List<T>) {
    this.listType = listType;
    this.value = value;
    this.next = next;
  }

  match<U>(nil:() => U, cons:(value:T, next:List<T>) => U) {
    switch(this.listType) {
      case ListType.nil:
        return nil();
      case ListType.cons:
        return cons(this.value, this.next);
    }
  }
}

export function of<T>(...args:T[]):List<T> {
  if (args.length === 0) {
    return new List<T>(ListType.nil, null, null);
  } else {
    var list = new List<T>(ListType.nil, null, null);
    for (var i:number = args.length - 1; i >= 0; i--) {
      list = cons(args[i], list);
    }
    return list;
  }
}

function returnTrue() {
  return true;
}

function returnFalse() {
  return false;
}

export function isEmpty<T>(list:List<T>):boolean {
  return list.match(returnTrue, returnFalse);
}

export function length<T>(list:List<T>):number {
  return list.match(function() { return 0;}, function(val:T, next:List<T>) { return 1 + length(next);});
}

export function cons<T>(elem:T, list:List<T>):List<T> {
  return new List<T>(ListType.cons, elem, list);
}

function returnJustHead<T>(val:T, tail:List<T>):Maybe.Maybe<T> {
  return Maybe.Just(val);
}

export function head<T>(list:List<T>):Maybe.Maybe<T> {
  return list.match(function() { return Maybe.Nothing<T>(); }, returnJustHead);
}

function returnTail<T>(head:T, tail:List<T>):List<T> {
  return tail;
}

export function tail<T>(list:List<T>):List<T> {
  return list.match(function() { return of<T>(); }, returnTail);
}

function prependToAll<T>(seperator:T, list:List<T>):List<T> {
  return list.match(function() {
    return list;
  }, function(head:T, tail:List<T>) {
    return cons(seperator, cons(head, prependToAll(seperator, tail)));
  });
}

export function intersperse<T>(seperator:T, list:List<T>):List<T> {
  return list.match(function() {
    return list;
  }, function(head:T, tail:List<T>) {
    return cons(head, prependToAll(seperator, tail));
  });
}

export function append<T>(list1:List<T>, list2:List<T>):List<T> {
  if (isEmpty(list2)) {
    return list1;
  } else if (isEmpty(list1)) {
    return list2;
  } else {
    return foldr(function(soFar:List<T>, thisVal:T) {
      return cons(thisVal, soFar);
    }, list2, list1);
  }
}

export function filter<T>(f:(t:T) => boolean, list:List<T>):List<T> {
  return foldr(function(soFar:List<T>, val:T) {
    if (f(val)) {
      return cons(val, soFar);
    } else {
      return soFar;
    }
  }, of<T>(), list);
}

export function map<T, U>(f:(t:T) => U, list:List<T>):List<U> {
  return list.match(function() {
    return of<U>();
  }, function(val:T, next:List<T>) {
    return new List<U>(ListType.cons, f(val), map(f, next));
  });
}

export function foldl<T, U>(f:(soFar:U, thisOne:T) => U, initialValue:U, list:List<T>):U {
  return list.match(function() {
    return initialValue;
  }, function(val:T, next:List<T>) {
    return foldl(f, f(initialValue, val), next);
  });
}

export function foldr<T, U>(f:(soFar:U, thisOne:T) => U, initialValue:U, list:List<T>):U {
  return list.match(function() {
    return initialValue;
  }, function(val:T, next:List<T>) {
    return f(foldr(f, initialValue, next), val);
  });
}

export function reverse<T>(listToReverse:List<T>):List<T> {
  return foldl(function(soFar:List<T>, val:T):List<T> {
    return cons(val, soFar);
  }, of<T>(), listToReverse);
}

export function fromArray<T>(array:T[]):List<T> {
  return array.reduceRight(function(existing:List<T>, thisOne:T) {
    return cons(thisOne, existing);
  }, of<T>());
}

export function toArray<T>(list:List<T>):T[] {
  return foldl(function(soFar:T[], thisOne:T) {
    soFar.push(thisOne);
    return soFar;
  }, [], list);
}
