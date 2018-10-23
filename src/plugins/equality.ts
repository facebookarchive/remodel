/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
import ObjectSpecUtils = require('../object-spec-utils');
import ObjectSpecCodeUtils = require('../object-spec-code-utils');

enum EqualityFunctionType {
  compareFloats,
  compareDoubles,
  compareCGFloats,
  hashFloat,
  hashDouble,
  hashCGFloat,
}

class EqualityFunction {
  private equalityFunctionType;

  constructor(type:EqualityFunctionType) {
    this.equalityFunctionType = type;
  }

  static CompareFloats() {
    return new EqualityFunction(EqualityFunctionType.compareFloats);
  }

  static CompareDoubles() {
    return new EqualityFunction(EqualityFunctionType.compareDoubles);
  }

  static CompareCGFloats() {
    return new EqualityFunction(EqualityFunctionType.compareCGFloats);
  }

  static HashFloat() {
    return new EqualityFunction(EqualityFunctionType.hashFloat);
  }

  static HashDouble() {
    return new EqualityFunction(EqualityFunctionType.hashDouble);
  }

  static HashCGFloat() {
    return new EqualityFunction(EqualityFunctionType.hashCGFloat);
  }

  match<T>(compareFloats:() => T, compareDoubles:() => T, compareCGFloats:() => T, hashFloat:() => T, hashDouble:() => T, hashCGFloat:() => T) {
    switch (this.equalityFunctionType) {
      case EqualityFunctionType.compareFloats:
        return compareFloats();
      case EqualityFunctionType.compareDoubles:
        return compareDoubles();
      case EqualityFunctionType.compareCGFloats:
        return compareCGFloats();
      case EqualityFunctionType.hashFloat:
        return hashFloat();
      case EqualityFunctionType.hashDouble:
        return hashDouble();
      case EqualityFunctionType.hashCGFloat:
        return hashCGFloat();
    }
  }
}

function nameOfEqualityFunction(equalityFunction:EqualityFunction):string {
  return equalityFunction.match(function():string {
    return 'CompareFloats';
  }, function():string {
    return 'CompareDoubles';
  }, function():string {
    return 'CompareCGFloats';
  }, function():string {
    return 'HashFloat';
  }, function():string {
    return 'HashDouble';
  }, function():string {
    return 'HashCGFloat';
  });
}

function equalityFunctionsToIncludeForEqualityFunction(equalityFunction:EqualityFunction):EqualityFunction[] {
  return equalityFunction.match(function():EqualityFunction[] {
    return [EqualityFunction.CompareFloats()];
  }, function():EqualityFunction[] {
    return [EqualityFunction.CompareDoubles()];
  }, function():EqualityFunction[] {
    return [EqualityFunction.CompareFloats(), EqualityFunction.CompareDoubles(), EqualityFunction.CompareCGFloats()];
  }, function():EqualityFunction[] {
    return [EqualityFunction.HashFloat()];
  }, function():EqualityFunction[] {
    return [EqualityFunction.HashDouble()];
  }, function():EqualityFunction[] {
    return [EqualityFunction.HashFloat(), EqualityFunction.HashDouble(), EqualityFunction.HashCGFloat()];
  });
}

enum ComputationCostType {
  ivarAccess,
  pointerComparison,
  functionInvocation,
  objectMessageSend
}

class ComputationCost {
  private computationCostType;

  constructor(type:ComputationCostType) {
    this.computationCostType = type;
  }

  static ivarAccess() {
    return new ComputationCost(ComputationCostType.ivarAccess);
  }

  static PointerComparison() {
    return new ComputationCost(ComputationCostType.pointerComparison);
  }

  static FunctionInvocation() {
    return new ComputationCost(ComputationCostType.functionInvocation);
  }

  static ObjectMessageSend() {
    return new ComputationCost(ComputationCostType.objectMessageSend);
  }

  match<T>(ivarAccess:() => T, pointerComparison:() => T, functionInvocation:() => T, objectMessageSend:() => T) {
    switch (this.computationCostType) {
      case ComputationCostType.ivarAccess:
        return ivarAccess();
      case ComputationCostType.pointerComparison:
        return pointerComparison();
      case ComputationCostType.functionInvocation:
        return functionInvocation();
      case ComputationCostType.objectMessageSend:
        return objectMessageSend();
    }
  }
}

function computationCostAsNumber(computationCost:ComputationCost):number {
  return computationCost.match(function():number {
    return 1;
  }, function():number {
    return 2;
  }, function():number {
    return 3;
  }, function():number {
    return 4;
  });
}

interface SystemFunction {
  name:string;
  import:Maybe.Maybe<ObjC.Import>;
}

interface TypeEqualityValue {
  value:string;
  functionsToInclude:EqualityFunction[];
  importsToInclude:ObjC.Import[];
  computationCost: ComputationCost;
}

interface TypeEqualityGenerationGroup {
  equalityCheckGenerator:(attributeValueAccessor:string) => TypeEqualityValue[];
  hashGenerator:(attributeValueAccessor:string) => TypeEqualityValue[];
}

function attributeValueOnComparisonObject(attributeValueAccessor:string):string {
  return 'object->' + attributeValueAccessor;
}

const GENERATOR_FOR_COMPARING_POINTER_EQUALITY = function(attributeValueAccessor:string):TypeEqualityValue[] {
  return [
    {
      value: attributeValueAccessor + ' == ' + attributeValueOnComparisonObject(attributeValueAccessor),
      functionsToInclude: [],
      importsToInclude: [],
      computationCost: ComputationCost.PointerComparison()
    }
  ];
};

