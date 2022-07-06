/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as AlgebraicType from '../algebraic-type';
import * as AlgebraicTypeInitialization from './algebraic-type-initialization';
import * as AlgebraicTypeUtils from '../algebraic-type-utils';
import * as ObjC from '../objc';
import * as ObjCCommentUtils from '../objc-comment-utils';
import * as StringUtils from '../string-utils';

function keywordsForAttributes(
  algebraicType: AlgebraicType.Type,
  attributes: AlgebraicType.SubtypeAttribute[],
): ObjC.Keyword[] {
  const assumeNonnull = algebraicType.includes.indexOf('RMAssumeNonnull') > 0;
  const usesNullability =
    assumeNonnull ||
    attributes.some((attribute) =>
      attribute.nullability.match(
        /* inherited */ () => false,
        /* nonnull   */ () => true,
        /* nullable  */ () => true,
        /* null_unspecified  */ () => true,
      ),
    );

  return attributes.map((attribute, index) => {
    let name = attribute.name;
    let reference = attribute.type.reference;

    if (usesNullability) {
      // Use the underscored nullability type annotations as the lowercased type
      // annotations are not compatible with a pointer to a pointer.
      reference = attribute.nullability.match(
        () => reference,
        () => (assumeNonnull ? reference : `${reference} _Nonnull`),
        () => `${reference} _Nullable`,
        () => `${reference} _Null_unspecified`,
      );
      reference = reference.concat(' * _Nullable');
    } else {
      reference = reference.concat(' *');
    }

    return {
      argument: {
        name: name,
        modifiers: [],
        type: {
          name: attribute.type.name,
          reference: reference,
        },
      },
      name: index !== 0 ? name : `is${StringUtils.capitalize(name)}`,
    };
  });
}

function keywordsForSubtype(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
): ObjC.Keyword[] {
  return subtype.match(
    (subtype) => {
      const attributes = subtype.attributes;
      if (attributes.length === 0) {
        return [
          {
            name: `is${StringUtils.capitalize(subtype.name)}`,
            argument: null,
          },
        ];
      } else {
        const keywords = keywordsForAttributes(algebraicType, attributes);
        keywords[0] = {
          argument: keywords[0].argument,
          name: `is${StringUtils.capitalize(
            subtype.name,
          )}With${StringUtils.capitalize(attributes[0].name)}`,
        };
        return keywords;
      }
    },
    (attribute) => keywordsForAttributes(algebraicType, [attribute]),
  );
}

function codeForMatchMethod(
  algebraicType: AlgebraicType.Type,
  subtype: AlgebraicType.Subtype,
  attributes: AlgebraicType.SubtypeAttribute[],
): string[] {
  const matchExpression = `${AlgebraicTypeUtils.valueAccessorForInstanceVariableStoringSubtype()} == ${AlgebraicTypeUtils.EnumerationValueNameForSubtype(
    algebraicType,
    subtype,
  )}`;

  const setterStatements = attributes.flatMap((attribute) => [
    `  if (${attribute.name}) {`,
    `    *${
      attribute.name
    } = ${AlgebraicTypeUtils.valueAccessorForInstanceVariableForAttribute(
      subtype,
      attribute,
    )};`,
    '  }',
  ]);

  if (setterStatements.length === 0) {
    return [`return ${matchExpression};`];
  } else {
    return [`if (${matchExpression}) {`]
      .concat(setterStatements)
      .concat(['  return YES;', '}', 'return NO;']);
  }
}

function commentsForMatchMethod(
  attributes: AlgebraicType.SubtypeAttribute[],
): ObjC.Comment[] {
  if (attributes.length === 0) {
    return [];
  }

  let defaultComments = [
    {content: ' *'},
    {
      content:
        ' * If this method returns NO, the out parameters are not modified.',
    },
    {
      content:
        ' * All out parameters are optional. Pass NULL to ignore their values.',
    },
  ];

  const paramComments = ObjCCommentUtils.paramCommentsFromAttributes(attributes)
    .filter((content) => content.trim().length !== 0)
    .map((content) => ({
      content: ` *${content}`,
    }));

  if (paramComments.length === 0) {
    return defaultComments;
  } else {
    return defaultComments.concat([{content: ' *'}]).concat(paramComments);
  }
}

function instanceMethodsForPlugin(
  algebraicType: AlgebraicType.Type,
): ObjC.Method[] {
  return algebraicType.subtypes.map((subtype) => {
    const attributes = AlgebraicTypeUtils.attributesFromSubtype(subtype);

    return {
      preprocessors: [],
      belongsToProtocol: null,
      code: codeForMatchMethod(algebraicType, subtype, attributes),
      comments: [
        {content: '/**'},
        {
          content: ` * Returns YES if the receiver's subtype is '${AlgebraicTypeUtils.subtypeNameFromSubtype(
            subtype,
          )}', otherwise NO.`,
        },
      ]
        .concat(commentsForMatchMethod(attributes))
        .concat([{content: ' */'}]),
      compilerAttributes: [],
      keywords: keywordsForSubtype(algebraicType, subtype),
      returnType: {
        type: {
          name: 'BOOL',
          reference: 'BOOL',
        },
        modifiers: [],
      },
    };
  });
}

export function createAlgebraicTypePlugin(): AlgebraicType.Plugin {
  return {
    additionalFiles: () => [],
    transformBaseFile: (_algebraicType, baseFile) => baseFile,
    blockTypes: () => [],
    classMethods: () => [],
    enumerations: () => [],
    transformFileRequest: (writeRequest) => writeRequest,
    fileType: () => null,
    forwardDeclarations: () => [],
    functions: () => [],
    headerComments: () => [],
    implementedProtocols: () => [],
    imports: () => [],
    instanceMethods: instanceMethodsForPlugin,
    instanceVariables: () => [],
    macros: () => [],
    requiredIncludesToRun: ['CaseMatching'],
    staticConstants: () => [],
    validationErrors: () => [],
    nullability: () => null,
    subclassingRestricted: () => false,
  };
}
