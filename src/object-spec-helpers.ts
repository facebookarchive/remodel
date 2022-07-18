/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as CLangCommon from './clang-common';
import * as ObjC from './objc';
import * as ObjectSpec from './object-spec';
import * as ObjectGeneration from './object-generation';

/// Used to build an Attribute object more easily and make writing tests
/// simpler as you no longer need to specify every field in every test case.
export class AttributeBuilder implements ObjectSpec.Attribute {
  annotations: ObjectGeneration.AnnotationMap;
  comments: string[];
  name: string;
  nullability: CLangCommon.Nullability;
  type: AttributeTypeBuilder;

  constructor(name: string, type: AttributeTypeBuilder) {
    this.name = name;
    this.type = type;
    this.annotations = {};
    this.comments = [];
    this.nullability = CLangCommon.Nullability.Inherited();
  }

  withAnnotations(
    annotations: ObjectGeneration.AnnotationMap,
  ): AttributeBuilder {
    this.annotations = annotations;
    return this;
  }

  withComments(comments: string[]): AttributeBuilder {
    this.comments = comments;
    return this;
  }

  withNullability(nullability: CLangCommon.Nullability): AttributeBuilder {
    this.nullability = nullability;
    return this;
  }

  /// Used to return a pure object version of the interface. It's not required
  /// to use this, but for tests it can make a difference as Jasmine checks class
  /// names for equivalence.
  asObject(): ObjectSpec.Attribute {
    return {
      annotations: this.annotations,
      comments: this.comments,
      name: this.name,
      nullability: this.nullability,
      type: this.type.asObject(),
    };
  }
}

/// Used to build an AttributeType object more easily and make writing tests
/// simpler as you no longer need to specify every field in every test case.
export class AttributeTypeBuilder implements ObjectSpec.AttributeType {
  fileTypeIsDefinedIn: string | null;
  libraryTypeIsDefinedIn: string | null;
  name: string;
  reference: string;
  underlyingType: string | null;
  conformingProtocols: string[];
  referencedGenericTypes: ObjC.ReferencedGenericType[];

  constructor(name: string, reference: string, underlyingType: string | null) {
    this.fileTypeIsDefinedIn = null;
    this.libraryTypeIsDefinedIn = null;
    this.name = name;
    this.reference = reference;
    this.underlyingType = underlyingType;
    this.conformingProtocols = [];
    this.referencedGenericTypes = [];
  }

  withFileTypeIsDefinedIn(file: string | null): AttributeTypeBuilder {
    this.fileTypeIsDefinedIn = file;
    return this;
  }

  withLibraryTypeIsDefinedIn(library: string | null): AttributeTypeBuilder {
    this.libraryTypeIsDefinedIn = library;
    return this;
  }

  withConformingProtocols(protocols: string[]): AttributeTypeBuilder {
    this.conformingProtocols = protocols;
    return this;
  }

  withReferencedGenericTypes(
    types: ObjC.ReferencedGenericType[],
  ): AttributeTypeBuilder {
    this.referencedGenericTypes = types;
    return this;
  }

  /// Used to return a pure object version of the interface. It's not required
  /// to use this, but for tests it can make a difference as Jasmine checks class
  /// names for equivalence.
  asObject(): ObjectSpec.AttributeType {
    return {
      fileTypeIsDefinedIn: this.fileTypeIsDefinedIn,
      libraryTypeIsDefinedIn: this.libraryTypeIsDefinedIn,
      name: this.name,
      reference: this.reference,
      underlyingType: this.underlyingType,
      conformingProtocols: this.conformingProtocols,
      referencedGenericTypes: this.referencedGenericTypes,
    };
  }
}
