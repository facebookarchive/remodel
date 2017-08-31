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
