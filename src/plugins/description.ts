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
import * as Maybe from '../maybe';
import * as ObjC from '../objc';
import * as ObjCTypeUtils from '../objc-type-utils';
import * as ObjectSpec from '../object-spec';
import * as ObjectSpecCodeUtils from '../object-spec-code-utils';

interface AttributeDescription {
  descriptionFunctionImport: ObjC.Import | null;
  token: string;
  valueGenerator: (valueAccessor: string) => string;
}

interface ComputedAttributeDescription {
  attributeFormatString: string;
  value: string;
}

function useValueAccessor(valueAccessor: string): string {
  return valueAccessor;
}

function castValueAccessorValue(
  castToApply: string,
): (valueAccessor: string) => string {
  return function(valueAccessor: string): string {
    return '(' + castToApply + ')' + valueAccessor;
  };
}

function useFunctionReturnValueAsDescriptionValue(
  functionToCall: string,
): (valueAccessor: string) => string {
  return function(valueAccessor: string): string {
    return functionToCall + '(' + valueAccessor + ')';
  };
}

const UI_GEOMETRY_IMPORT: ObjC.Import = {
  file: 'UIGeometry.h',
  isPublic: false,
  requiresCPlusPlus: false,
  library: 'UIKit',
};

const NSOBJECT_ATTRIBUTE_DESCRIPTION: AttributeDescription = {
  descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
  token: '%@',
  valueGenerator: useValueAccessor,
};

function attributeDescriptionForType(type: ObjC.Type): AttributeDescription {
  return ObjCTypeUtils.matchType(
    {
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
          valueGenerator: function(valueAccessor: string): string {
            return valueAccessor + ' ? @"YES" : @"NO"';
          },
        };
      },
      NSInteger: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%lld',
          valueGenerator: castValueAccessorValue('long long'),
        };
      },
      NSUInteger: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%llu',
          valueGenerator: castValueAccessorValue('unsigned long long'),
        };
      },
      double: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%lf',
          valueGenerator: useValueAccessor,
        };
      },
      float: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%f',
          valueGenerator: useValueAccessor,
        };
      },
      CGFloat: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%f',
          valueGenerator: useValueAccessor,
        };
      },
      NSTimeInterval: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%lf',
          valueGenerator: useValueAccessor,
        };
      },
      uintptr_t: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%p',
          valueGenerator: castValueAccessorValue('void *'),
        };
      },
      uint32_t: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%u',
          valueGenerator: useValueAccessor,
        };
      },
      uint64_t: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%llu',
          valueGenerator: castValueAccessorValue('unsigned long long'),
        };
      },
      int32_t: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%d',
          valueGenerator: useValueAccessor,
        };
      },
      int64_t: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%lld',
          valueGenerator: castValueAccessorValue('long long'),
        };
      },
      SEL: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%@',
          valueGenerator: useFunctionReturnValueAsDescriptionValue(
            'NSStringFromSelector',
          ),
        };
      },
      NSRange: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%@',
          valueGenerator: useFunctionReturnValueAsDescriptionValue(
            'NSStringFromRange',
          ),
        };
      },
      CGRect: function() {
        return {
          descriptionFunctionImport: UI_GEOMETRY_IMPORT,
          token: '%@',
          valueGenerator: useFunctionReturnValueAsDescriptionValue(
            'NSStringFromCGRect',
          ),
        };
      },
      CGPoint: function() {
        return {
          descriptionFunctionImport: UI_GEOMETRY_IMPORT,
          token: '%@',
          valueGenerator: useFunctionReturnValueAsDescriptionValue(
            'NSStringFromCGPoint',
          ),
        };
      },
      CGSize: function() {
        return {
          descriptionFunctionImport: UI_GEOMETRY_IMPORT,
          token: '%@',
          valueGenerator: useFunctionReturnValueAsDescriptionValue(
            'NSStringFromCGSize',
          ),
        };
      },
      UIEdgeInsets: function() {
        return {
          descriptionFunctionImport: UI_GEOMETRY_IMPORT,
          token: '%@',
          valueGenerator: useFunctionReturnValueAsDescriptionValue(
            'NSStringFromUIEdgeInsets',
          ),
        };
      },
      Class: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%@',
          valueGenerator: useValueAccessor,
        };
      },
      dispatch_block_t: function() {
        return {
          descriptionFunctionImport: Maybe.Nothing<ObjC.Import>(),
          token: '%@',
          valueGenerator: useValueAccessor,
        };
      },
      unmatchedType: function() {
        return null!;
      },
    },
    type,
  );
}

