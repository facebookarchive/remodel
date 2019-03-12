/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from '../algebraic-type';
import * as AlgebraicTypeUtils from '../algebraic-type-utils';
import * as Code from '../code';
import * as Error from '../error';
import * as FileWriter from '../file-writer';
import * as List from '../list';
import * as Map from '../map';
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjCCommentUtils from '../objc-comment-utils';
import * as ObjCImportUtils from '../objc-import-utils';
import * as ObjCNullabilityUtils from '../objc-nullability-utils';
import * as ObjectGeneration from '../object-generation';
import * as StringUtils from '../string-utils';

const PUBLIC_FOUNDATION_IMPORT: ObjC.Import = {
  library: Maybe.Just('Foundation'),
  file: 'Foundation.h',
  isPublic: true,
  requiresCPlusPlus: false,
};

function nameOfObjectWithinInitializer(): string {
  return 'object';
}

function nameOfKeywordParameterForAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
): string {
  return attribute.name;
}

function internalValueSettingCodeForAttribute(
  subtype: AlgebraicType.Subtype,
  attribute: AlgebraicType.SubtypeAttribute,
): string {
  return (
    nameOfObjectWithinInitializer() +
    '->' +
    AlgebraicTypeUtils.valueAccessorForInstanceVariableForAttribute(
      subtype,
      attribute,
    ) +
    ' = ' +
    nameOfKeywordParameterForAttribute(attribute) +
    ';'
  );
}

function keywordArgumentFromAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
): Maybe.Maybe<ObjC.KeywordArgument> {
  return Maybe.Just({
    name: nameOfKeywordParameterForAttribute(attribute),
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
  subtype: AlgebraicType.NamedAttributeCollectionSubtype,
  attribute: AlgebraicType.SubtypeAttribute,
): ObjC.Keyword {
  return {
    argument: keywordArgumentFromAttribute(attribute),
    name:
      StringUtils.lowercased(subtype.name) +
      'With' +
      StringUtils.capitalize(attribute.name),
  };
}

function attributeToKeyword(
  attribute: AlgebraicType.SubtypeAttribute,
): ObjC.Keyword {
  return {
    argument: keywordArgumentFromAttribute(attribute),
    name: attribute.name,
  };
}

function keywordsForNamedAttributeSubtype(
  subtype: AlgebraicType.NamedAttributeCollectionSubtype,
): ObjC.Keyword[] {
  if (subtype.attributes.length > 0) {
    return [firstInitializerKeyword(subtype, subtype.attributes[0])].concat(
      subtype.attributes.slice(1).map(attributeToKeyword),
    );
  } else {
    return [
      {
        name: StringUtils.lowercased(subtype.name),
        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
      },
    ];
  }
}

function commentsForSubtype(subtype: AlgebraicType.Subtype): string[] {
  return subtype.match(
    function(
      namedAttributeCollectionSubtype: AlgebraicType.NamedAttributeCollectionSubtype,
    ) {
      return ObjCCommentUtils.prefixedParamCommentsFromAttributes(
        namedAttributeCollectionSubtype.comments,
        namedAttributeCollectionSubtype.attributes,
      );
    },
    function(attribute: AlgebraicType.SubtypeAttribute) {
      return attribute.comments;
    },
  );
}

export function keywordsForSubtype(
  subtype: AlgebraicType.Subtype,
): ObjC.Keyword[] {
  return subtype.match(
    function(
      namedAttributeCollectionSubtype: AlgebraicType.NamedAttributeCollectionSubtype,
    ) {
      return keywordsForNamedAttributeSubtype(namedAttributeCollectionSubtype);
    },
    function(attribute: AlgebraicType.SubtypeAttribute) {
      return [
        {
          argument: keywordArgumentFromAttribute(attribute),
          name: StringUtils.lowercased(attribute.name),
        },
      ];
    },
  );
}

function canAssertExistenceForTypeOfAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
) {
  return ObjCNullabilityUtils.canAssertExistenceForType(
    AlgebraicTypeUtils.computeTypeOfAttribute(attribute),
  );
}

function isRequiredAttribute(
  assumeNonnull: boolean,
  attribute: AlgebraicType.SubtypeAttribute,
): boolean {
  return ObjCNullabilityUtils.shouldProtectFromNilValuesForNullability(
    assumeNonnull,
    attribute.nullability,
  );
}

function toRequiredAssertion(
  attribute: AlgebraicType.SubtypeAttribute,
): string {
  return 'RMParameterAssert(' + attribute.name + ' != nil);';
}

function initializationClassMethodForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
): ObjC.Method {
  const openingCode: string[] = [
    algebraicType.name +
      ' *' +
      nameOfObjectWithinInitializer() +
      ' = [(id)self new];',
    nameOfObjectWithinInitializer() +
      '->' +
      AlgebraicTypeUtils.valueAccessorForInstanceVariableStoringSubtype() +
      ' = ' +
      AlgebraicTypeUtils.EnumerationValueNameForSubtype(
        algebraicType,
        subtype,
      ) +
      ';',
  ];
  const assumeNonnull: boolean =
    algebraicType.includes.indexOf('RMAssumeNonnull') >= 0;
  const attributes: AlgebraicType.SubtypeAttribute[] = AlgebraicTypeUtils.attributesFromSubtype(
    subtype,
  );
  const requiredParameterAssertions: string[] = attributes
    .filter(canAssertExistenceForTypeOfAttribute)
    .filter(attribute => isRequiredAttribute(assumeNonnull, attribute))
    .map(toRequiredAssertion);
  const setterStatements: string[] = attributes.map(attribute =>
    internalValueSettingCodeForAttribute(subtype, attribute),
  );

  return {
    preprocessors: [],
    belongsToProtocol: Maybe.Nothing<string>(),
    code: requiredParameterAssertions
      .concat(openingCode)
      .concat(setterStatements)
      .concat('return object;'),
    comments: ObjCCommentUtils.commentsAsBlockFromStringArray(
      commentsForSubtype(subtype),
    ),
    compilerAttributes: [],
    keywords: keywordsForSubtype(subtype),
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'instancetype',
        reference: 'instancetype',
      }),
      modifiers: [],
    },
  };
}

