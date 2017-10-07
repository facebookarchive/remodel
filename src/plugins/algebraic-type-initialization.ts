/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import AlgebraicType = require('../algebraic-type');
import AlgebraicTypeUtils = require('../algebraic-type-utils');
import Code = require('../code');
import Error = require('../error');
import FileWriter = require('../file-writer');
import FunctionUtils = require('../function-utils');
import List = require('../list');
import Map = require('../map');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjCImportUtils = require('../objc-import-utils');
import ObjCNullabilityUtils = require('../objc-nullability-utils');
import ObjectGeneration = require('../object-generation');
import StringUtils = require('../string-utils');

const PUBLIC_FOUNDATION_IMPORT:ObjC.Import = {
  library:Maybe.Just('Foundation'),
  file:'Foundation.h',
  isPublic:true
};

function nameOfObjectWithinInitializer():string {
  return 'object';
}

function nameOfKeywordParameterForAttribute(attribute:AlgebraicType.SubtypeAttribute):string {
  return attribute.name;
}

function internalValueSettingCodeForAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):string {
  return nameOfObjectWithinInitializer() + '->' + AlgebraicTypeUtils.valueAccessorForInternalPropertyForAttribute(subtype, attribute) + ' = ' + nameOfKeywordParameterForAttribute(attribute) + ';';
}

function keywordArgumentFromAttribute(attribute:AlgebraicType.SubtypeAttribute):Maybe.Maybe<ObjC.KeywordArgument> {
  return Maybe.Just({
    name: nameOfKeywordParameterForAttribute(attribute),
    modifiers: ObjCNullabilityUtils.keywordArgumentModifiersForNullability(attribute.nullability),
    type: {
      name:attribute.type.name,
      reference:attribute.type.reference
    }
  });
}

function firstInitializerKeyword(subtype:AlgebraicType.NamedAttributeCollectionSubtype, attribute:AlgebraicType.SubtypeAttribute):ObjC.Keyword {
  return {
    argument: keywordArgumentFromAttribute(attribute),
    name: StringUtils.lowercased(subtype.name) + 'With' + StringUtils.capitalize(attribute.name)
  };
}

function attributeToKeyword(attribute:AlgebraicType.SubtypeAttribute):ObjC.Keyword {
  return {
    argument:keywordArgumentFromAttribute(attribute),
    name: attribute.name
  };
}

function keywordsForNamedAttributeSubtype(subtype:AlgebraicType.NamedAttributeCollectionSubtype):ObjC.Keyword[] {
  if (subtype.attributes.length > 0) {
    return [FunctionUtils.pApplyf2(subtype, firstInitializerKeyword)(subtype.attributes[0])].concat(subtype.attributes.slice(1).map(attributeToKeyword));
  } else {
    return [
      {
      name: StringUtils.lowercased(subtype.name),
      argument: Maybe.Nothing<ObjC.KeywordArgument>()
      }
    ];
  }
}

function keywordsForSubtype(subtype:AlgebraicType.Subtype):ObjC.Keyword[] {
  return subtype.match(
    function(namedAttributeCollectionSubtype:AlgebraicType.NamedAttributeCollectionSubtype) {
      return keywordsForNamedAttributeSubtype(namedAttributeCollectionSubtype);
    },
    function(attribute:AlgebraicType.SubtypeAttribute) {
      return [{
        argument: keywordArgumentFromAttribute(attribute),
        name: StringUtils.lowercased(attribute.name)
      }];
    });
}

function initializationClassMethodForSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):ObjC.Method {
  const openingCode:string[] = [
    algebraicType.name + ' *' + nameOfObjectWithinInitializer() + ' = [[' + algebraicType.name + ' alloc] init];',
    nameOfObjectWithinInitializer() + '->' + AlgebraicTypeUtils.valueAccessorForInternalPropertyStoringSubtype() + ' = ' + AlgebraicTypeUtils.EnumerationValueNameForSubtype(algebraicType, subtype) + ';'
  ];
  const setterStatements:string[] = AlgebraicTypeUtils.attributesFromSubtype(subtype).map(FunctionUtils.pApplyf2(subtype, internalValueSettingCodeForAttribute));

  return {
    belongsToProtocol:Maybe.Nothing<string>(),
    code: openingCode.concat(setterStatements).concat('return object;'),
    comments:[],
    compilerAttributes:[],
    keywords: keywordsForSubtype(subtype),
    returnType: Maybe.Just<ObjC.Type>({
      name: 'instancetype',
      reference: 'instancetype'
    })
  };
}

