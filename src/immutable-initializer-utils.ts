/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Maybe from './maybe';
import * as StringUtils from './string-utils';
import * as ObjC from './objc';
import * as ObjCCommentUtils from './objc-comment-utils';
import * as ObjCNullabilityUtils from './objc-nullability-utils';
import * as ObjectSpec from './object-spec';
import * as ObjectSpecUtils from './object-spec-utils';
import * as ObjectSpecCodeUtils from './object-spec-code-utils';

function keywordArgumentFromAttribute(
  attribute: ObjectSpec.Attribute,
): Maybe.Maybe<ObjC.KeywordArgument> {
  return Maybe.Just({
    name: attribute.name,
    modifiers: ObjCNullabilityUtils.keywordArgumentModifiersForNullability(
      attribute.nullability,
    ),
    type: {
      name: attribute.type.name,
      reference: attribute.type.reference,
    },
  });
}

function firstInitializerKeyword(
  attribute: ObjectSpec.Attribute,
): ObjC.Keyword {
  return {
    argument: keywordArgumentFromAttribute(attribute),
    name: 'initWith' + StringUtils.capitalize(attribute.name),
  };
}

function attributeToKeyword(attribute: ObjectSpec.Attribute): ObjC.Keyword {
  return {
    argument: keywordArgumentFromAttribute(attribute),
    name: attribute.name,
  };
}

function valueOrCopy(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): string {
  if (
    ObjectSpecCodeUtils.shouldCopyIncomingValueForAttribute(
      supportsValueSemantics,
      attribute,
    )
  ) {
    return '[' + attribute.name + ' copy];';
  } else {
    return attribute.name + ';';
  }
}

function toIvarAssignment(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): string {
  return (
    '_' +
    attribute.name +
    ' = ' +
    valueOrCopy(supportsValueSemantics, attribute)
  );
}

function canAssertExistenceForTypeOfAttribute(attribute: ObjectSpec.Attribute) {
  return ObjCNullabilityUtils.canAssertExistenceForType(
    ObjectSpecCodeUtils.computeTypeOfAttribute(attribute),
  );
}

function isRequiredAttribute(
  assumeNonnull: boolean,
  attribute: ObjectSpec.Attribute,
): boolean {
  return ObjCNullabilityUtils.shouldProtectFromNilValuesForNullability(
    assumeNonnull,
    attribute.nullability,
  );
}

function toRequiredAssertion(attribute: ObjectSpec.Attribute): string {
  return 'RMParameterAssert(' + attribute.name + ' != nil);';
}

function initializerCodeFromAttributes(
  assumeNonnull: boolean,
  supportsValueSemantics: boolean,
  attributes: ObjectSpec.Attribute[],
): string[] {
  const requiredParameterAssertions = attributes
    .filter(canAssertExistenceForTypeOfAttribute)
    .filter(attribute => isRequiredAttribute(assumeNonnull, attribute))
    .map(toRequiredAssertion);
  const opening = ['if ((self = [super init])) {'];
  const iVarAssignments = attributes
    .map(attribute => toIvarAssignment(supportsValueSemantics, attribute))
    .map(StringUtils.indent(2));
  const closing = ['}', '', 'return self;'];
  return requiredParameterAssertions
    .concat(opening)
    .concat(iVarAssignments)
    .concat(closing);
}

export function initializerFromAttributes(
  assumeNonnull: boolean,
  supportsValueSemantics: boolean,
  attributes: ObjectSpec.Attribute[],
): ObjC.Method {
  const keywords = [firstInitializerKeyword(attributes[0])].concat(
    attributes.slice(1).map(attributeToKeyword),
  );
  return {
    preprocessors: [],
    belongsToProtocol: Maybe.Nothing<string>(),
    code: initializerCodeFromAttributes(
      assumeNonnull,
      supportsValueSemantics,
      attributes,
    ),
    comments: ObjCCommentUtils.commentsAsBlockFromStringArray(
      ObjCCommentUtils.paramCommentsFromAttributes(attributes),
    ),
    compilerAttributes: ['NS_DESIGNATED_INITIALIZER'],
    keywords: keywords,
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'instancetype',
        reference: 'instancetype',
      }),
      modifiers: [],
    },
  };
}

export function initializerMethodsForObjectType(
  objectType: ObjectSpec.Type,
): ObjC.Method[] {
  if (objectType.attributes.length > 0) {
    const assumeNonnull: boolean =
      objectType.includes.indexOf('RMAssumeNonnull') >= 0;
    return [
      initializerFromAttributes(
        assumeNonnull,
        ObjectSpecUtils.typeSupportsValueObjectSemantics(objectType),
        objectType.attributes,
      ),
    ];
  } else {
    return [];
  }
}
