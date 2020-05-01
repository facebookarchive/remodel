/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ObjC from '../objc';
import * as ObjCTypeUtils from '../objc-type-utils';
import * as Maybe from '../maybe';

const UI_GEOMETRY_IMPORT: ObjC.Import = {
  file: 'UIGeometry.h',
  isPublic: false,
  requiresCPlusPlus: false,
  library: 'UIKit',
};

const NSOBJECT_CODING_STATEMENTS: CodingStatements = {
  codingFunctionImport: null,
  encodeStatement: 'encodeObject',
  encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
  decodeStatementGenerator: decodeObjectStatementGenerator,
  decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
};

const UNSUPPORTED_TYPE_CODING_STATEMENTS: CodingStatements = {
  codingFunctionImport: null,
  encodeStatement: '',
  encodeValueStatementGenerator: () => null!,
  decodeStatementGenerator: () => null!,
  decodeValueStatementGenerator: () => null!,
};

export interface CodingStatements {
  codingFunctionImport: ObjC.Import | null;
  decodeStatementGenerator: (
    valueClass: ObjC.Type,
    key: string,
    secureCoding: boolean,
  ) => string;
  decodeValueStatementGenerator: (decodedValueCode: string) => string;
  encodeStatement: string;
  encodeValueStatementGenerator: (valueAccessor: string) => string;
}

function encodeValueStatementGeneratorForEncodingValueDirectly(
  valueAccessor: string,
): string {
  return valueAccessor;
}

function encodeValueStatementGeneratorForEncodingValueAsString(
  encodingFunction: string,
): (valueAccessor: string) => string {
  return function(valueAccessor: string): string {
    return encodingFunction + '(' + valueAccessor + ')';
  };
}

function decodeValueStatementGeneratorForDecodingValueDirectly(
  decodedValueCode: string,
): string {
  return decodedValueCode;
}

function decodeValueStatementGeneratorForDecodingValueFromString(
  decodingFunction: string,
): (decodedValueCode: string) => string {
  return function(decodedValueCode: string): string {
    return decodingFunction + '(' + decodedValueCode + ')';
  };
}

function decodeValueSatementGeneratorForValueStoredAsNSString(
  type: ObjC.Type,
  key: string,
  secureCoding: boolean,
): string {
  if (secureCoding) {
    return `[aDecoder decodeObjectOfClass:[NSString class] forKey:${key}]`;
  } else {
    return `[aDecoder decodeObjectForKey:${key}]`;
  }
}

function insecureDecodeValueStatementGeneratorGenerator(
  decodeStatement: string,
): (type: ObjC.Type, key: string, secureCoding: boolean) => string {
  return function(type: ObjC.Type, key: string, secureCoding: boolean): string {
    return `[aDecoder ${decodeStatement}:${key}]`;
  };
}

function decodeObjectStatementGenerator(
  type: ObjC.Type,
  key: string,
  secureCoding: boolean,
) {
  if (secureCoding) {
    return `[aDecoder decodeObjectOfClass:[${type.name} class] forKey:${key}]`;
  } else {
    return `[aDecoder decodeObjectForKey:${key}]`;
  }
}

export function codingStatementsForType(type: ObjC.Type): CodingStatements {
  return ObjCTypeUtils.matchType(
    {
      id: function() {
        return NSOBJECT_CODING_STATEMENTS;
      },
      NSObject: function() {
        return NSOBJECT_CODING_STATEMENTS;
      },
      BOOL: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeBool',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeBoolForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      NSInteger: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeInteger',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeIntegerForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      NSUInteger: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeInteger',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeIntegerForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      double: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeDouble',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeDoubleForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      float: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeFloat',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeFloatForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      CGFloat: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeFloat',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeFloatForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      NSTimeInterval: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeDouble',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeDoubleForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      uintptr_t: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeInteger',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeIntegerForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      uint32_t: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeInt32',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeInt32ForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      uint64_t: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeInt64',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeInt64ForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      int32_t: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeInt32',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeInt32ForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      int64_t: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeInt64',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueDirectly,
          decodeStatementGenerator: insecureDecodeValueStatementGeneratorGenerator(
            'decodeInt64ForKey',
          ),
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueDirectly,
        };
      },
      SEL: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeObject',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString(
            'NSStringFromSelector',
          ),
          decodeStatementGenerator: decodeValueSatementGeneratorForValueStoredAsNSString,
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString(
            'NSSelectorFromString',
          ),
        };
      },
      NSRange: function() {
        return {
          codingFunctionImport: null,
          encodeStatement: 'encodeObject',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString(
            'NSStringFromRange',
          ),
          decodeStatementGenerator: decodeValueSatementGeneratorForValueStoredAsNSString,
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString(
            'NSRangeFromString',
          ),
        };
      },
      CGRect: function() {
        return {
          codingFunctionImport: UI_GEOMETRY_IMPORT,
          encodeStatement: 'encodeObject',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString(
            'NSStringFromCGRect',
          ),
          decodeStatementGenerator: decodeValueSatementGeneratorForValueStoredAsNSString,
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString(
            'CGRectFromString',
          ),
        };
      },
      CGPoint: function() {
        return {
          codingFunctionImport: UI_GEOMETRY_IMPORT,
          encodeStatement: 'encodeObject',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString(
            'NSStringFromCGPoint',
          ),
          decodeStatementGenerator: decodeValueSatementGeneratorForValueStoredAsNSString,
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString(
            'CGPointFromString',
          ),
        };
      },
      CGSize: function() {
        return {
          codingFunctionImport: UI_GEOMETRY_IMPORT,
          encodeStatement: 'encodeObject',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString(
            'NSStringFromCGSize',
          ),
          decodeStatementGenerator: decodeValueSatementGeneratorForValueStoredAsNSString,
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString(
            'CGSizeFromString',
          ),
        };
      },
      UIEdgeInsets: function() {
        return {
          codingFunctionImport: UI_GEOMETRY_IMPORT,
          encodeStatement: 'encodeObject',
          encodeValueStatementGenerator: encodeValueStatementGeneratorForEncodingValueAsString(
            'NSStringFromUIEdgeInsets',
          ),
          decodeStatementGenerator: decodeValueSatementGeneratorForValueStoredAsNSString,
          decodeValueStatementGenerator: decodeValueStatementGeneratorForDecodingValueFromString(
            'UIEdgeInsetsFromString',
          ),
        };
      },
      Class: function() {
        return UNSUPPORTED_TYPE_CODING_STATEMENTS;
      },
      dispatch_block_t: function() {
        return UNSUPPORTED_TYPE_CODING_STATEMENTS;
      },
      unmatchedType: function() {
        return null!;
      },
    },
    type,
  );
}

export const supportsSecureCodingMethod: ObjC.Method = {
  preprocessors: [],
  belongsToProtocol: 'NSSecureCoding',
  code: ['return YES;'],
  comments: [],
  compilerAttributes: [],
  keywords: [
    {
      name: 'supportsSecureCoding',
      argument: null,
    },
  ],
  returnType: {
    type: {
      name: 'BOOL',
      reference: 'BOOL',
    },
    modifiers: [],
  },
};
