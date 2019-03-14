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
import * as FunctionUtils from '../function-utils';
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjectGeneration from '../object-generation';
import * as ObjCTypeUtils from '../objc-type-utils';
import * as StringUtils from '../string-utils';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecCodeUtils from '../object-spec-code-utils';
import * as CodingUtils from './coding-utils';

function underscored(str: string): string {
  return str
    .replace(/([a-z\d])([A-Z]+)/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

export interface CodeableAttribute {
  name: string;
  valueAccessor: string;
  constantName: string;
  constantValue: string;
  legacyKeyNames: string[];
  type: ObjC.Type;
  originalType: ObjC.Type;
}

// We only support a single non-legacy coding key, but it's possible to write the annotation
// multiple times per-property. We catch this as a validation error, so that it won't affect
// code generation.
function codingKeysFromAnnotations(
  annotationMap: ObjectGeneration.AnnotationMap,
): string[] {
  const codingKeyAnnotations = annotationMap['codingKey'];
  if (codingKeyAnnotations == null) {
    return [];
  }

  return Maybe.catMaybes(
    codingKeyAnnotations.map(
      annotation => new Maybe.Maybe(annotation.properties['name']),
    ),
  );
}

function legacyCodingKeyNameForAnnotation(
  legacyKeyAnnotation: ObjectGeneration.Annotation,
): string {
  const legacyKey: string = legacyKeyAnnotation.properties['name'];
  return legacyKey === undefined ? '' : legacyKey;
}

function legacyCodingKeyNamesForAttribute(
  attribute: ObjectSpec.Attribute,
): string[] {
  const legacyKeyAnnotations = attribute.annotations['codingLegacyKey'];
  if (legacyKeyAnnotations && legacyKeyAnnotations.length > 0) {
    return legacyKeyAnnotations.map(legacyCodingKeyNameForAnnotation);
  } else {
    return [];
  }
}

export function codingAttributeForValueAttribute(
  attribute: ObjectSpec.Attribute,
): CodeableAttribute {
  const codingKeys = codingKeysFromAnnotations(attribute.annotations);
  const constantValue =
    codingKeys.length === 1
      ? `@"${codingKeys[0]}"`
      : constantValueForAttributeName(attribute.name);

  return {
    name: attribute.name,
    valueAccessor: ObjectSpecCodeUtils.ivarForAttribute(attribute),
    constantName: nameOfConstantForValueName(attribute.name),
    constantValue: constantValue,
    legacyKeyNames: legacyCodingKeyNamesForAttribute(attribute),
    type: ObjectSpecCodeUtils.computeTypeOfAttribute(attribute),
    originalType: ObjectSpecCodeUtils.computeOriginalTypeOfAttribute(attribute),
  };
}

function legacyKeyRespectingDecodeStatementForAttribute(
  attribute: CodeableAttribute,
  secureCoding: boolean,
): string[] {
  const defaultDecodeStatement: string = decodeStatementForAttribute(
    attribute,
    secureCoding,
  );
  const decodeStatements: string[] = [defaultDecodeStatement];

  if (attribute.legacyKeyNames.length > 0) {
    const nilValueForAttribute: string = nilValueForType(attribute.type);
    if (nilValueForAttribute.length > 0) {
      const legacyDecodeStatements: string[] = FunctionUtils.flatMap(
        attribute.legacyKeyNames,
        legacyKeyName => {
          return decodeStatementForAttributeAndLegacyKey(
            attribute,
            nilValueForAttribute,
            legacyKeyName,
            secureCoding,
          );
        },
      );
      if (legacyDecodeStatements.length > 0) {
        return decodeStatements.concat(legacyDecodeStatements);
      }
    }
  }

  return decodeStatements;
}

function decodeStatementForAttributeAndLegacyKey(
  attribute: CodeableAttribute,
  nilValueForAttribute: string,
  legacyKeyName: string,
  secureCoding: boolean,
): string[] {
  if (legacyKeyName.length > 0) {
    const legacyDecodeStatement: string = decodeStatementForTypeValueAccessorAndCodingKey(
      attribute.type,
      attribute.originalType,
      attribute.valueAccessor,
      '@"' + legacyKeyName + '"',
      secureCoding,
    );
    const conditionalStatement: string[] = [
      'if (' + attribute.valueAccessor + ' == ' + nilValueForAttribute + ') {',
      StringUtils.indent(2)(legacyDecodeStatement),
      '}',
    ];
    return conditionalStatement;
  } else {
    return [];
  }
}

export function decodeStatementForAttribute(
  attribute: CodeableAttribute,
  secureCoding: boolean,
): string {
  return decodeStatementForTypeValueAccessorAndCodingKey(
    attribute.type,
    attribute.originalType,
    attribute.valueAccessor,
    attribute.constantName,
    secureCoding,
  );
}

function decodeStatementForTypeValueAccessorAndCodingKey(
  type: ObjC.Type,
  originalType: ObjC.Type,
  valueAccessor: string,
  codingKey: string,
  secureCoding: boolean,
): string {
  const codingStatements: CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(
    type,
  );
  // we cast over to the id type to silence -Wnullable-to-nonnull-conversion errors, otherwise the flag
  // needs to be disabled for the entire target. This is better than using the valueObjectConfig, as it
  // allows the flag to remain on for the rest of the generated code, in case there are bugs in any other
  // plugins that lead to unsafe nullability issues.
  const cast = ObjCTypeUtils.isNSObject(type)
    ? `(id)`
    : type.name != originalType.name
    ? '(' + originalType.name + ')'
    : '';
  const decodedRawValuePart: string = `${cast}${codingStatements.decodeStatementGenerator(
    type,
    codingKey,
    secureCoding,
  )}`;
  const decodedValuePart = codingStatements.decodeValueStatementGenerator(
    decodedRawValuePart,
  );
  return valueAccessor + ' = ' + decodedValuePart + ';';
}

function decodeStatementForSubtype(
  attribute: CodeableAttribute,
  secureCoding: boolean,
): string {
  const codingStatements: CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(
    attribute.type,
  );
  const decodedRawValuePart: string = codingStatements.decodeStatementGenerator(
    attribute.type,
    attribute.constantName,
    secureCoding,
  );
  const decodedValuePart = codingStatements.decodeValueStatementGenerator(
    decodedRawValuePart,
  );
  return (
    'NSString *' + attribute.valueAccessor + ' = ' + decodedValuePart + ';'
  );
}

export function encodeStatementForAttribute(
  attribute: CodeableAttribute,
): string {
  const codingStatements: CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(
    attribute.type,
  );
  const encodeValuePart = codingStatements.encodeValueStatementGenerator(
    attribute.valueAccessor,
  );
  return (
    '[aCoder ' +
    codingStatements.encodeStatement +
    ':' +
    encodeValuePart +
    ' forKey:' +
    attribute.constantName +
    '];'
  );
}

function nameOfConstantForValueName(valueName: string): string {
  return 'k' + StringUtils.capitalize(valueName) + 'Key';
}

function constantValueForAttributeName(attributeName: string): string {
  return '@"' + underscored(attributeName).toUpperCase() + '"';
}

function staticConstantForAttribute(
  attribute: CodeableAttribute,
): ObjC.Constant {
  return {
    type: {
      name: 'NSString',
      reference: 'NSString *',
    },
    comments: [],
    name: attribute.constantName,
    value: attribute.constantValue,
    memorySemantic: ObjC.MemorySemantic.UnsafeUnretained(),
  };
}

function initBlockWithInternalCode(internalCode: string[]): string[] {
  const returnStatement: string = 'return self;';
  return ['if ((self = [super init])) {']
    .concat(internalCode.map(StringUtils.indent(2)))
    .concat('}')
    .concat(returnStatement);
}

function decodeMethodWithCode(code: string[]): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: Maybe.Just<string>('NSCoding'),
    code: initBlockWithInternalCode(code),
    comments: [],
    compilerAttributes: [],
    keywords: [
      {
        name: 'initWithCoder',
        argument: Maybe.Just<ObjC.KeywordArgument>({
          name: 'aDecoder',
          modifiers: [],
          type: {
            name: 'NSCoder',
            reference: 'NSCoder *',
          },
        }),
      },
    ],
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'instancetype',
        reference: 'instancetype',
      }),
      modifiers: [ObjC.KeywordArgumentModifier.Nullable()],
    },
  };
}

