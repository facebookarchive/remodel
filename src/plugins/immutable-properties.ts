/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import Code = require('../code');
import Error = require('../error');
import FunctionUtils = require('../function-utils');
import FileWriter = require('../file-writer');
import Maybe = require('../maybe');
import StringUtils = require('../string-utils');
import ObjC = require('../objc');
import ObjCCommentUtils = require('../objc-comment-utils');
import ObjCNullabilityUtils = require('../objc-nullability-utils');
import ObjCImportUtils = require('../objc-import-utils');
import ObjectGeneration = require('../object-generation');
import ValueObject = require('../value-object');
import ValueObjectCodeUtils = require('../value-object-code-utils');

function keywordArgumentFromAttribute(attribute:ValueObject.Attribute):Maybe.Maybe<ObjC.KeywordArgument> {
  return Maybe.Just({
    name:attribute.name,
    modifiers: ObjCNullabilityUtils.keywordArgumentModifiersForNullability(attribute.nullability),
    type: {
      name:attribute.type.name,
      reference:attribute.type.reference
    }
  });
}

function firstInitializerKeyword(attribute:ValueObject.Attribute):ObjC.Keyword {
  return {
    argument:keywordArgumentFromAttribute(attribute),
    name:'initWith' + StringUtils.capitalize(attribute.name)
  };
}

function attributeToKeyword(attribute:ValueObject.Attribute):ObjC.Keyword {
  return {
    argument:keywordArgumentFromAttribute(attribute),
    name: attribute.name
  };
}

function valueOrCopy(attribute:ValueObject.Attribute):string {
  if (ValueObjectCodeUtils.shouldCopyIncomingValueForAttribute(attribute)) {
    return '[' + attribute.name + ' copy];';
  } else {
    return attribute.name + ';';
  }
}

function toIvarAssignment(attribute:ValueObject.Attribute):string {
  return '_' + attribute.name + ' = ' + valueOrCopy(attribute);
}

function initializerCodeFromAttributes(attributes:ValueObject.Attribute[]):string[] {
  const result = [
    'if ((self = [super init])) {',
  ].concat(attributes.map(toIvarAssignment).map(StringUtils.indent(2)))
   .concat([
    '}',
    '',
    'return self;'
  ]);
  return result;
}

function initializerFromAttributes(attributes:ValueObject.Attribute[]):ObjC.Method {
  const keywords = [firstInitializerKeyword(attributes[0])].concat(attributes.slice(1).map(attributeToKeyword));
  return {
    belongsToProtocol: Maybe.Nothing<string>(),
    code: initializerCodeFromAttributes(attributes),
    comments:[],
    keywords: keywords,
    returnType: Maybe.Just({
      name: 'instancetype',
      reference: 'instancetype'
    })
  };
}

function propertyModifiersForCopyingFromAttribute(attribute: ValueObject.Attribute): ObjC.PropertyModifier[] {
  const type = ValueObjectCodeUtils.propertyOwnershipModifierForAttribute(attribute);
  if (type === null) {
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
    });
}

export function propertyModifiersFromAttribute(attribute:ValueObject.Attribute):ObjC.PropertyModifier[] {
  return [].concat([ObjC.PropertyModifier.Nonatomic(), ObjC.PropertyModifier.Readonly()])
           .concat(propertyModifiersForCopyingFromAttribute(attribute))
           .concat(ObjCNullabilityUtils.propertyModifiersForNullability(attribute.nullability));
}

function propertyFromAttribute(attribute:ValueObject.Attribute):ObjC.Property {
  return {
    comments: ObjCCommentUtils.commentsAsBlockFromStringArray(attribute.comments),
    modifiers:propertyModifiersFromAttribute(attribute),
    name:attribute.name,
    returnType: {
      name:attribute.type.name,
      reference:attribute.type.reference
    },
    access: ObjC.PropertyAccess.Public()
  };
}

function isImportRequiredForAttribute(typeLookups:ObjectGeneration.TypeLookup[], attribute:ValueObject.Attribute):boolean {
  return ObjCImportUtils.shouldIncludeImportForType(typeLookups, attribute.type.name);
}

