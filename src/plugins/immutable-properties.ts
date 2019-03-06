/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Code from '../code';
import * as Error from '../error';
import * as FileWriter from '../file-writer';
import * as ImmutableImportUtils from '../immutable-import-utils';
import * as ImmutableInitializerUtils from '../immutable-initializer-utils';
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjCCommentUtils from '../objc-comment-utils';
import * as ObjCNullabilityUtils from '../objc-nullability-utils';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecUtils from '../object-spec-utils';
import * as ObjectSpecCodeUtils from '../object-spec-code-utils';

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
  return []
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

function propertyFromAttribute(
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

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: function(objectType: ObjectSpec.Type): Code.File[] {
      return [];
    },
    transformBaseFile: function(objectType: ObjectSpec.Type, baseFile: Code.File): Code.File {
      return baseFile;
    },
    additionalTypes: function(objectType: ObjectSpec.Type): ObjectSpec.Type[] {
      return [];
    },
    attributes: function(objectType: ObjectSpec.Type): ObjectSpec.Attribute[] {
      return [];
    },
    classMethods: function(objectType: ObjectSpec.Type): ObjC.Method[] {
      return [];
    },
    transformFileRequest: function(
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function(
      objectType: ObjectSpec.Type,
    ): Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations:
      ImmutableImportUtils.forwardClassDeclarationsForObjectType,
    functions: function(objectType: ObjectSpec.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function(objectType: ObjectSpec.Type): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(
      objectType: ObjectSpec.Type,
    ): ObjC.Protocol[] {
      return [];
    },
    imports: ImmutableImportUtils.importsForObjectType,
    instanceMethods: ImmutableInitializerUtils.initializerMethodsForObjectType,
    macros: function(valueType: ObjectSpec.Type): ObjC.Macro[] {
      return [];
    },
    properties: function(objectType: ObjectSpec.Type): ObjC.Property[] {
      const supportsValueSemantics: boolean = ObjectSpecUtils.typeSupportsValueObjectSemantics(
        objectType,
      );
      return objectType.attributes.map(attribute =>
        propertyFromAttribute(supportsValueSemantics, attribute),
      );
    },
    requiredIncludesToRun: ['RMImmutableProperties'],
    staticConstants: function(objectType: ObjectSpec.Type): ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType: ObjectSpec.Type): Error.Error[] {
      return [];
    },
    nullability: function(
      objectType: ObjectSpec.Type,
    ): Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(objectType: ObjectSpec.Type): boolean {
      return false;
    },
  };
}
