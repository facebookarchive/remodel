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
const mona = require('mona');

const parseCommon = require('../object-parser-common');

function parse(fileInput) {
  try {
    const parsedType = mona.parse(parseCommon.parseNamedAttributeGroupWithIncludes(), fileInput);
    return {
      errorReason: null,
      isValid: true,
      foundType: parsedType
    };
  } catch (e) {
    return {
      errorReason:e.message,
      isValid:false,
      foundType: null
    };
  }

}

module.exports = {
  parse: parse,
};