function encodeMethodWithCode(code: string[]): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: Maybe.Just('NSCoding'),
    code: code,
    comments: [],
    compilerAttributes: [],
    keywords: [
      {
        name: 'encodeWithCoder',
        argument: Maybe.Just<ObjC.KeywordArgument>({
          name: 'aCoder',
          modifiers: [],
          type: {
            name: 'NSCoder',
            reference: 'NSCoder *',
          },
        }),
      },
    ],
    returnType: {
      type: Maybe.Nothing<ObjC.Type>(),
      modifiers: [],
    },
  };
}

function isTypeNSCodingCompliant(type: ObjC.Type): boolean {
  return ObjCTypeUtils.matchType(
    {
      id: function() {
        return true;
      },
      NSObject: function() {
        return true;
      },
      BOOL: function() {
        return true;
      },
      NSInteger: function() {
        return true;
      },
      NSUInteger: function() {
        return true;
      },
      double: function() {
        return true;
      },
      float: function() {
        return true;
      },
      CGFloat: function() {
        return true;
      },
      NSTimeInterval: function() {
        return true;
      },
      uintptr_t: function() {
        return true;
      },
      uint32_t: function() {
        return true;
      },
      uint64_t: function() {
        return true;
      },
      int32_t: function() {
        return true;
      },
      int64_t: function() {
        return true;
      },
      SEL: function() {
        return true;
      },
      NSRange: function() {
        return true;
      },
      CGRect: function() {
        return true;
      },
      CGPoint: function() {
        return true;
      },
      CGSize: function() {
        return true;
      },
      UIEdgeInsets: function() {
        return true;
      },
      Class: function() {
        return false;
      },
      dispatch_block_t: function() {
        return false;
      },
      unmatchedType: function() {
        return true;
      },
    },
    type,
  );
}

