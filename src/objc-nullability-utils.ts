/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as CLangCommon from './clang-common';
import * as ObjC from './objc';
import * as ObjCTypeUtils from './objc-type-utils';

export function keywordArgumentModifiersForNullability(
  nullability: CLangCommon.Nullability,
): ObjC.KeywordArgumentModifier[] {
  return nullability.match(
    function inherited() {
      return [];
    },
    function nonnull() {
      return [ObjC.KeywordArgumentModifier.Nonnull()];
    },
    function nullable() {
      return [ObjC.KeywordArgumentModifier.Nullable()];
    },
  );
}

export function propertyModifiersForNullability(
  nullability: CLangCommon.Nullability,
): ObjC.PropertyModifier[] {
  return nullability.match(
    function inherited() {
      return [];
    },
    function nonnull() {
      return [ObjC.PropertyModifier.Nonnull()];
    },
    function nullable() {
      return [ObjC.PropertyModifier.Nullable()];
    },
  );
}

export function shouldProtectFromNilValuesForNullability(
  assumeNonnull: boolean,
  nullability: CLangCommon.Nullability,
): boolean {
  return nullability.match(
    function inherited() {
      return assumeNonnull;
    },
    function nonnull() {
      return true;
    },
    function nullable() {
      return false;
    },
  );
}

export function nullabilityRequiresNonnullProtection(
  assumeNonnull: boolean,
  attributeNullabilities: CLangCommon.Nullability[],
): boolean {
  return attributeNullabilities.some((nullability) =>
    shouldProtectFromNilValuesForNullability(assumeNonnull, nullability),
  );
}

export function canAssertExistenceForType(type: ObjC.Type): boolean {
  return ObjCTypeUtils.matchType(
    {
      id: function () {
        return true;
      },
      NSObject: function () {
        return true;
      },
      BOOL: function () {
        return false;
      },
      NSInteger: function () {
        return false;
      },
      NSUInteger: function () {
        return false;
      },
      double: function () {
        return false;
      },
      float: function () {
        return false;
      },
      CGFloat: function () {
        return false;
      },
      NSTimeInterval: function () {
        return false;
      },
      uintptr_t: function () {
        return false;
      },
      uint32_t: function () {
        return false;
      },
      uint64_t: function () {
        return false;
      },
      int32_t: function () {
        return false;
      },
      int64_t: function () {
        return false;
      },
      SEL: function () {
        return false;
      },
      NSRange: function () {
        return false;
      },
      CGRect: function () {
        return false;
      },
      CGPoint: function () {
        return false;
      },
      CGSize: function () {
        return false;
      },
      UIEdgeInsets: function () {
        return false;
      },
      Class: function () {
        return true;
      },
      dispatch_block_t: function () {
        return true;
      },
      unmatchedType: function () {
        return false;
      },
    },
    type,
  );
}

export function canBeNullable(type: ObjC.Type): boolean {
  /** The first clause handles known types, the second clause handles custom
   * pointer types, and the last clause accounts for protocols on id types. */
  return (
    ObjCTypeUtils.isObject(type) ||
    type.reference.indexOf('*') !== -1 ||
    type.reference.startsWith('id<')
  );
}
