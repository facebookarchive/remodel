/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as CPlusPlus from './cplusplus';
import * as StringUtils from './string-utils';

function typeToString(type: CPlusPlus.Type): string {
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
      break;
  }

  return result;
}

function renderMethodParam(param: CPlusPlus.MethodParam): string {
  return typeToString(param.type) + param.name;
}

function renderMethodParameters(params: CPlusPlus.MethodParam[]): string {
  return params.map(renderMethodParam).join(', ');
}

function renderConstructor(constructor: CPlusPlus.ClassConstructor): string[] {
  var result: string[] = [];

  switch (constructor.default) {
    case CPlusPlus.ConstructorDefault.Default:
      result.push(constructor.name + '() = default;');
      break;
    case CPlusPlus.ConstructorDefault.Delete:
      result.push(constructor.name + '() = delete;');
      break;
    default:
      var currentLine =
        constructor.name +
        '(' +
        renderMethodParameters(constructor.params) +
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

export function renderFunction(funct: CPlusPlus.Function): string[] {
  var opener =
    typeToString(funct.returnType) +
    funct.name +
    '(' +
    renderMethodParameters(funct.params) +
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

export function renderMethod(method: CPlusPlus.ClassMethod): string[] {
  switch (method.kind) {
    case 'constructor':
      return renderConstructor(method);
    case 'function':
      return renderFunction(method);
  }
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
    section.methods
      .map(renderMethod)
      .reduce(
        (
          agg: string[],
          value: string[],
          currentIndex: number,
          array: string[][],
        ) => {
          return agg.concat(
            currentIndex < array.length - 1 ? value.concat('') : value,
          );
        },
        [],
      )
      .map(StringUtils.indent(2)),
  );

  // add members
  result = result.concat(
    section.members
      .map(member => {
        return typeToString(member.type) + member.name + ';';
      })
      .map(StringUtils.indent(2)),
  );

  return result.join('\n');
}

export function renderClass(klass: CPlusPlus.Class): string[] {
  var sections = klass.sections.map(renderSection).join('\n\n');
  return ['class ' + klass.name + ' {'].concat([sections]).concat(['};']);
}
