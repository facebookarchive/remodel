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
import ObjectSpec = require('../object-spec');
import ObjectSpecCodeUtils = require('../object-spec-code-utils');

interface AttributeDescription {
  descriptionFunctionImport: Maybe.Maybe<ObjC.Import>;
  token: string;
  valueGenerator: (valueAccessor:string) => string;
}

interface ComputedAttributeDescription {
  attributeFormatString: string;
  value: string;
}

function useValueAccessor(valueAccessor:string):string {
  return valueAccessor;
}

function useFunctionReturnValueAsDescriptionValue(functionToCall:string):(valueAccessor:string) => string {
  return function(valueAccessor:string):string {
    return functionToCall + '(' + valueAccessor + ')';
  };
}

const UI_GEOMETRY_IMPORT:ObjC.Import = {
  file:'UIGeometry.h',
  isPublic:false,
  library:Maybe.Just('UIKit'),
}

const NSOBJECT_ATTRIBUTE_DESCRIPTION:AttributeDescription = {
  descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
  token: '%@',
  valueGenerator:useValueAccessor,
}

function attributeDescriptionForType(type:ObjC.Type):AttributeDescription {
  return ObjCTypeUtils.matchType({
    id: function() {
      return NSOBJECT_ATTRIBUTE_DESCRIPTION;
    },
    NSObject: function() {
      return NSOBJECT_ATTRIBUTE_DESCRIPTION;
    },
    BOOL: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%@',
        valueGenerator: function(valueAccessor:string):string {
          return valueAccessor + ' ? @"YES" : @"NO"';
        }
      };
    },
    NSInteger: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%zd',
        valueGenerator: useValueAccessor
      };
    },
    NSUInteger: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%tu',
        valueGenerator: useValueAccessor
      };
    },
    double: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%lf',
        valueGenerator: useValueAccessor
      };
    },
    float: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%f',
        valueGenerator: useValueAccessor
      };
    },
    CGFloat: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%f',
        valueGenerator: useValueAccessor
      };
    },
    NSTimeInterval: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%lf',
        valueGenerator: useValueAccessor
      };
    },
    uintptr_t: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%ld',
        valueGenerator: useValueAccessor
      };
    },
    uint32_t: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%u',
        valueGenerator: useValueAccessor
      };
    },
    uint64_t: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%llu',
        valueGenerator: useValueAccessor
      };
    },
    int32_t: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%d',
        valueGenerator: useValueAccessor
      };
    },
    int64_t: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%lld',
        valueGenerator: useValueAccessor
      };
    },
    SEL: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%@',
        valueGenerator: useFunctionReturnValueAsDescriptionValue('NSStringFromSelector')
      };
    },
    NSRange: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%@',
        valueGenerator: useFunctionReturnValueAsDescriptionValue('NSStringFromRange')
      };
    },
    CGRect: function() {
      return {
        descriptionFunctionImport: Maybe.Just(UI_GEOMETRY_IMPORT),
        token: '%@',
        valueGenerator: useFunctionReturnValueAsDescriptionValue('NSStringFromCGRect')
      };
    },
    CGPoint: function() {
      return {
        descriptionFunctionImport: Maybe.Just(UI_GEOMETRY_IMPORT),
        token: '%@',
        valueGenerator: useFunctionReturnValueAsDescriptionValue('NSStringFromCGPoint')
      };
    },
    CGSize: function() {
      return {
        descriptionFunctionImport: Maybe.Just(UI_GEOMETRY_IMPORT),
        token: '%@',
        valueGenerator: useFunctionReturnValueAsDescriptionValue('NSStringFromCGSize')
      };
    },
    UIEdgeInsets: function() {
      return {
        descriptionFunctionImport: Maybe.Just(UI_GEOMETRY_IMPORT),
        token: '%@',
        valueGenerator: useFunctionReturnValueAsDescriptionValue('NSStringFromUIEdgeInsets')
      };
    },
    Class: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%@',
        valueGenerator: useValueAccessor
      };
    },
    dispatch_block_t: function() {
      return {
        descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
        token: '%@',
        valueGenerator: useValueAccessor
      };
    },
    unmatchedType: function() {
      return null;
    },
  }, type);
}

