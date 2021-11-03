/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ObjC from './objc';
import * as ObjectSpec from './object-spec';

function commentWithFirstSpaceIfNecessary(comment: string): string {
  return comment.charAt(0) == ' ' ? comment : ' ' + comment;
}

export function commentsAsBlockFromStringArray(
  commentsAsStrings: string[],
): ObjC.Comment[] {
  if (commentsAsStrings.length == 0) {
    return [];
  }

  const commentBody = commentsAsStrings.map(function (
    comment: string,
  ): ObjC.Comment {
    return {content: ' *' + commentWithFirstSpaceIfNecessary(comment)};
  });

  return [{content: '/**'}].concat(commentBody).concat({content: ' */'});
}

export function singleLineCommentsBlockFromStringArray(
  commentsAsStrings: string[],
): ObjC.Comment[] {
  return commentsAsStrings.map((comment) => {
    return {content: ['//', comment].filter(Boolean).join(' ')};
  });
}

function repeat(string: string, times: number): string {
  return times > 1 ? string + repeat(string, times - 1) : string;
}

function paramCommentsFromAttribute(attribute: ObjectSpec.Attribute): string[] {
  // for the first comment line, we'll append it directly to the
  // @param prefix, for the latter attributes, we'll align them
  // by prepending the same number of spaces to each line
  const prefix = ` @param ${attribute.name} `;
  const whitespace = repeat(' ', prefix.length);

  // trim off leading and trailing whitespace, so that '# comment'
  // is not rendered differently from '#comment'
  return attribute.comments.map((comment, index) => {
    return index === 0 ? prefix + comment.trim() : whitespace + comment.trim();
  });
}

export function paramCommentsFromAttributes(
  attributes: ObjectSpec.Attribute[],
): string[] {
  return ([] as string[]).concat(...attributes.map(paramCommentsFromAttribute));
}

export function prefixedParamCommentsFromAttributes(
  prefix: string[],
  attributes: ObjectSpec.Attribute[],
): string[] {
  const paramComments = paramCommentsFromAttributes(attributes);

  // if we have both prefix comments and parameter comments, insert a separator
  // line so that they're not squished together in the source file
  const separator = paramComments.length > 0 && prefix.length > 0 ? [''] : [];
  return prefix.concat(separator, paramComments);
}
