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
import FileWriter = require('../file-writer');
import FunctionUtils = require('../function-utils');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjCImportUtils = require('../objc-import-utils');
import ObjCNullabilityUtils = require('../objc-nullability-utils');
import ObjCTypeUtils = require('../objc-type-utils');
import ObjectGeneration = require('../object-generation');
import StringUtils = require('../string-utils');
import ValueObject = require('../value-object');
import ValueObjectUtils = require('../value-object-utils');
import ValueObjectCodeUtils = require('../value-object-code-utils');

function nameOfBuilderForValueTypeWithName(valueTypeName: string):string {
  return valueTypeName + 'Builder';
}

function shortNameOfObjectToBuildForValueTypeWithName(valueTypeName: string):string {
  return StringUtils.lowercased(StringUtils.stringRemovingCapitalizedPrefix(valueTypeName));
}

function builderClassMethodForValueType(valueType:ValueObject.Type):ObjC.Method {
  return {
    belongsToProtocol:Maybe.Nothing<string>(),
    code:[
      'return [[' + nameOfBuilderForValueTypeWithName(valueType.typeName) + ' alloc] init];'
    ],
    comments:[],
    keywords: [
      {
        name: shortNameOfObjectToBuildForValueTypeWithName(valueType.typeName),
        argument:Maybe.Nothing<ObjC.KeywordArgument>()
      }
    ],
    returnType: Maybe.Just({
      name:'instancetype',
      reference:'instancetype'
    })
  };
}

function keywordArgumentNameForBuilderFromExistingObjectClassMethodForValueType(valueType:ValueObject.Type):string {
  return 'existing' + StringUtils.capitalize(shortNameOfObjectToBuildForValueTypeWithName(valueType.typeName));
}

function openingBrace():string {
  return '[';
}

function indentationForItemAtIndexWithOffset(offset:number):(index:number) => string {
  return function(index:number):string {
    const indentation = offset - index;
    return StringUtils.stringContainingSpaces(indentation > 0 ? indentation : 0);
  };
}

function toWithInvocationCallForBuilderFromExistingObjectClassMethodForAttribute(indentationProvider:(index:number) => string, existingObjectName:string, soFar:string[], attribute:ValueObject.Attribute, index:number, array:ValueObject.Attribute[]):string[] {
  return soFar.concat(indentationProvider(index) + keywordNameForAttribute(attribute) + ':' + existingObjectName + '.' + attribute.name + ']');
}

function stringsWithLastItemContainingStringAtEnd(strings:string[], stringToIncludeAtEndOfLastString:string):string[] {
  const updatedStrings:string[] = strings.concat();
  updatedStrings[updatedStrings.length - 1] = updatedStrings[updatedStrings.length - 1] + stringToIncludeAtEndOfLastString;
  return updatedStrings;
}

function codeForBuilderFromExistingObjectClassMethodForValueType(valueType:ValueObject.Type):string[] {
  const returnOpening:string = 'return ';
  const openingBracesForWithMethodInvocations:string[] = valueType.attributes.map(openingBrace);
  const builderCreationCall:string = '[' + nameOfBuilderForValueTypeWithName(valueType.typeName) + ' ' + shortNameOfObjectToBuildForValueTypeWithName(valueType.typeName) + ']';
  const openingLine:string = returnOpening + openingBracesForWithMethodInvocations.join('') + builderCreationCall;

  const indentationProvider:(index:number) => string = indentationForItemAtIndexWithOffset(returnOpening.length + openingBracesForWithMethodInvocations.length);
  const existingObjectName:string = keywordArgumentNameForBuilderFromExistingObjectClassMethodForValueType(valueType);
  const linesForBuildingValuesIntoBuilder:string[] = valueType.attributes.reduce(toWithInvocationCallForBuilderFromExistingObjectClassMethodForAttribute.bind(null, indentationProvider, existingObjectName), []);

  const code:string[] = [openingLine].concat(linesForBuildingValuesIntoBuilder);
  return stringsWithLastItemContainingStringAtEnd(code, ';');
}

