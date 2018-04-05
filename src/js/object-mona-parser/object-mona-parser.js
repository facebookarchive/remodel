/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
