/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ObjC = require('./objc');

function commentWithFirstSpaceIfNecessary(comment:string):string {
  return comment.charAt(0) == ' ' ? comment : ' ' + comment;
}

export function commentsAsBlockFromStringArray(commentsAsStrings:string[]):ObjC.Comment[] {
  if (commentsAsStrings.length == 0) {
    return [];
  }

  const commentBody = commentsAsStrings.map(function(comment:string):ObjC.Comment {
      return { content: ' *' + commentWithFirstSpaceIfNecessary(comment) };
    });

  return [{ content: '/**' }].concat(commentBody).concat({ content: ' */' });
}