function stringForInvokingObjectEqualityOfAttributeValue(attributeValueAccessor:string):string {
  return '[' + attributeValueAccessor + ' isEqual:' + attributeValueOnComparisonObject(attributeValueAccessor) + ']';
}

function selectValue(typeEqualityValue:TypeEqualityValue):string {
  return typeEqualityValue.value;
}

function buildTypeEqualityValueFunctionsToInclude(soFar:EqualityFunction[], typeEqualityValue:TypeEqualityValue):EqualityFunction[] {
  return soFar.concat(typeEqualityValue.functionsToInclude);
}

function buildTypeEqualityValueImportsToInclude(soFar:ObjC.Import[], typeEqualityValue:TypeEqualityValue):ObjC.Import[] {
  return soFar.concat(typeEqualityValue.importsToInclude);
}

const GENERATOR_FOR_COMPARING_OBJECT_EQUALITY = function(attributeValueAccessor:string):TypeEqualityValue[] {
  const pointerEqualityValues:TypeEqualityValue[] = GENERATOR_FOR_COMPARING_POINTER_EQUALITY(attributeValueAccessor);
  return [
    {
      value: '(' + pointerEqualityValues.map(selectValue).join(' && ') + ' ? YES : ' + stringForInvokingObjectEqualityOfAttributeValue(attributeValueAccessor) + ')',
      functionsToInclude: pointerEqualityValues.reduce(buildTypeEqualityValueFunctionsToInclude, []),
      importsToInclude: pointerEqualityValues.reduce(buildTypeEqualityValueImportsToInclude, []),
      computationCost: ComputationCost.ObjectMessageSend()
    }
  ];
};

const GENERATOR_FOR_NOT_INCLUDING_VALUE = function(attributeValueAccessor:string):TypeEqualityValue[] {
  return [];
};

const GENERATOR_FOR_HASHING_POINTER_VALUE = function(attributeValueAccessor:string):TypeEqualityValue[] {
  return [
    {
      value: attributeValueAccessor,
      functionsToInclude: [],
      importsToInclude: [],
      computationCost: ComputationCost.ivarAccess()
    }
  ];
};

const GENERATOR_FOR_HASHING_OBJECT_VALUE = function(attributeValueAccessor:string):TypeEqualityValue[] {
  return [
    {
      value: '[' + attributeValueAccessor + ' hash]',
      functionsToInclude: [],
      importsToInclude: [],
      computationCost: ComputationCost.ObjectMessageSend()
    }
  ];
};

function returnEmptyArray() {
  return [];
}

function generatorForCastingAttributeValueToType(targetType:ObjC.Type):(attributeValueAccessor:string) => TypeEqualityValue[] {
  return function(attributeValueAccessor:string): TypeEqualityValue[] {
    return [
      {
        value: '(' + targetType.reference + ')' + attributeValueAccessor,
        functionsToInclude: [],
        importsToInclude: [],
        computationCost: ComputationCost.ivarAccess()
      }
    ];
  };
}

function generatorForInvokingSystemFunctionWithNameWithBothAttributeValues(systemFunction:SystemFunction):(attributeValueAccessor:string) => TypeEqualityValue[] {
  return function(attributeValueAccessor:string): TypeEqualityValue[] {
    return [
      {
        value: systemFunction.name + '(' + attributeValueAccessor + ', ' + attributeValueOnComparisonObject(attributeValueAccessor) + ')',
        functionsToInclude: [],
        importsToInclude: Maybe.match(function(importToInclude:ObjC.Import):ObjC.Import[] {
          return [importToInclude];
        }, returnEmptyArray, systemFunction.import),
        computationCost: ComputationCost.FunctionInvocation()
      }
    ];
  };
}

function generatorForInvokingFunctionWithBothAttributeValues(equalityFunction:EqualityFunction):(attributeValueAccessor:string) => TypeEqualityValue[] {
  return function(attributeValueAccessor:string): TypeEqualityValue[] {
    return [
      {
        value: nameOfEqualityFunction(equalityFunction) + '(' + attributeValueAccessor + ', ' + attributeValueOnComparisonObject(attributeValueAccessor) + ')',
        functionsToInclude: equalityFunctionsToIncludeForEqualityFunction(equalityFunction),
        importsToInclude: [],
        computationCost: ComputationCost.FunctionInvocation()
      }
    ];
  };
}

function generatorForInvokingSystemFunctionWithNameWithAttributeValue(systemFunction:SystemFunction):(attributeValueAccessor:string) => TypeEqualityValue[] {
  return function(attributeValueAccessor:string): TypeEqualityValue[] {
    return [
      {
        value: systemFunction.name + '(' + attributeValueAccessor + ')',
        functionsToInclude: [],
        importsToInclude: Maybe.match(function(importToInclude:ObjC.Import):ObjC.Import[] {
          return [importToInclude];
        }, returnEmptyArray, systemFunction.import),
        computationCost: ComputationCost.FunctionInvocation()
      }
    ];
  };
}

