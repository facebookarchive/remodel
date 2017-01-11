/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import ObjC = require('../objc');
import ObjCTypeUtils = require('../objc-type-utils');
import Maybe = require('../maybe');

const UI_GEOMETRY_IMPORT:ObjC.Import = {
  file:'UIGeometry.h',
  isPublic:false,
  library:Maybe.Just('UIKit'),
}

const NSOBJECT_CODING_STATEMENTS:CodingStatements = {
  codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
  encodeStatement: 'encodeObject',
  encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
  decodeStatement: 'decodeObjectForKey',
  decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
};

const UNSUPPORTED_TYPE_CODING_STATEMENTS:CodingStatements = {
  codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
  encodeStatement: '',
  encodeValueStatementGenerator: null,
  decodeStatement: '',
  decodeValueStatementGenerator: null
};

export interface CodingStatements {
  codingFunctionImport: Maybe.Maybe<ObjC.Import>;
  decodeStatement: string;
  decodeValueStatementGenerator: (decodedValueCode: string) => string;
  encodeStatement: string;
  encodeValueStatementGenerator: (valueAccessor: string) => string;
}

function encodeValueStatementGeneratorForEncodingValueDirectly(valueAccessor: string): string {
  return valueAccessor;
}

function encodeValueStatementGeneratorForEncodingValueAsString(encodingFunction: string): (valueAccessor: string) => string {
  return function(valueAccessor: string): string {
    return encodingFunction + '(' + valueAccessor + ')';
  };
}

function decodeValueStatementGeneratorForDecodingValueDirectly(decodedValueCode: string): string {
  return decodedValueCode;
}

function decodeValueStatementGeneratorForDecodingValueFromString(decodingFunction: string): (decodedValueCode: string) => string {
  return function(decodedValueCode: string): string {
    return decodingFunction + '(' + decodedValueCode + ')';
  };
}

export function codingStatementsForType(type:ObjC.Type):CodingStatements {
  return ObjCTypeUtils.matchType({
    id: function() {
      return NSOBJECT_CODING_STATEMENTS;
    },
    NSObject: function() {
      return NSOBJECT_CODING_STATEMENTS;
    },
    BOOL: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeBool',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeBoolForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    NSInteger: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeInteger',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeIntegerForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    NSUInteger: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeInteger',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeIntegerForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    double: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeDouble',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeDoubleForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    float: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeFloat',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeFloatForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    CGFloat: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeFloat',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeFloatForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    NSTimeInterval: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeDouble',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeDoubleForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    uintptr_t: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeInteger',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeIntegerForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    uint32_t: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeInt32',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeInt32ForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    uint64_t: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeInt64',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeInt64ForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    int32_t: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeInt32',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeInt32ForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    int64_t: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeInt64',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
        decodeStatement: 'decodeInt64ForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly
      };
    },
    SEL: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeObject',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString('NSStringFromSelector'),
        decodeStatement: 'decodeObjectForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString('NSSelectorFromString')
      };
    },
    NSRange: function() {
      return {
        codingFunctionImport: Maybe.Nothing<ObjC.Import>(),
        encodeStatement: 'encodeObject',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString('NSStringFromRange'),
        decodeStatement: 'decodeObjectForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString('NSRangeFromString')
      };
    },
    CGRect: function() {
      return {
        codingFunctionImport: Maybe.Just(UI_GEOMETRY_IMPORT),
        encodeStatement: 'encodeObject',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString('NSStringFromCGRect'),
        decodeStatement: 'decodeObjectForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString('CGRectFromString')
      };
    },
    CGPoint: function() {
      return {
        codingFunctionImport: Maybe.Just(UI_GEOMETRY_IMPORT),
        encodeStatement: 'encodeObject',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString('NSStringFromCGPoint'),
        decodeStatement: 'decodeObjectForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString('CGPointFromString')
      };
    },
    CGSize: function() {
      return {
        codingFunctionImport: Maybe.Just(UI_GEOMETRY_IMPORT),
        encodeStatement: 'encodeObject',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString('NSStringFromCGSize'),
        decodeStatement: 'decodeObjectForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString('CGSizeFromString')
      };
    },
    UIEdgeInsets: function() {
      return {
        codingFunctionImport: Maybe.Just(UI_GEOMETRY_IMPORT),
        encodeStatement: 'encodeObject',
        encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString('NSStringFromUIEdgeInsets'),
        decodeStatement: 'decodeObjectForKey',
        decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString('UIEdgeInsetsFromString')
      };
    },
    Class: function() {
     return UNSUPPORTED_TYPE_CODING_STATEMENTS;
    },
    dispatch_block_t: function() {
      return UNSUPPORTED_TYPE_CODING_STATEMENTS;
    },
    unmatchedType: function() {
      return null;
    },
  }, type);
}
