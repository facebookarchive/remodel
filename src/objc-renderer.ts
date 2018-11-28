/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Code = require('./code');
import CPlusPlus = require('./cplusplus');
import FunctionUtils = require('./function-utils');
import List = require('./list');
import Maybe = require('./maybe');
import StringUtils = require('./string-utils');
import ObjC = require('./objc');
import Unique = require('./unique');

function emptyString(): string {
  return '';
}

function returnTrue(): boolean {
  return true;
}

function doesNotBelongToAnImplementedProtocol(
  implementedProtocolNames: string[],
  belongsToProtocol: string,
): boolean {
  return implementedProtocolNames.indexOf(belongsToProtocol) === -1;
}

function includeMethodInHeader(
  implementedProtocols: ObjC.Protocol[],
  instanceMethod: ObjC.Method,
): boolean {
  if (instanceMethod.compilerAttributes.indexOf('NS_UNAVAILABLE') !== -1) {
    return true;
  } else {
    const implementedProtocolNames: string[] = implementedProtocols.map(
      toProtocolString,
    );
    return Maybe.match(
      belongsToProtocol =>
        doesNotBelongToAnImplementedProtocol(
          implementedProtocolNames,
          belongsToProtocol,
        ),
      returnTrue,
      instanceMethod.belongsToProtocol,
    );
  }
}

function localImport(file: string): string {
  if (file.indexOf('.h') === -1) {
    return '#import <' + file + '>';
  } else {
    return '#import "' + file + '"';
  }
}

function libraryImport(file: string, library: string): string {
  return '#import <' + library + '/' + file + '>';
}

function genericizedType(
  modifiers: ObjC.KeywordArgumentModifier[],
  covariantTypes: string[],
  type: ObjC.Type,
): string {
  const genericType: string =
    covariantTypes.indexOf(type.name) > -1 ? 'id' : type.reference;
  const modifiersString: string =
    modifiers.length > 0
      ? modifiers.map(toKeywordArgumentModifierString).join(' ') + ' '
      : '';
  return modifiersString + genericType;
}

function toGenericizedTypeString(
  covariantTypes: string[],
  returnType: ObjC.ReturnType,
): string {
  return Maybe.match(
    type => genericizedType(returnType.modifiers, covariantTypes, type),
    () => 'void',
    returnType.type,
  );
}

function toTypeString(returnType: ObjC.ReturnType): string {
  return toGenericizedTypeString([], returnType);
}

function toImportString(givenImport: ObjC.Import): string {
  return Maybe.match<string, string>(
    lib => libraryImport(givenImport.file, lib),
    () => localImport(givenImport.file),
    givenImport.library,
  );
}

function isPublicImport(givenImport: ObjC.Import): boolean {
  return givenImport.isPublic;
}

function isPrivateImport(givenImport: ObjC.Import): boolean {
  return !isPublicImport(givenImport);
}

function arrayWithDuplicatesRemoved(array: any[]): any[] {
  return array.filter(function(str, pos) {
    return array.indexOf(str) == pos;
  });
}

function returnString(str: string): () => string {
  return function() {
    return str;
  };
}

function toPropertyModifierString(modifier: ObjC.PropertyModifier): string {
  return modifier.match(
    returnString('assign'),
    returnString('atomic'),
    returnString('copy'),
    returnString('nonatomic'),
    returnString('nonnull'),
    returnString('nullable'),
    returnString('readonly'),
    returnString('readwrite'),
    returnString('strong'),
    returnString('weak'),
    returnString('unsafe_unretained'),
  );
}

export function indexOfFirstEndingAsterisk(str: string): number {
  var index: number = str.length - 1;
  while (str.charAt(index) === '*') {
    if (str.charAt(index - 1) !== '*') {
      return index;
    } else {
      index -= 1;
    }
  }
  return -1;
}

function stringReplacingCharacterAtIndexWithString(
  str: string,
  indexToReplace: number,
  replacementString: string,
): string {
  return (
    str.substr(0, indexToReplace) +
    replacementString +
    str.substr(indexToReplace + 1)
  );
}

export function renderableTypeReference(typeReference: string): string {
  const indexOfFirstAsteriskAtEnd: number = indexOfFirstEndingAsterisk(
    typeReference,
  );
  if (
    indexOfFirstAsteriskAtEnd !== -1 &&
    typeReference.charAt(indexOfFirstAsteriskAtEnd - 1) !== ' '
  ) {
    return stringReplacingCharacterAtIndexWithString(
      typeReference,
      indexOfFirstAsteriskAtEnd,
      ' *',
    );
  } else {
    return typeReference;
  }
}