function generatorForInvokingFunctionWithAttributeValue(equalityFunction:EqualityFunction):(attributeValueAccessor:string) => TypeEqualityValue[] {
  return function(attributeValueAccessor:string): TypeEqualityValue[] {
    return [
      {
        value: nameOfEqualityFunction(equalityFunction) + '(' + attributeValueAccessor + ')',
        functionsToInclude: equalityFunctionsToIncludeForEqualityFunction(equalityFunction),
        importsToInclude: [],
        computationCost: ComputationCost.FunctionInvocation()
      }
    ];
  };
}

function buildTypeEqualityValuesFromGenerators(attributeValueAccessor:string, soFar:TypeEqualityValue[], generator:(attributeValueAccessor:string) => TypeEqualityValue[]):TypeEqualityValue[] {
  return soFar.concat(generator(attributeValueAccessor));
}

function generatorForInvokingSubGenerators(generators:{(attributeValueAccessor:string): TypeEqualityValue[];}[]):(attributeValueAccessor:string) => TypeEqualityValue[] {
  return function(attributeValueAccessor:string): TypeEqualityValue[] {
    return generators.reduce(FunctionUtils.pApplyf3(attributeValueAccessor, buildTypeEqualityValuesFromGenerators), []);
  };
}

const NSOBJECT_GENERATION_GROUP:TypeEqualityGenerationGroup = {
  equalityCheckGenerator: GENERATOR_FOR_COMPARING_OBJECT_EQUALITY,
  hashGenerator: GENERATOR_FOR_HASHING_OBJECT_VALUE
};

const NSUINTEGER_TYPE:ObjC.Type = {
  name: 'NSUInteger',
  reference: 'NSUInteger'
};

const DOUBLE_TYPE:ObjC.Type = {
  name: 'double',
  reference: 'double'
};

const CGFLOAT_TYPE:ObjC.Type = {
  name: 'CGFloat',
  reference: 'CGFloat'
};

const CGPOINT_TYPE:ObjC.Type = {
  name: 'CGPoint',
  reference: 'CGPoint'
};

const CGSIZE_TYPE:ObjC.Type = {
  name: 'CGSize',
  reference: 'CGSize'
};

function generationGroupForType(type:ObjC.Type):TypeEqualityGenerationGroup {
  return ObjCTypeUtils.matchType({
    id: function() {
      return NSOBJECT_GENERATION_GROUP;
    },
    NSObject: function() {
      return NSOBJECT_GENERATION_GROUP;
    },
    BOOL: function() {
      return {
        equalityCheckGenerator: GENERATOR_FOR_COMPARING_POINTER_EQUALITY,
        hashGenerator: generatorForCastingAttributeValueToType(NSUINTEGER_TYPE)
      };
    },
    NSInteger: function() {
      return {
        equalityCheckGenerator: GENERATOR_FOR_COMPARING_POINTER_EQUALITY,
        hashGenerator: generatorForInvokingSystemFunctionWithNameWithAttributeValue({
          name: 'ABS',
          import: Maybe.Nothing<ObjC.Import>()
        })
      };
    },
    NSUInteger: function() {
      return {
        equalityCheckGenerator: GENERATOR_FOR_COMPARING_POINTER_EQUALITY,
        hashGenerator: GENERATOR_FOR_HASHING_POINTER_VALUE
      };
    },
    double: function() {
      return {
        equalityCheckGenerator: generatorForInvokingFunctionWithBothAttributeValues(EqualityFunction.CompareDoubles()),
        hashGenerator: generatorForInvokingFunctionWithAttributeValue(EqualityFunction.HashDouble())
      };
    },
    float: function() {
      return {
        equalityCheckGenerator: generatorForInvokingFunctionWithBothAttributeValues(EqualityFunction.CompareFloats()),
        hashGenerator: generatorForInvokingFunctionWithAttributeValue(EqualityFunction.HashFloat())
      };
    },
    CGFloat: function() {
      return {
        equalityCheckGenerator: generatorForInvokingFunctionWithBothAttributeValues(EqualityFunction.CompareCGFloats()),
        hashGenerator: generatorForInvokingFunctionWithAttributeValue(EqualityFunction.HashCGFloat())
      };
    },
    NSTimeInterval: function() {
      return {
        equalityCheckGenerator: generatorForProvidingEqualityValuesFromGeneratorOfType(DOUBLE_TYPE),
        hashGenerator: generatorForProvidingHashValuesFromGeneratorOfType(DOUBLE_TYPE)
      };
    },
    uintptr_t: function() {
      return {
        equalityCheckGenerator: GENERATOR_FOR_COMPARING_POINTER_EQUALITY,
        hashGenerator: GENERATOR_FOR_HASHING_POINTER_VALUE
      };
    },
    uint32_t: function() {
      return {
        equalityCheckGenerator: GENERATOR_FOR_COMPARING_POINTER_EQUALITY,
        hashGenerator: GENERATOR_FOR_HASHING_POINTER_VALUE
      };
    },
    uint64_t: function() {
      return {
        equalityCheckGenerator: GENERATOR_FOR_COMPARING_POINTER_EQUALITY,
        hashGenerator: GENERATOR_FOR_HASHING_POINTER_VALUE
      };
    },
    int32_t: function() {
      return {
        equalityCheckGenerator: GENERATOR_FOR_COMPARING_POINTER_EQUALITY,
        hashGenerator: GENERATOR_FOR_HASHING_POINTER_VALUE
      };
    },
    int64_t: function() {
      return {
        equalityCheckGenerator: GENERATOR_FOR_COMPARING_POINTER_EQUALITY,
        hashGenerator: generatorForInvokingSystemFunctionWithNameWithAttributeValue({
          name: 'ABS',
          import: Maybe.Nothing<ObjC.Import>()
        })
      };
    },
    SEL: function() {
      return {
        equalityCheckGenerator: generatorForInvokingSystemFunctionWithNameWithBothAttributeValues({
          name: 'sel_isEqual',
          import: Maybe.Just<ObjC.Import>({
            library:Maybe.Just('objc'),
            file:'runtime.h',
            isPublic:false
          })
        }),
        hashGenerator: GENERATOR_FOR_NOT_INCLUDING_VALUE
      };
    },
    NSRange: function() {
      return {
        equalityCheckGenerator: generatorForInvokingSystemFunctionWithNameWithBothAttributeValues({
          name: 'NSEqualRanges',
          import: Maybe.Nothing<ObjC.Import>()
        }),
        hashGenerator: generatorForInvokingSubGenerators([
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(NSUINTEGER_TYPE, 'location'),
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(NSUINTEGER_TYPE, 'length')
        ])
      };
    },
    CGRect: function() {
      return {
        equalityCheckGenerator: generatorForInvokingSystemFunctionWithNameWithBothAttributeValues({
          name: 'CGRectEqualToRect',
          import: Maybe.Nothing<ObjC.Import>()
        }),
        hashGenerator: generatorForInvokingSubGenerators([
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGPOINT_TYPE, 'origin'),
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGSIZE_TYPE, 'size')
        ])
      };
    },
    CGPoint: function() {
      return {
        equalityCheckGenerator: generatorForInvokingSystemFunctionWithNameWithBothAttributeValues({
          name: 'CGPointEqualToPoint',
          import: Maybe.Nothing<ObjC.Import>()
        }),
        hashGenerator: generatorForInvokingSubGenerators([
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGFLOAT_TYPE, 'x'),
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGFLOAT_TYPE, 'y')
        ])
      };
    },
    CGSize: function() {
      return {
        equalityCheckGenerator: generatorForInvokingSystemFunctionWithNameWithBothAttributeValues({
          name: 'CGSizeEqualToSize',
          import: Maybe.Nothing<ObjC.Import>()
        }),
        hashGenerator: generatorForInvokingSubGenerators([
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGFLOAT_TYPE, 'width'),
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGFLOAT_TYPE, 'height')
        ])
      };
    },
    UIEdgeInsets: function() {
      return {
        equalityCheckGenerator: generatorForInvokingSystemFunctionWithNameWithBothAttributeValues({
          name: 'UIEdgeInsetsEqualToEdgeInsets',
          import: Maybe.Nothing<ObjC.Import>()
        }),
        hashGenerator: generatorForInvokingSubGenerators([
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGFLOAT_TYPE, 'top'),
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGFLOAT_TYPE, 'left'),
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGFLOAT_TYPE, 'bottom'),
          generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(CGFLOAT_TYPE, 'right')
        ])
      };
    },
    Class: function() {
      return NSOBJECT_GENERATION_GROUP;
    },
    dispatch_block_t: function() {
      return NSOBJECT_GENERATION_GROUP;
    },
    unmatchedType: function() {
      return null;
    },
  }, type);
}

