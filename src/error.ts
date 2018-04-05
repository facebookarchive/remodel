/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