function internalImportForFileWithName(name: string): ObjC.Import {
  return {
    library: Maybe.Nothing<string>(),
    file: name + '.h',
    isPublic: false,
    requiresCPlusPlus: false,
  };
}

function instanceVariableForEnumeration(
  algebraicType: AlgebraicType.Type,
): ObjC.InstanceVariable {
  const enumerationName: string = AlgebraicTypeUtils.EnumerationNameForAlgebraicType(
    algebraicType,
  );
  return {
    name: AlgebraicTypeUtils.nameForInstanceVariableStoringSubtype(),
    comments: [],
    returnType: {
      name: enumerationName,
      reference: enumerationName,
    },
    modifiers: [],
    access: ObjC.InstanceVariableAccess.Private(),
  };
}

function instanceVariableFromAttribute(
  subtype: AlgebraicType.Subtype,
  attribute: AlgebraicType.SubtypeAttribute,
): ObjC.InstanceVariable {
  return {
    name: AlgebraicTypeUtils.nameOfInstanceVariableForAttribute(
      subtype,
      attribute,
    ),
    comments: [],
    returnType: {
      name: attribute.type.name,
      reference: attribute.type.reference,
    },
    modifiers: [],
    access: ObjC.InstanceVariableAccess.Private(),
  };
}

function instanceVariablesForImplementationOfAlgebraicType(
  algebraicType: AlgebraicType.Type,
): ObjC.InstanceVariable[] {
  const enumerationInstanceVariable: ObjC.InstanceVariable = instanceVariableForEnumeration(
    algebraicType,
  );
  const attributeInstanceVariables: ObjC.InstanceVariable[] = AlgebraicTypeUtils.mapAttributesWithSubtypeFromSubtypes(
    algebraicType.subtypes,
    instanceVariableFromAttribute,
  );
  return [enumerationInstanceVariable].concat(attributeInstanceVariables);
}

function isImportRequiredForAttribute(
  typeLookups: ObjectGeneration.TypeLookup[],
  attribute: AlgebraicType.SubtypeAttribute,
): boolean {
  return ObjCImportUtils.shouldIncludeImportForType(
    typeLookups,
    attribute.type.name,
  );
}

