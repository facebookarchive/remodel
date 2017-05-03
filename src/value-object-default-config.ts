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

export const VALUE_OBJECT_DEFAULT_CONFIG = {
  baseIncludes: List.of(
    'RMCopying',
    'RMDescription',
    'RMEquality',
    'RMImmutableProperties',
    'RMValueObjectSemantics'
  ),
  basePlugins: List.of(
    'assume-nonnull',
    'builder',
    'coding',
    'copying',
    'description',
    'equality',
    'fetch-status',
    'immutable-properties',
    'use-cpp'
  )
};
