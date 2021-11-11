/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

enum NullabilityType {
  inherited,
  nonnull,
  nullable,
}

export class Nullability {
  private nullabilityType: NullabilityType;

  constructor(type: NullabilityType) {
    this.nullabilityType = type;
  }

  static Inherited() {
    return new Nullability(NullabilityType.inherited);
  }

  static Nonnull() {
    return new Nullability(NullabilityType.nonnull);
  }

  static Nullable() {
    return new Nullability(NullabilityType.nullable);
  }

  match<T>(inherited: () => T, nonnull: () => T, nullable: () => T) {
    switch (this.nullabilityType) {
      case NullabilityType.inherited:
        return inherited();
      case NullabilityType.nonnull:
        return nonnull();
      case NullabilityType.nullable:
        return nullable();
    }
  }
}
