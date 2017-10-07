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
import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjCTypeUtils = require('../objc-type-utils');
import StringUtils = require('../string-utils');
import ObjectSpec = require('../object-spec');
import ObjectSpecCodeUtils = require('../object-spec-code-utils');
import CodingUtils = require('./coding-utils')

function underscored(str: string): string {
  return str.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
}

export interface CodeableAttribute {
  name:string;
  valueAccessor:string;
  constantName:string;
  type:ObjC.Type;
}

function codingAttributeForValueAttribute(attribute:ObjectSpec.Attribute):CodeableAttribute {
  return {
    name: attribute.name,
    valueAccessor: ObjectSpecCodeUtils.ivarForAttribute(attribute),
    constantName: nameOfConstantForValueName(attribute.name),
    type: ObjectSpecCodeUtils.computeTypeOfAttribute(attribute)
  };
}

export function decodeStatementForAttribute(attribute:CodeableAttribute):string {
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(attribute.type);
  const decodedRawValuePart:string = '[aDecoder ' + codingStatements.decodeStatement + ':' + attribute.constantName + ']';
  const decodedValuePart = codingStatements.decodeValueStatementGenerator(decodedRawValuePart);
  return attribute.valueAccessor + ' = ' + decodedValuePart + ';';
}

function decodeStatementForSubtype(attribute:CodeableAttribute):string {
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(attribute.type);
  const decodedRawValuePart:string = '[aDecoder ' + codingStatements.decodeStatement + ':' + attribute.constantName + ']';
  const decodedValuePart = codingStatements.decodeValueStatementGenerator(decodedRawValuePart);
  return 'NSString *' + attribute.valueAccessor + ' = ' + decodedValuePart + ';';
}

export function encodeStatementForAttribute(attribute:CodeableAttribute):string {
  const codingStatements: CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(attribute.type);
  const encodeValuePart = codingStatements.encodeValueStatementGenerator(attribute.valueAccessor);
  return '[aCoder ' + codingStatements.encodeStatement + ':' + encodeValuePart + ' forKey:' + attribute.constantName + '];';
}

function nameOfConstantForValueName(valueName:string): string {
  return 'k' + StringUtils.capitalize(valueName) + 'Key';
}

function constantValueForAttributeName(attributeName:string):string {
  return '@"' + underscored(attributeName).toUpperCase() + '"';
}

function staticConstantForAttribute(attribute:CodeableAttribute):ObjC.Constant {
  return {
    type: {
      name:'NSString',
      reference:'NSString *'
    },
    comments: [],
    name: attribute.constantName,
    value: constantValueForAttributeName(attribute.name),
    memorySemantic: ObjC.MemorySemantic.UnsafeUnretained()
  };
}

function initBlockWithInternalCode(internalCode:string[]):string[] {
  const returnStatement:string = 'return self;';
  return ['if ((self = [super init])) {'].concat(internalCode.map(StringUtils.indent(2))).concat('}').concat(returnStatement);
}

function decodeMethodWithCode(code:string[]):ObjC.Method {
  return {
    belongsToProtocol:Maybe.Just<string>('NSCoding'),
    code: initBlockWithInternalCode(code),
    comments:[],
    compilerAttributes:[],
    keywords: [
      {
        name: 'initWithCoder',
        argument: Maybe.Just<ObjC.KeywordArgument>({
          name: 'aDecoder',
          modifiers: [],
          type: {
            name: 'NSCoder',
            reference: 'NSCoder *'
          }
        })
      }
    ],
    returnType: Maybe.Just<ObjC.Type>({
      name: 'instancetype',
      reference: 'instancetype'
    })
  };
}

function encodeMethodWithCode(code:string[]):ObjC.Method {
  return {
    belongsToProtocol:Maybe.Just('NSCoding'),
    code: code,
    comments:[],
    compilerAttributes:[],
    keywords: [
      {
        name: 'encodeWithCoder',
        argument: Maybe.Just<ObjC.KeywordArgument>({
          name: 'aCoder',
          modifiers: [],
          type: {
            name: 'NSCoder',
            reference: 'NSCoder *'
          }
        })
      }
    ],
    returnType: Maybe.Nothing<ObjC.Type>()
  };
}

function isTypeNSCodingCompliant(type:ObjC.Type):boolean {
  return ObjCTypeUtils.matchType({
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
    }
  },
  type);
}