function builderFromExistingObjectClassMethodForValueType(valueType:ValueObject.Type):ObjC.Method {
  return {
    belongsToProtocol:Maybe.Just('NSObject'),
    code: codeForBuilderFromExistingObjectClassMethodForValueType(valueType),
    comments:[],
    keywords: [
      {
        name: shortNameOfObjectToBuildForValueTypeWithName(valueType.typeName) + 'FromExisting' + StringUtils.capitalize(shortNameOfObjectToBuildForValueTypeWithName(valueType.typeName)),
        argument:Maybe.Just<ObjC.KeywordArgument>({
          name: keywordArgumentNameForBuilderFromExistingObjectClassMethodForValueType(valueType),
          modifiers: [],
          type: {
            name: valueType.typeName,
            reference: ValueObjectUtils.typeReferenceForValueTypeWithName(valueType.typeName)
          }
        })
      }
    ],
    returnType: Maybe.Just({
      name:'instancetype',
      reference:'instancetype'
    })
  };
}

function valueGeneratorForInvokingInitializerWithAttribute(attribute:ValueObject.Attribute):string {
  return ValueObjectCodeUtils.ivarForAttribute(attribute);
}

function buildObjectInstanceMethodForValueType(valueType:ValueObject.Type):ObjC.Method {
  return {
    belongsToProtocol:Maybe.Nothing<string>(),
    code:[
      'return ' + ValueObjectCodeUtils.methodInvocationForConstructor(valueType, valueGeneratorForInvokingInitializerWithAttribute) + ';'
    ],
    comments:[],
    keywords: [
      {
        name:'build',
        argument:Maybe.Nothing<ObjC.KeywordArgument>()
      }
    ],
    returnType: Maybe.Just({
      name: valueType.typeName,
      reference: ValueObjectUtils.typeReferenceForValueTypeWithName(valueType.typeName)
    })
  };
}

function keywordArgumentNameForAttribute(attribute:ValueObject.Attribute):string {
  return attribute.name;
}

function keywordNameForAttribute(attribute:ValueObject.Attribute):string {
  return 'with' + StringUtils.capitalize(keywordArgumentNameForAttribute(attribute));
}

function valueToAssignIntoInternalStateForAttribute(attribute:ValueObject.Attribute):string {
  const keywordArgumentName:string = keywordArgumentNameForAttribute(attribute);
  if (ValueObjectCodeUtils.shouldCopyIncomingValueForAttribute(attribute)) {
    return '[' + keywordArgumentName + ' copy]';
  } else {
    return keywordArgumentName;
  }
}

function withInstanceMethodForAttribute(attribute:ValueObject.Attribute):ObjC.Method {
  return {
    belongsToProtocol:Maybe.Nothing<string>(),
    code:[
      ValueObjectCodeUtils.ivarForAttribute(attribute) + ' = ' + valueToAssignIntoInternalStateForAttribute(attribute) + ';',
      'return self;'
    ],
    comments:[],
    keywords: [
      {
        name: keywordNameForAttribute(attribute),
        argument:Maybe.Just<ObjC.KeywordArgument>({
          name: keywordArgumentNameForAttribute(attribute),
          modifiers: ObjCNullabilityUtils.keywordArgumentModifiersForNullability(attribute.nullability),
          type: {
            name: attribute.type.name,
            reference: attribute.type.reference
          }
        })
      }
    ],
    returnType: Maybe.Just({
      name:'instancetype',
      reference:'instancetype'
    })
  };
}