function importForAttribute(
  objectLibrary: Maybe.Maybe<string>,
  isPublic: boolean,
  attribute: AlgebraicType.SubtypeAttribute,
): ObjC.Import {
  const builtInImportMaybe: Maybe.Maybe<
    ObjC.Import
  > = ObjCImportUtils.typeDefinitionImportForKnownSystemType(
    attribute.type.name,
  );

  return Maybe.match(
    function(builtInImport: ObjC.Import) {
      return builtInImport;
    },
    function() {
      const requiresPublicImport =
        isPublic ||
        ObjCImportUtils.requiresPublicImportForType(
          attribute.type.name,
          AlgebraicTypeUtils.computeTypeOfAttribute(attribute),
        );
      return {
        library: ObjCImportUtils.libraryForImport(
          attribute.type.libraryTypeIsDefinedIn,
          objectLibrary,
        ),
        file: ObjCImportUtils.fileForImport(
          attribute.type.fileTypeIsDefinedIn,
          attribute.type.name,
        ),
        isPublic: requiresPublicImport,
        requiresCPlusPlus: false,
      };
    },
    builtInImportMaybe,
  );
}

function shouldForwardDeclareAttribute(
  algebraicTypeName: string,
  makePublicImports: boolean,
  attribute: AlgebraicType.SubtypeAttribute,
): boolean {
  const declaringPublicAttributes =
    !makePublicImports &&
    ObjCImportUtils.canForwardDeclareTypeForAttribute(attribute);
  const attributeTypeReferencesObjectType =
    algebraicTypeName == attribute.type.name;
  return declaringPublicAttributes || attributeTypeReferencesObjectType;
}

function makePublicImportsForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): boolean {
  return algebraicType.includes.indexOf('UseForwardDeclarations') === -1;
}

function forwardDeclarationForAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
): ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(attribute.type.name);
}

function isForwardDeclarationRequiredForTypeLookup(
  algebraicType: AlgebraicType.Type,
  typeLookup: ObjectGeneration.TypeLookup,
): boolean {
  return (
    typeLookup.name === algebraicType.name ||
    (typeLookup.canForwardDeclare &&
      !makePublicImportsForAlgebraicType(algebraicType))
  );
}

function isImportRequiredForTypeLookup(
  algebraicType: AlgebraicType.Type,
  typeLookup: ObjectGeneration.TypeLookup,
): boolean {
  return typeLookup.name !== algebraicType.name;
}

function forwardDeclarationForTypeLookup(
  typeLookup: ObjectGeneration.TypeLookup,
): ObjC.ForwardDeclaration {
  return ObjC.ForwardDeclaration.ForwardClassDeclaration(typeLookup.name);
}

function enumerationForSubtypesOfAlgebraicType(
  algebraicType: AlgebraicType.Type,
): ObjC.Enumeration {
  return {
    name: AlgebraicTypeUtils.EnumerationNameForAlgebraicType(algebraicType),
    underlyingType: 'NSUInteger',
    values: algebraicType.subtypes.map(subtype =>
      AlgebraicTypeUtils.EnumerationValueNameForSubtype(algebraicType, subtype),
    ),
    isPublic: false,
    comments: [],
  };
}

interface ValidationErrorReductionTracker {
  errors: List.List<Error.Error>;
  seenSubtypeNames: Map.Map<string, string>;
}

function buildAlgebraicTypeValidationErrors(
  soFar: ValidationErrorReductionTracker,
  subtype: AlgebraicType.Subtype,
): ValidationErrorReductionTracker {
  const subtypeName: string = AlgebraicTypeUtils.subtypeNameFromSubtype(
    subtype,
  );
  if (Map.containsKey(subtypeName, soFar.seenSubtypeNames)) {
    const error: Error.Error = Error.Error(
      'Algebraic types cannot have two subtypes with the same name, but found two or more subtypes with the name ' +
        subtypeName,
    );
    return {
      errors: List.cons(error, soFar.errors),
      seenSubtypeNames: soFar.seenSubtypeNames,
    };
  } else {
    return {
      errors: soFar.errors,
      seenSubtypeNames: Map.insert(
        subtypeName,
        subtypeName,
        soFar.seenSubtypeNames,
      ),
    };
  }
}