function doesValueAttributeContainAnUnknownType(attribute:ObjectSpec.Attribute):boolean {
  const codeableAttribute:CodeableAttribute = codingAttributeForValueAttribute(attribute);
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(codeableAttribute.type);
  return codingStatements == null;
}

function doesValueAttributeContainAnUnsupportedType(attribute:ObjectSpec.Attribute):boolean {
  return isTypeNSCodingCompliant(ObjectSpecCodeUtils.computeTypeOfAttribute(attribute)) === false;
}

function valueAttributeToUnknownTypeError(objectType:ObjectSpec.Type, attribute:ObjectSpec.Attribute):Error.Error {
  return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the backing type "' + underlyingType + '" from ' + objectType.typeName + '.' + attribute.name + '. Did you declare the wrong backing type?');
  }, function():Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the type "' + attribute.type.name + '" from ' + objectType.typeName + '.' + attribute.name + '. Did you forget to declare a backing type?');
  }, attribute.type.underlyingType);
}

function valueAttributeToUnsupportedTypeError(objectType:ObjectSpec.Type, attribute:ObjectSpec.Attribute):Error.Error {
   return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the backing type "' + underlyingType + '" from ' + objectType.typeName + '.' + attribute.name + '. ' + attribute.type.name + ' is not NSCoding-compilant.');
  }, function():Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the type "' + attribute.type.name + '" from ' + objectType.typeName + '.' + attribute.name + '. ' + attribute.type.name + ' is not NSCoding-compilant.');
  }, attribute.type.underlyingType);
}

function importForAttributeCodingMethod(attribute:ObjectSpec.Attribute):Maybe.Maybe<ObjC.Import> {
  const codeableAttribute:CodeableAttribute = codingAttributeForValueAttribute(attribute);
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(codeableAttribute.type);
  return codingStatements.codingFunctionImport;
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
      return [];
    },
    functions: function(objectType:ObjectSpec.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(objectType:ObjectSpec.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
      return [
        {
          name: 'NSCoding'
        }
      ];
    },
    imports: function(objectType:ObjectSpec.Type):ObjC.Import[] {
      const codingImportMaybes:Maybe.Maybe<ObjC.Import>[] = objectType.attributes.map(importForAttributeCodingMethod);

      return Maybe.catMaybes(codingImportMaybes);
    },
    instanceMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
      if (objectType.attributes.length > 0) {
        const codingAttributes:CodeableAttribute[] = objectType.attributes.map(codingAttributeForValueAttribute);
        const decodeCode:string[] = codingAttributes.map(decodeStatementForAttribute);
        const encodeCode:string[] = codingAttributes.map(encodeStatementForAttribute);
        return [
          decodeMethodWithCode(decodeCode),
          encodeMethodWithCode(encodeCode)
        ];
      } else {
        return [];
      }
    },
    properties: function(objectType:ObjectSpec.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun:['RMCoding'],
    staticConstants: function(objectType:ObjectSpec.Type):ObjC.Constant[] {
      return objectType.attributes.map(codingAttributeForValueAttribute).map(staticConstantForAttribute);
    },
    validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
      const unknownTypeErrors = objectType.attributes.filter(doesValueAttributeContainAnUnknownType).map(FunctionUtils.pApplyf2(objectType, valueAttributeToUnknownTypeError));
      const unsupportedTypeErrors = objectType.attributes.filter(doesValueAttributeContainAnUnsupportedType).map(FunctionUtils.pApplyf2(objectType, valueAttributeToUnsupportedTypeError));
      return unknownTypeErrors.concat(unsupportedTypeErrors);
    },
    nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    }
  };
}

function codeableAttributeForSubtypePropertyOfAlgebraicType():CodeableAttribute {
  return {
    name: 'codedSubtype',
    valueAccessor: 'codedSubtype',
    constantName: nameOfConstantForValueName('codedSubtype'),
    type: {
      name: 'NSObject',
      reference: 'NSObject'
    }
  };
}

function codeableAttributeForAlgebraicSubtypeAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):CodeableAttribute {
  const valueName:string = subtype.match(
    function(namedAttributeCollectionSubtype:AlgebraicType.NamedAttributeCollectionSubtype) {
      return StringUtils.capitalize(namedAttributeCollectionSubtype.name) + StringUtils.capitalize(attribute.name) ;
    },
    function(attribute:AlgebraicType.SubtypeAttribute) {
      return StringUtils.capitalize(attribute.name);
    });

  return {
    name: AlgebraicTypeUtils.nameOfInternalPropertyForAttribute(subtype, attribute),
    valueAccessor: AlgebraicTypeUtils.valueAccessorForInternalPropertyForAttribute(subtype, attribute),
    constantName: nameOfConstantForValueName(valueName),
    type: AlgebraicTypeUtils.computeTypeOfAttribute(attribute)
  };
}

function decodeStatementForAlgebraicSubtypeAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):string {
  const codeableAttribute:CodeableAttribute = codeableAttributeForAlgebraicSubtypeAttribute(subtype, attribute);
  return decodeStatementForAttribute(codeableAttribute);
}

function decodeStatementsForAlgebraicSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):string[] {
  const decodeAttributes:string[] = AlgebraicTypeUtils.attributesFromSubtype(subtype).map(FunctionUtils.pApplyf2(subtype, decodeStatementForAlgebraicSubtypeAttribute));
  return decodeAttributes.concat(decodedStatementForSubtypeProperty(algebraicType, subtype))
}

function decodedStatementForSubtypeProperty(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):string {
  return AlgebraicTypeUtils.valueAccessorForInternalPropertyStoringSubtype() + ' = ' + AlgebraicTypeUtils.EnumerationValueNameForSubtype(algebraicType, subtype) + ';';
}

function decodeCodeForAlgebraicType(algebraicType:AlgebraicType.Type):string[] {
  const codeableAttributeForSubtypeProperty:CodeableAttribute = codeableAttributeForSubtypePropertyOfAlgebraicType();
  const switchStatement:string[] = codeForBranchingOnSubtypeWithSubtypeMapper(algebraicType, codeableAttributeForSubtypeProperty.valueAccessor, decodeStatementsForAlgebraicSubtype);
  return [decodeStatementForSubtype(codeableAttributeForSubtypeProperty)].concat(switchStatement);
}

function encodeStatementForAlgebraicSubtypeAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):string {
  const codeableAttribute:CodeableAttribute = codeableAttributeForAlgebraicSubtypeAttribute(subtype, attribute);
  return encodeStatementForAttribute(codeableAttribute);
}

function encodedStatementForSubtypeProperty(subtype:AlgebraicType.Subtype):string {
  const subtypeAttribute:CodeableAttribute = codeableAttributeForSubtypePropertyOfAlgebraicType();
  const codingStatements: CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(subtypeAttribute.type);
  return '[aCoder ' + codingStatements.encodeStatement + ':' + CodingNameForSubtype(subtype) + ' forKey:' + subtypeAttribute.constantName + '];';
}

function encodeStatementsForAlgebraicSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):string[] {
  const encodeAttributes:string[] = AlgebraicTypeUtils.attributesFromSubtype(subtype).map(FunctionUtils.pApplyf2(subtype, encodeStatementForAlgebraicSubtypeAttribute));
  return encodeAttributes.concat(encodedStatementForSubtypeProperty(subtype));
}

function encodeCodeForAlgebraicType(algebraicType:AlgebraicType.Type):string[] {
  return AlgebraicTypeUtils.codeForSwitchingOnSubtypeWithSubtypeMapper(algebraicType, AlgebraicTypeUtils.valueAccessorForInternalPropertyStoringSubtype(), encodeStatementsForAlgebraicSubtype);
}

function doesAlgebraicAttributeContainAnUnknownType(attribute:AlgebraicType.SubtypeAttribute):boolean {
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(AlgebraicTypeUtils.computeTypeOfAttribute(attribute));
  return codingStatements == null;
}

function doesAlgebraicAttributeContainAnUnsupportedType(attribute:AlgebraicType.SubtypeAttribute):boolean {
  return isTypeNSCodingCompliant(AlgebraicTypeUtils.computeTypeOfAttribute(attribute)) === false;
}

function algebraicAttributeToUnknownTypeError(algebraicType:AlgebraicType.Type, attribute:AlgebraicType.SubtypeAttribute):Error.Error {
  return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the backing type "' + underlyingType + '" from ' + algebraicType.name + '.' + attribute.name + '. Did you declare the wrong backing type?');
  }, function():Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the type "' + attribute.type.name + '" from ' + algebraicType.name + '.' + attribute.name + '. Did you forget to declare a backing type?');
  }, attribute.type.underlyingType);
}

