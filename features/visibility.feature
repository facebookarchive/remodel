# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Objects With Visibility Annotations

  @announce
  Scenario: Generating Value Objects with Visibility
    Given a file named "project/values/RMPage.value" with:
      """
      %visibility value=default
      RMPage {
        NSString *name
        NSString *identifier
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPage.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMPage.value
       */

      #import <Foundation/Foundation.h>

      __attribute__((visibility("default")))
      @interface RMPage : NSObject <NSCopying>

      @property (nonatomic, readonly, copy) NSString *name;
      @property (nonatomic, readonly, copy) NSString *identifier;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithName:(NSString *)name identifier:(NSString *)identifier NS_DESIGNATED_INITIALIZER;

      @end

      """

  @announce
  Scenario: Generating an algebraic type with visibility
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      %visibility value=hidden
      SimpleADT {
        FirstSubtype {
          NSString *firstValue
          NSUInteger secondValue
        }
        SomeRandomSubtype
        %singleAttributeSubtype attributeType="NSNumber*"
        someAttributeSubtype
        SecondSubtype {
          BOOL something
        }
      }
      """
    And a file named "project/.algebraicTypeConfig" with:
      """
      {
        "defaultExcludes": [
          "RMCoding"
         ]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/SimpleADT.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is SimpleADT.adtValue
       */

      #import <Foundation/Foundation.h>

      typedef void (^SimpleADTFirstSubtypeMatchHandler)(NSString *firstValue, NSUInteger secondValue);
      typedef void (^SimpleADTSomeRandomSubtypeMatchHandler)(void);
      typedef void (^SimpleADTSomeAttributeSubtypeMatchHandler)(NSNumber *someAttributeSubtype);
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      __attribute__((visibility("hidden")))
      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue;

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      + (instancetype)someAttributeSubtype:(NSNumber *)someAttributeSubtype;

      + (instancetype)someRandomSubtype;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchFirstSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler someAttributeSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTSomeAttributeSubtypeMatchHandler)someAttributeSubtypeMatchHandler secondSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler NS_SWIFT_NAME(match(firstSubtype:someRandomSubtype:someAttributeSubtype:secondSubtype:));

      @end

      """