export function renderableTypeReferenceNestingSubsequentToken(
  typeReference: string,
): string {
  const renderableReference: string = renderableTypeReference(typeReference);
  if (renderableReference.indexOf('*') !== -1) {
    return renderableReference;
  } else {
    return renderableReference + ' ';
  }
}

function toPropertyTypeAndNameString(type: ObjC.Type, name: string): string {
  return renderableTypeReferenceNestingSubsequentToken(type.reference) + name;
}

function toPropertyString(property: ObjC.Property): string {
  const propertyComments = property.comments.map(toCommentString).join('\n');
  const propertyCommentsSection = codeSectionForCodeStringWithoutExtraSpace(
    propertyComments,
  );

  return (
    propertyCommentsSection +
    '@property (' +
    property.modifiers.map(toPropertyModifierString).join(', ') +
    ') ' +
    toPropertyTypeAndNameString(property.returnType, property.name) +
    ';'
  );
}

function toKeywordArgumentModifierString(
  argumentModifier: ObjC.KeywordArgumentModifier,
): string {
  return argumentModifier.match(
    returnString('nonnull'),
    returnString('nullable'),
    returnString('NS_NOESCAPE'),
  );
}

export function toKeywordArgumentString(
  covariantTypes: string[],
  argument: ObjC.KeywordArgument,
): string {
  const modifiers: string = argument.modifiers
    .map(toKeywordArgumentModifierString)
    .join(' ');
  const typePart: string = renderableTypeReference(
    genericizedType([], covariantTypes, argument.type),
  );
  const innerPart: string =
    modifiers.length > 0 ? modifiers + ' ' + typePart : typePart;
  return ':(' + innerPart + ')' + argument.name;
}

function toKeywordString(
  covariantTypes: string[],
  keyword: ObjC.Keyword,
): string {
  return (
    keyword.name +
    Maybe.match(
      arg => toKeywordArgumentString(covariantTypes, arg),
      emptyString,
      keyword.argument,
    )
  );
}

function toOptionalPreprocessorOpeningCodeString(method: ObjC.Method): string {
  if (method.preprocessors.length == 0) {
    return '';
  }
  return (
    method.preprocessors
      .map(function(object) {
        return object.openingCode;
      })
      .join('\n') + '\n'
  );
}

function toOptionalPreprocessorClosingCodeString(method: ObjC.Method): string {
  if (method.preprocessors.length == 0) {
    return '';
  }
  return (
    '\n' +
    method.preprocessors
      .map(function(object) {
        return object.closingCode;
      })
      .join('\n')
  );
}

function toMethodHeaderString(
  methodModifier: string,
  method: ObjC.Method,
): string {
  const methodComments = method.comments.map(toCommentString).join('\n');
  const methodCommentsSection = codeSectionForCodeStringWithoutExtraSpace(
    methodComments,
  );
  const compilerAttributesString =
    method.compilerAttributes.length > 0
      ? ' ' + method.compilerAttributes.join(' ')
      : '';

  return (
    toOptionalPreprocessorOpeningCodeString(method) +
    methodCommentsSection +
    methodModifier +
    ' (' +
    toTypeString(method.returnType) +
    ')' +
    method.keywords.map(keyword => toKeywordString([], keyword)).join(' ') +
    compilerAttributesString +
    ';' +
    toOptionalPreprocessorClosingCodeString(method)
  );
}

var toClassMethodHeaderString = method => toMethodHeaderString('+', method);
var toInstanceMethodHeaderString = method => toMethodHeaderString('-', method);

function toMethodImplementationString(
  methodModifier: string,
  covariantTypes: string[],
  method: ObjC.Method,
): string {
  const methodStr =
    toOptionalPreprocessorOpeningCodeString(method) +
    methodModifier +
    ' (' +
    toGenericizedTypeString(covariantTypes, method.returnType) +
    ')' +
    method.keywords
      .map(keyword => toKeywordString(covariantTypes, keyword))
      .join(' ') +
    '\n' +
    '{\n' +
    method.code.map(StringUtils.indent(2)).join('\n') +
    '\n}' +
    toOptionalPreprocessorClosingCodeString(method);
  return methodStr;
}

var toClassMethodImplementationString = (covariantTypes, method) =>
  toMethodImplementationString('+', covariantTypes, method);

var toInstanceMethodImplementationString = (covariantTypes, method) =>
  toMethodImplementationString('-', covariantTypes, method);

