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
import * as ObjectSpecCodeUtils from '../object-spec-code-utils';
import * as StringUtils from '../string-utils';

const PUBLIC_FOUNDATION_IMPORT: ObjC.Import = {
  library: 'Foundation',
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
): ObjC.KeywordArgument | null {
  return {
    name: nameOfKeywordParameterForAttribute(attribute),
    modifiers: ObjCNullabilityUtils.keywordArgumentModifiersForNullability(
      attribute.nullability,
    ),
    type: {
      name: attribute.type.name,
      reference: attribute.type.reference,
    },
  };
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
        argument: null,
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

function swiftNameForSubtype(subtype: AlgebraicType.Subtype): string | null {
  return subtype.match(
    collection => {
      if (collection.attributes.length > 0) {
        const name = StringUtils.lowercased(collection.name);
        const keywords = collection.attributes
          .map(attribute => `${attribute.name}:`)
          .join('');

        return `NS_SWIFT_NAME(${name}(${keywords}))`;
      } else {
        return null;
      }
    },
    attribute => null,
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
      ' = [(Class)self new];',
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
    belongsToProtocol: null,
    code: requiredParameterAssertions
      .concat(openingCode)
      .concat(setterStatements)
      .concat('return object;'),
    comments: ObjCCommentUtils.commentsAsBlockFromStringArray(
      commentsForSubtype(subtype),
    ),
    compilerAttributes: Maybe.catMaybes([swiftNameForSubtype(subtype)]),
    keywords: keywordsForSubtype(subtype),
    returnType: {
      type: {
        name: 'instancetype',
        reference: 'instancetype',
      },
      modifiers: [],
    },
  };
}

function internalImportForFileWithName(name: string): ObjC.Import {
  return {
    library: null,
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

function makePublicImportsForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): boolean {
  return algebraicType.includes.indexOf('UseForwardDeclarations') === -1;
}

function isImportRequiredForTypeLookup(
  algebraicType: AlgebraicType.Type,
  typeLookup: ObjectGeneration.TypeLookup,
): boolean {
  const needsImportsForAllTypeLookups = makePublicImportsForAlgebraicType(
    algebraicType,
  );
  return (
    typeLookup.name !== algebraicType.name &&
    (!typeLookup.canForwardDeclare || needsImportsForAllTypeLookups)
  );
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
    ): Code.FileType | null {
      return null;
    },
    forwardDeclarations: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.ForwardDeclaration[] {
      if (makePublicImportsForAlgebraicType(algebraicType)) {
        return [];
      }
      const attributes = AlgebraicTypeUtils.allAttributesFromSubtypes(
        algebraicType.subtypes,
      );
      return ([] as ObjC.ForwardDeclaration[]).concat(
        ...attributes.map(a =>
          ObjCImportUtils.forwardDeclarationsForAttributeType(
            a.type.name,
            a.type.underlyingType,
            a.type.conformingProtocol,
            a.type.referencedGenericTypes,
            algebraicType.typeLookups,
          ),
        ),
      );
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
    ): ObjC.ImplementedProtocol[] {
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
          ObjCImportUtils.importForTypeLookup(
            algebraicType.libraryName,
            makePublicImports || !typeLookup.canForwardDeclare,
            typeLookup,
          ),
        );
      const skipAttributeImports =
        !makePublicImports &&
        algebraicType.includes.indexOf('SkipImportsInImplementation') !== -1;
      const attributeImports: ObjC.Import[] = skipAttributeImports
        ? []
        : AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes)
            .filter(attribute =>
              ObjCImportUtils.shouldIncludeImportForType(
                algebraicType.typeLookups,
                attribute.type.name,
              ),
            )
            .map(attribute =>
              ObjCImportUtils.importForAttribute(
                attribute.type.name,
                attribute.type.underlyingType,
                attribute.type.libraryTypeIsDefinedIn,
                attribute.type.fileTypeIsDefinedIn,
                algebraicType.libraryName,
                makePublicImports,
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
    ): ObjC.ClassNullability | null {
      return null;
    },
    subclassingRestricted: function(
      algebraicType: AlgebraicType.Type,
    ): boolean {
      return false;
    },
  };
}