function nilValueForType(type: ObjC.Type): string {
  return ObjCTypeUtils.matchType(
    {
      id: function() {
        return 'nil';
      },
      NSObject: function() {
        return 'nil';
      },
      BOOL: function() {
        return 'NO';
      },
      NSInteger: function() {
        return '0';
      },
      NSUInteger: function() {
        return '0';
      },
      double: function() {
        return '0';
      },
      float: function() {
        return '0';
      },
      CGFloat: function() {
        return '0';
      },
      NSTimeInterval: function() {
        return '0';
      },
      uintptr_t: function() {
        return '0';
      },
      uint32_t: function() {
        return '0';
      },
      uint64_t: function() {
        return '0';
      },
      int32_t: function() {
        return '0';
      },
      int64_t: function() {
        return '0';
      },
      SEL: function() {
        return '';
      },
      NSRange: function() {
        return '';
      },
      CGRect: function() {
        return '';
      },
      CGPoint: function() {
        return '';
      },
      CGSize: function() {
        return '';
      },
      UIEdgeInsets: function() {
        return '';
      },
      Class: function() {
        return 'nil';
      },
      dispatch_block_t: function() {
        return '';
      },
      unmatchedType: function() {
        return '';
      },
    },
    type,
  );
}

function doesValueAttributeContainAnUnknownType(
  attribute: ObjectSpec.Attribute,
): boolean {
  const codeableAttribute: CodeableAttribute = codingAttributeForValueAttribute(
    attribute,
  );
  const codingStatements: CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(
    codeableAttribute.type,
  );
  return codingStatements == null;
}

function doesValueAttributeContainAnUnsupportedType(
  attribute: ObjectSpec.Attribute,
): boolean {
  return (
    isTypeNSCodingCompliant(
      ObjectSpecCodeUtils.computeTypeOfAttribute(attribute),
    ) === false
  );
}

function doesValueAttributeContainAnLegacyKeyForUnsupportedType(
  attribute: ObjectSpec.Attribute,
): boolean {
  return (
    legacyCodingKeyNamesForAttribute(attribute).length > 0 &&
    nilValueForType(ObjectSpecCodeUtils.computeTypeOfAttribute(attribute))
      .length == 0
  );
}