function toCovariantTypeString(covariantType: string): string {
  return '__covariant ' + covariantType;
}

function covariantTypesString(covariantTypes: string[]): string {
  if (covariantTypes.length > 0) {
    return '<' + covariantTypes.map(toCovariantTypeString).join(', ') + '>';
  } else {
    return '';
  }
}

function toProtocolString(protocol: ObjC.Protocol): string {
  return protocol.name;
}

function protocolsString(protocols: ObjC.Protocol[]): string {
  var dedupedProtocolStrings = List.toArray(
    Unique.uniqueValuesInList(List.fromArray(protocols.map(toProtocolString))),
  );
  if (dedupedProtocolStrings.length > 0) {
    return ' <' + dedupedProtocolStrings.join(', ') + '>';
  } else {
    return '';
  }
}

function implementedProtocolsIncludingNSObjectAndADTInit(
  implementedProtocols: ObjC.Protocol[],
): ObjC.Protocol[] {
  return implementedProtocols
    .concat({name: 'NSObject'})
    .concat({name: 'ADTInit'});
}

const HEADER_FUNCTIONS_SECTION_BEGIN: string =
  '#ifdef __cplusplus\nextern "C" {\n#endif\n\n';
const HEADER_FUNCTIONS_SECTION_END: string =
  '\n\n#ifdef __cplusplus\n}\n#endif';

function isPublicFunction(functionDefinition: ObjC.Function): boolean {
  return functionDefinition.isPublic;
}

function toFunctionHeaderString(functionDefinition: ObjC.Function): string {
  const functionHeaderComments = functionDefinition.comments
    .map(toCommentString)
    .join('\n');
  const functionHeaderCommentsSection = codeSectionForCodeStringWithoutExtraSpace(
    functionHeaderComments,
  );

  return (
    functionHeaderCommentsSection +
    functionDeclarationForFunction(functionDefinition) +
    ';'
  );
}

function toCommentString(comment: ObjC.Comment): string {
  return comment.content;
}

function addCommaToEndOfString(str: string): string {
  return str + ',';
}

function toNSEnumDeclaration(enumeration: ObjC.Enumeration): string {
  const enumComments = enumeration.comments.map(toCommentString).join('\n');
  const enumCommentsSection = codeSectionForCodeStringWithoutExtraSpace(
    enumComments,
  );
  const declaration: string =
    enumCommentsSection +
    'typedef NS_ENUM(' +
    enumeration.underlyingType +
    ', ' +
    enumeration.name +
    ') {';
  const values: string[] = enumeration.values.map(StringUtils.indent(2));
  const valuesContainingCommas: string[] = values
    .slice(0, values.length - 1)
    .map(addCommaToEndOfString)
    .concat(values.slice(values.length - 1));
  return [declaration]
    .concat(valuesContainingCommas)
    .concat('};')
    .join('\n');
}

function enumerationIsPublic(
  isPublic: boolean,
): (enumeration: ObjC.Enumeration) => boolean {
  return function(enumeration: ObjC.Enumeration): boolean {
    return enumeration.isPublic === isPublic;
  };
}

class Macro {
  prefix: string;
  postfix: string;

  constructor(prefix: string, postfix: string) {
    this.prefix = prefix;
    this.postfix = postfix;
  }
}

function classNullabilityMacro(
  nullability: ObjC.ClassNullability,
): Maybe.Maybe<Macro> {
  switch (nullability) {
    case ObjC.ClassNullability.assumeNonnull:
      return Maybe.Just(
        new Macro('NS_ASSUME_NONNULL_BEGIN', 'NS_ASSUME_NONNULL_END'),
      );
    case ObjC.ClassNullability.default:
      return Maybe.Nothing<Macro>();
  }
}

function classMacros(classInfo: ObjC.Class): Macro[] {
  return Maybe.catMaybes([classNullabilityMacro(classInfo.nullability)]);
}

function blockMacros(blockType: ObjC.BlockType): Macro[] {
  return Maybe.catMaybes([classNullabilityMacro(blockType.nullability)]);
}

function toPrefixMacroString(macro: Macro): string {
  return macro.prefix;
}

function toPostfixMacroString(macro: Macro): string {
  return macro.postfix;
}

export function toBlockTypeParameterString(
  parameter: ObjC.BlockTypeParameter,
): string {
  if (parameter.type != null) {
    const nullabilityModifier: String = parameter.nullability.match(
      returnString(''),
      returnString('_Nonnull '),
      returnString('_Nullable '),
    );
    return (
      renderableTypeReferenceNestingSubsequentToken(parameter.type.reference) +
      nullabilityModifier +
      parameter.name
    );
  } else {
    return 'void';
  }
}

