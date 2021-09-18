# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Algebraic Types With Ad Hoc Subtype Matching Methods

  @announce
  Scenario: Generating an algebraic type with case matching with the type first
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      SimpleADT {
        FirstSubtype {
          NSString *firstValue
          NSUInteger secondValue
        }
        SomeRandomSubtype
        %singleAttributeSubtype attributeType=NSUInteger
        someAttributeSubtype
        SecondSubtype {
          BOOL something
        }
      }
      """
    And a file named "project/.algebraicTypeConfig" with:
      """
      {
        "defaultIncludes": ["CaseMatching"],
        "defaultExcludes": [
            "RMCopying",
            "RMDescription",
            "RMEquality",
            "VoidMatching"
        ]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/SimpleADT.h" should contain:
      """
      #import <Foundation/Foundation.h>

      @interface SimpleADT : NSObject

      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue NS_SWIFT_NAME(firstSubtype(firstValue:secondValue:));

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something NS_SWIFT_NAME(secondSubtype(something:));

      + (instancetype)someAttributeSubtype:(NSUInteger)someAttributeSubtype;

      + (instancetype)someRandomSubtype;

      - (instancetype)init NS_UNAVAILABLE;

      /**
       * Returns YES if the receiver's subtype is 'FirstSubtype', otherwise NO.
       *
       * If this method returns NO, the out parameters are not modified.
       * All out parameters are optional. Pass NULL to ignore their values.
       */
      - (BOOL)isFirstSubtypeWithFirstValue:(NSString* *)firstValue secondValue:(NSUInteger *)secondValue;

      /**
       * Returns YES if the receiver's subtype is 'SecondSubtype', otherwise NO.
       *
       * If this method returns NO, the out parameters are not modified.
       * All out parameters are optional. Pass NULL to ignore their values.
       */
      - (BOOL)isSecondSubtypeWithSomething:(BOOL *)something;

      /**
       * Returns YES if the receiver's subtype is 'SomeAttributeSubtype', otherwise NO.
       *
       * If this method returns NO, the out parameters are not modified.
       * All out parameters are optional. Pass NULL to ignore their values.
       */
      - (BOOL)isSomeAttributeSubtype:(NSUInteger *)someAttributeSubtype;

      /**
       * Returns YES if the receiver's subtype is 'SomeRandomSubtype', otherwise NO.
       */
      - (BOOL)isSomeRandomSubtype;

      @end

      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "SimpleADT.h"

      typedef NS_ENUM(NSUInteger, SimpleADTSubtypes) {
        SimpleADTSubtypesFirstSubtype,
        SimpleADTSubtypesSomeRandomSubtype,
        SimpleADTSubtypesSomeAttributeSubtype,
        SimpleADTSubtypesSecondSubtype
      };

      @implementation SimpleADT
      {
        SimpleADTSubtypes _subtype;
        NSString *_firstSubtype_firstValue;
        NSUInteger _firstSubtype_secondValue;
        NSUInteger _someAttributeSubtype;
        BOOL _secondSubtype_something;
      }

      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue
      {
        SimpleADT *object = [(Class)self new];
        object->_subtype = SimpleADTSubtypesFirstSubtype;
        object->_firstSubtype_firstValue = firstValue;
        object->_firstSubtype_secondValue = secondValue;
        return object;
      }

      + (instancetype)secondSubtypeWithSomething:(BOOL)something
      {
        SimpleADT *object = [(Class)self new];
        object->_subtype = SimpleADTSubtypesSecondSubtype;
        object->_secondSubtype_something = something;
        return object;
      }

      + (instancetype)someAttributeSubtype:(NSUInteger)someAttributeSubtype
      {
        SimpleADT *object = [(Class)self new];
        object->_subtype = SimpleADTSubtypesSomeAttributeSubtype;
        object->_someAttributeSubtype = someAttributeSubtype;
        return object;
      }

      + (instancetype)someRandomSubtype
      {
        SimpleADT *object = [(Class)self new];
        object->_subtype = SimpleADTSubtypesSomeRandomSubtype;
        return object;
      }

      - (BOOL)isFirstSubtypeWithFirstValue:(NSString* *)firstValue secondValue:(NSUInteger *)secondValue
      {
        if (_subtype == SimpleADTSubtypesFirstSubtype) {
          if (firstValue) {
            *firstValue = _firstSubtype_firstValue;
          }
          if (secondValue) {
            *secondValue = _firstSubtype_secondValue;
          }
          return YES;
        }
        return NO;
      }

      - (BOOL)isSecondSubtypeWithSomething:(BOOL *)something
      {
        if (_subtype == SimpleADTSubtypesSecondSubtype) {
          if (something) {
            *something = _secondSubtype_something;
          }
          return YES;
        }
        return NO;
      }

      - (BOOL)isSomeAttributeSubtype:(NSUInteger *)someAttributeSubtype
      {
        if (_subtype == SimpleADTSubtypesSomeAttributeSubtype) {
          if (someAttributeSubtype) {
            *someAttributeSubtype = _someAttributeSubtype;
          }
          return YES;
        }
        return NO;
      }

      - (BOOL)isSomeRandomSubtype
      {
        return _subtype == SimpleADTSubtypesSomeRandomSubtype;
      }

      @end

      """