function valueAttributeToUnknownTypeError(
  objectType: ObjectSpec.Type,
  attribute: ObjectSpec.Attribute,
): Error.Error {
  return Maybe.match(
    function(underlyingType: string): Error.Error {
      return Error.Error(
        'The Coding plugin does not know how to decode and encode the backing type "' +
          underlyingType +
          '" from ' +
          objectType.typeName +
          '.' +
          attribute.name +
          '. Did you declare the wrong backing type?',
      );
    },
    function(): Error.Error {
      return Error.Error(
        'The Coding plugin does not know how to decode and encode the type "' +
          attribute.type.name +
          '" from ' +
          objectType.typeName +
          '.' +
          attribute.name +
          '. Did you forget to declare a backing type?',
      );
    },
    attribute.type.underlyingType,
  );
}

function valueAttributeToUnsupportedTypeError(
  objectType: ObjectSpec.Type,
  attribute: ObjectSpec.Attribute,
): Error.Error {
  return Maybe.match(
    function(underlyingType: string): Error.Error {
      return Error.Error(
        'The Coding plugin does not know how to decode and encode the backing type "' +
          underlyingType +
          '" from ' +
          objectType.typeName +
          '.' +
          attribute.name +
          '. ' +
          attribute.type.name +
          ' is not NSCoding-compilant.',
      );
    },
    function(): Error.Error {
      return Error.Error(
        'The Coding plugin does not know how to decode and encode the type "' +
          attribute.type.name +
          '" from ' +
          objectType.typeName +
          '.' +
          attribute.name +
          '. ' +
          attribute.type.name +
          ' is not NSCoding-compilant.',
      );
    },
    attribute.type.underlyingType,
  );
}

function valueAttributeToUnsupportedLegacyKeyTypeError(
  objectType: ObjectSpec.Type,
  attribute: ObjectSpec.Attribute,
): Error.Error {
  return Maybe.match(
    function(underlyingType: string): Error.Error {
      return Error.Error(
        '%codingLegacyKey can\'t be used with "' +
          underlyingType +
          '" at ' +
          objectType.typeName +
          '.' +
          attribute.name +
          '.',
      );
    },
    function(): Error.Error {
      return Error.Error(
        '%codingLegacyKey can\'t be used with "' +
          attribute.type.name +
          '" at ' +
          objectType.typeName +
          '.' +
          attribute.name +
          '.',
      );
    },
    attribute.type.underlyingType,
  );
}

function multipleCodingKeyAnnotationErrorForValueAttribute(
  objectType: ObjectSpec.Type,
  attribute: ObjectSpec.Attribute,
): Maybe.Maybe<Error.Error> {
  const length = codingKeysFromAnnotations(attribute.annotations).length;
  return length > 1
    ? Maybe.Just(
        Error.Error(
          `Only one %codingKey name is supported: ${objectType.typeName}.${
            attribute.name
          } has ${length}.`,
        ),
      )
    : Maybe.Nothing();
}

function importForAttributeCodingMethod(
  attribute: ObjectSpec.Attribute,
): Maybe.Maybe<ObjC.Import> {
  const codeableAttribute: CodeableAttribute = codingAttributeForValueAttribute(
    attribute,
  );
  const codingStatements: CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(
    codeableAttribute.type,
  );
  return codingStatements.codingFunctionImport;
}

