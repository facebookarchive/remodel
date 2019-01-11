# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Value Objects With Coded Values

  @announce
  Scenario: Generating correct NSCoding headers & implementation with 4 different types
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage includes(RMCoding) {
        BOOL doesUserLike
        NSString* identifier
        NSInteger likeCount
        NSUInteger numberOfRatings
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

      @interface RMPage : NSObject <NSCopying, NSCoding>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) NSUInteger numberOfRatings;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings NS_DESIGNATED_INITIALIZER;

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

      static __unsafe_unretained NSString * const kDoesUserLikeKey = @"DOES_USER_LIKE";
      static __unsafe_unretained NSString * const kIdentifierKey = @"IDENTIFIER";
      static __unsafe_unretained NSString * const kLikeCountKey = @"LIKE_COUNT";
      static __unsafe_unretained NSString * const kNumberOfRatingsKey = @"NUMBER_OF_RATINGS";

      @implementation RMPage

      - (nullable instancetype)initWithCoder:(NSCoder *)aDecoder
      {
        if ((self = [super init])) {
          _doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];
          _identifier = (id)[aDecoder decodeObjectForKey:kIdentifierKey];
          _likeCount = [aDecoder decodeIntegerForKey:kLikeCountKey];
          _numberOfRatings = [aDecoder decodeIntegerForKey:kNumberOfRatingsKey];
        }
        return self;
      }

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %lld; \n\t numberOfRatings: %llu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (long long)_likeCount, (unsigned long long)_numberOfRatings];
      }

      - (void)encodeWithCoder:(NSCoder *)aCoder
      {
        [aCoder encodeBool:_doesUserLike forKey:kDoesUserLikeKey];
        [aCoder encodeObject:_identifier forKey:kIdentifierKey];
        [aCoder encodeInteger:_likeCount forKey:kLikeCountKey];
        [aCoder encodeInteger:_numberOfRatings forKey:kNumberOfRatingsKey];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash], ABS(_likeCount), _numberOfRatings};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 4; ++ii) {
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
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]);
      }

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

      static __unsafe_unretained NSString * const kDoesUserLikeKey = @"DOES_USER_LIKE";
      static __unsafe_unretained NSString * const kIdentifierKey = @"IDENTIFIER";
      static __unsafe_unretained NSString * const kLikeCountKey = @"LIKE_COUNT";
      static __unsafe_unretained NSString * const kNumberOfRatingsKey = @"NUMBER_OF_RATINGS";

      @implementation RMPage

      - (nullable instancetype)initWithCoder:(NSCoder *)aDecoder
      {
        if ((self = [super init])) {
          _doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];
          _identifier = (id)[aDecoder decodeObjectForKey:kIdentifierKey];
          _likeCount = [aDecoder decodeIntegerForKey:kLikeCountKey];
          _numberOfRatings = [aDecoder decodeIntegerForKey:kNumberOfRatingsKey];
        }
        return self;
      }

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %lld; \n\t numberOfRatings: %llu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (long long)_likeCount, (unsigned long long)_numberOfRatings];
      }

      - (void)encodeWithCoder:(NSCoder *)aCoder
      {
        [aCoder encodeBool:_doesUserLike forKey:kDoesUserLikeKey];
        [aCoder encodeObject:_identifier forKey:kIdentifierKey];
        [aCoder encodeInteger:_likeCount forKey:kLikeCountKey];
        [aCoder encodeInteger:_numberOfRatings forKey:kNumberOfRatingsKey];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash], ABS(_likeCount), _numberOfRatings};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 4; ++ii) {
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
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]);
      }

      @end

      """

  @announce
  Scenario: Generating correct NSCoding implementation with specified legacyKeys
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage includes(RMCoding) {
        %codingLegacyKey name=old_does_user_like
        BOOL doesUserLike
        %codingLegacyKey name=old_identifier
        NSString* identifier
        %codingLegacyKey name=old_like_count
        NSInteger likeCount
        %codingLegacyKey name=old_number_of_ratings
        %codingLegacyKey name=even_older_number_of_ratings
        NSUInteger numberOfRatings
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
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

      static __unsafe_unretained NSString * const kDoesUserLikeKey = @"DOES_USER_LIKE";
      static __unsafe_unretained NSString * const kIdentifierKey = @"IDENTIFIER";
      static __unsafe_unretained NSString * const kLikeCountKey = @"LIKE_COUNT";
      static __unsafe_unretained NSString * const kNumberOfRatingsKey = @"NUMBER_OF_RATINGS";

      @implementation RMPage

      - (nullable instancetype)initWithCoder:(NSCoder *)aDecoder
      {
        if ((self = [super init])) {
          _doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];
          if (_doesUserLike == NO) {
            _doesUserLike = [aDecoder decodeBoolForKey:@"old_does_user_like"];
          }
          _identifier = (id)[aDecoder decodeObjectForKey:kIdentifierKey];
          if (_identifier == nil) {
            _identifier = (id)[aDecoder decodeObjectForKey:@"old_identifier"];
          }
          _likeCount = [aDecoder decodeIntegerForKey:kLikeCountKey];
          if (_likeCount == 0) {
            _likeCount = [aDecoder decodeIntegerForKey:@"old_like_count"];
          }
          _numberOfRatings = [aDecoder decodeIntegerForKey:kNumberOfRatingsKey];
          if (_numberOfRatings == 0) {
            _numberOfRatings = [aDecoder decodeIntegerForKey:@"old_number_of_ratings"];
          }
          if (_numberOfRatings == 0) {
            _numberOfRatings = [aDecoder decodeIntegerForKey:@"even_older_number_of_ratings"];
          }
        }
        return self;
      }

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %lld; \n\t numberOfRatings: %llu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (long long)_likeCount, (unsigned long long)_numberOfRatings];
      }

      - (void)encodeWithCoder:(NSCoder *)aCoder
      {
        [aCoder encodeBool:_doesUserLike forKey:kDoesUserLikeKey];
        [aCoder encodeObject:_identifier forKey:kIdentifierKey];
        [aCoder encodeInteger:_likeCount forKey:kLikeCountKey];
        [aCoder encodeInteger:_numberOfRatings forKey:kNumberOfRatingsKey];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash], ABS(_likeCount), _numberOfRatings};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 4; ++ii) {
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
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]);
      }

      @end

      """
  
  @announce
  Scenario: Generating correct NSCoding implementation with specified codingKeys
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage includes(RMCoding) {
        %codingKey name=custom_does_user_like
        BOOL doesUserLike
        %codingKey name=custom_identifier
        NSString* identifier
        NSInteger likeCount
        %codingKey name=custom_number_of_ratings
        %codingLegacyKey name=old_number_of_ratings
        NSUInteger numberOfRatings
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
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

      static __unsafe_unretained NSString * const kDoesUserLikeKey = @"custom_does_user_like";
      static __unsafe_unretained NSString * const kIdentifierKey = @"custom_identifier";
      static __unsafe_unretained NSString * const kLikeCountKey = @"LIKE_COUNT";
      static __unsafe_unretained NSString * const kNumberOfRatingsKey = @"custom_number_of_ratings";

      @implementation RMPage

      - (nullable instancetype)initWithCoder:(NSCoder *)aDecoder
      {
        if ((self = [super init])) {
          _doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];
          _identifier = (id)[aDecoder decodeObjectForKey:kIdentifierKey];
          _likeCount = [aDecoder decodeIntegerForKey:kLikeCountKey];
          _numberOfRatings = [aDecoder decodeIntegerForKey:kNumberOfRatingsKey];
          if (_numberOfRatings == 0) {
            _numberOfRatings = [aDecoder decodeIntegerForKey:@"old_number_of_ratings"];
          }
        }
        return self;
      }

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %lld; \n\t numberOfRatings: %llu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (long long)_likeCount, (unsigned long long)_numberOfRatings];
      }

      - (void)encodeWithCoder:(NSCoder *)aCoder
      {
        [aCoder encodeBool:_doesUserLike forKey:kDoesUserLikeKey];
        [aCoder encodeObject:_identifier forKey:kIdentifierKey];
        [aCoder encodeInteger:_likeCount forKey:kLikeCountKey];
        [aCoder encodeInteger:_numberOfRatings forKey:kNumberOfRatingsKey];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash], ABS(_likeCount), _numberOfRatings};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 4; ++ii) {
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
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]);
      }

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

      static __unsafe_unretained NSString * const kDoesUserLikeKey = @"custom_does_user_like";
      static __unsafe_unretained NSString * const kIdentifierKey = @"custom_identifier";
      static __unsafe_unretained NSString * const kLikeCountKey = @"LIKE_COUNT";
      static __unsafe_unretained NSString * const kNumberOfRatingsKey = @"custom_number_of_ratings";

      @implementation RMPage

      - (nullable instancetype)initWithCoder:(NSCoder *)aDecoder
      {
        if ((self = [super init])) {
          _doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];
          _identifier = (id)[aDecoder decodeObjectForKey:kIdentifierKey];
          _likeCount = [aDecoder decodeIntegerForKey:kLikeCountKey];
          _numberOfRatings = [aDecoder decodeIntegerForKey:kNumberOfRatingsKey];
          if (_numberOfRatings == 0) {
            _numberOfRatings = [aDecoder decodeIntegerForKey:@"old_number_of_ratings"];
          }
        }
        return self;
      }

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %lld; \n\t numberOfRatings: %llu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (long long)_likeCount, (unsigned long long)_numberOfRatings];
      }

      - (void)encodeWithCoder:(NSCoder *)aCoder
      {
        [aCoder encodeBool:_doesUserLike forKey:kDoesUserLikeKey];
        [aCoder encodeObject:_identifier forKey:kIdentifierKey];
        [aCoder encodeInteger:_likeCount forKey:kLikeCountKey];
        [aCoder encodeInteger:_numberOfRatings forKey:kNumberOfRatingsKey];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash], ABS(_likeCount), _numberOfRatings};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 4; ++ii) {
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
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]);
      }

      @end

      """