function toBlockTypeDeclaration(blockType: ObjC.BlockType): string {
  const blockTypeComments = blockType.comments.map(toCommentString).join('\n');
  const blockTypeCommentsSection = codeSectionForCodeStringWithoutExtraSpace(
    blockTypeComments,
  );

  return (
    blockTypeCommentsSection +
    'typedef ' +
    toFunctionReturnTypeString(blockType.returnType) +
    '(^' +
    blockType.name +
    ')(' +
    blockType.parameters.map(toBlockTypeParameterString).join(', ') +
    ');'
  );
}

function toBlockTypeDeclarationWithMacros(blockType: ObjC.BlockType): string {
  const macros = blockMacros(blockType);

  const prefixBlockTypeMacrosStr: string = macros
    .map(toPrefixMacroString)
    .join('\n');
  const prefixBlockTypeMacrosSection: string =
    prefixBlockTypeMacrosStr !== '' ? prefixBlockTypeMacrosStr + '\n' : '';

  const blockTypeDeclaration = toBlockTypeDeclaration(blockType);

  const postfixBlockTypeMacrosStr: string = macros
    .map(toPostfixMacroString)
    .join('\n');
  const postfixBlockTypeMacrosSection: string =
    postfixBlockTypeMacrosStr !== '' ? '\n' + postfixBlockTypeMacrosStr : '';

  return (
    prefixBlockTypeMacrosSection +
    blockTypeDeclaration +
    postfixBlockTypeMacrosSection
  );
}

function blockTypeIsPublic(
  isPublic: boolean,
): (blockType: ObjC.BlockType) => boolean {
  return function(blockType: ObjC.BlockType): boolean {
    return blockType.isPublic === isPublic;
  };
}

function blockTypeIsInlined(
  isInlined: boolean,
): (blockType: ObjC.BlockType) => boolean {
  return function(blockType: ObjC.BlockType): boolean {
    return blockType.isInlined === isInlined;
  };
}

function headerFunctionsSection(functions: ObjC.Function[]): string {
  const functionsToIncludeInHeader = functions.filter(isPublicFunction);
  if (functionsToIncludeInHeader.length > 0) {
    return (
      HEADER_FUNCTIONS_SECTION_BEGIN +
      functionsToIncludeInHeader.map(toFunctionHeaderString).join('\n') +
      HEADER_FUNCTIONS_SECTION_END
    );
  } else {
    return '';
  }
}

function templateTypeDeclaration(templateType: CPlusPlus.TemplateType): string {
  return templateType.match(
    function(): string {
      return 'typename';
    },
    function(): string {
      return 'class';
    },
  );
}

function toTemplatedTypeContents(
  templatedType: CPlusPlus.TemplatedType,
): string {
  return (
    templateTypeDeclaration(templatedType.type) + ' ' + templatedType.value
  );
}

function toTemplateContents(template: CPlusPlus.Template): string[] {
  const templateDeclaration: string =
    'template <' +
    template.templatedTypes.map(toTemplatedTypeContents).join(', ') +
    '>';
  return [templateDeclaration].concat(template.code);
}

function buildTemplateContents(
  soFar: string[],
  templateContents: string[],
): string[] {
  return soFar.concat(templateContents);
}

function toStructContents(struct) {
  var structDeclaration = 'struct ' + struct.name + ' {' + '\n';
  var endStructDeclaration = '};';
  return struct.templates
    .map(toTemplateContents)
    .reduce(buildTemplateContents, [])
    .concat(structDeclaration)
    .concat(
      struct.code.reduce(buildStructContents, []).map(StringUtils.indent(2)),
    )
    .concat(endStructDeclaration)
    .join('\n');
}

function buildStructContents(soFar, structContents) {
  return soFar.concat(structContents);
}

function toNamespaceContents(namespace: CPlusPlus.Namespace): string {
  const namespaceDeclaration: string = 'namespace ' + namespace.name + ' {';
  const endNamespaceDeclaration: string = '}';

  return [namespaceDeclaration]
    .concat(
      namespace.templates
        .map(toTemplateContents)
        .reduce(buildTemplateContents, [])
        .map(StringUtils.indent(2)),
    )
    .concat(endNamespaceDeclaration)
    .join('\n');
}

function headerNeedsToIncludeInstanceVariable(
  instanceVariable: ObjC.InstanceVariable,
): boolean {
  return instanceVariable.access.match(
    function privateAccess(): boolean {
      return false;
    },
    function packageAccess(): boolean {
      return true;
    },
    function publicAccess(): boolean {
      return true;
    },
  );
}