export function createPlugin(): ObjectSpec.Plugin {
  return {
    additionalFiles: function(objectType: ObjectSpec.Type): Code.File[] {
      return [];
    },
    transformBaseFile: function(
      objectType: ObjectSpec.Type,
      baseFile: Code.File,
    ): Code.File {
      return baseFile;
    },
    additionalTypes: function(objectType: ObjectSpec.Type): ObjectSpec.Type[] {
      return [];
    },
    classMethods: function(objectType: ObjectSpec.Type): ObjC.Method[] {
      const secureCoding = objectType.includes.indexOf('NSSecureCoding') >= 0;
      return secureCoding ? [CodingUtils.supportsSecureCodingMethod] : [];
    },
    attributes: function(objectType: ObjectSpec.Type): ObjectSpec.Attribute[] {
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
    ): ObjC.Protocol[] {
      const secureCoding = objectType.includes.indexOf('NSSecureCoding') >= 0;
      if (secureCoding) {
        return [
          {
            name: 'NSSecureCoding',
          },
        ];
      } else {
        return [
          {
            name: 'NSCoding',
          },
        ];
      }
    },
    imports: function(objectType: ObjectSpec.Type): ObjC.Import[] {
      const codingImportMaybes: Maybe.Maybe<
        ObjC.Import
      >[] = objectType.attributes.map(importForAttributeCodingMethod);

      return Maybe.catMaybes(codingImportMaybes);
    },
    instanceMethods: function(objectType: ObjectSpec.Type): ObjC.Method[] {
      const secureCoding = objectType.includes.indexOf('NSSecureCoding') >= 0;
      if (objectType.attributes.length > 0) {
        const codingAttributes: CodeableAttribute[] = objectType.attributes.map(
          codingAttributeForValueAttribute,
        );
        const decodeCode: string[] = FunctionUtils.flatMap(
          codingAttributes,
          codingAttribute => {
            return legacyKeyRespectingDecodeStatementForAttribute(
              codingAttribute,
              secureCoding,
            );
          },
        );
        const encodeCode: string[] = codingAttributes.map(
          encodeStatementForAttribute,
        );
        return [
          decodeMethodWithCode(decodeCode),
          encodeMethodWithCode(encodeCode),
        ];
      } else {
        return [];
      }
    },
    macros: function(valueType: ObjectSpec.Type): ObjC.Macro[] {
      return [];
    },
    properties: function(objectType: ObjectSpec.Type): ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMCoding'],
    staticConstants: function(objectType: ObjectSpec.Type): ObjC.Constant[] {
      return objectType.attributes
        .map(codingAttributeForValueAttribute)
        .map(staticConstantForAttribute);
    },
    validationErrors: function(objectType: ObjectSpec.Type): Error.Error[] {
      const unknownTypeErrors = objectType.attributes
        .filter(doesValueAttributeContainAnUnknownType)
        .map(attribute =>
          valueAttributeToUnknownTypeError(objectType, attribute),
        );
      const unsupportedTypeErrors = objectType.attributes
        .filter(doesValueAttributeContainAnUnsupportedType)
        .map(attribute =>
          valueAttributeToUnsupportedTypeError(objectType, attribute),
        );
      const unsupportedLegacyKeyTypeErrors = objectType.attributes
        .filter(doesValueAttributeContainAnLegacyKeyForUnsupportedType)
        .map(attribute =>
          valueAttributeToUnsupportedLegacyKeyTypeError(objectType, attribute),
        );
      const multipleCodingKeyErrors = Maybe.catMaybes(
        objectType.attributes.map(attribute =>
          multipleCodingKeyAnnotationErrorForValueAttribute(
            objectType,
            attribute,
          ),
        ),
      );
      return unknownTypeErrors.concat(
        unsupportedTypeErrors,
        unsupportedLegacyKeyTypeErrors,
        multipleCodingKeyErrors,
      );
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

function codeableAttributeForSubtypePropertyOfAlgebraicType(): CodeableAttribute {
  return {
    name: 'codedSubtype',
    valueAccessor: 'codedSubtype',
    constantName: nameOfConstantForValueName('codedSubtype'),
    constantValue: constantValueForAttributeName('codedSubtype'),
    legacyKeyNames: [],
    type: {
      name: 'NSObject',
      reference: 'NSObject',
    },
    originalType: {
      name: 'NSObject',
      reference: 'NSObject',
    },
  };
}

function codeableAttributeForAlgebraicSubtypeAttribute(
  subtype: AlgebraicType.Subtype,
  attribute: AlgebraicType.SubtypeAttribute,
): CodeableAttribute {
  const valueName: string = subtype.match(
    function(
      namedAttributeCollectionSubtype: AlgebraicType.NamedAttributeCollectionSubtype,
    ) {
      return (
        StringUtils.capitalize(namedAttributeCollectionSubtype.name) +
        StringUtils.capitalize(attribute.name)
      );
    },
    function(attribute: AlgebraicType.SubtypeAttribute) {
      return StringUtils.capitalize(attribute.name);
    },
  );

  const name = AlgebraicTypeUtils.nameOfInstanceVariableForAttribute(
    subtype,
    attribute,
  );
  return {
    name: name,
    valueAccessor: AlgebraicTypeUtils.valueAccessorForInstanceVariableForAttribute(
      subtype,
      attribute,
    ),
    constantName: nameOfConstantForValueName(valueName),
    constantValue: constantValueForAttributeName(name),
    legacyKeyNames: legacyCodingKeyNamesForAttribute(attribute),
    type: AlgebraicTypeUtils.computeTypeOfAttribute(attribute),
    originalType: AlgebraicTypeUtils.computeOriginalTypeOfAttribute(attribute),
  };
}

function decodeStatementForAlgebraicSubtypeAttribute(
  subtype: AlgebraicType.Subtype,
  attribute: AlgebraicType.SubtypeAttribute,
  secureCoding: boolean,
): string {
  const codeableAttribute: CodeableAttribute = codeableAttributeForAlgebraicSubtypeAttribute(
    subtype,
    attribute,
  );
  return decodeStatementForAttribute(codeableAttribute, secureCoding);
}

function decodeStatementsForAlgebraicSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
  secureCoding: boolean,
): string[] {
  const decodeAttributes: string[] = AlgebraicTypeUtils.attributesFromSubtype(
    subtype,
  ).map(attribute => {
    return decodeStatementForAlgebraicSubtypeAttribute(
      subtype,
      attribute,
      secureCoding,
    );
  });
  return decodeAttributes.concat(
    decodedStatementForSubtypeProperty(algebraicType, subtype),
  );
}

function decodedStatementForSubtypeProperty(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
): string {
  return (
    AlgebraicTypeUtils.valueAccessorForInstanceVariableStoringSubtype() +
    ' = ' +
    AlgebraicTypeUtils.EnumerationValueNameForSubtype(algebraicType, subtype) +
    ';'
  );
}

function decodeCodeForAlgebraicType(
  algebraicType: AlgebraicType.Type,
  secureCoding: boolean,
): string[] {
  const codeableAttributeForSubtypeProperty: CodeableAttribute = codeableAttributeForSubtypePropertyOfAlgebraicType();
  const switchStatement: string[] = codeForBranchingOnSubtypeWithSubtypeMapper(
    algebraicType,
    codeableAttributeForSubtypeProperty.valueAccessor,
    (algebraicType, subtype) =>
      decodeStatementsForAlgebraicSubtype(algebraicType, subtype, secureCoding),
  );
  return [
    decodeStatementForSubtype(
      codeableAttributeForSubtypeProperty,
      secureCoding,
    ),
  ].concat(switchStatement);
}

function encodeStatementForAlgebraicSubtypeAttribute(
  subtype: AlgebraicType.Subtype,
  attribute: AlgebraicType.SubtypeAttribute,
): string {
  const codeableAttribute: CodeableAttribute = codeableAttributeForAlgebraicSubtypeAttribute(
    subtype,
    attribute,
  );
  return encodeStatementForAttribute(codeableAttribute);
}

function encodedStatementForSubtypeProperty(
  subtype: AlgebraicType.Subtype,
): string {
  const subtypeAttribute: CodeableAttribute = codeableAttributeForSubtypePropertyOfAlgebraicType();
  const codingStatements: CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(
    subtypeAttribute.type,
  );
  return (
    '[aCoder ' +
    codingStatements.encodeStatement +
    ':' +
    CodingNameForSubtype(subtype) +
    ' forKey:' +
    subtypeAttribute.constantName +
    '];'
  );
}

function encodeStatementsForAlgebraicSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
): string[] {
  const encodeAttributes: string[] = AlgebraicTypeUtils.attributesFromSubtype(
    subtype,
  ).map(attribute =>
    encodeStatementForAlgebraicSubtypeAttribute(subtype, attribute),
  );
  return encodeAttributes.concat(encodedStatementForSubtypeProperty(subtype));
}

function encodeCodeForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): string[] {
  return AlgebraicTypeUtils.codeForSwitchingOnSubtypeWithSubtypeMapper(
    algebraicType,
    AlgebraicTypeUtils.valueAccessorForInstanceVariableStoringSubtype(),
    encodeStatementsForAlgebraicSubtype,
  );
}

