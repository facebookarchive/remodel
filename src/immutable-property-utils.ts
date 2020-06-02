/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ObjC from './objc';
import * as ObjCCommentUtils from './objc-comment-utils';
import * as ObjCNullabilityUtils from './objc-nullability-utils';
import * as ObjectSpec from './object-spec';
import * as ObjectSpecCodeUtils from './object-spec-code-utils';

function propertyModifiersForCopyingFromAttribute(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): ObjC.PropertyModifier[] {
  const type = ObjectSpecCodeUtils.propertyOwnershipModifierForAttribute(
    supportsValueSemantics,
    attribute,
  );
  if (type == null) {
    return [];
  }
  return type.match(
    function assign() {
      return [];
    },
    function atomic() {
      return [];
    },
    function copy() {
      return [ObjC.PropertyModifier.Copy()];
    },
    function nonatomic() {
      return [];
    },
    function nonnull() {
      return [];
    },
    function nullable() {
      return [];
    },
    function readonly() {
      return [];
    },
    function readwrite() {
      return [];
    },
    function setter() {
      return [];
    },
    function strong() {
      return [];
    },
    function weak() {
      return [];
    },
    function unsafeUnretained() {
      return [ObjC.PropertyModifier.UnsafeUnretained()];
    },
  );
}

export function propertyModifiersFromAttribute(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): ObjC.PropertyModifier[] {
  return ([] as ObjC.PropertyModifier[])
    .concat([
      ObjC.PropertyModifier.Nonatomic(),
      ObjC.PropertyModifier.Readonly(),
    ])
    .concat(
      propertyModifiersForCopyingFromAttribute(
        supportsValueSemantics,
        attribute,
      ),
    )
    .concat(
      ObjCNullabilityUtils.propertyModifiersForNullability(
        attribute.nullability,
      ),
    );
}

export function propertyFromAttribute(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): ObjC.Property {
  return {
    comments: ObjCCommentUtils.commentsAsBlockFromStringArray(
      attribute.comments,
    ),
    modifiers: propertyModifiersFromAttribute(
      supportsValueSemantics,
      attribute,
    ),
    name: attribute.name,
    returnType: {
      name: attribute.type.name,
      reference: attribute.type.reference,
    },
    access: ObjC.PropertyAccess.Public(),
  };
}
