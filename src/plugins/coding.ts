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
import ValueObject = require('../value-object');
import ValueObjectCodeUtils = require('../value-object-code-utils');
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

function codingAttributeForValueAttribute(attribute:ValueObject.Attribute):CodeableAttribute {
  return {
    name: attribute.name,
    valueAccessor: ValueObjectCodeUtils.ivarForAttribute(attribute),
    constantName: nameOfConstantForValueName(attribute.name),
    type: ValueObjectCodeUtils.computeTypeOfAttribute(attribute)
  };
}

export function decodeStatementForAttribute(attribute:CodeableAttribute):string {
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(attribute.type);
  const decodedRawValuePart:string = '[aDecoder ' + codingStatements.decodeStatement + ':' + attribute.constantName + ']';
  const decodedValuePart = codingStatements.decodeValueStatementGenerator(decodedRawValuePart);
  return attribute.valueAccessor + ' = ' + decodedValuePart + ';';
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
    unmatchedType: function() {
      return true;
    }
  },
  type);
}

function doesValueAttributeContainAnUnknownType(attribute:ValueObject.Attribute):boolean {
  const codeableAttribute:CodeableAttribute = codingAttributeForValueAttribute(attribute);
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(codeableAttribute.type);
  return codingStatements == null;
}

function doesValueAttributeContainAnUnsupportedType(attribute:ValueObject.Attribute):boolean {
  return isTypeNSCodingCompliant(ValueObjectCodeUtils.computeTypeOfAttribute(attribute)) === false;
}

function valueAttributeToUnknownTypeError(valueType:ValueObject.Type, attribute:ValueObject.Attribute):Error.Error {
  return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the backing type "' + underlyingType + '" from ' + valueType.typeName + '.' + attribute.name + '. Did you declare the wrong backing type?');
  }, function():Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the type "' + attribute.type.name + '" from ' + valueType.typeName + '.' + attribute.name + '. Did you forget to declare a backing type?');
  }, attribute.type.underlyingType);
}

function valueAttributeToUnsupportedTypeError(valueType:ValueObject.Type, attribute:ValueObject.Attribute):Error.Error {
   return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the backing type "' + underlyingType + '" from ' + valueType.typeName + '.' + attribute.name + '. ' + attribute.type.name + ' is not NSCoding-compilant.');
  }, function():Error.Error {
    return Error.Error('The Coding plugin does not know how to decode and encode the type "' + attribute.type.name + '" from ' + valueType.typeName + '.' + attribute.name + '. ' + attribute.type.name + ' is not NSCoding-compilant.');
  }, attribute.type.underlyingType);
}

function importForAttributeCodingMethod(attribute:ValueObject.Attribute):Maybe.Maybe<ObjC.Import> {
  const codeableAttribute:CodeableAttribute = codingAttributeForValueAttribute(attribute);
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(codeableAttribute.type);
  return codingStatements.codingFunctionImport;
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
      return [];
    },
    functions: function(valueType:ValueObject.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(valueType:ValueObject.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(valueType:ValueObject.Type):ObjC.Protocol[] {
      return [
        {
          name: 'NSCoding'
        }
      ];
    },
    imports: function(valueType:ValueObject.Type):ObjC.Import[] {
      const codingImportMaybes:Maybe.Maybe<ObjC.Import>[] = valueType.attributes.map(importForAttributeCodingMethod);

      return Maybe.catMaybes(codingImportMaybes);
    },
    instanceMethods: function(valueType:ValueObject.Type):ObjC.Method[] {
      if (valueType.attributes.length > 0) {
        const codingAttributes:CodeableAttribute[] = valueType.attributes.map(codingAttributeForValueAttribute);
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
    properties: function(valueType:ValueObject.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun:['RMCoding'],
    staticConstants: function(valueType:ValueObject.Type):ObjC.Constant[] {
      return valueType.attributes.map(codingAttributeForValueAttribute).map(staticConstantForAttribute);
    },
    validationErrors: function(valueType:ValueObject.Type):Error.Error[] {
      const unknownTypeErrors = valueType.attributes.filter(doesValueAttributeContainAnUnknownType).map(FunctionUtils.pApplyf2(valueType, valueAttributeToUnknownTypeError));
      const unsupportedTypeErrors = valueType.attributes.filter(doesValueAttributeContainAnUnsupportedType).map(FunctionUtils.pApplyf2(valueType, valueAttributeToUnsupportedTypeError));
      return unknownTypeErrors.concat(unsupportedTypeErrors);
    }
  };
}

function codeableAttributeForSubtypePropertyOfAlgebraicType():CodeableAttribute {
  return {
    name: 'subtype',
    valueAccessor: '_subtype',
    constantName: nameOfConstantForValueName('subtype'),
    type: {
      name: 'NSUInteger',
      reference: 'NSUInteger'
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
  return AlgebraicTypeUtils.attributesFromSubtype(subtype).map(FunctionUtils.pApplyf2(subtype, decodeStatementForAlgebraicSubtypeAttribute));
}

function decodeCodeForAlgebraicType(algebraicType:AlgebraicType.Type):string[] {
  const codeableAttributeForSubtypeProperty:CodeableAttribute = codeableAttributeForSubtypePropertyOfAlgebraicType();
  const switchStatement:string[] = AlgebraicTypeUtils.codeForSwitchingOnSubtypeWithSubtypeMapper(algebraicType, codeableAttributeForSubtypeProperty.valueAccessor, decodeStatementsForAlgebraicSubtype);
  return [decodeStatementForAttribute(codeableAttributeForSubtypeProperty)].concat(switchStatement);
}

function encodeStatementForAlgebraicSubtypeAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):string {
  const codeableAttribute:CodeableAttribute = codeableAttributeForAlgebraicSubtypeAttribute(subtype, attribute);
  return encodeStatementForAttribute(codeableAttribute);
}

function encodeStatementsForAlgebraicSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):string[] {
  return AlgebraicTypeUtils.attributesFromSubtype(subtype).map(FunctionUtils.pApplyf2(subtype, encodeStatementForAlgebraicSubtypeAttribute));
}

function encodeCodeForAlgebraicType(algebraicType:AlgebraicType.Type):string[] {
  const codeableAttributeForSubtypeProperty:CodeableAttribute = codeableAttributeForSubtypePropertyOfAlgebraicType();
  const switchStatement:string[] = AlgebraicTypeUtils.codeForSwitchingOnSubtypeWithSubtypeMapper(algebraicType, codeableAttributeForSubtypeProperty.valueAccessor, encodeStatementsForAlgebraicSubtype);
  return [encodeStatementForAttribute(codeableAttributeForSubtypeProperty)].concat(switchStatement);
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
    }
  };
}