function importForAttribute(objectLibrary:Maybe.Maybe<string>, isPublic:boolean, attribute:ValueObject.Attribute):ObjC.Import {
  const builtInImportMaybe:Maybe.Maybe<ObjC.Import> = ObjCImportUtils.typeDefinitionImportForKnownSystemType(attribute.type.name);

  return Maybe.match(
    function(builtInImport:ObjC.Import) {
      return builtInImport;
    },
    function() {
      const requiresPublicImport = isPublic || ObjCImportUtils.requiresPublicImportForType(attribute.type.name, ValueObjectCodeUtils.computeTypeOfAttribute(attribute));
      return {
        library: ObjCImportUtils.libraryForImport(attribute.type.libraryTypeIsDefinedIn, objectLibrary),
        file: ObjCImportUtils.fileForImport(attribute.type.fileTypeIsDefinedIn, attribute.type.name),
        isPublic: requiresPublicImport
      };
    }, builtInImportMaybe);
}

function shouldForwardDeclareAttribute(valueTypeName:string, makePublicImports:boolean, attribute:ValueObject.Attribute):boolean {
  const declaringPublicAttributes = !makePublicImports && ObjCImportUtils.canForwardDeclareTypeForAttribute(attribute);
  const attributeTypeReferencesObjectType = valueTypeName == attribute.type.name;
  return declaringPublicAttributes || attributeTypeReferencesObjectType;
}

function forwardDeclarationForAttribute(attribute:ValueObject.Attribute): ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(attribute.type.name);
}

export function createPlugin():ValueObject.Plugin {
  return {
    additionalFiles: function(valueType:ValueObject.Type):Code.File[] {
      return [];
    },
    additionalTypes: function(valueType:ValueObject.Type):ValueObject.Type[] {
      return [];
    },
    attributes: function(valueType:ValueObject.Type):ValueObject.Attribute[] {
      return [];
    },
    fileTransformation: function(request:FileWriter.Request):FileWriter.Request {
      return request;
    },
    fileType: function(valueType:ValueObject.Type):Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(valueType:ValueObject.Type):ObjC.ForwardDeclaration[] {
      const makePublicImports = valueType.includes.indexOf('UseForwardDeclarations') === -1;
      const typeLookupForwardDeclarations = !makePublicImports ? ObjCImportUtils.forwardDeclarationsForTypeLookups(valueType.typeLookups) : [];
      const attributeForwardDeclarations = valueType.attributes.filter(FunctionUtils.pApply2f3(valueType.typeName, makePublicImports, shouldForwardDeclareAttribute))
                                                               .map(forwardDeclarationForAttribute);
      return [].concat(typeLookupForwardDeclarations).concat(attributeForwardDeclarations);
    },
    functions: function(valueType:ValueObject.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(valueType:ValueObject.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(valueType:ValueObject.Type):ObjC.Protocol[] {
      return [];
    },
    imports: function(valueType:ValueObject.Type):ObjC.Import[] {
      const baseImports = [
        {file:'Foundation.h', isPublic:true, library:Maybe.Just('Foundation')},
        {file:valueType.typeName + '.h', isPublic:false, library:Maybe.Nothing<string>() }
      ];
      const makePublicImports = valueType.includes.indexOf('UseForwardDeclarations') === -1;
      const typeLookupImports = valueType.typeLookups.map(FunctionUtils.pApply2f3(valueType.libraryName, makePublicImports, ObjCImportUtils.importForTypeLookup));
      const attributeImports = valueType.attributes.filter(FunctionUtils.pApplyf2(valueType.typeLookups, isImportRequiredForAttribute))
                                                 .map(FunctionUtils.pApply2f3(valueType.libraryName, makePublicImports, importForAttribute));
      return baseImports.concat(typeLookupImports).concat(attributeImports);
    },
    instanceMethods: function(valueType:ValueObject.Type):ObjC.Method[] {
      if (valueType.attributes.length > 0) {
        return [initializerFromAttributes(valueType.attributes)];
      } else {
        return [];
      }
    },
    properties: function(valueType:ValueObject.Type):ObjC.Property[] {
      return valueType.attributes.map(propertyFromAttribute);
    },
    requiredIncludesToRun:['RMImmutableProperties'],
    staticConstants: function(valueType:ValueObject.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(valueType:ValueObject.Type):Error.Error[] {
      return [];
    }
  };
}