function generatorForProvidingHashValuesFromGeneratorOfTypeWithSubValue(type:ObjC.Type, propertyName:string):(attributeValueAccessor:string) => TypeEqualityValue[] {
  return function(attributeValueAccessor:string): TypeEqualityValue[] {
    const generationGroup:TypeEqualityGenerationGroup = generationGroupForType(type);
    return generationGroup.hashGenerator(attributeValueAccessor + '.' + propertyName);
  };
}

function generatorForProvidingEqualityValuesFromGeneratorOfType(type:ObjC.Type):(attributeValueAccessor:string) => TypeEqualityValue[] {
  return function(attributeValueAccessor:string): TypeEqualityValue[] {
    const generationGroup:TypeEqualityGenerationGroup = generationGroupForType(type);
    return generationGroup.equalityCheckGenerator(attributeValueAccessor);
  };
}

function generatorForProvidingHashValuesFromGeneratorOfType(type:ObjC.Type):(attributeValueAccessor:string) => TypeEqualityValue[] {
  return function(attributeValueAccessor:string): TypeEqualityValue[] {
    const generationGroup:TypeEqualityGenerationGroup = generationGroupForType(type);
    return generationGroup.hashGenerator(attributeValueAccessor);
  };
}

interface GeneratedTypeEqualityInformation {
  equalityChecks:TypeEqualityValue[];
  hashValues:TypeEqualityValue[];
}

function generatedTypeEqualityInformationForAttribute(attribute:ObjectSpec.Attribute):GeneratedTypeEqualityInformation {
  const type:ObjC.Type = ObjectSpecCodeUtils.computeTypeOfAttribute(attribute);
  const generationGroup:TypeEqualityGenerationGroup = generationGroupForType(type);
  const attributeValueAccessor:string = ObjectSpecCodeUtils.ivarForAttribute(attribute);
  return generatedTypeEqualityInformationForGenerationGroup(generationGroup, attributeValueAccessor);
}

function buildImportsToInclude(soFar:ObjC.Import[], generatedTypeEqualityInformation:GeneratedTypeEqualityInformation):ObjC.Import[] {
  return soFar.concat(generatedTypeEqualityInformation.equalityChecks.reduce(buildTypeEqualityValueImportsToInclude, []))
              .concat(generatedTypeEqualityInformation.hashValues.reduce(buildTypeEqualityValueImportsToInclude, []));
}