function computedAttributeDescriptionFromAttributeDescription(attributeDescription:AttributeDescription, name:string, valueAccessor:string):ComputedAttributeDescription {
  return {
    attributeFormatString: name + ': ' + attributeDescription.token + ';',
    value: attributeDescription.valueGenerator(valueAccessor)
  };
}

function attributeDescriptionForObjectSpecAttribute(attribute:ObjectSpec.Attribute):AttributeDescription {
  return attributeDescriptionForType(ObjectSpecCodeUtils.computeTypeOfAttribute(attribute));
}

function attributeDescriptionImportMaybeForObjectSpecAttribute(attribute:ObjectSpec.Attribute):Maybe.Maybe<ObjC.Import> {
  return attributeDescriptionForType(ObjectSpecCodeUtils.computeTypeOfAttribute(attribute)).descriptionFunctionImport;
}

function attributeDescriptionImportMaybeForAlgebraicAttribute(attribute:AlgebraicType.SubtypeAttribute):Maybe.Maybe<ObjC.Import> {
  return attributeDescriptionForType(AlgebraicTypeUtils.computeTypeOfAttribute(attribute)).descriptionFunctionImport;
}

function computedAttributeDescriptionFromAttribute(attribute:ObjectSpec.Attribute):ComputedAttributeDescription {
  const attributeDescription:AttributeDescription = attributeDescriptionForObjectSpecAttribute(attribute);
  return computedAttributeDescriptionFromAttributeDescription(attributeDescription, attribute.name, ObjectSpecCodeUtils.ivarForAttribute(attribute));
}

function selectToken(attributeDescription:ComputedAttributeDescription):string {
  return attributeDescription.attributeFormatString;
}

function selectValue(attributeDescription:ComputedAttributeDescription):string {
  return attributeDescription.value;
}

function returnStatementForAttributeDescriptions(attributeDescriptions:ComputedAttributeDescription[], name?:string):string {
  const nameString:string = name ? ' ' + name : '';
  const attributesBeginning:string = attributeDescriptions.length > 0 ? ' \\n\\t ' : '';
  const attributesFormatString:string = attributeDescriptions.map(selectToken).join(' \\n\\t ');
  const attributesValueString:string = attributeDescriptions.length > 0 ? ', ' + attributeDescriptions.map(selectValue).join(', ') : '';
  return 'return [NSString stringWithFormat:@"%@ -' + nameString + attributesBeginning + attributesFormatString + ' \\n", [super description]' + attributesValueString + '];';
}

function descriptionInstanceMethodWithCode(code:string[]):ObjC.Method {
  return {
    belongsToProtocol:Maybe.Just('NSObject'),
    code: code,
    comments:[],
    compilerAttributes:[],
    keywords: [
      {
        name: 'description',
        argument: Maybe.Nothing<ObjC.KeywordArgument>()
      }
    ],
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'NSString',
        reference: 'NSString *'
      }),
      modifiers: []
    }
  };
}

function doesValueAttributeContainAnUnknownType(attribute:ObjectSpec.Attribute):boolean {
  const attributeDescription:AttributeDescription = attributeDescriptionForObjectSpecAttribute(attribute);
  return attributeDescription == null;
}

function valueAttributeToUnknownTypeError(objectType:ObjectSpec.Type, attribute:ObjectSpec.Attribute):Error.Error {
  return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Description plugin does not know how to format the backing type "' + underlyingType + '" from ' + objectType.typeName + '.' + attribute.name + '. Did you declare the wrong backing type?');
  }, function():Error.Error {
    return Error.Error('The Description plugin does not know how to format the type "' + attribute.type.name + '" from ' + objectType.typeName + '.' + attribute.name + '. Did you forget to declare a backing type?');
  }, attribute.type.underlyingType);
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
    classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
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
      return [];
    },
    imports: function(objectType:ObjectSpec.Type):ObjC.Import[] {
      const attributeDescriptionImportMaybes:Maybe.Maybe<ObjC.Import>[] = objectType.attributes.map(attributeDescriptionImportMaybeForObjectSpecAttribute);

      return Maybe.catMaybes(attributeDescriptionImportMaybes);
    },
    instanceMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
      if (objectType.attributes.length > 0) {
        const attributeDescriptions:ComputedAttributeDescription[] = objectType.attributes.map(computedAttributeDescriptionFromAttribute);
        const code:string[] = [returnStatementForAttributeDescriptions(attributeDescriptions)];
        return [descriptionInstanceMethodWithCode(code)];
      } else {
        return [];
      }
    },
    properties: function(objectType:ObjectSpec.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun:['RMDescription'],
    staticConstants: function(objectType:ObjectSpec.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
      return objectType.attributes.filter(doesValueAttributeContainAnUnknownType).map(FunctionUtils.pApplyf2(objectType, valueAttributeToUnknownTypeError));
    },
    nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    }
  };
}