function algebraicAttributeToUnsupportedTypeError(algebraicType:AlgebraicType.Type, attribute:AlgebraicType.SubtypeAttribute):Error.Error {
  return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the backing type "' + underlyingType + '" from ' + algebraicType.name + '.' + attribute.name + '. ' + attribute.type.name + ' is not NSCoding-compilant.');
  }, function():Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the type "' + attribute.type.name + '" from ' + algebraicType.name + '.' + attribute.name + '. ' + attribute.type.name + ' is not NSCoding-compilant.');
  }, attribute.type.underlyingType);
}

export function CodingNameForSubtype(subtype:AlgebraicType.Subtype):string {
  return constantValueForAttributeName('SUBTYPE_' + AlgebraicTypeUtils.subtypeNameFromSubtype(subtype));
}

function codeForSubtypeBranchesWithSubtypeMapper(algebraicType:AlgebraicType.Type, subtypeValueAccessor:string, subtypeMapper:(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype) => string[], soFar:string[], subtype:AlgebraicType.Subtype):string[] {
  const internalCode:string[] = subtypeMapper(algebraicType, subtype);
  const code:string[] = [(soFar.length ? 'else if([' : 'if([') + subtypeValueAccessor + ' isEqualToString:' + CodingNameForSubtype(subtype) + ']) {'].concat(internalCode.map(StringUtils.indent(2))).concat(['}']);
  return soFar.concat(code);
}

function codeForBranchingOnSubtypeWithSubtypeMapper(algebraicType:AlgebraicType.Type, subtypeValueAccessor:string, subtypeMapper:(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype) => string[]):string[] {
  const subtypeBranches:string[] = algebraicType.subtypes.reduce(FunctionUtils.pApply3f5(algebraicType, subtypeValueAccessor, subtypeMapper, codeForSubtypeBranchesWithSubtypeMapper), []);
  const failureCase:string[] = ['else {', StringUtils.indent(2)('@throw([NSException exceptionWithName:@"InvalidSubtypeException" reason:@"nil or unknown subtype provided" userInfo:@{@"subtype": ' + codeableAttributeForSubtypePropertyOfAlgebraicType().valueAccessor +'}]);'), '}'];
  return subtypeBranches.concat(failureCase);
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
      return [];
    },
    enumerations: function(algebraicType:AlgebraicType.Type):ObjC.Enumeration[] {
      return [];
    },
    fileTransformation: function(request:FileWriter.Request):FileWriter.Request {
      return request;
    },
    fileType: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(algebraicType:AlgebraicType.Type):ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(algebraicType:AlgebraicType.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(algebraicType:AlgebraicType.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(algebraicType:AlgebraicType.Type):ObjC.Protocol[] {
      return [
        {
          name: 'NSCoding'
        }
      ];
    },
    imports: function(algebraicType:AlgebraicType.Type):ObjC.Import[] {
      return [];
    },
    instanceMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      const decodeCode:string[] = decodeCodeForAlgebraicType(algebraicType);
      const encodeCode:string[] = encodeCodeForAlgebraicType(algebraicType);
      return [
        decodeMethodWithCode(decodeCode),
        encodeMethodWithCode(encodeCode)
      ];
    },
    internalProperties: function(algebraicType:AlgebraicType.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMCoding'],
    staticConstants: function(algebraicType:AlgebraicType.Type):ObjC.Constant[] {
      const codeableAttributeForSubtypeProperty:CodeableAttribute = codeableAttributeForSubtypePropertyOfAlgebraicType();
      const codeableAttributeForSubtypeAttributes:CodeableAttribute[] = AlgebraicTypeUtils.mapAttributesWithSubtypeFromSubtypes(algebraicType.subtypes, codeableAttributeForAlgebraicSubtypeAttribute);
      const codeableAttributes:CodeableAttribute[] = [codeableAttributeForSubtypeProperty].concat(codeableAttributeForSubtypeAttributes);
      return codeableAttributes.map(staticConstantForAttribute);
    },
    validationErrors: function(algebraicType:AlgebraicType.Type):Error.Error[] {
      const unknownTypeErrors = AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes).filter(doesAlgebraicAttributeContainAnUnknownType).map(FunctionUtils.pApplyf2(algebraicType, algebraicAttributeToUnknownTypeError));
      const unsupportedTypeErrors = AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes).filter(doesAlgebraicAttributeContainAnUnsupportedType).map(FunctionUtils.pApplyf2(algebraicType, algebraicAttributeToUnsupportedTypeError));
      return unknownTypeErrors.concat(unsupportedTypeErrors);
    },
    nullability: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    }
  };
}
