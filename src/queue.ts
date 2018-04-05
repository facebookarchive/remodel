/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import List = require('./list');
import Maybe = require('./maybe');

export class Queue<T> {
  public forwardList:List.List<T>;
  public backwardList:List.List<T>;

  constructor(forwardList:List.List<T>, backwardList:List.List<T>) {
    this.forwardList = forwardList;
    this.backwardList = backwardList;
  }
}

export interface DequeueResult<T> {
  value:Maybe.Maybe<T>;
  queue:Queue<T>;
}

export function Empty<T>():Queue<T> {
  return new Queue<T>(List.of<T>(), List.of<T>());
}

export function dequeue<T>(queue:Queue<T>):DequeueResult<T> {
  return queue.forwardList.match(function() {
    const newForwardList = List.reverse(queue.backwardList);
    return newForwardList.match(function() {
      const result:DequeueResult<T> = {
        value:Maybe.Nothing<T>(),
        queue:Empty<T>()
      };
      return result;
    }, function(head:T, tail:List.List<T>) {
      const newQueue = new Queue<T>(tail, List.of<T>());
      const result:DequeueResult<T> = {
        value:Maybe.Just(head),
        queue:newQueue
      };
      return result;
    });
  }, function(head:T, tail:List.List<T>) {
    const newQueue = new Queue<T>(tail, queue.backwardList);
    const result:DequeueResult<T> = {
      value:Maybe.Just(head),
      queue:newQueue
    };
    return result;
  });
}

export function of<T>(...args:T[]):Queue<T> {
  var list:List.List<T> = List.of<T>();
  for (var i = args.length - 1; i >= 0; i--) {
    list = List.cons(args[i], list);
  }
  const queue = new Queue(list, List.of<T>());
  return queue;
}

export function enqueue<T>(value:T, queue:Queue<T>):Queue<T> {
  return new Queue<T>(queue.forwardList, List.cons(value, queue.backwardList));
}