function buildEqualityChecks(soFar:TypeEqualityValue[], generatedTypeEqualityInformation:GeneratedTypeEqualityInformation):TypeEqualityValue[] {
  return soFar.concat(generatedTypeEqualityInformation.equalityChecks);
}

function stringForIncludingEqualityCheckInCode(equalityCheck:string):string {
  return '  ' + equalityCheck + ' &&';
}

enum ComparisonResult {
  OrderedAscending = -1,
  OrderedSame = 0,
  OrderedDescending = 1
}

function compareTypeEqualityValuesByComputationCost(typeEqualityValue:TypeEqualityValue, typeEqualityValueToCompare:TypeEqualityValue):ComparisonResult {
  const baseComputationCostValue:number = computationCostAsNumber(typeEqualityValue.computationCost);
  const comparisonComputationCostValue:number = computationCostAsNumber(typeEqualityValueToCompare.computationCost);
  if (baseComputationCostValue < comparisonComputationCostValue) {
    return ComparisonResult.OrderedAscending;
  } else if (baseComputationCostValue > comparisonComputationCostValue) {
    return ComparisonResult.OrderedDescending;
  } else {
    return ComparisonResult.OrderedSame;
  }
}

function isEqualInstanceMethod(typeName:string, generatedTypeEqualityInformation:GeneratedTypeEqualityInformation[]):ObjC.Method {
  const openingCode:string[] = [
    'if (self == object) {',
    '  return YES;',
    '} else if (object == nil || ![object isKindOfClass:[self class]]) {',
    '  return NO;',
    '}',
    'return'
  ];
  const equalityCheckEqualityValues:TypeEqualityValue[] = generatedTypeEqualityInformation.reduce(buildEqualityChecks, []);
  const equalityCheckEqualityValuesSortedByCost:TypeEqualityValue[] = equalityCheckEqualityValues.concat().sort(compareTypeEqualityValuesByComputationCost);
  const equalityChecks:string[] = equalityCheckEqualityValuesSortedByCost.map(selectValue);
  const equalityChecksUpUntilLastOne:string[] = equalityChecks.slice(0, equalityChecks.length - 1).map(stringForIncludingEqualityCheckInCode);
  const lastEqualityCheck:string = equalityChecks[equalityChecks.length - 1];
  const code:string[] = openingCode.concat(equalityChecksUpUntilLastOne).concat('  ' + lastEqualityCheck + ';');
  return {
    preprocessors:[],
    belongsToProtocol:Maybe.Just('NSObject'),
    keywords: [
      {
        name: 'isEqual',
        argument: Maybe.Just<ObjC.KeywordArgument>({
          name: 'object',
          modifiers: [],
          type: {
            name: typeName,
            reference: ObjectSpecUtils.typeReferenceForValueTypeWithName(typeName)
          }
        })
      }
    ],
    code: code,
    comments:[],
    compilerAttributes:[],
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'BOOL',
        reference: 'BOOL'
      }),
      modifiers: []
    }
  };
}

function buildHashValues(soFar:TypeEqualityValue[], generatedTypeEqualityInformation:GeneratedTypeEqualityInformation):TypeEqualityValue[] {
  return soFar.concat(generatedTypeEqualityInformation.hashValues);
}

function hashInstanceMethod(generatedTypeEqualityInformation:GeneratedTypeEqualityInformation[]):ObjC.Method {
  const hashEqualityValues:TypeEqualityValue[] = generatedTypeEqualityInformation.reduce(buildHashValues, []);
  const hashValues:string[] = hashEqualityValues.map(selectValue);
  const hashValuesGroup:string = hashValues.join(', ');

  return {
    preprocessors:[],
    belongsToProtocol:Maybe.Just('NSObject'),
    keywords: [
      {
        name: 'hash',
        argument: Maybe.Nothing<ObjC.KeywordArgument>()
      }
    ],
    code: [
      'NSUInteger subhashes[] = {' + hashValuesGroup + '};',
      'NSUInteger result = subhashes[0];',
      'for (int ii = 1; ii < ' + hashValues.length + '; ++ii) {',
      '  unsigned long long base = (((unsigned long long)result) << 32 | subhashes[ii]);',
      '  base = (~base) + (base << 18);',
      '  base ^= (base >> 31);',
      '  base *=  21;',
      '  base ^= (base >> 11);',
      '  base += (base << 6);',
      '  base ^= (base >> 22);',
      '  result = base;',
      '}',
      'return result;'
    ],
    comments:[],
    compilerAttributes:[],
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'NSUInteger',
        reference: 'NSUInteger'
      }),
      modifiers: []
    }
  };
}

const COMPARE_FLOATS_FN:ObjC.Function = {
  comments: [],
  name: 'CompareFloats',
  parameters: [
    {
      type: {
        name: 'float',
        reference: 'float'
      },
      name: 'givenFloat'
    },
    {
      type: {
        name: 'float',
        reference: 'float'
      },
      name: 'floatToCompare'
    }
  ],
  returnType: {
    type: Maybe.Just<ObjC.Type>({
      name: 'BOOL',
      reference: 'BOOL'
    }),
    modifiers: []
  },
  code: [
    'return fabsf(givenFloat - floatToCompare) < FLT_EPSILON * fabsf(givenFloat + floatToCompare) || fabsf(givenFloat - floatToCompare) < FLT_MIN;'
  ],
  isPublic: false,
  compilerAttributes: [],
};

