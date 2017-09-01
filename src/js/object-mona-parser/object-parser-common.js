/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
* Legacy value object parser written using mona and pure js. This should
* eventually be moved into a more effecient and typed parser.
*/
const mona = require('mona');

function typeReferenceFromParsedDefinition(parsedTypeReference, genericsSection, protocolSection) {
  if (genericsSection !== undefined) {
    return parsedTypeReference + '<' + genericsSection + '>';
  } else if (protocolSection !== undefined) {
    return parsedTypeReference + '<' + protocolSection + '>';
  } else {
    return parsedTypeReference;
  }
}

// ex:
// EnumName(NSUInteger)
function parseAttributeTypeReferenceSection() {
  return mona.sequence(function(s) {
    const typeReferenceSection = s(mona.trimLeft(mona.text(mona.or(mona.alphanum(), mona.string('_')))));
    const protocolSection = s(mona.maybe(mona.between(mona.string('<'), mona.string('>'), mona.text(mona.or(mona.alphanum())))));
    const genericsSection = s(mona.maybe(mona.between(mona.string('<'), mona.string('>'), mona.text(mona.or(mona.alphanum(), mona.string('_'), mona.string('*'), mona.spaces(), mona.string(','))))));
    const underlyingType = s(mona.maybe(mona.between(mona.string('('),
    mona.string(')'),
    mona.text(mona.or(mona.alphanum(), mona.string('_'))))));
    s(mona.maybe(mona.spaces()));

    const typeReference = typeReferenceFromParsedDefinition(typeReferenceSection, genericsSection, protocolSection);

    const parsedAttributeTypeReferenceSection = {
      typeReference: typeReference,
      typeName: typeReferenceSection,
      underlyingType: underlyingType,
      conformingProtocol: protocolSection
    };
    return mona.value(parsedAttributeTypeReferenceSection);
  });
}

function quotedText() {
  return mona.sequence(function(s) {
    s(mona.string('"'));
    const text = s(mona.text(mona.noneOf('"')));
    s(mona.string('"'));

    s(mona.maybe(mona.spaces()));

    return mona.value(text);
  });
}

function unquotedTextTerminatingWithSpace() {
  return mona.sequence(function(s) {
    const text = s(mona.text(mona.or(mona.alphanum(), mona.string('_'), mona.string('+'))));
    s(mona.spaces());
    return mona.value(text);
  });
}

// ex:
// key=value
function annotationKeyValue() {
  return mona.sequence(function(s) {
    const key = s(mona.text(mona.alphanum()));
    s(mona.string('='));
    const value = s(mona.or(quotedText(), unquotedTextTerminatingWithSpace()));
    const annotatedKeyObjectSpec = {
      key: key,
      value: value
    };
    return mona.value(annotatedKeyObjectSpec);
  });
}

// ex:
// % name key=value
function annotation() {
  return mona.sequence(function(s) {
    s(mona.maybe(mona.spaces()));
    s(mona.string('%'));
    const annotationName = s(mona.maybe(mona.text(mona.alphanum())));
    s(mona.maybe(mona.string(' ')));

    const values = s(mona.collect(annotationKeyValue()));

    const valueObject = values.reduce(function(previousValue, currentValue) {
      previousValue[currentValue.key] = currentValue.value;
      return previousValue;
    }, {});

    const annotationObject = {
      name: annotationName,
      value: valueObject
    };
    return mona.value(annotationObject);
  });
}

// ex:
// % name1 key1=value1
// % name2 key2=value2
function annotations() {
  return mona.sequence(function(s) {
    const foundAnnotations = s(mona.collect(annotation()));
    const annotationsObject = foundAnnotations.reduce(function(collectedAnnotations, foundAnnotation) {
      if (collectedAnnotations[foundAnnotation.name] === undefined) {
        collectedAnnotations[foundAnnotation.name] = [];
      }
      collectedAnnotations[foundAnnotation.name].push(foundAnnotation.value || {});
      return collectedAnnotations;
    }, {});
    return mona.value(annotationsObject);
  });
}

// ex:
// #comments
// % key=value
// AttributeType attributeName;
function parseAttribute() {
  return mona.sequence(function(s) {
    const comments = s(mona.collect(comment()));
    const rawAnnotations = s(annotations());
    const parsedAnnotations = rawAnnotations || {};

    const nameValuePair = s(parseAttributeNameValuePair());

    return mona.value(foundAttributeFromParsedSequences(comments, parsedAnnotations, nameValuePair));
  });
}

