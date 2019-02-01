/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='./type-defs/node-0.11.d.ts'/>

import * as child_process from 'child_process';
import * as File from './file';
import * as LazySequence from './lazy-sequence';
import * as os from 'os';
import * as ParallelProcess from './parallel-process';

const CPUS = os.cpus();

const pidToWorkersMap = {};
const requestIdToSequenceSource = {};
const requestIdToCount = {};
var globalRequestId = 0;

class CircularArray<T> {
  private currentIndex: number;
  private maxIndex: number;
  private allItems: T[];
  constructor(allItems: T[]) {
    this.allItems = allItems;
    this.maxIndex = allItems.length - 1;
    this.currentIndex = 0;
  }

  nextValue(): T {
    const value: T = this.allItems[this.currentIndex];
    if (this.currentIndex === this.maxIndex) {
      this.currentIndex = 0;
    } else {
      this.currentIndex += 1;
    }
    return value;
  }
}

const allItems: number[] = [];
for (var i = 0; i < CPUS.length; i++) {
  const loc = __dirname + '/parallel-process-worker.js';
  const process: child_process.ChildProcess = child_process.fork(loc);
  pidToWorkersMap[process.pid] = process;
  process.on('message', processMessageFromWorker);
  allItems.push(process.pid);
}

const circularArray = new CircularArray(allItems);

function dispatchFindFilesRequest(request: ParallelProcess.Request) {
  const pid: number = circularArray.nextValue();
  const worker = pidToWorkersMap[pid];
  worker.send(request);
}

export function findFiles(
  directoryToScan: File.AbsoluteFilePath,
  fileExtension: string,
): LazySequence.Sequence<File.AbsoluteFilePath> {
  const localRequestId = globalRequestId++;
  const queueRequest: ParallelProcess.Request = {
    requestType: ParallelProcess.RequestType.findFilesRequest,
    findFilesRequest: {
      requestId: localRequestId,
      directoryToSearch: directoryToScan,
      fileExtension: fileExtension,
    },
  };
  const source: LazySequence.Source<
    File.AbsoluteFilePath
  > = LazySequence.source<File.AbsoluteFilePath>();
  requestIdToCount[localRequestId] = 1;
  requestIdToSequenceSource[localRequestId] = source;

  dispatchFindFilesRequest(queueRequest);
  return source.getSequence();
}

export function shutDown() {
  while (1) {
    const pid = circularArray.nextValue();
    const worker = pidToWorkersMap[pid];
    if (worker !== undefined) {
      worker.disconnect();
      pidToWorkersMap[pid] = undefined;
    } else {
      break;
    }
  }
}

function processFindFilesResponse(
  pid: number,
  response: ParallelProcess.FindFilesResponse,
) {
  const requestId = response.requestId;
  requestIdToCount[requestId] = requestIdToCount[requestId] - 1;
  const source = requestIdToSequenceSource[requestId];
  for (var i = 0; i < response.foundFilePaths.length; i++) {
    source.nextValue(response.foundFilePaths[i]);
  }
  for (var j = 0; j < response.foundDirectoriesToSearch.length; j++) {
    const directoryToScan: File.AbsoluteFilePath =
      response.foundDirectoriesToSearch[j];
    const queueRequest: ParallelProcess.Request = {
      requestType: ParallelProcess.RequestType.findFilesRequest,
      findFilesRequest: {
        requestId: requestId,
        directoryToSearch: directoryToScan,
        fileExtension: response.fileExtension,
      },
    };
    dispatchFindFilesRequest(queueRequest);
  }
  requestIdToCount[requestId] =
    requestIdToCount[requestId] + response.foundDirectoriesToSearch.length;
  if (requestIdToCount[requestId] === 0) {
    source.finished();
    requestIdToCount[requestId] = undefined;
    requestIdToSequenceSource[requestId] = undefined;
  }
}

function processMessageFromWorker(response: ParallelProcess.Response) {
  switch (response.responseType) {
    case ParallelProcess.ResponseType.findFilesResponse:
      processFindFilesResponse(response.pid, response.findFilesResponse);
  }
}