function doesAlgebraicAttributeContainAnUnknownType(
  attribute: AlgebraicType.SubtypeAttribute,
): boolean {
  const codingStatements: CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(
    AlgebraicTypeUtils.computeTypeOfAttribute(attribute),
  );
  return codingStatements == null;
}

function doesAlgebraicAttributeContainAnUnsupportedType(
  attribute: AlgebraicType.SubtypeAttribute,
): boolean {
  return (
    isTypeNSCodingCompliant(
      AlgebraicTypeUtils.computeTypeOfAttribute(attribute),
    ) === false
  );
}

function algebraicAttributeToUnknownTypeError(
  algebraicType: AlgebraicType.Type,
  attribute: AlgebraicType.SubtypeAttribute,
): Error.Error {
  return Maybe.match(
    function(underlyingType: string): Error.Error {
      return Error.Error(
        'The Coding plugin does not know how to decode and encode the backing type "' +
          underlyingType +
          '" from ' +
          algebraicType.name +
          '.' +
          attribute.name +
          '. Did you declare the wrong backing type?',
      );
    },
    function(): Error.Error {
      return Error.Error(
        'The Coding plugin does not know how to decode and encode the type "' +
          attribute.type.name +
          '" from ' +
          algebraicType.name +
          '.' +
          attribute.name +
          '. Did you forget to declare a backing type?',
      );
    },
    attribute.type.underlyingType,
  );
}

