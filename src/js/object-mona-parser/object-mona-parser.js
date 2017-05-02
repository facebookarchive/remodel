/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Legacy value object parser written using mona and pure js. This should
 * eventually be moved into a more effecient and typed parser.
 */
const objectSpec = require('./object-spec/object-spec-parser');
const algebraicType = require('./algebraic-type/algebraic-type-parser');

module.exports = {
  parseObjectSpec: objectSpec.parse,
  parseAlgebraicType: algebraicType.parse,
};
