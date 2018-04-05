/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import FunctionUtils = require('./function-utils');

export function stringContainingSpaces(spaces:number):string {
  var str = '';
  for (var i = 0; i < spaces; i++) {
    str += ' ';
  }
  return str;
}

function indentFunc(spaces:number, str:string):string {
  if (str !== '') {
    return stringContainingSpaces(spaces) + str;
  } else {
    return str;
  }
}

export function indent(spaces:number):(str:string) => string {
  return FunctionUtils.pApplyf2(spaces, indentFunc);
}


export function capitalize(str: string): string {
  const capitalizedFirstCharacter = str.substring(0, 1).toUpperCase();
  return capitalizedFirstCharacter + str.substring(1, str.length);
}

export function lowercased(str: string): string {
  const lowercasedFirstCharacter = str.substring(0, 1).toLowerCase();
  return lowercasedFirstCharacter + str.substring(1, str.length);
}

export function removeWhitespace(name: string): string {
  return name.replace(/\s/g,'');
}

const PREFIX_REGEX = /([A-Z]+)/;

function prefixIncludingFirstCharacterOfNameFromString(stringIncludingPrefix: string):string {
  const matchIncludingFirstCharacterOfName:string[] = PREFIX_REGEX.exec(stringIncludingPrefix);
  if (matchIncludingFirstCharacterOfName != null) {
    return matchIncludingFirstCharacterOfName[0];
  } else {
    return '';
  }
}

export function stringRemovingCapitalizedPrefix(stringIncludingPrefix:string):string {
  const prefixIncludingFirstCharacter:string = prefixIncludingFirstCharacterOfNameFromString(stringIncludingPrefix);
  return stringIncludingPrefix.substring(prefixIncludingFirstCharacter.length - 1);
}