function implementationNeedsToIncludeInstanceVariable(
  instanceVariable: ObjC.InstanceVariable,
): boolean {
  return !headerNeedsToIncludeInstanceVariable(instanceVariable);
}

function accessIdentifierForAccess(
  propertyAccess: ObjC.InstanceVariableAccess,
): string {
  return propertyAccess.match(
    function privateAccess(): string {
      return '@private';
    },
    function packageAccess(): string {
      return '@package';
    },
    function publicAccess(): string {
      return '@public';
    },
  );
}

function buildInstanceVariablesContainingAccessIdentifiers(
  soFar: string[],
  instanceVariable: ObjC.InstanceVariable,
): string[] {
  return soFar.concat([
    accessIdentifierForAccess(instanceVariable.access),
    toInstanceVariableString(instanceVariable),
  ]);
}

function headerClassSection(file: Code.File, classInfo: ObjC.Class): string {
  const macros = classMacros(classInfo);

  const prefixClassMacrosStr: string = macros
    .map(toPrefixMacroString)
    .join('\n');
  const prefixClassMacrosSection: string =
    prefixClassMacrosStr !== '' ? prefixClassMacrosStr + '\n\n' : '';

  const classComments = classInfo.comments.map(toCommentString).join('\n');
  const classCommentsSection = codeSectionForCodeStringWithoutExtraSpace(
    classComments,
  );

  const covariantTypesStr = covariantTypesString(classInfo.covariantTypes);
  const protocolsStr = protocolsString(classInfo.implementedProtocols);

  const subclassingRestrictedStr = classInfo.subclassingRestricted
    ? '__attribute__((objc_subclassing_restricted)) \n'
    : '';
  const classSection =
    '@interface ' +
    classInfo.name +
    covariantTypesStr +
    ' : ' +
    classInfo.baseClassName +
    protocolsStr;

  const instanceVariablesStr: string = classInfo.instanceVariables
    .filter(headerNeedsToIncludeInstanceVariable)
    .reduce(buildInstanceVariablesContainingAccessIdentifiers, [])
    .map(StringUtils.indent(2))
    .join('\n');
  const instanceVariablesSection: string =
    instanceVariablesStr !== ''
      ? '{\n' + instanceVariablesStr + '\n}\n\n'
      : '\n';

  const propertiesStr = classInfo.properties.map(toPropertyString).join('\n');
  const propertiesSection = codeSectionForCodeString(propertiesStr);

  const inlinedBlocksStr: string = file.blockTypes
    .filter(blockTypeIsInlined(true))
    .filter(blockTypeIsPublic(true))
    .map(toBlockTypeDeclaration)
    .join('\n');
  const inlinedBlocksSection: string = codeSectionForCodeString(
    inlinedBlocksStr,
  );

  const implementedProtocols = implementedProtocolsIncludingNSObjectAndADTInit(
    classInfo.implementedProtocols,
  );
  const classMethodsStr = classInfo.classMethods
    .filter(method => includeMethodInHeader(implementedProtocols, method))
    .map(toClassMethodHeaderString)
    .join('\n\n');
  const classMethodsSection = codeSectionForCodeString(classMethodsStr);

  const instanceMethodsStr = classInfo.instanceMethods
    .filter(method => includeMethodInHeader(implementedProtocols, method))
    .map(toInstanceMethodHeaderString)
    .join('\n\n');
  const instanceMethodsSection = codeSectionForCodeString(instanceMethodsStr);

  const postfixClassMacrosStr: string = macros
    .map(toPostfixMacroString)
    .join('\n');
  const postfixClassMacrosSection: string =
    postfixClassMacrosStr !== '' ? '\n\n' + postfixClassMacrosStr : '';

  return (
    prefixClassMacrosSection +
    classCommentsSection +
    subclassingRestrictedStr +
    classSection +
    '\n' +
    instanceVariablesSection +
    propertiesSection +
    inlinedBlocksSection +
    classMethodsSection +
    instanceMethodsSection +
    '@end' +
    postfixClassMacrosSection
  );
}

function toDeclarationString(forwardDeclaration: ObjC.ForwardDeclaration) {
  return forwardDeclaration.match<string>(
    function(classDeclarationName: string): string {
      return '@class ' + classDeclarationName + ';';
    },
    function(protocolDeclarationName: string): string {
      return '@protocol ' + protocolDeclarationName + ';';
    },
  );
}