function computedAttributeDescriptionFromAlgebraicSubtypeAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):ComputedAttributeDescription {
  const attributeDescription:AttributeDescription = attributeDescriptionForType(AlgebraicTypeUtils.computeTypeOfAttribute(attribute));
  return computedAttributeDescriptionFromAttributeDescription(attributeDescription, attribute.name, AlgebraicTypeUtils.valueAccessorForInternalPropertyForAttribute(subtype, attribute));
}

function returnStatementForAlgebraicSubtype(algebraicType:AlgebraicType.Type, subtype:AlgebraicType.Subtype):string[] {
  return subtype.match(
    function(namedAttributeCollectionSubtype:AlgebraicType.NamedAttributeCollectionSubtype) {
      const attributeDescriptions:ComputedAttributeDescription[] = namedAttributeCollectionSubtype.attributes.map(FunctionUtils.pApplyf2(subtype, computedAttributeDescriptionFromAlgebraicSubtypeAttribute));
      return [returnStatementForAttributeDescriptions(attributeDescriptions, namedAttributeCollectionSubtype.name)];
    },
    function(attribute:AlgebraicType.SubtypeAttribute) {
      const attributeDescriptions = [computedAttributeDescriptionFromAlgebraicSubtypeAttribute(subtype, attribute)];
      return [returnStatementForAttributeDescriptions(attributeDescriptions)];
    });
}

function descriptionInstanceMethodCodeForAlgebraicType(algebraicType:AlgebraicType.Type):string[] {
  return AlgebraicTypeUtils.codeForSwitchingOnSubtypeWithSubtypeMapper(algebraicType, AlgebraicTypeUtils.valueAccessorForInternalPropertyStoringSubtype(), returnStatementForAlgebraicSubtype);
}

function doesAlgebraicAttributeContainAnUnknownType(attribute:AlgebraicType.SubtypeAttribute):boolean {
  const attributeDescription:AttributeDescription = attributeDescriptionForType(AlgebraicTypeUtils.computeTypeOfAttribute(attribute));
  return attributeDescription == null;
}

function algebraicAttributeToUnknownTypeError(algebraicType:AlgebraicType.Type, attribute:AlgebraicType.SubtypeAttribute):Error.Error {
  return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Description plugin does not know how to format the backing type "' + underlyingType + '" from ' + algebraicType.name + '.' + attribute.name + '. Did you declare the wrong backing type?');
  }, function():Error.Error {
    return Error.Error('The Description plugin does not know how to format the type "' + attribute.type.name + '" from ' + algebraicType.name + '.' + attribute.name + '. Did you forget to declare a backing type?');
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
      return [];
    },
    imports: function(algebraicType:AlgebraicType.Type):ObjC.Import[] {
      const attributeDescriptionImportMaybes:Maybe.Maybe<ObjC.Import>[] = AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes).map(attributeDescriptionImportMaybeForAlgebraicAttribute);

      return Maybe.catMaybes(attributeDescriptionImportMaybes);
    },
    instanceMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      const code:string[] = descriptionInstanceMethodCodeForAlgebraicType(algebraicType);
      return [descriptionInstanceMethodWithCode(code)];
    },
    internalProperties: function(algebraicType:AlgebraicType.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun: ['RMDescription'],
    staticConstants: function(algebraicType:AlgebraicType.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(algebraicType:AlgebraicType.Type):Error.Error[] {
      return AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes).filter(doesAlgebraicAttributeContainAnUnknownType).map(FunctionUtils.pApplyf2(algebraicType, algebraicAttributeToUnknownTypeError));
    },
    nullability: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    }
  };
}
