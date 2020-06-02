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
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjCImportUtils from '../objc-import-utils';
import * as ObjCNullabilityUtils from '../objc-nullability-utils';
import * as ObjectGeneration from '../object-generation';
import * as StringUtils from '../string-utils';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecUtils from '../object-spec-utils';
import * as ObjectSpecCodeUtils from '../object-spec-code-utils';

function nameOfBuilderForValueTypeWithName(valueTypeName: string): string {
  return valueTypeName + 'Builder';
}

function shortNameOfObjectToBuildForValueTypeWithName(
  valueTypeName: string,
): string {
  return StringUtils.lowercased(
    StringUtils.stringRemovingCapitalizedPrefix(valueTypeName),
  );
}

function builderClassMethodForValueType(
  objectType: ObjectSpec.Type,
): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: null,
    code: [
      'return [' +
        nameOfBuilderForValueTypeWithName(objectType.typeName) +
        ' new];',
    ],
    comments: [],
    compilerAttributes: [],
    keywords: [
      {
        name: shortNameOfObjectToBuildForValueTypeWithName(objectType.typeName),
        argument: null,
      },
    ],
    returnType: {
      type: {
        name: 'instancetype',
        reference: 'instancetype',
      },
      modifiers: [],
    },
  };
}

function keywordArgumentNameForBuilderFromExistingObjectClassMethodForValueType(
  objectType: ObjectSpec.Type,
): string {
  return (
    'existing' +
    StringUtils.capitalize(
      shortNameOfObjectToBuildForValueTypeWithName(objectType.typeName),
    )
  );
}

function openingBrace(): string {
  return '[';
}

function indentationForItemAtIndexWithOffset(
  offset: number,
): (index: number) => string {
  return function(index: number): string {
    const indentation = offset - index;
    return StringUtils.stringContainingSpaces(
      indentation > 0 ? indentation : 0,
    );
  };
}

function toWithInvocationCallForBuilderFromExistingObjectClassMethodForAttribute(
  indentationProvider: (index: number) => string,
  existingObjectName: string,
  soFar: string[],
  attribute: ObjectSpec.Attribute,
  index: number,
  array: ObjectSpec.Attribute[],
): string[] {
  return soFar.concat(
    indentationProvider(index) +
      keywordNameForAttribute(attribute) +
      ':' +
      existingObjectName +
      '.' +
      attribute.name +
      ']',
  );
}

function stringsWithLastItemContainingStringAtEnd(
  strings: string[],
  stringToIncludeAtEndOfLastString: string,
): string[] {
  const updatedStrings: string[] = strings.concat();
  updatedStrings[updatedStrings.length - 1] =
    updatedStrings[updatedStrings.length - 1] +
    stringToIncludeAtEndOfLastString;
  return updatedStrings;
}

function codeForBuilderFromExistingObjectClassMethodForValueType(
  objectType: ObjectSpec.Type,
): string[] {
  const returnOpening: string = 'return ';
  const openingBracesForWithMethodInvocations: string[] = objectType.attributes.map(
    openingBrace,
  );
  const builderCreationCall: string =
    '[' +
    nameOfBuilderForValueTypeWithName(objectType.typeName) +
    ' ' +
    shortNameOfObjectToBuildForValueTypeWithName(objectType.typeName) +
    ']';
  const openingLine: string =
    returnOpening +
    openingBracesForWithMethodInvocations.join('') +
    builderCreationCall;

  const indentationProvider: (
    index: number,
  ) => string = indentationForItemAtIndexWithOffset(
    returnOpening.length + openingBracesForWithMethodInvocations.length,
  );
  const existingObjectName: string = keywordArgumentNameForBuilderFromExistingObjectClassMethodForValueType(
    objectType,
  );
  const linesForBuildingValuesIntoBuilder: string[] = objectType.attributes.reduce(
    toWithInvocationCallForBuilderFromExistingObjectClassMethodForAttribute.bind(
      null,
      indentationProvider,
      existingObjectName,
    ),
    [],
  );

  const code: string[] = [openingLine].concat(
    linesForBuildingValuesIntoBuilder,
  );
  return stringsWithLastItemContainingStringAtEnd(code, ';');
}

function builderFromExistingObjectClassMethodForValueType(
  objectType: ObjectSpec.Type,
): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: null,
    code: codeForBuilderFromExistingObjectClassMethodForValueType(objectType),
    comments: [],
    compilerAttributes: [],
    keywords: [
      {
        name:
          shortNameOfObjectToBuildForValueTypeWithName(objectType.typeName) +
          'FromExisting' +
          StringUtils.capitalize(
            shortNameOfObjectToBuildForValueTypeWithName(objectType.typeName),
          ),
        argument: {
          name: keywordArgumentNameForBuilderFromExistingObjectClassMethodForValueType(
            objectType,
          ),
          modifiers: [],
          type: {
            name: objectType.typeName,
            reference: ObjectSpecUtils.typeReferenceForValueTypeWithName(
              objectType.typeName,
            ),
          },
        },
      },
    ],
    returnType: {
      type: {
        name: 'instancetype',
        reference: 'instancetype',
      },
      modifiers: [],
    },
  };
}

