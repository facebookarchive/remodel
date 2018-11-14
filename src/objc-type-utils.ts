/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ObjC = require('./objc');

export interface TypeMatchers<T> {
  id: () => T;
  NSObject: () => T;
  BOOL: () => T;
  NSInteger: () => T;
  NSUInteger: () => T;
  double: () => T;
  float: () => T;
  CGFloat: () => T;
  NSTimeInterval: () => T;
  uintptr_t: () => T;
  uint32_t: () => T;
  uint64_t: () => T;
  int32_t: () => T;
  int64_t: () => T;
  SEL: () => T;
  NSRange: () => T;
  CGRect: () => T;
  CGPoint: () => T;
  CGSize: () => T;
  UIEdgeInsets: () => T;
  Class: () => T;
  dispatch_block_t: () => T;
  unmatchedType: () => T;
}

/**
  The code below is meant to help you implement this matching function,
  given its length. You just need to fill in the return statement values

  return ObjCTypeUtils.matchType({
    id: function() {
      return ;
    },
    NSObject: function() {
      return ;
    },
    BOOL: function() {
      return ;
    },
    NSInteger: function() {
      return ;
    },
    NSUInteger: function() {
      return ;
    },
    double: function() {
      return ;
    },
    float: function() {
      return ;
    },
    CGFloat: function() {
      return ;
    },
    NSTimeInterval: function() {
      return ;
    },
    uintptr_t: function() {
      return ;
    },
    uint32_t: function() {
      return ;
    },
    uint64_t: function() {
      return ;
    },
    int32_t: function() {
      return ;
    },
    int64_t: function() {
      return ;
    },
    SEL: function() {
      return ;
    },
    NSRange: function() {
      return ;
    },
    CGRect: function() {
      return ;
    },
    CGPoint: function() {
      return ;
    },
    CGSize: function() {
      return ;
    },
    UIEdgeInsets: function() {
      return ;
    },
    Class: function() {
      return ;
    },
    unmatchedType: function() {
      return ;
    }
  },
  type);
*/
export function matchType<T>(matchers: TypeMatchers<T>, type: ObjC.Type): T {
  if (type.name === 'id') {
    return matchers.id();
  } else if (type.name === 'NSObject') {
    return matchers.NSObject();
  } else if (type.name === 'BOOL') {
    return matchers.BOOL();
  } else if (type.name === 'NSInteger') {
    return matchers.NSInteger();
  } else if (type.name === 'NSUInteger') {
    return matchers.NSUInteger();
  } else if (type.name === 'double') {
    return matchers.double();
  } else if (type.name === 'float') {
    return matchers.float();
  } else if (type.name === 'CGFloat') {
    return matchers.CGFloat();
  } else if (type.name === 'NSTimeInterval') {
    return matchers.NSTimeInterval();
  } else if (type.name === 'uintptr_t') {
    return matchers.uintptr_t();
  } else if (type.name === 'uint32_t') {
    return matchers.uint32_t();
  } else if (type.name === 'uint64_t') {
    return matchers.uint64_t();
  } else if (type.name === 'int32_t') {
    return matchers.int32_t();
  } else if (type.name === 'int64_t') {
    return matchers.int64_t();
  } else if (type.name === 'SEL') {
    return matchers.SEL();
  } else if (type.name === 'NSRange') {
    return matchers.NSRange();
  } else if (type.name === 'CGRect') {
    return matchers.CGRect();
  } else if (type.name === 'CGPoint') {
    return matchers.CGPoint();
  } else if (type.name === 'CGSize') {
    return matchers.CGSize();
  } else if (type.name === 'UIEdgeInsets') {
    return matchers.UIEdgeInsets();
  } else if (type.name === 'Class') {
    return matchers.Class();
  } else if (type.name === 'dispatch_block_t') {
    return matchers.dispatch_block_t();
  } else {
    return matchers.unmatchedType();
  }
}

export function isNSObject(type: ObjC.Type): boolean {
  const returnFalse = () => false;

  return matchType(
    {
      id: returnFalse,
      NSObject: () => true,
      BOOL: returnFalse,
      NSInteger: returnFalse,
      NSUInteger: returnFalse,
      double: returnFalse,
      float: returnFalse,
      CGFloat: returnFalse,
      NSTimeInterval: returnFalse,
      uintptr_t: returnFalse,
      uint32_t: returnFalse,
      uint64_t: returnFalse,
      int32_t: returnFalse,
      int64_t: returnFalse,
      SEL: returnFalse,
      NSRange: returnFalse,
      CGRect: returnFalse,
      CGPoint: returnFalse,
      CGSize: returnFalse,
      UIEdgeInsets: returnFalse,
      Class: returnFalse,
      dispatch_block_t: returnFalse,
      unmatchedType: returnFalse,
    },
    type,
  );
}