function internalImportForFileWithName(name:string):ObjC.Import {
  return {
    library:Maybe.Nothing<string>(),
    file: name + '.h',
    isPublic:false
  };
}

function internalPropertyForEnumeration(algebraicType:AlgebraicType.Type):ObjC.Property {
  const enumerationName:string = AlgebraicTypeUtils.EnumerationNameForAlgebraicType(algebraicType);
  return {
    name:AlgebraicTypeUtils.nameForInternalPropertyStoringSubtype(),
    comments: [],
    returnType: {
      name:enumerationName,
      reference:enumerationName
    },
    modifiers:[],
    access: ObjC.PropertyAccess.Private()
  };
}

function internalPropertyFromAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):ObjC.Property {
  return {
    name: AlgebraicTypeUtils.nameOfInternalPropertyForAttribute(subtype, attribute),
    comments: [],
    returnType: {
      name:attribute.type.name,
      reference:attribute.type.reference
    },
    modifiers:[],
    access: ObjC.PropertyAccess.Private()
  };
}

function internalPropertiesForImplementationOfAlgebraicType(algebraicType:AlgebraicType.Type):ObjC.Property[] {
  const enumerationProperty:ObjC.Property = internalPropertyForEnumeration(algebraicType);
  const attributeProperties:ObjC.Property[] = AlgebraicTypeUtils.mapAttributesWithSubtypeFromSubtypes(algebraicType.subtypes, internalPropertyFromAttribute);
  return [enumerationProperty].concat(attributeProperties);
}

function isImportRequiredForTypeLookup(algebraicTypeName:string, typeLookup:ObjectGeneration.TypeLookup):boolean {
  return !isForwardDeclarationRequiredForTypeLookup(algebraicTypeName, typeLookup);
}

function isImportRequiredForAttribute(typeLookups:ObjectGeneration.TypeLookup[], attribute:AlgebraicType.SubtypeAttribute):boolean {
  return ObjCImportUtils.shouldIncludeImportForType(typeLookups, attribute.type.name);
}

function importForAttribute(objectLibrary:Maybe.Maybe<string>, isPublic:boolean, attribute:AlgebraicType.SubtypeAttribute):ObjC.Import {
  const builtInImportMaybe:Maybe.Maybe<ObjC.Import> = ObjCImportUtils.typeDefinitionImportForKnownSystemType(attribute.type.name);

  return Maybe.match(
    function(builtInImport:ObjC.Import) {
      return builtInImport;
    },
    function() {
      const requiresPublicImport = isPublic || ObjCImportUtils.requiresPublicImportForType(attribute.type.name, AlgebraicTypeUtils.computeTypeOfAttribute(attribute));
      return {
        library: ObjCImportUtils.libraryForImport(attribute.type.libraryTypeIsDefinedIn, objectLibrary),
        file: ObjCImportUtils.fileForImport(attribute.type.fileTypeIsDefinedIn, attribute.type.name),
        isPublic: requiresPublicImport
      };
    }, builtInImportMaybe);
}

function shouldForwardDeclareAttribute(algebraicTypeName:string, makePublicImports:boolean, attribute:AlgebraicType.SubtypeAttribute):boolean {
  const declaringPublicAttributes = !makePublicImports && ObjCImportUtils.canForwardDeclareTypeForAttribute(attribute);
  const attributeTypeReferencesObjectType = algebraicTypeName == attribute.type.name;
  return declaringPublicAttributes || attributeTypeReferencesObjectType;
}

function forwardDeclarationForAttribute(attribute:AlgebraicType.SubtypeAttribute): ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(attribute.type.name);
}

function isForwardDeclarationRequiredForTypeLookup(algebraicTypeName:string, typeLookup:ObjectGeneration.TypeLookup):boolean {
  return typeLookup.name === algebraicTypeName;
}

function forwardDeclarationForTypeLookup(typeLookup:ObjectGeneration.TypeLookup):ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(typeLookup.name);
}

function enumerationForSubtypesOfAlgebraicType(algebraicType:AlgebraicType.Type):ObjC.Enumeration {
  return {
    name: AlgebraicTypeUtils.EnumerationNameForAlgebraicType(algebraicType),
    underlyingType: 'NSUInteger',
    values: algebraicType.subtypes.map(FunctionUtils.pApplyf2(algebraicType, AlgebraicTypeUtils.EnumerationValueNameForSubtype)),
    isPublic: false,
    comments: []
  };
}

