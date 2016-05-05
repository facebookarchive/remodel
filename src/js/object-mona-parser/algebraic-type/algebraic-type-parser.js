/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Legacy algebraic type parser written using mona and pure js. This should
 * eventually be moved into a more effecient and typed parser.
 */
const mona = require('mona');
const parseCommon = require('../object-parser-common');

function algebraicSubtype() {
  return mona.trim(
    mona.sequence(function(s) {
      const subtype = s(parseCommon.parseNamedAttributeGroupOrSingleAttribute());
      s(mona.maybe(mona.string(',')));
      s(mona.maybe(mona.spaces()));
      return mona.value(subtype);
    })
  );
}

function algebraicType() {
  return mona.trim(
    mona.sequence(function(s) {
      const comments = s(mona.collect(parseCommon.comment()));

      const rawAnnotations = s(parseCommon.annotations());
      const parsedAnnotations = rawAnnotations || {};

      const typeNameSection = s(parseCommon.parseTypeNameSectionWithIncludes());
      const valueTypes = s(mona.between(mona.string('{'),
      mona.string('}'),
      mona.collect(algebraicSubtype())));

      const includes = typeNameSection.includes || [];
      const excludes = typeNameSection.excludes || [];

      const foundType = {
        annotations: parsedAnnotations,
        comments: comments,
        excludes: excludes,
        includes: includes,
        typeName: typeNameSection.typeName,
        subtypes: valueTypes,
      };
      return mona.value(foundType);
    })
  );
}

function parse(fileInput) {
  try {
    const parsedType = mona.parse(algebraicType(), fileInput);

    if (parsedType == null) {
      throw "parsed type came back as null";
    }
    return {
      errorReason: null,
      isValid: true,
      type: parsedType
    };
  } catch (e) {
    return {
      errorReason:e.message,
      isValid:false,
      type: null
    };
  }
}

module.exports = {
  parse: parse,
};
