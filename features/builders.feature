# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Value Objects

  @announce
  Scenario: Generating a Builder
    Given a file named "project/values/RMPage.value" with:
      """
      %library name=MyLib
      %type name=RMSomeObject library=SomeLib file=AnotherFile
      %type name=RMFooObject
      %type name=RMSomeEnum canForwardDeclare=false
      RMPage includes(RMBuilder) {
        BOOL doesUserLike
        NSString* identifier
        NSInteger likeCount
        RMRating* rating
        RMEnum(NSUInteger) someEnumValue
        %import library=RMCustomLibrary
        RMLibType* customLibObject
        %import library=RMCustomProtocol
        id<RMCustomProtocol> someObject
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPageBuilder.h" should contain:
      """
      #import <Foundation/Foundation.h>
      #import <MyLib/RMSomeEnum.h>
      #import <MyLib/RMEnum.h>

      @class RMPage;
      @class RMRating;
      @class RMLibType;
      @protocol RMCustomProtocol;

      @interface RMPageBuilder : NSObject

      + (instancetype)page;

      + (instancetype)pageFromExistingPage:(RMPage *)existingPage;

      - (RMPage *)build;

      - (instancetype)withDoesUserLike:(BOOL)doesUserLike;

      - (instancetype)withIdentifier:(NSString *)identifier;

      - (instancetype)withLikeCount:(NSInteger)likeCount;

      - (instancetype)withRating:(RMRating *)rating;

      - (instancetype)withSomeEnumValue:(RMEnum)someEnumValue;

      - (instancetype)withCustomLibObject:(RMLibType *)customLibObject;

      - (instancetype)withSomeObject:(id<RMCustomProtocol>)someObject;

      @end

      """
   And the file "project/values/RMPageBuilder.m" should contain:
      """
      #import <MyLib/RMPage.h>
      #import "RMPageBuilder.h"
      #import <MyLib/RMRating.h>
      #import <RMCustomLibrary/RMLibType.h>

      @implementation RMPageBuilder
      {
        BOOL _doesUserLike;
        NSString *_identifier;
        NSInteger _likeCount;
        RMRating *_rating;
        RMEnum _someEnumValue;
        RMLibType *_customLibObject;
        id<RMCustomProtocol> _someObject;
      }

      + (instancetype)page
      {
        return [RMPageBuilder new];
      }

      + (instancetype)pageFromExistingPage:(RMPage *)existingPage
      {
        return [[[[[[[[RMPageBuilder page]
                      withDoesUserLike:existingPage.doesUserLike]
                     withIdentifier:existingPage.identifier]
                    withLikeCount:existingPage.likeCount]
                   withRating:existingPage.rating]
                  withSomeEnumValue:existingPage.someEnumValue]
                 withCustomLibObject:existingPage.customLibObject]
                withSomeObject:existingPage.someObject];
      }

      - (RMPage *)build
      {
        return [[RMPage alloc] initWithDoesUserLike:_doesUserLike identifier:_identifier likeCount:_likeCount rating:_rating someEnumValue:_someEnumValue customLibObject:_customLibObject someObject:_someObject];
      }

      - (instancetype)withDoesUserLike:(BOOL)doesUserLike
      {
        _doesUserLike = doesUserLike;
        return self;
      }

      - (instancetype)withIdentifier:(NSString *)identifier
      {
        _identifier = [identifier copy];
        return self;
      }

      - (instancetype)withLikeCount:(NSInteger)likeCount
      {
        _likeCount = likeCount;
        return self;
      }

      - (instancetype)withRating:(RMRating *)rating
      {
        _rating = [rating copy];
        return self;
      }

      - (instancetype)withSomeEnumValue:(RMEnum)someEnumValue
      {
        _someEnumValue = someEnumValue;
        return self;
      }

      - (instancetype)withCustomLibObject:(RMLibType *)customLibObject
      {
        _customLibObject = [customLibObject copy];
        return self;
      }

			- (instancetype)withSomeObject:(id<RMCustomProtocol>)someObject
			{
        _someObject = someObject;
        return self;
			}

      @end
      """

  @announce
  Scenario: Generating a Builder while using UseForwardDeclarations
    Given a file named "project/values/RMPage.value" with:
      """
      %library name=MyLib
      %type name=RMSomeObject library=SomeLib file=AnotherFile
      %type name=RMFooObject
      %type name=RMSomeEnum canForwardDeclare=false
      RMPage includes(RMBuilder, UseForwardDeclarations) {
        RMFooObject* rating
        RMSomeEnum(NSUInteger) someEnumValue
        RMSomeObject* customLibObject
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPageBuilder.h" should contain:
      """
      #import <Foundation/Foundation.h>
      #import <MyLib/RMSomeEnum.h>

      @class RMPage;
      @class RMFooObject;
      @class RMSomeObject;

      @interface RMPageBuilder : NSObject

      + (instancetype)page;

      + (instancetype)pageFromExistingPage:(RMPage *)existingPage;

      - (RMPage *)build;

      - (instancetype)withRating:(RMFooObject *)rating;

      - (instancetype)withSomeEnumValue:(RMSomeEnum)someEnumValue;

      - (instancetype)withCustomLibObject:(RMSomeObject *)customLibObject;

      @end

      """
   And the file "project/values/RMPageBuilder.m" should contain:
      """
      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import <MyLib/RMPage.h>
      #import "RMPageBuilder.h"
      #import <SomeLib/AnotherFile.h>
      #import <MyLib/RMFooObject.h>

      @implementation RMPageBuilder
      {
        RMFooObject *_rating;
        RMSomeEnum _someEnumValue;
        RMSomeObject *_customLibObject;
      }

      + (instancetype)page
      {
        return [RMPageBuilder new];
      }

      + (instancetype)pageFromExistingPage:(RMPage *)existingPage
      {
        return [[[[RMPageBuilder page]
                  withRating:existingPage.rating]
                 withSomeEnumValue:existingPage.someEnumValue]
                withCustomLibObject:existingPage.customLibObject];
      }

      - (RMPage *)build
      {
        return [[RMPage alloc] initWithRating:_rating someEnumValue:_someEnumValue customLibObject:_customLibObject];
      }

      - (instancetype)withRating:(RMFooObject *)rating
      {
        _rating = [rating copy];
        return self;
      }

      - (instancetype)withSomeEnumValue:(RMSomeEnum)someEnumValue
      {
        _someEnumValue = someEnumValue;
        return self;
      }

      - (instancetype)withCustomLibObject:(RMSomeObject *)customLibObject
      {
        _customLibObject = [customLibObject copy];
        return self;
      }

      @end

      """
