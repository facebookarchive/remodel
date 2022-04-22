/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ObjC from './objc';

export function initUnavailableInstanceMethod(): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: 'NSObject',
    code: [],
    comments: [],
    compilerAttributes: ['NS_UNAVAILABLE'],
    keywords: [
      {
        name: 'init',
        argument: null,
      },
    ],
    returnType: {
      type: {
        name: 'instancetype',
        reference: 'instancetype',
      },
      modifiers: [],
    },
  };
}

export function newUnavailableClassMethod(): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: 'NSObject',
    code: [],
    comments: [],
    compilerAttributes: ['NS_UNAVAILABLE'],
    keywords: [
      {
        name: 'new',
        argument: null,
      },
    ],
    returnType: {
      type: {
        name: 'instancetype',
        reference: 'instancetype',
      },
      modifiers: [],
    },
  };
}
