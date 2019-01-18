# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Algebraic Types With Templated Matching

  @announce
  Scenario: Generating an algebraic type with templated matching with the type first
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
        "defaultIncludes": ["TemplatedMatching"],
        "defaultExcludes": ["VoidMatching"]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/SimpleADTTemplatedMatchingHelpers.h" should contain:
      """
      #import <Foundation/Foundation.h>
      #import "SimpleADT.h"
      #import <memory>

      #ifdef __cplusplus
      template <typename T>
      struct SimpleADTMatcher {

        static T match(SimpleADT *simpleADT, T(^firstSubtypeMatchHandler)(NSString *firstValue, NSUInteger secondValue), T(^someRandomSubtypeMatchHandler)(), T(^someAttributeSubtypeMatchHandler)(NSUInteger someAttributeSubtype), T(^secondSubtypeMatchHandler)(BOOL something)) {
          NSCAssert(simpleADT != nil, @"The ADT object simpleADT is nil");
          __block std::unique_ptr<T> result;

          SimpleADTFirstSubtypeMatchHandler matchFirstSubtype = ^(NSString *firstValue, NSUInteger secondValue) {
            result = std::make_unique<T>(firstSubtypeMatchHandler(firstValue, secondValue));
          };

          SimpleADTSomeRandomSubtypeMatchHandler matchSomeRandomSubtype = ^(void) {
            result = std::make_unique<T>(someRandomSubtypeMatchHandler());
          };

          SimpleADTSomeAttributeSubtypeMatchHandler matchSomeAttributeSubtype = ^(NSUInteger someAttributeSubtype) {
            result = std::make_unique<T>(someAttributeSubtypeMatchHandler(someAttributeSubtype));
          };

          SimpleADTSecondSubtypeMatchHandler matchSecondSubtype = ^(BOOL something) {
            result = std::make_unique<T>(secondSubtypeMatchHandler(something));
          };

          [simpleADT matchFirstSubtype:matchFirstSubtype someRandomSubtype:matchSomeRandomSubtype someAttributeSubtype:matchSomeAttributeSubtype secondSubtype:matchSecondSubtype];
          return *result;
        }
        static T match(T(^firstSubtypeMatchHandler)(NSString *firstValue, NSUInteger secondValue), T(^someRandomSubtypeMatchHandler)(), T(^someAttributeSubtypeMatchHandler)(NSUInteger someAttributeSubtype), T(^secondSubtypeMatchHandler)(BOOL something), SimpleADT *simpleADT) {
          return match(simpleADT, firstSubtypeMatchHandler, someRandomSubtypeMatchHandler, someAttributeSubtypeMatchHandler, secondSubtypeMatchHandler);
        }
      };
      #endif // __cplusplus

      """
   And the file "project/values/SimpleADTTemplatedMatchingHelpers.mm" should contain:
      """
      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "SimpleADTTemplatedMatchingHelpers.h"

      """