function computedAttributeDescriptionFromAttributeDescription(
  attributeDescription: AttributeDescription,
  name: string,
  valueAccessor: string,
): ComputedAttributeDescription {
  return {
    attributeFormatString: name + ': ' + attributeDescription.token + ';',
    value: attributeDescription.valueGenerator(valueAccessor),
  };
}

function attributeDescriptionForObjectSpecAttribute(
  attribute: ObjectSpec.Attribute,
): AttributeDescription {
  return attributeDescriptionForType(
    ObjectSpecCodeUtils.computeTypeOfAttribute(attribute),
  );
}

function attributeDescriptionImportMaybeForObjectSpecAttribute(
  attribute: ObjectSpec.Attribute,
): ObjC.Import | null {
  return attributeDescriptionForType(
    ObjectSpecCodeUtils.computeTypeOfAttribute(attribute),
  ).descriptionFunctionImport;
}

function attributeDescriptionImportMaybeForAlgebraicAttribute(
  attribute: AlgebraicType.SubtypeAttribute,
): ObjC.Import | null {
  return attributeDescriptionForType(
    AlgebraicTypeUtils.computeTypeOfAttribute(attribute),
  ).descriptionFunctionImport;
}

function computedAttributeDescriptionFromAttribute(
  attribute: ObjectSpec.Attribute,
): ComputedAttributeDescription {
  const attributeDescription: AttributeDescription = attributeDescriptionForObjectSpecAttribute(
    attribute,
  );
  return computedAttributeDescriptionFromAttributeDescription(
    attributeDescription,
    attribute.name,
    ObjectSpecCodeUtils.ivarForAttribute(attribute),
  );
}

function selectToken(
  attributeDescription: ComputedAttributeDescription,
): string {
  return attributeDescription.attributeFormatString;
}

function selectValue(
  attributeDescription: ComputedAttributeDescription,
): string {
  return attributeDescription.value;
}

function returnStatementForAttributeDescriptions(
  attributeDescriptions: ComputedAttributeDescription[],
  name?: string,
): string {
  const nameString: string = name ? ' ' + name : '';
  const attributesBeginning: string =
    attributeDescriptions.length > 0 ? ' \\n\\t ' : '';
  const attributesFormatString: string = attributeDescriptions
    .map(selectToken)
    .join(' \\n\\t ');
  const attributesValueString: string =
    attributeDescriptions.length > 0
      ? ', ' + attributeDescriptions.map(selectValue).join(', ')
      : '';
  return (
    'return [NSString stringWithFormat:@"%@ -' +
    nameString +
    attributesBeginning +
    attributesFormatString +
    ' \\n", [super description]' +
    attributesValueString +
    '];'
  );
}

function descriptionInstanceMethodWithCode(code: string[]): ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: 'NSObject',
    code: code,
    comments: [],
    compilerAttributes: [],
    keywords: [
      {
        name: 'description',
        argument: Maybe.Nothing<ObjC.KeywordArgument>(),
      },
    ],
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'NSString',
        reference: 'NSString *',
      }),
      modifiers: [],
    },
  };
}

function doesValueAttributeContainAnUnknownType(
  attribute: ObjectSpec.Attribute,
): boolean {
  const attributeDescription: AttributeDescription = attributeDescriptionForObjectSpecAttribute(
    attribute,
  );
  return attributeDescription == null;
}

