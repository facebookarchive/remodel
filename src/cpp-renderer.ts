/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as CLangCommon from './clang-common';
import * as CPlusPlus from './cplusplus';
import * as StringUtils from './string-utils';

function returnString(str: string): () => string {
  return function () {
    return str;
  };
}

function nullabilityString(nullability: CLangCommon.Nullability): string {
  return nullability.match(
    /* inherited */ returnString(''),
    /* nonnull */ returnString('_Nonnull '),
    /* nullable */ returnString('_Nullable '),
  );
}

function typeToString(
  type: CPlusPlus.Type,
  includeNullability: boolean,
): string {
  var result = '';

  if (type.qualifier.is_const) {
    result += 'const ';
  }

  result += type.baseType;

  switch (type.qualifier.passBy) {
    case CPlusPlus.TypePassBy.Value:
      result += ' ';
      break;
    case CPlusPlus.TypePassBy.Reference:
      result += ' &';
      break;
    case CPlusPlus.TypePassBy.Pointer:
      result += ' *';
      if (includeNullability) {
        result += nullabilityString(type.qualifier.nullability);
      }
      break;
  }

  return result;
}

function renderParam(param: CPlusPlus.FunctionParam): string {
  return typeToString(param.type, true) + param.name;
}

function renderParameters(params: CPlusPlus.FunctionParam[]): string {
  return params.map(renderParam).join(', ');
}

function renderConstructorDeclaration(
  constructor: CPlusPlus.ClassConstructor,
): string[] {
  var result: string[] = [];

  switch (constructor.default) {
    case CPlusPlus.ConstructorDefault.Default:
      result.push(constructor.name + '() = default;');
      break;
    case CPlusPlus.ConstructorDefault.Delete:
      result.push(constructor.name + '() = delete;');
      break;
    default:
      result.push(
        constructor.name + '(' + renderParameters(constructor.params) + ');',
      );
  }

  return result;
}

function renderConstructorDefinition(
  className: string,
  constructor: CPlusPlus.ClassConstructor,
): string[] {
  var result: string[] = [];

  switch (constructor.default) {
    case CPlusPlus.ConstructorDefault.Default:
    case CPlusPlus.ConstructorDefault.Delete:
      // no need to emit
      break;
    default:
      var currentLine =
        className +
        '::' +
        constructor.name +
        '(' +
        renderParameters(constructor.params) +
        ')';
      if (constructor.initializers.length > 0) {
        result.push(currentLine + ' :');

        constructor.initializers.reduce(
          (previousValue, currentValue, currentIndex) => {
            var line =
              '  ' +
              currentValue.memberName +
              '(' +
              currentValue.expression +
              ')';
            if (currentIndex < constructor.initializers.length - 1) {
              line += ',';
            } else {
              line += ' {}';
            }

            previousValue.push(line);
            return previousValue;
          },
          result,
        );
      } else {
        result.push(currentLine + ' {}');
      }
  }

  return result;
}

export function renderFunctionDeclaration(funct: CPlusPlus.Function): string[] {
  var opener =
    typeToString(funct.returnType, true) +
    funct.name +
    '(' +
    renderParameters(funct.params) +
    ')' +
    (funct.is_const ? ' const' : '');

  return [opener + ';'];
}

export function renderFunctionDefinitionCore(
  className: string,
  funct: CPlusPlus.Function,
): string[] {
  var classQualifier = className.length > 0 ? className + '::' : '';

  var opener =
    typeToString(funct.returnType, true) +
    classQualifier +
    funct.name +
    '(' +
    renderParameters(funct.params) +
    ')' +
    (funct.is_const ? ' const' : '');

  if (funct.code != null) {
    if (funct.code.length == 0) {
      return [opener + ' {}'];
    } else {
      return [opener]
        .concat('{')
        .concat(funct.code.map(StringUtils.indent(2)))
        .concat('}');
    }
  } else {
    return [opener + ';'];
  }
}

export function renderFunctionDefinition(funct: CPlusPlus.Function): string[] {
  return renderFunctionDefinitionCore('', funct);
}

export function renderMethodDefinition(
  className: string,
  funct: CPlusPlus.Function,
): string[] {
  return renderFunctionDefinitionCore(className, funct);
}

function renderSectionVisibility(section: CPlusPlus.ClassSection): string {
  switch (section.visibility) {
    case CPlusPlus.ClassSectionVisibility.Private:
      return 'private:';
    case CPlusPlus.ClassSectionVisibility.Public:
      return 'public:';
      break;
  }
}

function renderSection(section: CPlusPlus.ClassSection): string {
  var result: string[] = [renderSectionVisibility(section)];

  // add methods
  result = result.concat(
    section.constructors
      .map(renderConstructorDeclaration)
      .flat()
      .map(StringUtils.indent(2)),
  );

  if (section.methods.length > 0) {
    result.push('');

    result = result.concat(
      section.methods
        .map(renderFunctionDeclaration)
        .flat()
        .map(StringUtils.indent(2)),
    );
  }

  // add members
  result = result.concat(
    section.members
      .map((member) => {
        return typeToString(member.type, false) + member.name + '{};';
      })
      .map(StringUtils.indent(2)),
  );

  return result.join('\n');
}

function spaceOutGroups(groups: string[][]): string[] {
  var result: string[] = [];

  groups.forEach((lines) => {
    if (result.length > 0 && lines.length > 0) {
      result.push('');
    }
    result = result.concat(lines);
  });

  return result;
}

export function renderClassDeclaration(klass: CPlusPlus.Class): string[] {
  var sections = klass.sections.map(renderSection).join('\n\n');
  var wholeClass = ['class ' + klass.name + ' {']
    .concat([sections])
    .concat(['};']);
  if (klass.nullability == CPlusPlus.ClassNullability.assumeNonnull) {
    return ['NS_ASSUME_NONNULL_BEGIN']
      .concat(wholeClass)
      .concat(['NS_ASSUME_NONNULL_END']);
  } else {
    return wholeClass;
  }
}

export function renderClassDefinition(klass: CPlusPlus.Class): string[] {
  var result: string[] = [];

  // render all constructors first
  var constructors = klass.sections.reduce(
    (previousValue, currentValue, currentIndex) => {
      return previousValue.concat(
        currentValue.constructors.map(
          renderConstructorDefinition.bind(null, klass.name),
        ),
      );
    },
    Array<Array<string>>(),
  );

  var methods = klass.sections.reduce(
    (previousValue, currentValue, currentIndex) => {
      return previousValue.concat(
        currentValue.methods.map(renderMethodDefinition.bind(null, klass.name)),
      );
    },
    Array<Array<string>>(),
  );

  return spaceOutGroups(constructors.concat(methods));
}
