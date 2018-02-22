/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import Configuration = require('./configuration');
import List = require('./list')

export const OBJECT_SPEC_DEFAULT_CONFIG = {
  baseIncludes: List.of(
    'RMAssertNullability',
    'RMDescription',
    'RMImmutableProperties',
    'RMInitNewUnavailable'
  ),
  basePlugins: List.of(
    'assert-nullability',
    'assume-nonnull',
    'builder',
    'coding',
    'description',
    'fetch-status',
    'immutable-properties',
    'init-new-unavailable',
    'subclassing-restricted',
    'use-cpp'
  )
};