function valueAttributeToUnknownTypeError(
  objectType: ObjectSpec.Type,
  attribute: ObjectSpec.Attribute,
): Error.Error {
  return Maybe.match(
    function(underlyingType: string): Error.Error {
      return Error.Error(
        'The Description plugin does not know how to format the backing type "' +
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
        'The Description plugin does not know how to format the type "' +
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
      return [];
    },
    imports: function(objectType: ObjectSpec.Type): ObjC.Import[] {
      const attributeDescriptionImportMaybes = objectType.attributes.map(
        attributeDescriptionImportMaybeForObjectSpecAttribute,
      );

      return Maybe.catMaybes(attributeDescriptionImportMaybes);
    },
    instanceMethods: function(objectType: ObjectSpec.Type): ObjC.Method[] {
      if (objectType.attributes.length > 0) {
        const attributeDescriptions: ComputedAttributeDescription[] = objectType.attributes.map(
          computedAttributeDescriptionFromAttribute,
        );
        const code: string[] = [
          returnStatementForAttributeDescriptions(attributeDescriptions),
        ];
        return [descriptionInstanceMethodWithCode(code)];
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
    requiredIncludesToRun: ['RMDescription'],
    staticConstants: function(objectType: ObjectSpec.Type): ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType: ObjectSpec.Type): Error.Error[] {
      return objectType.attributes
        .filter(doesValueAttributeContainAnUnknownType)
        .map(attribute =>
          valueAttributeToUnknownTypeError(objectType, attribute),
        );
    },
    nullability: function(
      objectType: ObjectSpec.Type,
    ): ObjC.ClassNullability | null {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(objectType: ObjectSpec.Type): boolean {
      return false;
    },
  };
}

function computedAttributeDescriptionFromAlgebraicSubtypeAttribute(
  subtype: AlgebraicType.Subtype,
  attribute: AlgebraicType.SubtypeAttribute,
): ComputedAttributeDescription {
  const attributeDescription: AttributeDescription = attributeDescriptionForType(
    AlgebraicTypeUtils.computeTypeOfAttribute(attribute),
  );
  return computedAttributeDescriptionFromAttributeDescription(
    attributeDescription,
    attribute.name,
    AlgebraicTypeUtils.valueAccessorForInstanceVariableForAttribute(
      subtype,
      attribute,
    ),
  );
}

function returnStatementForAlgebraicSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
): string[] {
  return subtype.match(
    function(
      namedAttributeCollectionSubtype: AlgebraicType.NamedAttributeCollectionSubtype,
    ) {
      const attributeDescriptions: ComputedAttributeDescription[] = namedAttributeCollectionSubtype.attributes.map(
        attribute =>
          computedAttributeDescriptionFromAlgebraicSubtypeAttribute(
            subtype,
            attribute,
          ),
      );
      return [
        returnStatementForAttributeDescriptions(
          attributeDescriptions,
          namedAttributeCollectionSubtype.name,
        ),
      ];
    },
    function(attribute: AlgebraicType.SubtypeAttribute) {
      const attributeDescriptions = [
        computedAttributeDescriptionFromAlgebraicSubtypeAttribute(
          subtype,
          attribute,
        ),
      ];
      return [returnStatementForAttributeDescriptions(attributeDescriptions)];
    },
  );
}

function descriptionInstanceMethodCodeForAlgebraicType(
  algebraicType: AlgebraicType.Type,
): string[] {
  return AlgebraicTypeUtils.codeForSwitchingOnSubtypeWithSubtypeMapper(
    algebraicType,
    AlgebraicTypeUtils.valueAccessorForInstanceVariableStoringSubtype(),
    returnStatementForAlgebraicSubtype,
  );
}

function doesAlgebraicAttributeContainAnUnknownType(
  attribute: AlgebraicType.SubtypeAttribute,
): boolean {
  const attributeDescription: AttributeDescription = attributeDescriptionForType(
    AlgebraicTypeUtils.computeTypeOfAttribute(attribute),
  );
  return attributeDescription == null;
}

function algebraicAttributeToUnknownTypeError(
  algebraicType: AlgebraicType.Type,
  attribute: AlgebraicType.SubtypeAttribute,
): Error.Error {
  return Maybe.match(
    function(underlyingType: string): Error.Error {
      return Error.Error(
        'The Description plugin does not know how to format the backing type "' +
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
        'The Description plugin does not know how to format the type "' +
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
      return [];
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
    ): Code.FileType | null {
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
      return [];
    },
    imports: function(algebraicType: AlgebraicType.Type): ObjC.Import[] {
      const attributeDescriptionImportMaybes = AlgebraicTypeUtils.allAttributesFromSubtypes(
        algebraicType.subtypes,
      ).map(attributeDescriptionImportMaybeForAlgebraicAttribute);

      return Maybe.catMaybes(attributeDescriptionImportMaybes);
    },
    instanceMethods: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Method[] {
      const code: string[] = descriptionInstanceMethodCodeForAlgebraicType(
        algebraicType,
      );
      return [descriptionInstanceMethodWithCode(code)];
    },
    instanceVariables: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.InstanceVariable[] {
      return [];
    },
    macros: function(algebraicType: AlgebraicType.Type): ObjC.Macro[] {
      return [];
    },
    requiredIncludesToRun: ['RMDescription'],
    staticConstants: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.Constant[] {
      return [];
    },
    validationErrors: function(
      algebraicType: AlgebraicType.Type,
    ): Error.Error[] {
      return AlgebraicTypeUtils.allAttributesFromSubtypes(
        algebraicType.subtypes,
      )
        .filter(doesAlgebraicAttributeContainAnUnknownType)
        .map(attribute =>
          algebraicAttributeToUnknownTypeError(algebraicType, attribute),
        );
    },
    nullability: function(
      algebraicType: AlgebraicType.Type,
    ): ObjC.ClassNullability | null {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(
      algebraicType: AlgebraicType.Type,
    ): boolean {
      return false;
    },
  };
}
