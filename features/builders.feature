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
        RMPageBuilder *builder = [[RMPageBuilder alloc] init];
        builder->_doesUserLike = existingPage.doesUserLike;
        builder->_identifier = [existingPage.identifier copy];
        builder->_likeCount = existingPage.likeCount;
        builder->_rating = [existingPage.rating copy];
        builder->_someEnumValue = existingPage.someEnumValue;
        builder->_customLibObject = [existingPage.customLibObject copy];
        builder->_someObject = existingPage.someObject;
        return builder;
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
        RMPageBuilder *builder = [[RMPageBuilder alloc] init];
        builder->_rating = [existingPage.rating copy];
        builder->_someEnumValue = existingPage.someEnumValue;
        builder->_customLibObject = [existingPage.customLibObject copy];
        return builder;
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

  @announce
  Scenario: Generating a Builder with Required Attributes
    Given a file named "project/values/RMContact.value" with:
      """
      RMContact includes(RMBuilder) {
        %nonnull NSString *firstName
        %nullable NSString *middleName
        %nonnull NSString *lastName
        NSInteger age
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMContactBuilder.h" should contain:
      """
      #import <Foundation/Foundation.h>

      @class RMContact;

      @interface RMContactBuilder : NSObject

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)contactFromExistingContact:(RMContact *)existingContact;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithFirstName:(nonnull NSString *)firstName lastName:(nonnull NSString *)lastName;

      - (RMContact *)build;

      - (instancetype)withFirstName:(nonnull NSString *)firstName;

      - (instancetype)withMiddleName:(nullable NSString *)middleName;

      - (instancetype)withLastName:(nonnull NSString *)lastName;

      - (instancetype)withAge:(NSInteger)age;

      @end

      """
   And the file "project/values/RMContactBuilder.m" should contain:
      """
      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMContact.h"
      #import "RMContactBuilder.h"

      @implementation RMContactBuilder
      {
        NSString *_firstName;
        NSString *_middleName;
        NSString *_lastName;
        NSInteger _age;
      }

      + (instancetype)contactFromExistingContact:(RMContact *)existingContact
      {
        RMContactBuilder *builder = [[RMContactBuilder alloc] initWithFirstName:existingContact.firstName lastName:existingContact.lastName];
        builder->_middleName = [existingContact.middleName copy];
        builder->_age = existingContact.age;
        return builder;
      }

      - (instancetype)initWithFirstName:(nonnull NSString *)firstName lastName:(nonnull NSString *)lastName
      {
        if ((self = [super init]) != nil) {
          _firstName = [firstName copy];
          _lastName = [lastName copy];
        }
        return self;
      }

      - (RMContact *)build
      {
        return [[RMContact alloc] initWithFirstName:_firstName middleName:_middleName lastName:_lastName age:_age];
      }

      - (instancetype)withFirstName:(nonnull NSString *)firstName
      {
        _firstName = [firstName copy];
        return self;
      }

      - (instancetype)withMiddleName:(nullable NSString *)middleName
      {
        _middleName = [middleName copy];
        return self;
      }

      - (instancetype)withLastName:(nonnull NSString *)lastName
      {
        _lastName = [lastName copy];
        return self;
      }

      - (instancetype)withAge:(NSInteger)age
      {
        _age = age;
        return self;
      }

      @end
      """

  @announce
  Scenario: Generating a Builder with Required Attributes via Assume Nonnull
    Given a file named "project/values/RMContact.value" with:
      """
      RMContact includes(RMAssumeNonnull, RMBuilder) {
        NSString *firstName
        %nullable NSString *middleName
        NSString *lastName
        NSInteger age
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMContactBuilder.h" should contain:
      """
      #import <Foundation/Foundation.h>

      @class RMContact;

      NS_ASSUME_NONNULL_BEGIN

      @interface RMContactBuilder : NSObject

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)contactFromExistingContact:(RMContact *)existingContact;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithFirstName:(NSString *)firstName lastName:(NSString *)lastName;

      - (RMContact *)build;

      - (instancetype)withFirstName:(NSString *)firstName;

      - (instancetype)withMiddleName:(nullable NSString *)middleName;

      - (instancetype)withLastName:(NSString *)lastName;

      - (instancetype)withAge:(NSInteger)age;

      @end

      NS_ASSUME_NONNULL_END

      """
   And the file "project/values/RMContactBuilder.m" should contain:
      """
      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMContact.h"
      #import "RMContactBuilder.h"

      NS_ASSUME_NONNULL_BEGIN

      @implementation RMContactBuilder
      {
        NSString *_firstName;
        NSString *_middleName;
        NSString *_lastName;
        NSInteger _age;
      }

      + (instancetype)contactFromExistingContact:(RMContact *)existingContact
      {
        RMContactBuilder *builder = [[RMContactBuilder alloc] initWithFirstName:existingContact.firstName lastName:existingContact.lastName];
        builder->_middleName = [existingContact.middleName copy];
        builder->_age = existingContact.age;
        return builder;
      }

      - (instancetype)initWithFirstName:(NSString *)firstName lastName:(NSString *)lastName
      {
        if ((self = [super init]) != nil) {
          _firstName = [firstName copy];
          _lastName = [lastName copy];
        }
        return self;
      }

      - (RMContact *)build
      {
        return [[RMContact alloc] initWithFirstName:_firstName middleName:_middleName lastName:_lastName age:_age];
      }

      - (instancetype)withFirstName:(NSString *)firstName
      {
        _firstName = [firstName copy];
        return self;
      }

      - (instancetype)withMiddleName:(nullable NSString *)middleName
      {
        _middleName = [middleName copy];
        return self;
      }

      - (instancetype)withLastName:(NSString *)lastName
      {
        _lastName = [lastName copy];
        return self;
      }

      - (instancetype)withAge:(NSInteger)age
      {
        _age = age;
        return self;
      }

      @end

      NS_ASSUME_NONNULL_END

      """