function valueGeneratorForInvokingInitializerWithAttribute(
  attribute: ObjectSpec.Attribute,
): string {
  return ObjectSpecCodeUtils.ivarForAttribute(attribute);
}

function buildObjectInstanceMethodForValueType(
  objectType: ObjectSpec.Type,
): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: null,
    code: [
      'return ' +
        ObjectSpecCodeUtils.methodInvocationForConstructor(
          objectType,
          valueGeneratorForInvokingInitializerWithAttribute,
        ) +
        ';',
    ],
    comments: [],
    compilerAttributes: [],
    keywords: [
      {
        name: 'build',
        argument: null,
      },
    ],
    returnType: {
      type: {
        name: objectType.typeName,
        reference: ObjectSpecUtils.typeReferenceForValueTypeWithName(
          objectType.typeName,
        ),
      },
      modifiers: [],
    },
  };
}

function keywordArgumentNameForAttribute(
  attribute: ObjectSpec.Attribute,
): string {
  return attribute.name;
}

function keywordNameForAttribute(attribute: ObjectSpec.Attribute): string {
  return (
    'with' + StringUtils.capitalize(keywordArgumentNameForAttribute(attribute))
  );
}

function valueToAssignIntoInternalStateForAttribute(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): string {
  const keywordArgumentName: string = keywordArgumentNameForAttribute(
    attribute,
  );
  if (
    ObjectSpecCodeUtils.shouldCopyIncomingValueForAttribute(
      supportsValueSemantics,
      attribute,
    )
  ) {
    return '[' + keywordArgumentName + ' copy]';
  } else {
    return keywordArgumentName;
  }
}

function withInstanceMethodForAttribute(
  supportsValueSemantics: boolean,
  attribute: ObjectSpec.Attribute,
): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: null,
    code: [
      ObjectSpecCodeUtils.ivarForAttribute(attribute) +
        ' = ' +
        valueToAssignIntoInternalStateForAttribute(
          supportsValueSemantics,
          attribute,
        ) +
        ';',
      'return self;',
    ],
    comments: [],
    compilerAttributes: [],
    keywords: [
      {
        name: keywordNameForAttribute(attribute),
        argument: {
          name: keywordArgumentNameForAttribute(attribute),
          modifiers: ObjCNullabilityUtils.keywordArgumentModifiersForNullability(
            attribute.nullability,
          ),
          type: {
            name: attribute.type.name,
            reference: attribute.type.reference,
          },
        },
      },
    ],
    returnType: {
      type: {
        name: 'instancetype',
        reference: 'instancetype',
      },
      modifiers: [],
    },
  };
}

function instanceVariableForAttribute(
  attribute: ObjectSpec.Attribute,
): ObjC.InstanceVariable {
  return {
    name: attribute.name,
    comments: [],
    returnType: {
      name: attribute.type.name,
      reference: attribute.type.reference,
    },
    modifiers: [],
    access: ObjC.InstanceVariableAccess.Private(),
  };
}

export function importsForTypeLookupsOfObjectType(
  objectType: ObjectSpec.Type,
): ObjC.Import[] {
  const needsImportsForAllTypeLookups =
    objectType.includes.indexOf('UseForwardDeclarations') !== -1;
  return objectType.typeLookups
    .map(function(typeLookup: ObjectGeneration.TypeLookup): ObjC.Import {
      if (!typeLookup.canForwardDeclare) {
        return ObjCImportUtils.importForTypeLookup(
          objectType.libraryName,
          true,
          typeLookup,
        );
      } else if (needsImportsForAllTypeLookups) {
        return ObjCImportUtils.importForTypeLookup(
          objectType.libraryName,
          false,
          typeLookup,
        );
      } else {
        return null!;
      }
    })
    .filter(function(maybeImport: ObjC.Import): boolean {
      return maybeImport != null;
    });
}

function makePublicImportsForValueType(objectType: ObjectSpec.Type): boolean {
  return objectType.includes.indexOf('UseForwardDeclarations') === -1;
}