// ex:
// AttributeType attributeName;
function parseAttributeNameValuePair() {
  return mona.sequence(function(s) {
    const attributeTypeReferenceSection = s(parseAttributeTypeReferenceSection());
    const pointerSection = s(mona.trimRight(mona.maybe(mona.string('*'))));
    const attributeNameSection = s(mona.text(mona.or(mona.alphanum(), mona.string('_'))));
    s(mona.maybe(mona.string(';')));
    s(mona.spaces());

    return mona.value({
      attributeTypeReferenceSection: attributeTypeReferenceSection,
      isPointer: pointerSection != null,
      attributeNameSection: attributeNameSection
    });
  });
}

function hashWithoutKeys(hash, keys) {
  const newHash = {};
  for (var hashKey in hash) {
    if (hash.hasOwnProperty(hashKey) && keys[hashKey] === undefined) {
      newHash[hashKey] = hash[hashKey];
    }
  }
  return newHash;
}

function foundAttributeFromParsedSequences(comments, parsedAnnotations, attributeNameValuePair) {
  const attributeTypeReferenceSection = attributeNameValuePair.attributeTypeReferenceSection;
  const isIdType = attributeTypeReferenceSection.typeReference === 'id';
  const isNSObject = attributeNameValuePair.isPointer || isIdType;
  const typeReference = (isNSObject && !isIdType) ? attributeTypeReferenceSection.typeReference + '*' : attributeTypeReferenceSection.typeReference;
  return  {
    comments: comments,
    name: attributeNameValuePair.attributeNameSection,
    annotations: hashWithoutKeys(parsedAnnotations, {'singleAttributeSubtype': true}),
    type: {
      name: attributeTypeReferenceSection.typeName,
      reference: typeReference,
      underlyingType: attributeTypeReferenceSection.underlyingType,
      conformingProtocol: attributeTypeReferenceSection.conformingProtocol
    },
  };
}

// ex: sectionName(name, name)
function namedParenSection(sectionName){
  return mona.sequence(function(s) {
    s(mona.string(sectionName + '('));
    const values = s(mona.split(mona.text(mona.alphanum()),
    mona.or(mona.string(', '), mona.string(','))));
    s(mona.string(')'));
    s(mona.maybe(mona.spaces()));

    return mona.value(values);
  });
}

// ex:
// Name includes(Include) excludes(Exclude)
function parseTypeNameSectionWithIncludes() {
  return mona.sequence(function(s) {
    const typeName = s(mona.trim(mona.text(mona.alphanum())));
    const includes = s(mona.maybe(namedParenSection('includes')));
    const excludes = s(mona.maybe(namedParenSection('excludes')));

    const typeNameSection = {
      typeName: typeName,
      includes: includes,
      excludes: excludes
    };
    return mona.value(typeNameSection);
  });
}

// ex:
// Name
function parseTypeNameSectionWithoutIncludes() {
  return mona.sequence(function(s) {
    s(mona.maybe(mona.spaces()));
    const typeName = s(mona.text(mona.alphanum()));

    const typeNameSection = {
      typeName: typeName,
    };
    return mona.value(typeNameSection);
  });
}

// ex:
// # my comment
function comment() {
  return mona.sequence(function(s) {
    s(mona.maybe(mona.spaces()));
    const comment = s(mona.between(mona.string('#'), mona.string('\n'), mona.text(mona.noneOf('\n'))));
    return mona.value(comment);
  });
}

// Attribute group that allows optional excludes, ex:
// Name includes(Include) excludes(Exclude) {
//    Value val;
// }
function parseNamedAttributeGroupWithIncludes() {
  return parseNamedAttributeGroup(true);
}

// Attribute group that does not allow includes/excludes ex:
// Name {
//    Value val;
// }
function parseNamedAttributeGroupWithoutIncludes() {
  return parseNamedAttributeGroup(false);
}

// Attribute group ex:
// {
//    Value val;
// }
function parseAttributeGroup() {
  return mona.sequence(function(s) {
    s(mona.maybe(mona.spaces()));
    const open = s(mona.string('{'));
    const attributes = s(mona.collect(parseAttribute()));
    const close = s(mona.string('}'));
    return mona.value(attributes);
  });
}

// nothing.
function parseEmptyAttributeGroup() {
  return mona.sequence(function(s) {
    s(mona.or(mona.string(','), mona.space()));
    return mona.value([]);
  });
}