const HASH_FLOAT_FN:ObjC.Function = {
  comments: [],
  name: 'HashFloat',
  parameters: [
    {
      type: {
        name: 'float',
        reference: 'float'
      },
      name: 'givenFloat'
    }
  ],
  returnType: {
    type: Maybe.Just<ObjC.Type>({
      name: 'NSUInteger',
      reference: 'NSUInteger'
    }),
    modifiers: []
  },
  code: [
    'union {',
    '  float key;',
    '  uint32_t bits;',
    '} u;',
    'u.key = givenFloat;',
    'NSUInteger h = (NSUInteger)u.bits;',
    '#if !TARGET_RT_64_BIT',
    'h = ~h + (h << 15);',
    'h ^= (h >> 12);',
    'h += (h << 2);',
    'h ^= (h >> 4);',
    'h *= 2057;',
    'h ^= (h >> 16);',
    '#else',
    'h += ~h + (h << 21);',
    'h ^= (h >> 24);',
    'h = (h + (h << 3)) + (h << 8);',
    'h ^= (h >> 14);',
    'h = (h + (h << 2)) + (h << 4);',
    'h ^= (h >> 28);',
    'h += (h << 31);',
    '#endif',
    'return h;'
  ],
  isPublic: false,
  compilerAttributes: [],
};

const COMPARE_DOUBLES_FN:ObjC.Function = {
  comments: [],
  name: 'CompareDoubles',
  parameters: [
    {
      type: {
        name: 'double',
        reference: 'double'
      },
      name: 'givenDouble'
    },
    {
      type: {
        name: 'double',
        reference: 'double'
      },
      name: 'doubleToCompare'
    }
  ],
  returnType: {
    type: Maybe.Just<ObjC.Type>({
      name: 'BOOL',
      reference: 'BOOL'
    }),
    modifiers: []
  },
  code: [
    'return fabs(givenDouble - doubleToCompare) < DBL_EPSILON * fabs(givenDouble + doubleToCompare) || fabs(givenDouble - doubleToCompare) < DBL_MIN;'
  ],
  isPublic: false,
  compilerAttributes: [],
};

const HASH_DOUBLE_FN:ObjC.Function = {
  comments: [],
  name: 'HashDouble',
  parameters: [
    {
      type: {
        name: 'double',
        reference: 'double'
      },
      name: 'givenDouble'
    }
  ],
  returnType: {
    type: Maybe.Just<ObjC.Type>({
      name: 'NSUInteger',
      reference: 'NSUInteger'
    }),
    modifiers: []
  },
  code: [
    'union {',
    '  double key;',
    '  uint64_t bits;',
    '} u;',
    'u.key = givenDouble;',
    'NSUInteger p = u.bits;',
    'p = (~p) + (p << 18);',
    'p ^= (p >> 31);',
    'p *=  21;',
    'p ^= (p >> 11);',
    'p += (p << 6);',
    'p ^= (p >> 22);',
    'return (NSUInteger) p;'
  ],
  isPublic: false,
  compilerAttributes: [],
};

function wrapCGFloatTypeComparisonCodeToAvoidUnusedFunctionWarning(doubleCode:string, floatCode:string):string[] {
  return [
    '#if CGFLOAT_IS_DOUBLE',
    '  BOOL useDouble = YES;',
    '#else',
    '  BOOL useDouble = NO;',
    '#endif',
    '  if (useDouble) {',
    '    ' + doubleCode,
    '  } else {',
    '    ' + floatCode,
    '  }'
  ];
}

const COMPARE_CGFLOATS_FN:ObjC.Function = {
  comments: [],
  name: 'CompareCGFloats',
  parameters: [
    {
      type: {
        name: 'CGFloat',
        reference: 'CGFloat'
      },
      name: 'givenCGFloat'
    },
    {
      type: {
        name: 'CGFloat',
        reference: 'CGFloat'
      },
      name: 'cgFloatToCompare'
    }
  ],
  returnType: {
    type: Maybe.Just<ObjC.Type>({
      name: 'BOOL',
      reference: 'BOOL'
    }),
    modifiers: []
  },
  code: wrapCGFloatTypeComparisonCodeToAvoidUnusedFunctionWarning(
    'return CompareDoubles(givenCGFloat, cgFloatToCompare);',
    'return CompareFloats(givenCGFloat, cgFloatToCompare);'
  ),
  isPublic: false,
  compilerAttributes: [],
};

const HASH_CGFLOATS_FN:ObjC.Function = {
  comments: [],
  name: 'HashCGFloat',
  parameters: [
    {
      type: {
        name: 'CGFloat',
        reference: 'CGFloat'
      },
      name: 'givenCGFloat'
    }
  ],
  returnType: {
    type: Maybe.Just<ObjC.Type>({
      name: 'NSUInteger',
      reference: 'NSUInteger'
    }),
    modifiers: []
  },
  code: wrapCGFloatTypeComparisonCodeToAvoidUnusedFunctionWarning(
    'return HashDouble(givenCGFloat);',
    'return HashFloat(givenCGFloat);'
  ),
  isPublic: false,
  compilerAttributes: [],
};

