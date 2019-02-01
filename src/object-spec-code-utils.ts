/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Maybe from './maybe';
import * as ObjC from './objc';
import * as ObjCTypeUtils from './objc-type-utils';
import * as StringUtils from './string-utils';
import * as ObjectSpec from './object-spec';

function allocationAndInvocationCanBeOneForAttribute(
  typeName: string,
  attributes: ObjectSpec.Attribute[],
): boolean {
  return attributes.length == 0;
}

function allocationPartOfConstructorInvocationForTypeName(
  typeName: string,
): string {
  return typeName + ' alloc';
}

function invocationPartForAttribute(
  valueGenerator: (attribute: ObjectSpec.Attribute) => string,
  attribute: ObjectSpec.Attribute,
): string {
  return attribute.name + ':' + valueGenerator(attribute);
}

function invocationPartOfConstructorInvocationForAttributes(
  attributes: ObjectSpec.Attribute[],
  valueGenerator: (attribute: ObjectSpec.Attribute) => string,
): string {
  if (attributes.length > 0) {
    return (
      'initWith' +
      StringUtils.capitalize(
        attributes
          .map(invocationPartForAttribute.bind(null, valueGenerator))
          .join(' '),
      )
    );
  } else {
    return 'init';
  }
}

export function methodInvocationForConstructor(
  objectType: ObjectSpec.Type,
  valueGenerator: (attribute: ObjectSpec.Attribute) => string,
): string {
  if (
    allocationAndInvocationCanBeOneForAttribute(
      objectType.typeName,
      objectType.attributes,
    )
  ) {
    return '[' + objectType.typeName + ' new]';
  }

  const allocationPart = allocationPartOfConstructorInvocationForTypeName(
    objectType.typeName,
  );
  const invocationPart = invocationPartOfConstructorInvocationForAttributes(
    objectType.attributes,
    valueGenerator,
  );
  return '[[' + allocationPart + '] ' + invocationPart + ']';
}

export function ivarForAttribute(attribute: ObjectSpec.Attribute): string {
  return '_' + attribute.name;
}

function typeForUnderlyingType(underlyingType: string): ObjC.Type {
  return {
    name: underlyingType,
    reference: underlyingType === 'NSObject' ? 'NSObject*' : underlyingType,
  };
}

function propertyModifierForCopyable(
  supportsValueSemantics: boolean,
): ObjC.PropertyModifier {
  if (supportsValueSemantics) {
    return ObjC.PropertyModifier.Copy();
  } else {
    return ObjC.PropertyModifier.Assign();
  }
}

export function computeTypeOfAttribute(
  attribute: ObjectSpec.Attribute,
): ObjC.Type {
  return Maybe.match(
    typeForUnderlyingType,
    function(): ObjC.Type {
      return {
        name: attribute.type.name,
        reference: attribute.type.reference,
      };
    },
    attribute.type.underlyingType,
  );
}

export function propertyOwnershipModifierForAttribute(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): ObjC.PropertyModifier {
  const type = computeTypeOfAttribute(attribute);
  if (type === null) {
    return ObjC.PropertyModifier.Assign();
  }
  return ObjCTypeUtils.matchType(
    {
      id: function() {
        return Maybe.match(
          function(protocol) {
            return ObjC.PropertyModifier.Assign();
          },
          function() {
            return propertyModifierForCopyable(supportsValueSemantics);
          },
          attribute.type.conformingProtocol,
        );
      },
      NSObject: function() {
        return propertyModifierForCopyable(supportsValueSemantics);
      },
      BOOL: function() {
        return ObjC.PropertyModifier.Assign();
      },
      NSInteger: function() {
        return ObjC.PropertyModifier.Assign();
      },
      NSUInteger: function() {
        return ObjC.PropertyModifier.Assign();
      },
      double: function() {
        return ObjC.PropertyModifier.Assign();
      },
      float: function() {
        return ObjC.PropertyModifier.Assign();
      },
      CGFloat: function() {
        return ObjC.PropertyModifier.Assign();
      },
      NSTimeInterval: function() {
        return ObjC.PropertyModifier.Assign();
      },
      uintptr_t: function() {
        return ObjC.PropertyModifier.Assign();
      },
      uint32_t: function() {
        return ObjC.PropertyModifier.Assign();
      },
      uint64_t: function() {
        return ObjC.PropertyModifier.Assign();
      },
      int32_t: function() {
        return ObjC.PropertyModifier.Assign();
      },
      int64_t: function() {
        return ObjC.PropertyModifier.Assign();
      },
      SEL: function() {
        return ObjC.PropertyModifier.Assign();
      },
      NSRange: function() {
        return ObjC.PropertyModifier.Assign();
      },
      CGRect: function() {
        return ObjC.PropertyModifier.Assign();
      },
      CGPoint: function() {
        return ObjC.PropertyModifier.Assign();
      },
      CGSize: function() {
        return ObjC.PropertyModifier.Assign();
      },
      UIEdgeInsets: function() {
        return ObjC.PropertyModifier.Assign();
      },
      Class: function() {
        return ObjC.PropertyModifier.UnsafeUnretained();
      },
      dispatch_block_t: function() {
        return propertyModifierForCopyable(supportsValueSemantics);
      },
      unmatchedType: function() {
        return null;
      },
    },
    type,
  );
}

export function shouldCopyIncomingValueForAttribute(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): boolean {
  if (attribute.annotations['copy'] !== undefined) {
    return true;
  }
  const modifier = propertyOwnershipModifierForAttribute(
    supportsValueSemantics,
    attribute,
  );
  if (modifier === null) {
    return false;
  }
  return modifier.match(
    function assign() {
      return false;
    },
    function atomic() {
      return false;
    },
    function copy() {
      return true;
    },
    function nonatomic() {
      return false;
    },
    function nonnull() {
      return false;
    },
    function nullable() {
      return false;
    },
    function readonly() {
      return false;
    },
    function readwrite() {
      return false;
    },
    function strong() {
      return false;
    },
    function weak() {
      return false;
    },
    function unsafeUnretained() {
      return false;
    },
  );
}