export function renderHeader(file: Code.File): Maybe.Maybe<string> {
  const commentsStr = file.comments.map(toCommentString).join('\n');
  const commentsSection = codeSectionForCodeString(commentsStr);

  const imports = file.imports.filter(isPublicImport).map(toImportString);
  const importStr = arrayWithDuplicatesRemoved(imports).join('\n');
  const importsSection = codeSectionForCodeString(importStr);

  const declarations = file.forwardDeclarations.map(toDeclarationString);
  const declarationsStr = arrayWithDuplicatesRemoved(declarations).join('\n');
  const declarationsSection = codeSectionForCodeString(declarationsStr);

  const enumerationsStr: string = file.enumerations
    .filter(enumerationIsPublic(true))
    .map(toNSEnumDeclaration)
    .join('\n');
  const enumerationsSection: string = codeSectionForCodeString(enumerationsStr);

  const blocksStr: string = file.blockTypes
    .filter(blockTypeIsInlined(false))
    .filter(blockTypeIsPublic(true))
    .map(toBlockTypeDeclarationWithMacros)
    .join('\n');
  const blocksSection: string = codeSectionForCodeString(blocksStr);

  const functionsSection = codeSectionForCodeString(
    headerFunctionsSection(file.functions),
  );

  const classSection = file.classes
    .map(cls => headerClassSection(file, cls))
    .join('\n\n');

  const structsStr = file.structs.map(toStructContents).join('\n');
  const structsSection = codeSectionForCodeString(structsStr);

  const namespacesStr: string = file.namespaces
    .map(toNamespaceContents)
    .join('\n');
  const namespacesSection: string = codeSectionForCodeString(namespacesStr);

  const contents: string =
    commentsSection +
    importsSection +
    declarationsSection +
    enumerationsSection +
    blocksSection +
    functionsSection +
    structsSection +
    namespacesSection +
    classSection +
    '\n\n';
  return Maybe.Just<string>(contents);
}

function toMemorySemanticString(memorySemantic: ObjC.MemorySemantic): string {
  return memorySemantic.match(
    returnString('assign'),
    returnString('copy'),
    returnString('strong'),
    returnString('__unsafe_unretained'),
    returnString('weak'),
  );
}

function toStaticConstantString(constant: ObjC.Constant): string {
  const constantComments = constant.comments.map(toCommentString).join('\n');
  const constantCommentsSection = codeSectionForCodeStringWithoutExtraSpace(
    constantComments,
  );

  return (
    constantCommentsSection +
    'static ' +
    toMemorySemanticString(constant.memorySemantic) +
    ' ' +
    constant.type.reference +
    ' const ' +
    constant.name +
    ' = ' +
    constant.value +
    ';'
  );
}

function qualifierForFunction(functionDefinition: ObjC.Function): string {
  if (functionDefinition.isPublic) {
    return 'extern';
  } else {
    return 'static';
  }
}

function toFunctionReturnTypeString(returnType: ObjC.ReturnType): string {
  return renderableTypeReferenceNestingSubsequentToken(
    toTypeString(returnType),
  );
}

function toFunctionParameterString(
  functionParameter: ObjC.FunctionParameter,
): string {
  return (
    renderableTypeReferenceNestingSubsequentToken(
      functionParameter.type.reference,
    ) + functionParameter.name
  );
}

function declarationCommentsForFunctionImplementation(
  functionDefinition: ObjC.Function,
): string {
  if (!functionDefinition.isPublic) {
    const functionDeclarationComments = functionDefinition.comments
      .map(toCommentString)
      .join('\n');
    const functionDeclarationCommentsSection = codeSectionForCodeStringWithoutExtraSpace(
      functionDeclarationComments,
    );

    return functionDeclarationCommentsSection;
  } else {
    return '';
  }
}

function functionDeclarationForFunction(
  functionDefinition: ObjC.Function,
): string {
  // don't add a newline if there are no attributes
  const attributes =
    functionDefinition.compilerAttributes.length > 0
      ? functionDefinition.compilerAttributes.join(' ') + '\n'
      : '';

  return (
    attributes +
    qualifierForFunction(functionDefinition) +
    ' ' +
    toFunctionReturnTypeString(functionDefinition.returnType) +
    functionDefinition.name +
    '(' +
    functionDefinition.parameters.map(toFunctionParameterString).join(', ') +
    ')'
  );
}

const BEGINNING_OF_DEFINE = '#';