function functionDefinitionForEqualityFunction(equalityFunction:EqualityFunction):ObjC.Function {
  return equalityFunction.match(function():ObjC.Function {
    return COMPARE_FLOATS_FN;
  }, function():ObjC.Function {
    return COMPARE_DOUBLES_FN;
  }, function():ObjC.Function {
    return COMPARE_CGFLOATS_FN;
  }, function():ObjC.Function {
    return HASH_FLOAT_FN;
  }, function():ObjC.Function {
    return HASH_DOUBLE_FN;
  }, function():ObjC.Function {
    return HASH_CGFLOATS_FN;
  });
}

interface EqualityFunctionsToIncludeTracker {
  equalityFunctionsToInclude:EqualityFunction[];
  equalityFunctionsIncluded:{[equalityFunctionName:string]: boolean;};
}

function objectIncludingValue(existingObject:{[key:string]: boolean;}, key:string, value:boolean):{[key:string]: boolean;} {
  const updatedObject:{[equalityFunctionName:string]: boolean;} = {};
  for (const existingKey in existingObject) {
    if (existingObject.hasOwnProperty(existingKey)) {
      updatedObject[existingKey] = existingObject[existingKey];
    }
  }
  updatedObject[key] = value;
  return updatedObject;
}

function buildEqualityFunctionsToIncludeTracker(tracker:EqualityFunctionsToIncludeTracker, equalityFunction:EqualityFunction):EqualityFunctionsToIncludeTracker {
  const equalityFunctionName:string = nameOfEqualityFunction(equalityFunction);
  if (tracker.equalityFunctionsIncluded[equalityFunctionName] !== true) {
    return {
      equalityFunctionsToInclude: tracker.equalityFunctionsToInclude.concat(equalityFunction),
      equalityFunctionsIncluded: objectIncludingValue(tracker.equalityFunctionsIncluded, equalityFunctionName, true)
    };
  } else {
    return tracker;
  }
}

function buildFunctionsToInclude(soFar:EqualityFunction[], generatedTypeEqualityInformation:GeneratedTypeEqualityInformation):EqualityFunction[] {
  return soFar.concat(generatedTypeEqualityInformation.equalityChecks.reduce(buildTypeEqualityValueFunctionsToInclude, []))
              .concat(generatedTypeEqualityInformation.hashValues.reduce(buildTypeEqualityValueFunctionsToInclude, []));
}

function functionsToIncludeForGeneratedTypeEqualityInformation(generatedTypeEqualityInformation:GeneratedTypeEqualityInformation[]):ObjC.Function[] {
  const allEqualityFunctions:EqualityFunction[] = generatedTypeEqualityInformation.reduce(buildFunctionsToInclude, []);

  const emptyTracker:EqualityFunctionsToIncludeTracker = {
    equalityFunctionsToInclude: [],
    equalityFunctionsIncluded: {}
  };
  const tracker:EqualityFunctionsToIncludeTracker = allEqualityFunctions.reduce(buildEqualityFunctionsToIncludeTracker, emptyTracker);

  return tracker.equalityFunctionsToInclude.map(functionDefinitionForEqualityFunction);
}

function doesValueAttributeContainAnUnknownType(attribute:ObjectSpec.Attribute):boolean {
  const type:ObjC.Type = ObjectSpecCodeUtils.computeTypeOfAttribute(attribute);
  const generationGroup:TypeEqualityGenerationGroup = generationGroupForType(type);
  return generationGroup == null;
}

function attributeToUnknownTypeError(objectType:ObjectSpec.Type, attribute:ObjectSpec.Attribute):Error.Error {
  return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Equality plugin does not know how to compare or hash the backing type "' + underlyingType + '" from ' + objectType.typeName + '.' + attribute.name + '. Did you declare the wrong backing type?');
  }, function():Error.Error {
    return Error.Error('The Equality plugin does not know how to compare or hash the type "' + attribute.type.name + '" from ' + objectType.typeName + '.' + attribute.name + '. Did you forget to declare a backing type?');
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
      if (objectType.attributes.length > 0) {
        const generatedTypeEqualityInformation:GeneratedTypeEqualityInformation[] = objectType.attributes.map(generatedTypeEqualityInformationForAttribute);
        return functionsToIncludeForGeneratedTypeEqualityInformation(generatedTypeEqualityInformation);
      } else {
        return [];
      }
    },
    headerComments: function(objectType:ObjectSpec.Type):ObjC.Comment[] {
      return [];
    },
    imports: function(objectType:ObjectSpec.Type):ObjC.Import[] {
      if (objectType.attributes.length > 0) {
        const generatedTypeEqualityInformation:GeneratedTypeEqualityInformation[] = objectType.attributes.map(generatedTypeEqualityInformationForAttribute);
        return generatedTypeEqualityInformation.reduce(buildImportsToInclude, []);
      } else {
        return [];
      }
    },
    implementedProtocols: function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
      return [];
    },
    instanceMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
      if (objectType.attributes.length > 0) {
        const generatedTypeEqualityInformation:GeneratedTypeEqualityInformation[] = objectType.attributes.map(generatedTypeEqualityInformationForAttribute);
        return [
          isEqualInstanceMethod(objectType.typeName, generatedTypeEqualityInformation),
          hashInstanceMethod(generatedTypeEqualityInformation)
        ];
      } else {
        return [];
      }
    },
    macros: function(valueType:ObjectSpec.Type):ObjC.Macro[] {
      return [];
    },
    properties: function(objectType:ObjectSpec.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun:['RMEquality'],
    staticConstants: function(objectType:ObjectSpec.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
      return objectType.attributes.filter(doesValueAttributeContainAnUnknownType).map(FunctionUtils.pApplyf2(objectType, attributeToUnknownTypeError));
    },
    nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(objectType:ObjectSpec.Type):boolean {
      return false;
    },
  };
}

