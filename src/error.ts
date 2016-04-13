/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

export interface Error {
  reason:string;
}

export function Error(reason:string) {
  return {reason:reason};
}

export function getReason(error:Error) {
  return error.reason;
}
