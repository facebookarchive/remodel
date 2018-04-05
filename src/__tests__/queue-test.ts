/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../type-defs/jasmine.d.ts'/>
///<reference path='../type-defs/jasmine-test-additions.d.ts'/>

import Maybe = require('../maybe');
import Queue = require('../queue');

describe('Queue', function() {
  describe('#dequeue', function() {
    it('gives back nothing when nothing has been added', function() {
      const queue:Queue.Queue<number> = Queue.Empty<number>();
      const result:Queue.DequeueResult<number> = Queue.dequeue(queue);

      const expectedResult:Queue.DequeueResult<number> = {
        value:Maybe.Nothing<number>(),
        queue:Queue.Empty<number>()
      };

      expect(result).toEqualJSON(expectedResult);
    });

    it('gives back a single value and an empty queue one thing has been added', function() {
      const queue:Queue.Queue<number> = Queue.Empty<number>();
      const updatedQueue = Queue.enqueue(1, queue);
      const result:Queue.DequeueResult<number> = Queue.dequeue(updatedQueue);

      const expectedResult:Queue.DequeueResult<number> = {
        value:Maybe.Just<number>(1),
        queue:Queue.Empty<number>()
      };

      expect(result).toEqualJSON(expectedResult);
    });

    it('gives back a single value and a non empty queue two things has been added', function() {
      const queue:Queue.Queue<number> = Queue.Empty<number>();
      const updatedQueue1 = Queue.enqueue(1, queue);
      const updatedQueue2 = Queue.enqueue(2, updatedQueue1);
      const result:Queue.DequeueResult<number> = Queue.dequeue(updatedQueue2);

      const expectedResult:Queue.DequeueResult<number> = {
        value:Maybe.Just<number>(1),
        queue:Queue.of<number>(2)
      };

      expect(result).toEqualJSON(expectedResult);
    });

    it('gives back a single value and an empty queue two things has been added and then ' +
       'dequeued', function() {
      const queue:Queue.Queue<number> = Queue.Empty<number>();
      const updatedQueue1 = Queue.enqueue(1, queue);
      const updatedQueue2 = Queue.enqueue(2, updatedQueue1);
      const result1:Queue.DequeueResult<number> = Queue.dequeue(updatedQueue2);
      const result2:Queue.DequeueResult<number> = Queue.dequeue(result1.queue);

      const expectedResult:Queue.DequeueResult<number> = {
        value:Maybe.Just<number>(2),
        queue:Queue.Empty<number>()
      };

      expect(result2).toEqualJSON(expectedResult);
    });
  });
});