function generatedTypeEqualityInformationForGenerationGroup(generationGroup:TypeEqualityGenerationGroup, valueAccessor:string):GeneratedTypeEqualityInformation {
  return {
    equalityChecks: generationGroup.equalityCheckGenerator(valueAccessor),
    hashValues: generationGroup.hashGenerator(valueAccessor)
  };
}

function generatedTypeEqualityInformationForSubtypeAttributeForAlgebraicType(algebraicType:AlgebraicType.Type):GeneratedTypeEqualityInformation {
  const type:ObjC.Type = {
    name: 'NSUInteger',
    reference: 'NSUInteger'
  };
  const generationGroup:TypeEqualityGenerationGroup = generationGroupForType(type);
  return generatedTypeEqualityInformationForGenerationGroup(generationGroup, AlgebraicTypeUtils.valueAccessorForInstanceVariableStoringSubtype());
}

function generatedTypeEqualityInformationForAlgebraicSubtypeAttribute(subtype:AlgebraicType.Subtype, attribute:AlgebraicType.SubtypeAttribute):GeneratedTypeEqualityInformation {
  const type:ObjC.Type = AlgebraicTypeUtils.computeTypeOfAttribute(attribute);
  const generationGroup:TypeEqualityGenerationGroup = generationGroupForType(type);
  return generatedTypeEqualityInformationForGenerationGroup(generationGroup, AlgebraicTypeUtils.valueAccessorForInstanceVariableForAttribute(subtype, attribute));
}

function generatedTypeEqualityInformationForAlgebraicType(algebraicType:AlgebraicType.Type):GeneratedTypeEqualityInformation[] {
  const attributeGeneratedTypeEqualityInformation:GeneratedTypeEqualityInformation[] = AlgebraicTypeUtils.mapAttributesWithSubtypeFromSubtypes(algebraicType.subtypes, generatedTypeEqualityInformationForAlgebraicSubtypeAttribute);
  return [generatedTypeEqualityInformationForSubtypeAttributeForAlgebraicType(algebraicType)].concat(attributeGeneratedTypeEqualityInformation);
}

function doesAlgebraicAttributeContainAnUnknownType(attribute:AlgebraicType.SubtypeAttribute):boolean {
  const type:ObjC.Type = AlgebraicTypeUtils.computeTypeOfAttribute(attribute);
  const generationGroup:TypeEqualityGenerationGroup = generationGroupForType(type);
  return generationGroup == null;
}

function algebraicAttributeToUnknownTypeError(algebraicType:AlgebraicType.Type, attribute:AlgebraicType.SubtypeAttribute):Error.Error {
  return Maybe.match(function(underlyingType: string):Error.Error {
    return Error.Error('The Equality plugin does not know how to compare or hash the backing type "' + underlyingType + '" from ' + algebraicType.name + '.' + attribute.name + '. Did you declare the wrong backing type?');
  }, function():Error.Error {
    return Error.Error('The Equality plugin does not know how to compare or hash the type "' + attribute.type.name + '" from ' + algebraicType.name + '.' + attribute.name + '. Did you forget to declare a backing type?');
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
      const generatedTypeEqualityInformation:GeneratedTypeEqualityInformation[] = generatedTypeEqualityInformationForAlgebraicType(algebraicType);
      return functionsToIncludeForGeneratedTypeEqualityInformation(generatedTypeEqualityInformation);
    },
    headerComments: function(algebraicType:AlgebraicType.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(algebraicType:AlgebraicType.Type):ObjC.Protocol[] {
      return [];
    },
    imports: function(algebraicType:AlgebraicType.Type):ObjC.Import[] {
      const generatedTypeEqualityInformation: GeneratedTypeEqualityInformation[] = generatedTypeEqualityInformationForAlgebraicType(algebraicType);
      return generatedTypeEqualityInformation.reduce(buildImportsToInclude, []);
    },
    instanceMethods: function(algebraicType:AlgebraicType.Type):ObjC.Method[] {
      const generatedTypeEqualityInformation:GeneratedTypeEqualityInformation[] = generatedTypeEqualityInformationForAlgebraicType(algebraicType);
      return [
        isEqualInstanceMethod(algebraicType.name, generatedTypeEqualityInformation),
        hashInstanceMethod(generatedTypeEqualityInformation)
      ];
    },
    instanceVariables: function(algebraicType:AlgebraicType.Type):ObjC.InstanceVariable[] {
      return [];
    },
    macros: function(algebraicType:AlgebraicType.Type):ObjC.Macro[] {
      return [];
    },
    requiredIncludesToRun: ['RMEquality'],
    staticConstants: function(algebraicType:AlgebraicType.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(algebraicType:AlgebraicType.Type):Error.Error[] {
      return AlgebraicTypeUtils.allAttributesFromSubtypes(algebraicType.subtypes).filter(doesAlgebraicAttributeContainAnUnknownType).map(FunctionUtils.pApplyf2(algebraicType, algebraicAttributeToUnknownTypeError));
    },
    nullability: function(algebraicType:AlgebraicType.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
    subclassingRestricted: function(algebraicType:AlgebraicType.Type):boolean {
      return false;
    },
  };
}