function indentFunctionCode(
  indentFunc: (str: string) => string,
  code: string,
): string {
  if (code.charAt(0) !== BEGINNING_OF_DEFINE) {
    return indentFunc(code);
  } else {
    return code;
  }
}

export function toMacroImplementationString(
  macroDefinition: ObjC.Macro,
): string {
  const parameters = macroDefinition.parameters.join(', ');
  return `#define ${macroDefinition.name}(${parameters}) ${
    macroDefinition.code
  }`;
}

export function toFunctionImplementationString(
  functionDefinition: ObjC.Function,
): string {
  return (
    declarationCommentsForFunctionImplementation(functionDefinition) +
    functionDeclarationForFunction(functionDefinition) +
    ' {\n' +
    functionDefinition.code
      .map(line => indentFunctionCode(StringUtils.indent(2), line))
      .join('\n') +
    '\n}'
  );
}

function toInstanceVariableModifierString(
  modifier: ObjC.InstanceVariableModifier,
): string {
  return modifier.match(
    returnString(''),
    returnString(''),
    returnString('__strong'),
    returnString('__weak'),
    returnString('__unsafe_unretained'),
  );
}

function toInstanceVariableString(
  instanceVariable: ObjC.InstanceVariable,
): string {
  const instanceVariableComments = instanceVariable.comments
    .map(toCommentString)
    .join('\n');
  const instanceVariableCommentsSection = codeSectionForCodeStringWithoutExtraSpace(
    instanceVariableComments,
  );
  const memorySemantics: string = instanceVariable.modifiers
    .map(toInstanceVariableModifierString)
    .join(' ');
  const typeString: string = renderableTypeReferenceNestingSubsequentToken(
    instanceVariable.returnType.reference,
  );
  const name: string = '_' + instanceVariable.name;
  return (
    instanceVariableCommentsSection +
    (memorySemantics.length > 0 ? memorySemantics + ' ' : '') +
    typeString +
    name +
    ';'
  );
}

function toDiagnosticIgnoreString(diagnosticIgnore: string): string {
  return '#pragma GCC diagnostic ignored "' + diagnosticIgnore + '"';
}

function methodIsNotUnavailableNSObjectMethod(method: ObjC.Method): boolean {
  return Maybe.match(
    function Just(type: string) {
      if (type == 'NSObject') {
        return method.compilerAttributes.indexOf('NS_UNAVAILABLE') === -1;
      } else {
        return true;
      }
    },
    function Nothing() {
      return true;
    },
    method.belongsToProtocol,
  );
}

function implementationClassSection(classInfo: ObjC.Class): string {
  const macros = classMacros(classInfo);

  const prefixClassMacrosStr: string = macros
    .map(toPrefixMacroString)
    .join('\n');
  const prefixClassMacrosSection: string =
    prefixClassMacrosStr !== '' ? prefixClassMacrosStr + '\n\n' : '';

  const classSection: string = '@implementation ' + classInfo.name + '\n';
  const instanceVariablesStr: string = classInfo.instanceVariables
    .filter(implementationNeedsToIncludeInstanceVariable)
    .map(toInstanceVariableString)
    .map(StringUtils.indent(2))
    .join('\n');
  const instanceVariablesSection: string =
    instanceVariablesStr !== ''
      ? '{\n' + instanceVariablesStr + '\n}\n\n'
      : '\n';
  const classMethodsStr: string = classInfo.classMethods
    .filter(methodIsNotUnavailableNSObjectMethod)
    .map(method =>
      toClassMethodImplementationString(classInfo.covariantTypes, method),
    )
    .join('\n\n');
  const classMethodsSection = codeSectionForCodeString(classMethodsStr);
  const instanceMethodsSection = classInfo.instanceMethods
    .filter(methodIsNotUnavailableNSObjectMethod)
    .map(method =>
      toInstanceMethodImplementationString(classInfo.covariantTypes, method),
    )
    .join('\n\n');

  const postfixClassMacrosStr: string = macros
    .map(toPostfixMacroString)
    .join('\n');
  const postfixClassMacrosSection: string =
    postfixClassMacrosStr !== '' ? '\n\n' + postfixClassMacrosStr : '';

  return (
    prefixClassMacrosSection +
    classSection +
    instanceVariablesSection +
    classMethodsSection +
    instanceMethodsSection +
    '\n\n@end' +
    postfixClassMacrosSection
  );
}

function codeSectionForCodeString(codeStr: string): string {
  return codeStr.length > 0 ? codeStr + '\n\n' : '';
}

function codeSectionForCodeStringWithoutExtraSpace(codeStr: string): string {
  return codeStr.length > 0 ? codeStr + '\n' : '';
}