function algebraicAttributeToUnsupportedTypeError(
  algebraicType: AlgebraicType.Type,
  attribute: AlgebraicType.SubtypeAttribute,
): Error.Error {
  return Maybe.match(
    function(underlyingType: string): Error.Error {
      return Error.Error(
        'The Coding plugin does not know how to decode and encode the backing type "' +
          underlyingType +
          '" from ' +
          algebraicType.name +
          '.' +
          attribute.name +
          '. ' +
          attribute.type.name +
          ' is not NSCoding-compilant.',
      );
    },
    function(): Error.Error {
      return Error.Error(
        'The Coding plugin does not know how to decode and encode the type "' +
          attribute.type.name +
          '" from ' +
          algebraicType.name +
          '.' +
          attribute.name +
          '. ' +
          attribute.type.name +
          ' is not NSCoding-compilant.',
      );
    },
    attribute.type.underlyingType,
  );
}

function unsupportedAnnotationErrorForAlgebraicAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
): Maybe.Maybe<Error.Error> {
  return codingKeysFromAnnotations(attribute.annotations).length != 0
    ? Maybe.Just(
        Error.Error(
          'Custom coding keys are not supported for algebraic type attributes',
        ),
      )
    : Maybe.Nothing();
}

export function CodingNameForSubtype(subtype: AlgebraicType.Subtype): string {
  return constantValueForAttributeName(
    'SUBTYPE_' + AlgebraicTypeUtils.subtypeNameFromSubtype(subtype),
  );
}

function codeForSubtypeBranchesWithSubtypeMapper(
  algebraicType: AlgebraicType.Type,
  subtypeValueAccessor: string,
  subtypeMapper: (
    algebraicType: AlgebraicType.Type,
    subtype: AlgebraicType.Subtype,
  ) => string[],
  soFar: string[],
  subtype: AlgebraicType.Subtype,
): string[] {
  const internalCode: string[] = subtypeMapper(algebraicType, subtype);
  const code: string[] = [
    (soFar.length ? 'else if([' : 'if([') +
      subtypeValueAccessor +
      ' isEqualToString:' +
      CodingNameForSubtype(subtype) +
      ']) {',
  ]
    .concat(internalCode.map(StringUtils.indent(2)))
    .concat(['}']);
  return soFar.concat(code);
}