function importForTypeLookup(
  libraryName: Maybe.Maybe<string>,
  makePublicImports: boolean,
  typeLookup: ObjectGeneration.TypeLookup,
): ObjC.Import {
  const isPublic = makePublicImports || !typeLookup.canForwardDeclare;
  return ObjCImportUtils.importForTypeLookup(libraryName, isPublic, typeLookup);
}

export function createAlgebraicTypePlugin(): AlgebraicType.Plugin {
  return {
    additionalFiles: function(algebraicType: AlgebraicType.Type): Code.File[] {
      return [];
    },
    transformBaseFile: function(
      algebraicType: AlgebraicType.Type,
      baseFile: Code.File,
    ): Code.File {
      return baseFile;
    },
    blockTypes: function(algebraicType: AlgebraicType.Type): ObjC.BlockType[] {
      return [];
    },
    classMethods: function(algebraicType: AlgebraicType.Type): ObjC.Method[] {
      return algebraicType.subtypes.map(subtype =>
        initializationClassMethodForSubtype(algebraicType, subtype),
      );
    },
    enumerations: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Enumeration[] {
      return [enumerationForSubtypesOfAlgebraicType(algebraicType)];
    },
    transformFileRequest: function(
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    fileType: function(
      algebraicType: AlgebraicType.Type,
    ): Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.ForwardDeclaration[] {
      const makePublicImports = makePublicImportsForAlgebraicType(
        algebraicType,
      );
      const attributeForwardDeclarations = AlgebraicTypeUtils.allAttributesFromSubtypes(
        algebraicType.subtypes,
      )
        .filter(attribute =>
          shouldForwardDeclareAttribute(
            algebraicType.name,
            makePublicImports,
            attribute,
          ),
        )
        .map(forwardDeclarationForAttribute);
      const typeLookupForwardDeclarations = algebraicType.typeLookups
        .filter(typeLookup =>
          isForwardDeclarationRequiredForTypeLookup(algebraicType, typeLookup),
        )
        .map(forwardDeclarationForTypeLookup);
      return []
        .concat(attributeForwardDeclarations)
        .concat(typeLookupForwardDeclarations);
    },
    functions: function(algebraicType: AlgebraicType.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Protocol[] {
      return [];
    },
    imports: function imports(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Import[] {
      const baseImports: ObjC.Import[] = [
        PUBLIC_FOUNDATION_IMPORT,
        internalImportForFileWithName(algebraicType.name),
      ];
      const makePublicImports = makePublicImportsForAlgebraicType(
        algebraicType,
      );
      const typeLookupImports = algebraicType.typeLookups
        .filter(typeLookup =>
          isImportRequiredForTypeLookup(algebraicType, typeLookup),
        )
        .map(typeLookup =>
          importForTypeLookup(
            algebraicType.libraryName,
            makePublicImports,
            typeLookup,
          ),
        );
      const attributeImports: ObjC.Import[] = AlgebraicTypeUtils.allAttributesFromSubtypes(
        algebraicType.subtypes,
      )
        .filter(attribute =>
          isImportRequiredForAttribute(algebraicType.typeLookups, attribute),
        )
        .map(attribute =>
          importForAttribute(
            algebraicType.libraryName,
            makePublicImports,
            attribute,
          ),
        );
      return baseImports.concat(typeLookupImports).concat(attributeImports);
    },
    instanceMethods: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Method[] {
      return [];
    },
    instanceVariables: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return instanceVariablesForImplementationOfAlgebraicType(algebraicType);
    },
    macros: function(algebraicType: AlgebraicType.Type): ObjC.Macro[] {
      return [];
    },
    requiredIncludesToRun: ['AlgebraicTypeInitialization'],
    staticConstants: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Constant[] {
      return [];
    },
    validationErrors: function(
      algebraicType: AlgebraicType.Type,
    ): Error.Error[] {
      const initialReductionTracker: ValidationErrorReductionTracker = {
        errors: List.of<Error.Error>(),
        seenSubtypeNames: Map.Empty<string, string>(),
      };
      return List.toArray(
        algebraicType.subtypes.reduce(
          buildAlgebraicTypeValidationErrors,
          initialReductionTracker,
        ).errors,
      );
    },
    nullability: function(
      algebraicType: AlgebraicType.Type,
    ): Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(
      algebraicType: AlgebraicType.Type,
    ): boolean {
      return false;
    },
  };
}
