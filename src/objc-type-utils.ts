/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ObjC from './objc';

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
  return matchTypeName(matchers, type.name);
}

/** Like matchType but allows you to pass a type name instead of an ObjC.Type. */
export function matchTypeName<T>(
  matchers: TypeMatchers<T>,
  typeName: string,
): T {
  if (typeName === 'id') {
    return matchers.id();
  } else if (typeName === 'NSObject') {
    return matchers.NSObject();
  } else if (typeName === 'BOOL') {
    return matchers.BOOL();
  } else if (typeName === 'NSInteger') {
    return matchers.NSInteger();
  } else if (typeName === 'NSUInteger') {
    return matchers.NSUInteger();
  } else if (typeName === 'double') {
    return matchers.double();
  } else if (typeName === 'float') {
    return matchers.float();
  } else if (typeName === 'CGFloat') {
    return matchers.CGFloat();
  } else if (typeName === 'NSTimeInterval') {
    return matchers.NSTimeInterval();
  } else if (typeName === 'uintptr_t') {
    return matchers.uintptr_t();
  } else if (typeName === 'uint32_t') {
    return matchers.uint32_t();
  } else if (typeName === 'uint64_t') {
    return matchers.uint64_t();
  } else if (typeName === 'int32_t') {
    return matchers.int32_t();
  } else if (typeName === 'int64_t') {
    return matchers.int64_t();
  } else if (typeName === 'SEL') {
    return matchers.SEL();
  } else if (typeName === 'NSRange') {
    return matchers.NSRange();
  } else if (typeName === 'CGRect') {
    return matchers.CGRect();
  } else if (typeName === 'CGPoint') {
    return matchers.CGPoint();
  } else if (typeName === 'CGSize') {
    return matchers.CGSize();
  } else if (typeName === 'UIEdgeInsets') {
    return matchers.UIEdgeInsets();
  } else if (typeName === 'Class') {
    return matchers.Class();
  } else if (typeName === 'dispatch_block_t') {
    return matchers.dispatch_block_t();
  } else {
    return matchers.unmatchedType();
  }
}

const returnFalse = () => false;
const returnTrue = () => true;

export function isNSObject(type: ObjC.Type): boolean {
  return matchType(
    {
      id: returnFalse,
      NSObject: returnTrue,
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

export function isObject(type: ObjC.Type): boolean {
  return matchType(
    {
      id: returnTrue,
      NSObject: returnTrue,
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
      Class: returnTrue,
      dispatch_block_t: returnTrue,
      unmatchedType: returnFalse,
    },
    type,
  );
}
