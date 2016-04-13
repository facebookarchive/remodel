/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