function codeForBranchingOnSubtypeWithSubtypeMapper(
  algebraicType: AlgebraicType.Type,
  subtypeValueAccessor: string,
  subtypeMapper: (
    algebraicType: AlgebraicType.Type,
    subtype: AlgebraicType.Subtype,
  ) => string[],
): string[] {
  const subtypeBranches: string[] = algebraicType.subtypes.reduce(
    (soFar, subtype) =>
      codeForSubtypeBranchesWithSubtypeMapper(
        algebraicType,
        subtypeValueAccessor,
        subtypeMapper,
        soFar,
        subtype,
      ),
    [],
  );
  const failureCase: string[] = [
    'else {',
    StringUtils.indent(2)(
      '[[NSException exceptionWithName:@"InvalidSubtypeException" reason:@"nil or unknown subtype provided" userInfo:@{@"subtype": ' +
        codeableAttributeForSubtypePropertyOfAlgebraicType().valueAccessor +
        '}] raise];',
    ),
    '}',
  ];
  return subtypeBranches.concat(failureCase);
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
      const secureCoding =
        algebraicType.includes.indexOf('NSSecureCoding') >= 0;
      return secureCoding ? [CodingUtils.supportsSecureCodingMethod] : [];
    },
    enumerations: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Enumeration[] {
      return [];
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
      return [];
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
      const secureCoding =
        algebraicType.includes.indexOf('NSSecureCoding') >= 0;
      if (secureCoding) {
        return [
          {
            name: 'NSSecureCoding',
          },
        ];
      } else {
        return [
          {
            name: 'NSCoding',
          },
        ];
      }
    },
    imports: function(algebraicType: AlgebraicType.Type): ObjC.Import[] {
      return [];
    },
    instanceMethods: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Method[] {
      const secureCoding =
        algebraicType.includes.indexOf('NSSecureCoding') >= 0;
      const decodeCode: string[] = decodeCodeForAlgebraicType(
        algebraicType,
        secureCoding,
      );
      const encodeCode: string[] = encodeCodeForAlgebraicType(algebraicType);
      return [
        decodeMethodWithCode(decodeCode),
        encodeMethodWithCode(encodeCode),
      ];
    },
    instanceVariables: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return [];
    },
    macros: function(algebraicType: AlgebraicType.Type): ObjC.Macro[] {
      return [];
    },
    requiredIncludesToRun: ['RMCoding'],
    staticConstants: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Constant[] {
      const codeableAttributeForSubtypeProperty: CodeableAttribute = codeableAttributeForSubtypePropertyOfAlgebraicType();
      const codeableAttributeForSubtypeAttributes: CodeableAttribute[] = AlgebraicTypeUtils.mapAttributesWithSubtypeFromSubtypes(
        algebraicType.subtypes,
        codeableAttributeForAlgebraicSubtypeAttribute,
      );
      const codeableAttributes: CodeableAttribute[] = [
        codeableAttributeForSubtypeProperty,
      ].concat(codeableAttributeForSubtypeAttributes);
      return codeableAttributes.map(staticConstantForAttribute);
    },
    validationErrors: function(
      algebraicType: AlgebraicType.Type,
    ): Error.Error[] {
      const attributes = AlgebraicTypeUtils.allAttributesFromSubtypes(
        algebraicType.subtypes,
      );
      const unknownTypeErrors = attributes
        .filter(doesAlgebraicAttributeContainAnUnknownType)
        .map(attribute =>
          algebraicAttributeToUnknownTypeError(algebraicType, attribute),
        );
      const unsupportedTypeErrors = attributes
        .filter(doesAlgebraicAttributeContainAnUnsupportedType)
        .map(attribute =>
          algebraicAttributeToUnsupportedTypeError(algebraicType, attribute),
        );
      const unsupportedAnnotationErrors = Maybe.catMaybes(
        attributes.map(unsupportedAnnotationErrorForAlgebraicAttribute),
      );
      return unknownTypeErrors
        .concat(unsupportedTypeErrors)
        .concat(unsupportedAnnotationErrors);
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
