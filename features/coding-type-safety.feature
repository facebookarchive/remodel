# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Coding Type Safety

  @announce
  Scenario: Generating NSCoding type-safety function
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage includes(RMCodingTypeSafety) {
        BOOL doesUserLike
        NSString* identifier
        id object
        dispatch_block_t thisWouldntCompile
        NSInteger likeCount
        NSUInteger numberOfRatings
        MyCustomType(NSUInteger) customType
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
      #import "MyCustomType.h"

      @interface RMPage : NSObject <NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;
      @property (nonatomic, readonly, copy) id object;
      @property (nonatomic, readonly, copy) dispatch_block_t thisWouldntCompile;
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) NSUInteger numberOfRatings;
      @property (nonatomic, readonly) MyCustomType customType;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier object:(id)object thisWouldntCompile:(dispatch_block_t)thisWouldntCompile likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings customType:(MyCustomType)customType NS_DESIGNATED_INITIALIZER;

      @end

      """
    And the file "project/values/RMPage.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMPage.value
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMPage.h"

      @implementation RMPage

      /**
       * This unused function ensures that all object fields conform to NSCoding.
       * The encoding methods do not check for protocol conformance.
       */
      __attribute__((unused))
      static void RMCodingValidatorFunction() {
        id<NSCoding> identifier_must_conform_to_NSCoding __unused = (NSString*)nil;
        id<NSCoding> object_must_conform_to_NSCoding __unused = (id)nil;
        id<NSCoding> thisWouldntCompile_must_conform_to_NSCoding __unused = (dispatch_block_t)nil;
      }

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier object:(id)object thisWouldntCompile:(dispatch_block_t)thisWouldntCompile likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings customType:(MyCustomType)customType
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _object = [object copy];
          _thisWouldntCompile = [thisWouldntCompile copy];
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
          _customType = customType;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t object: %@; \n\t thisWouldntCompile: %@; \n\t likeCount: %lld; \n\t numberOfRatings: %llu; \n\t customType: %llu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, _object, _thisWouldntCompile, (long long)_likeCount, (unsigned long long)_numberOfRatings, (unsigned long long)_customType];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash], [_object hash], [_thisWouldntCompile hash], ABS(_likeCount), _numberOfRatings, _customType};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 7; ++ii) {
          unsigned long long base = (((unsigned long long)result) << 32 | subhashes[ii]);
          base = (~base) + (base << 18);
          base ^= (base >> 31);
          base *=  21;
          base ^= (base >> 11);
          base += (base << 6);
          base ^= (base >> 22);
          result = base;
        }
        return result;
      }

      - (BOOL)isEqual:(RMPage *)object
      {
        if (self == object) {
          return YES;
        } else if (object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _doesUserLike == object->_doesUserLike &&
          _likeCount == object->_likeCount &&
          _numberOfRatings == object->_numberOfRatings &&
          _customType == object->_customType &&
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]) &&
          (_object == object->_object ? YES : [_object isEqual:object->_object]) &&
          (_thisWouldntCompile == object->_thisWouldntCompile ? YES : [_thisWouldntCompile isEqual:object->_thisWouldntCompile]);
      }

      @end

      """
