# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Value Objects with Ivars and Getters

  @announce
  Scenario: Generating value object with ivars and getters
    Given a file named "project/values/RMIvarObject.value" with:
      """
      # Important and gripping comment
      # that takes up two lines.
      %library name=MyLib
      %type name=RMSomeObject library=SomeLib file=AnotherFile
      %type name=RMFooObject
      %type name=RMSomeEnum canForwardDeclare=false
      %type name=RMSomeType library=FooLibrary
      # And an extra comment here for good measure.
      RMIvarObject {
        BOOL doesUserLike
        NSString* identifier
        NSInteger likeCount
        uint32_t numberOfRatings
        RMSomeType *someType
        Class someClass
        dispatch_block_t someBlock
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      {
          "defaultExcludes": [
              "RMAssertNullability",
              "RMCoding",
              "RMCopying",
              "RMDescription",
              "RMEquality",
              "RMImmutableProperties"
          ],
          "defaultIncludes": [
              "RMImmutableIvars"
          ]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMIvarObject.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMIvarObject.value
       */

      #import <Foundation/Foundation.h>
      #import <SomeLib/AnotherFile.h>
      #import <MyLib/RMFooObject.h>
      #import <MyLib/RMSomeEnum.h>
      #import <FooLibrary/RMSomeType.h>

      /**
       * Important and gripping comment
       * that takes up two lines.
       * And an extra comment here for good measure.
       */
      @interface RMIvarObject : NSObject

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(uint32_t)numberOfRatings someType:(RMSomeType *)someType someClass:(Class)someClass someBlock:(dispatch_block_t)someBlock NS_DESIGNATED_INITIALIZER;

      - (BOOL)doesUserLike;

      - (NSString*)identifier;

      - (NSInteger)likeCount;

      - (uint32_t)numberOfRatings;

      - (dispatch_block_t)someBlock;

      - (Class)someClass;

      - (RMSomeType*)someType;

      @end

      """
   And the file "project/values/RMIvarObject.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMIvarObject.value
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMIvarObject.h"

      @implementation RMIvarObject
      {
        BOOL _doesUserLike;
        NSString *_identifier;
        NSInteger _likeCount;
        uint32_t _numberOfRatings;
        RMSomeType *_someType;
        Class _someClass;
        dispatch_block_t _someBlock;
      }

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(uint32_t)numberOfRatings someType:(RMSomeType *)someType someClass:(Class)someClass someBlock:(dispatch_block_t)someBlock
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
          _someType = [someType copy];
          _someClass = someClass;
          _someBlock = [someBlock copy];
        }

        return self;
      }

      - (BOOL)doesUserLike
      {
        return _doesUserLike;
      }

      - (NSString*)identifier
      {
        return _identifier;
      }

      - (NSInteger)likeCount
      {
        return _likeCount;
      }

      - (uint32_t)numberOfRatings
      {
        return _numberOfRatings;
      }

      - (dispatch_block_t)someBlock
      {
        return _someBlock;
      }

      - (Class)someClass
      {
        return _someClass;
      }

      - (RMSomeType*)someType
      {
        return _someType;
      }

      @end

      """