function importIsPublic(
  isPublic: boolean,
): (importToCheck: ObjC.Import) => boolean {
  return function(importToCheck: ObjC.Import): boolean {
    return importToCheck.isPublic == isPublic;
  };
}

function willHaveImplementationForClass(classInfo: ObjC.Class): boolean {
  return (
    classInfo.classMethods.length > 0 ||
    classInfo.instanceMethods.length > 0 ||
    classInfo.instanceVariables.filter(
      implementationNeedsToIncludeInstanceVariable,
    ).length > 0
  );
}

function willHaveImplementationForFunction(func: ObjC.Function): boolean {
  return func.code.length > 0 || !func.isPublic;
}

function fileHasImplementationCodeToRender(file: Code.File): boolean {
  const importsRequireImplementation: boolean =
    file.imports.filter(importIsPublic(false)).length > 0;
  const enumerationsRequireImplementation: boolean =
    file.enumerations.filter(enumerationIsPublic(false)).length > 0;
  const blockTypesRequireImplementation: boolean =
    file.blockTypes.filter(blockTypeIsPublic(false)).length > 0;
  const functionsRequireImplementation: boolean =
    file.functions.filter(willHaveImplementationForFunction).length > 0;
  const classesRequireImplementation: boolean =
    file.classes.filter(willHaveImplementationForClass).length > 0;

  return (
    importsRequireImplementation ||
    enumerationsRequireImplementation ||
    blockTypesRequireImplementation ||
    functionsRequireImplementation ||
    classesRequireImplementation
  );
}

function diagnosticIgnoreSectionFromStr(str: string): string {
  if (str.length > 0) {
    return '#pragma clang diagnostic push\n' + str + '\n\n';
  } else {
    return '';
  }
}

function diagnosticIgnoreEndSectionFromStr(str: string): string {
  if (str.length > 0) {
    return '#pragma clang diagnostic pop\n';
  } else {
    return '';
  }
}

function arcCompileFlagCheckSection(): string {
  return (
    '#if  ! __has_feature(objc_arc)\n' +
    '#error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).\n' +
    '#endif\n\n'
  );
}

export function renderImplementation(file: Code.File): Maybe.Maybe<string> {
  if (fileHasImplementationCodeToRender(file)) {
    const commentsStr = file.comments.map(toCommentString).join('\n');
    const commentsSection = codeSectionForCodeString(commentsStr);

    const imports = file.imports.filter(isPrivateImport).map(toImportString);
    const importStr = arrayWithDuplicatesRemoved(imports).join('\n');
    const importsSection = codeSectionForCodeString(importStr);

    const diagnosticIgnoresStr = file.diagnosticIgnores
      .map(toDiagnosticIgnoreString)
      .join('\n');
    const diagnosticIgnoresSection = diagnosticIgnoreSectionFromStr(
      diagnosticIgnoresStr,
    );
    const diagnosticIgnoresEndSection = diagnosticIgnoreEndSectionFromStr(
      diagnosticIgnoresStr,
    );

    const staticConstantsStr = file.staticConstants
      .map(toStaticConstantString)
      .join('\n');
    const staticConstantsSection = codeSectionForCodeString(staticConstantsStr);

    const enumerationsStr = file.enumerations
      .filter(enumerationIsPublic(false))
      .map(toNSEnumDeclaration)
      .join('\n');
    const enumerationsSection = codeSectionForCodeString(enumerationsStr);

    const blocksStr: string = file.blockTypes
      .filter(blockTypeIsPublic(false))
      .map(toBlockTypeDeclarationWithMacros)
      .join('\n');
    const blocksSection: string = codeSectionForCodeString(blocksStr);

    const macrosStr = file.macros.map(toMacroImplementationString).join('\n\n');
    const macrosSection = codeSectionForCodeString(macrosStr);

    const functionStr = file.functions
      .map(toFunctionImplementationString)
      .join('\n\n');
    const functionsSection = codeSectionForCodeString(functionStr);

    const classesSection = file.classes
      .map(implementationClassSection)
      .join('\n\n');

    const contents: string =
      commentsSection +
      arcCompileFlagCheckSection() +
      importsSection +
      diagnosticIgnoresSection +
      staticConstantsSection +
      enumerationsSection +
      blocksSection +
      macrosSection +
      functionsSection +
      classesSection +
      '\n' +
      diagnosticIgnoresEndSection +
      '\n';

    return Maybe.Just<string>(contents);
  } else {
    return Maybe.Nothing<string>();
  }
}
