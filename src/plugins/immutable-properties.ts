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
import ObjectSpec = require('../object-spec');
import ObjectSpecCodeUtils = require('../object-spec-code-utils');

function keywordArgumentFromAttribute(attribute:ObjectSpec.Attribute):Maybe.Maybe<ObjC.KeywordArgument> {
  return Maybe.Just({
    name:attribute.name,
    modifiers: ObjCNullabilityUtils.keywordArgumentModifiersForNullability(attribute.nullability),
    type: {
      name:attribute.type.name,
      reference:attribute.type.reference
    }
  });
}

function firstInitializerKeyword(attribute:ObjectSpec.Attribute):ObjC.Keyword {
  return {
    argument:keywordArgumentFromAttribute(attribute),
    name:'initWith' + StringUtils.capitalize(attribute.name)
  };
}

function attributeToKeyword(attribute:ObjectSpec.Attribute):ObjC.Keyword {
  return {
    argument:keywordArgumentFromAttribute(attribute),
    name: attribute.name
  };
}

function valueOrCopy(attribute:ObjectSpec.Attribute):string {
  if (ObjectSpecCodeUtils.shouldCopyIncomingValueForAttribute(attribute)) {
    return '[' + attribute.name + ' copy];';
  } else {
    return attribute.name + ';';
  }
}

function toIvarAssignment(attribute:ObjectSpec.Attribute):string {
  return '_' + attribute.name + ' = ' + valueOrCopy(attribute);
}

function initializerCodeFromAttributes(attributes:ObjectSpec.Attribute[]):string[] {
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

function initializerFromAttributes(attributes:ObjectSpec.Attribute[]):ObjC.Method {
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

function propertyModifiersForCopyingFromAttribute(attribute: ObjectSpec.Attribute): ObjC.PropertyModifier[] {
  const type = ObjectSpecCodeUtils.propertyOwnershipModifierForAttribute(attribute);
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

export function propertyModifiersFromAttribute(attribute:ObjectSpec.Attribute):ObjC.PropertyModifier[] {
  return [].concat([ObjC.PropertyModifier.Nonatomic(), ObjC.PropertyModifier.Readonly()])
           .concat(propertyModifiersForCopyingFromAttribute(attribute))
           .concat(ObjCNullabilityUtils.propertyModifiersForNullability(attribute.nullability));
}

function propertyFromAttribute(attribute:ObjectSpec.Attribute):ObjC.Property {
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

function isImportRequiredForAttribute(typeLookups:ObjectGeneration.TypeLookup[], attribute:ObjectSpec.Attribute):boolean {
  return ObjCImportUtils.shouldIncludeImportForType(typeLookups, attribute.type.name);
}

function isImportRequiredForTypeLookup(objectType:ObjectSpec.Type, typeLookup:ObjectGeneration.TypeLookup):boolean {
  return !isForwardDeclarationRequiredForTypeLookup(objectType, typeLookup);
}

function importForAttribute(objectLibrary:Maybe.Maybe<string>, isPublic:boolean, attribute:ObjectSpec.Attribute):ObjC.Import {
  const builtInImportMaybe:Maybe.Maybe<ObjC.Import> = ObjCImportUtils.typeDefinitionImportForKnownSystemType(attribute.type.name);

  return Maybe.match(
    function(builtInImport:ObjC.Import) {
      return builtInImport;
    },
    function() {
      const requiresPublicImport = isPublic || ObjCImportUtils.requiresPublicImportForType(attribute.type.name, ObjectSpecCodeUtils.computeTypeOfAttribute(attribute));
      return {
        library: ObjCImportUtils.libraryForImport(attribute.type.libraryTypeIsDefinedIn, objectLibrary),
        file: ObjCImportUtils.fileForImport(attribute.type.fileTypeIsDefinedIn, attribute.type.name),
        isPublic: requiresPublicImport
      };
    }, builtInImportMaybe);
}

function makePublicImportsForValueType(objectType:ObjectSpec.Type):boolean {
  return objectType.includes.indexOf('UseForwardDeclarations') === -1;
}

function isForwardDeclarationRequiredForTypeLookup(objectType:ObjectSpec.Type, typeLookup:ObjectGeneration.TypeLookup):boolean {
  return typeLookup.name === objectType.typeName || !makePublicImportsForValueType(objectType);
}

function forwardDeclarationForTypeLookup(typeLookup:ObjectGeneration.TypeLookup):ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(typeLookup.name);
}

function shouldForwardDeclareAttribute(valueTypeName:string, makePublicImports:boolean, attribute:ObjectSpec.Attribute):boolean {
  const declaringPublicAttributes = !makePublicImports && ObjCImportUtils.canForwardDeclareTypeForAttribute(attribute);
  const attributeTypeReferencesObjectType = valueTypeName == attribute.type.name;
  return declaringPublicAttributes || attributeTypeReferencesObjectType;
}

function forwardDeclarationForAttribute(attribute:ObjectSpec.Attribute): ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(attribute.type.name);
}

export function createPlugin():ObjectSpec.Plugin {
  return {
    additionalFiles: function(objectType:ObjectSpec.Type):Code.File[] {
      return [];
    },
    additionalTypes: function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
      return [];
    },
    attributes: function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
      return [];
    },
    fileTransformation: function(request:FileWriter.Request):FileWriter.Request {
      return request;
    },
    fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
      const typeLookupForwardDeclarations = objectType.typeLookups.filter(FunctionUtils.pApplyf2(objectType, isForwardDeclarationRequiredForTypeLookup))
                                                                 .map(forwardDeclarationForTypeLookup);
      const attributeForwardDeclarations = objectType.attributes.filter(FunctionUtils.pApply2f3(objectType.typeName, makePublicImportsForValueType(objectType), shouldForwardDeclareAttribute))
                                                               .map(forwardDeclarationForAttribute);
      return [].concat(typeLookupForwardDeclarations).concat(attributeForwardDeclarations);
    },
    functions: function(objectType:ObjectSpec.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(objectType:ObjectSpec.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
      return [];
    },
    imports: function(objectType:ObjectSpec.Type):ObjC.Import[] {
      const baseImports = [
        {file:'Foundation.h', isPublic:true, library:Maybe.Just('Foundation')},
        {file:objectType.typeName + '.h', isPublic:false, library:Maybe.Nothing<string>() }
      ];
      const makePublicImports = objectType.includes.indexOf('UseForwardDeclarations') === -1;
      const typeLookupImports = objectType.typeLookups.filter(FunctionUtils.pApplyf2(objectType, isImportRequiredForTypeLookup))
                                                     .map(FunctionUtils.pApply2f3(objectType.libraryName, makePublicImportsForValueType(objectType), ObjCImportUtils.importForTypeLookup));
      const attributeImports = objectType.attributes.filter(FunctionUtils.pApplyf2(objectType.typeLookups, isImportRequiredForAttribute))
                                                 .map(FunctionUtils.pApply2f3(objectType.libraryName, makePublicImports, importForAttribute));
      return baseImports.concat(typeLookupImports).concat(attributeImports);
    },
    instanceMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
      if (objectType.attributes.length > 0) {
        return [initializerFromAttributes(objectType.attributes)];
      } else {
        return [];
      }
    },
    properties: function(objectType:ObjectSpec.Type):ObjC.Property[] {
      return objectType.attributes.map(propertyFromAttribute);
    },
    requiredIncludesToRun:['RMImmutableProperties'],
    staticConstants: function(objectType:ObjectSpec.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
      return [];
    },
    nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    }
  };
}