// ex:
// Name {
//    Value val;
// }
function parseNamedAttributeGroup(withIncludes) {
  return mona.trim(
    mona.sequence(function(s) {
      const comments = s(mona.collect(comment()));

      const rawAnnotations = s(annotations());
      const parsedAnnotations = rawAnnotations || {};

      const typeNameSection = withIncludes ? s(parseTypeNameSectionWithIncludes()) : s(parseTypeNameSectionWithoutIncludes());
      const attributes = s(mona.or(parseAttributeGroup(), parseEmptyAttributeGroup()));

      return mona.value(namedAttributeGroupFoundType(comments, parsedAnnotations, typeNameSection, attributes, withIncludes));
    })
  );
}

function namedAttributeGroupFoundType(comments, parsedAnnotations, typeNameSection, attributes, withIncludes) {

  var foundType;
  if (withIncludes) {
    const includes = typeNameSection.includes === undefined ? [] : typeNameSection.includes;
    const excludes = typeNameSection.excludes === undefined ? [] : typeNameSection.excludes;

    foundType = {
      annotations: parsedAnnotations,
      attributes: attributes || [],
      comments: comments,
      typeName: typeNameSection.typeName,
      includes: includes,
      excludes: excludes
    };
  } else {
    foundType = {
      annotations: parsedAnnotations,
      attributes: attributes || [],
      comments: comments,
      typeName: typeNameSection.typeName
    };
  }

  return foundType;
}

function parseAttributeTypeReferenceSectionWithOptionalPointer() {
  return mona.sequence(function(s) {
    const attributeTypeReferenceSection = s(parseAttributeTypeReferenceSection());
    const pointerSection = s(mona.trimRight(mona.maybe(mona.string('*'))));

    return mona.value({
      hasPointer: pointerSection !== undefined,
      attributeTypeReferenceSection: attributeTypeReferenceSection
    });
  });
}

function findSingleAttributeAnnotation(parsedAnnotations) {
  const singleAttributeAnnotations = parsedAnnotations['singleAttributeSubtype'];
  if (singleAttributeAnnotations != null && singleAttributeAnnotations.length > 0) {
    for (var i = singleAttributeAnnotations.length - 1; i >= 0; i--) {
      const singleAttributeAnnotation = singleAttributeAnnotations[i];
      if (singleAttributeAnnotation['attributeType'] != null) {
        return singleAttributeAnnotation;
      }
    }
    return null;
  } else {
    return null;
  }
}

function parseNamedAttributeGroupOrSingleAttribute() {
  return mona.trim(
    mona.sequence(function(s) {

      const comments = s(mona.collect(comment()));
      const rawAnnotations = s(annotations());
      const parsedAnnotations = rawAnnotations || {};

      const singleAttributeAnnotation = findSingleAttributeAnnotation(parsedAnnotations);
      if (singleAttributeAnnotation != null) {
        const nameSection = s(parseTypeNameSectionWithoutIncludes());

        const parsedAttributeTypeReferenceSectionWithOptionalPointer = mona.parse(parseAttributeTypeReferenceSectionWithOptionalPointer(), singleAttributeAnnotation['attributeType']);

        const attributeNameValuePair = {
          attributeTypeReferenceSection: parsedAttributeTypeReferenceSectionWithOptionalPointer.attributeTypeReferenceSection,
          isPointer: parsedAttributeTypeReferenceSectionWithOptionalPointer.hasPointer,
          attributeNameSection: nameSection.typeName
        };

        return mona.value({ attributeValue: foundAttributeFromParsedSequences(comments, parsedAnnotations, attributeNameValuePair) });
      } else {
        const typeNameSection = s(parseTypeNameSectionWithoutIncludes());
        const attributes = s(mona.or(parseAttributeGroup(), parseEmptyAttributeGroup()));

        return mona.value({ namedCollectionValue: namedAttributeGroupFoundType(comments, parsedAnnotations, typeNameSection, attributes, false) });
      }
    })
  );
}

module.exports = {
  annotations: annotations,
  comment: comment,
  parseAttribute: parseAttribute,
  parseTypeNameSectionWithIncludes: parseTypeNameSectionWithIncludes,
  parseTypeNameSectionWithoutIncludes: parseTypeNameSectionWithoutIncludes,
  parseNamedAttributeGroupWithIncludes: parseNamedAttributeGroupWithIncludes,
  parseNamedAttributeGroupWithoutIncludes: parseNamedAttributeGroupWithoutIncludes,
  parseNamedAttributeGroupOrSingleAttribute: parseNamedAttributeGroupOrSingleAttribute
};
