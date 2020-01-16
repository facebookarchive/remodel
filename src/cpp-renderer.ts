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
  var result = constructor.name + '()';

  switch (constructor.default) {
    case CPlusPlus.ConstructorDefault.Default:
      result += ' = default;';
      break;
    case CPlusPlus.ConstructorDefault.Delete:
      result += ' = delete;';
      break;
    default:
      result += ' {}';
  }

  return [result];
}

export function renderFunction(funct: CPlusPlus.Function): string[] {
  var opener =
    typeToString(funct.returnType) +
    funct.name +
    '(' +
    renderMethodParameters(funct.params) +
    ')' +
    (funct.is_const ? ' const' : '');

  if (funct.code) {
    return [opener + ' {']
      .concat(funct.code.map(StringUtils.indent(2)))
      .concat('}')
      .concat('');
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
      .reduce((agg: string[], value: string[]) => {
        return agg.concat(value);
      }, [])
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