interface ValidationErrorReductionTracker {
  errors:List.List<Error.Error>;
  seenSubtypeNames:Map.Map<string, string>;
}

function buildAlgebraicTypeValidationErrors(soFar:ValidationErrorReductionTracker, subtype:AlgebraicType.Subtype):ValidationErrorReductionTracker {
  const subtypeName:string = AlgebraicTypeUtils.subtypeNameFromSubtype(subtype);
  if (Map.containsKey(subtypeName, soFar.seenSubtypeNames)) {
    const error:Error.Error = Error.Error('Algebraic types cannot have two subtypes with the same name, but found two or more subtypes with the name ' + subtypeName);
    return {
      errors:List.cons(error, soFar.errors),
      seenSubtypeNames:soFar.seenSubtypeNames
    };
  } else {
    return {
      errors:soFar.errors,
      seenSubtypeNames:Map.insert(subtypeName, subtypeName, soFar.seenSubtypeNames)
    };
  }
}

export function createAlgebraicTypePlugin():AlgebraicType.Plugin {
  return {
    additionalFiles: function(algebraicType:AlgebraicType.Type):Code.File[] {
      return [];
    },
    blockTypes: function(algebraicType:AlgebraicType.Type):ObjC.BlockType[] {
      return [];
    },
    classMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      return algebraicType.subtypes.map(FunctionUtils.pApplyf2(algebraicType, initializationClassMethodForSubtype));
    },
    enumerations: function(algebraicType:AlgebraicType.Type):ObjC.Enumeration[] {
      return [enumerationForSubtypesOfAlgebraicType(algebraicType)];
    },
    fileTransformation: function(request:FileWriter.Request):FileWriter.Request {
      return request;
    },
    fileType: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(algebraicType:AlgebraicType.Type):ObjC.ForwardDeclaration[] {
      const makePublicImports = algebraicType.includes.indexOf('UseForwardDeclarations') === -1;
      const attributeForwardDeclarations = AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes)
                                                             .filter(FunctionUtils.pApply2f3(algebraicType.name, makePublicImports, shouldForwardDeclareAttribute))
                                                             .map(forwardDeclarationForAttribute);
      const typeLookupForwardDeclarations = algebraicType.typeLookups.filter(FunctionUtils.pApplyf2(algebraicType.name, isForwardDeclarationRequiredForTypeLookup))
                                                                     .map(forwardDeclarationForTypeLookup);
      return [].concat(attributeForwardDeclarations).concat(typeLookupForwardDeclarations);
    },
    functions: function(algebraicType:AlgebraicType.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(algebraicType:AlgebraicType.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(algebraicType:AlgebraicType.Type):ObjC.Protocol[] {
      return [];
    },
    imports: function imports(algebraicType:AlgebraicType.Type):ObjC.Import[] {
      const baseImports:ObjC.Import[] = [
        PUBLIC_FOUNDATION_IMPORT,
        internalImportForFileWithName(algebraicType.name)
      ];

      const makePublicImports = algebraicType.includes.indexOf('UseForwardDeclarations') === -1;
      const typeLookupImports = algebraicType.typeLookups.filter(FunctionUtils.pApplyf2(algebraicType.name, isImportRequiredForTypeLookup))
                                                         .map(FunctionUtils.pApply2f3(algebraicType.libraryName, makePublicImports, ObjCImportUtils.importForTypeLookup));
      const attributeImports:ObjC.Import[] = AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes)
                                                             .filter(FunctionUtils.pApplyf2(algebraicType.typeLookups, isImportRequiredForAttribute))
                                                             .map(FunctionUtils.pApply2f3(algebraicType.libraryName, makePublicImports, importForAttribute));
      return baseImports.concat(typeLookupImports).concat(attributeImports);
    },
    instanceMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      return [];
    },
    internalProperties: function(algebraicType:AlgebraicType.Type):ObjC.Property[] {
      return internalPropertiesForImplementationOfAlgebraicType(algebraicType);
    },
    requiredIncludesToRun: ['AlgebraicTypeInitialization'],
    staticConstants: function(algebraicType:AlgebraicType.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(algebraicType:AlgebraicType.Type):Error.Error[] {
      const initialReductionTracker:ValidationErrorReductionTracker = {
        errors: List.of<Error.Error>(),
        seenSubtypeNames: Map.Empty<string, string>()
      };
      return List.toArray(algebraicType.subtypes.reduce(buildAlgebraicTypeValidationErrors, initialReductionTracker).errors);
    },
    nullability: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    }
  };
}