function internalPropertyForAttribute(attribute:ValueObject.Attribute):ObjC.Property {
  return {
    name: attribute.name,
    comments: [],
    returnType: {
      name: attribute.type.name,
      reference: attribute.type.reference
    },
    modifiers: [],
    access: ObjC.PropertyAccess.Private()
  };
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

function importRequiredForTypeLookup(typeLookup:ObjectGeneration.TypeLookup):boolean {
  return !typeLookup.canForwardDeclare;
}

function canUseForwardDeclarationForTypeLookup(typeLookup:ObjectGeneration.TypeLookup):boolean {
  return typeLookup.canForwardDeclare;
}

export function importsForTypeLookups(typeLookups:ObjectGeneration.TypeLookup[], defaultLibrary:Maybe.Maybe<string>):ObjC.Import[] {
  return typeLookups.filter(importRequiredForTypeLookup)
                    .map(FunctionUtils.pApply2f3(defaultLibrary, true, ObjCImportUtils.importForTypeLookup));
}

function importsForBuilder(valueType:ValueObject.Type):ObjC.Import[] {
  const typeLookupImports:ObjC.Import[] = importsForTypeLookups(valueType.typeLookups, valueType.libraryName);

  const attributeImports:ObjC.Import[] = valueType.attributes.filter(FunctionUtils.pApplyf2(valueType.typeLookups, mustDeclareImportForAttribute))
                                                           .map(function(attribute:ValueObject.Attribute):ObjC.Import {
                                                             return importForAttribute(valueType.libraryName, false, attribute);
                                                           });

  return [
    {file:'Foundation.h', isPublic:true, library:Maybe.Just('Foundation')},
    {file:valueType.typeName + '.h', isPublic:false, library:valueType.libraryName},
    {file:nameOfBuilderForValueTypeWithName(valueType.typeName) + '.h', isPublic:false, library:Maybe.Nothing<string>()}
  ].concat(typeLookupImports).concat(attributeImports);
}

function mustDeclareImportForAttribute(typeLookups:ObjectGeneration.TypeLookup[], attribute:ValueObject.Attribute):boolean {
  return ObjCImportUtils.shouldIncludeImportForType(typeLookups, attribute.type.name);
}

function forwardDeclarationsForBuilder(valueType:ValueObject.Type):ObjC.ForwardDeclaration[] {
  const typeLookupForwardDeclarations:ObjC.ForwardDeclaration[] = valueType.typeLookups.filter(canUseForwardDeclarationForTypeLookup)
                                                                                     .map(function (typeLookup:ObjectGeneration.TypeLookup):ObjC.ForwardDeclaration {
                                                                                       return ObjC.ForwardDeclaration.ForwardClassDeclaration(typeLookup.name);
                                                                                     });

  const attributeDeclarations:ObjC.ForwardDeclaration[] = valueType.attributes.filter(ObjCImportUtils.canForwardDeclareTypeForAttribute).map(function(attribute:ValueObject.Attribute):ObjC.ForwardDeclaration {
    return ObjC.ForwardDeclaration.ForwardClassDeclaration(attribute.type.name);
  });

  return [
    ObjC.ForwardDeclaration.ForwardClassDeclaration(valueType.typeName)
  ].concat(typeLookupForwardDeclarations).concat(attributeDeclarations);
}

function builderFileForValueType(valueType:ValueObject.Type):Code.File {
  return {
    name: nameOfBuilderForValueTypeWithName(valueType.typeName),
    type: Code.FileType.ObjectiveC(),
    imports:importsForBuilder(valueType),
    forwardDeclarations:forwardDeclarationsForBuilder(valueType),
    comments:[],
    enumerations: [],
    blockTypes:[],
    staticConstants: [],
    functions:[],
    classes: [
      {
        baseClassName:'NSObject',
        classMethods: [
          builderClassMethodForValueType(valueType),
          builderFromExistingObjectClassMethodForValueType(valueType)
        ],
        comments: [ ],
        instanceMethods: [buildObjectInstanceMethodForValueType(valueType)].concat(valueType.attributes.map(withInstanceMethodForAttribute)),
        name: nameOfBuilderForValueTypeWithName(valueType.typeName),
        properties: [],
        internalProperties:valueType.attributes.map(internalPropertyForAttribute),
        implementedProtocols: []
      }
    ],
    diagnosticIgnores:[],
    namespaces: []
  };
}

export function createPlugin():ValueObject.Plugin {
  return {
    additionalFiles: function(valueType:ValueObject.Type):Code.File[] {
      return [
        builderFileForValueType(valueType)
      ];
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
      return [];
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
      return [];
    },
    instanceMethods: function(valueType:ValueObject.Type):ObjC.Method[] {
      return [];
    },
    properties: function(valueType:ValueObject.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun:['RMBuilder'],
    staticConstants: function(valueType:ValueObject.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(valueType:ValueObject.Type):Error.Error[] {
      return [];
    }
  };
}