function importsForBuilder(
  objectType: ObjectSpec.Type,
  forBaseFile: boolean,
): ObjC.Import[] {
  const typeLookupImports: ObjC.Import[] = importsForTypeLookupsOfObjectType(
    objectType,
  );

  const makePublicImports = makePublicImportsForValueType(objectType);
  const skipAttributeImports =
    !makePublicImports &&
    objectType.includes.indexOf('SkipImportsInImplementation') !== -1;

  const attributeImports: ObjC.Import[] = skipAttributeImports
    ? []
    : objectType.attributes
        .filter(attribute =>
          ObjCImportUtils.shouldIncludeImportForType(
            objectType.typeLookups,
            attribute.type.name,
          ),
        )
        .map(function(attribute: ObjectSpec.Attribute): ObjC.Import {
          return ObjCImportUtils.importForAttribute(
            attribute.type.name,
            attribute.type.underlyingType,
            attribute.type.libraryTypeIsDefinedIn,
            attribute.type.fileTypeIsDefinedIn,
            objectType.libraryName,
            false,
          );
        });

  return [
    {
      file: 'Foundation.h',
      isPublic: true,
      requiresCPlusPlus: false,
      library: 'Foundation',
    },
    {
      file: objectType.typeName + '.h',
      isPublic: false,
      requiresCPlusPlus: false,
      library: objectType.libraryName,
    },
    ...conditionallyAddToSpread(!forBaseFile, {
      file: nameOfBuilderForValueTypeWithName(objectType.typeName) + '.h',
      isPublic: false,
      requiresCPlusPlus: false,
      library: null,
    }),
  ]
    .concat(typeLookupImports)
    .concat(attributeImports);
}

function forwardDeclarationsForBuilder(
  objectType: ObjectSpec.Type,
): ObjC.ForwardDeclaration[] {
  return [
    ObjC.ForwardDeclaration.ForwardClassDeclaration(objectType.typeName),
    ...ImmutableImportUtils.forwardClassDeclarationsForObjectType(objectType),
  ];
}

function classesForBuilder(objectType: ObjectSpec.Type): ObjC.Class[] {
  return [
    {
      baseClassName: 'NSObject',
      covariantTypes: [],
      classMethods: [
        builderClassMethodForValueType(objectType),
        builderFromExistingObjectClassMethodForValueType(objectType),
      ],
      comments: [],
      inlineBlockTypedefs: [],
      instanceMethods: [
        buildObjectInstanceMethodForValueType(objectType),
      ].concat(
        objectType.attributes.map(attribute =>
          withInstanceMethodForAttribute(
            ObjectSpecUtils.typeSupportsValueObjectSemantics(objectType),
            attribute,
          ),
        ),
      ),
      name: nameOfBuilderForValueTypeWithName(objectType.typeName),
      properties: [],
      instanceVariables: objectType.attributes.map(
        instanceVariableForAttribute,
      ),
      implementedProtocols: [],
      nullability:
        objectType.includes.indexOf('RMAssumeNonnull') >= 0
          ? ObjC.ClassNullability.assumeNonnull
          : ObjC.ClassNullability.default,
      subclassingRestricted: false,
    },
  ];
}

function conditionallyAddToSpread<T>(addIt: boolean, value: T): T[] {
  return addIt ? [value] : [];
}

function builderFileForValueType(
  objectType: ObjectSpec.Type,
  forBaseFile: boolean,
): Code.File {
  return {
    name: nameOfBuilderForValueTypeWithName(objectType.typeName),
    type: Code.FileType.ObjectiveC,
    imports: importsForBuilder(objectType, forBaseFile),
    forwardDeclarations: forwardDeclarationsForBuilder(objectType),
    comments: [],
    enumerations: [],
    blockTypes: [],
    staticConstants: [],
    functions: [],
    classes: classesForBuilder(objectType),
    diagnosticIgnores: [],
    structs: [],
    cppClasses: [],
    namespaces: [],
    macros: [],
  };
}

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: function(objectType: ObjectSpec.Type): Code.File[] {
      return [builderFileForValueType(objectType, false)];
    },
    transformBaseFile: function(
      objectType: ObjectSpec.Type,
      baseFile: Code.File,
    ): Code.File {
      baseFile.imports = baseFile.imports.concat(
        importsForBuilder(objectType, true),
      );
      baseFile.forwardDeclarations = baseFile.forwardDeclarations.concat(
        forwardDeclarationsForBuilder(objectType),
      );
      baseFile.classes = baseFile.classes.concat(classesForBuilder(objectType));
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
    fileType: function(objectType: ObjectSpec.Type): Code.FileType | null {
      return null;
    },
    forwardDeclarations: function(
      objectType: ObjectSpec.Type,
    ): ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(objectType: ObjectSpec.Type): ObjC.Function[] {
      return [];
    },
    headerComments: function(objectType: ObjectSpec.Type): ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(
      objectType: ObjectSpec.Type,
    ): ObjC.ImplementedProtocol[] {
      return [];
    },
    imports: function(objectType: ObjectSpec.Type): ObjC.Import[] {
      return [];
    },
    instanceMethods: function(objectType: ObjectSpec.Type): ObjC.Method[] {
      return [];
    },
    macros: function(valueType: ObjectSpec.Type): ObjC.Macro[] {
      return [];
    },
    properties: function(objectType: ObjectSpec.Type): ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMBuilder'],
    staticConstants: function(objectType: ObjectSpec.Type): ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType: ObjectSpec.Type): Error.Error[] {
      return [];
    },
    nullability: function(
      objectType: ObjectSpec.Type,
    ): ObjC.ClassNullability | null {
      return null;
    },
    subclassingRestricted: function(objectType: ObjectSpec.Type): boolean {
      return false;
    },
  };
}
