Feature: Outputting Value Objects With Coded Values

  @announce
  Scenario: Generating Header Files including Coding
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
      #import "RMPage.h"

      static __unsafe_unretained NSString * const kDoesUserLikeKey = @"DOES_USER_LIKE";
      static __unsafe_unretained NSString * const kIdentifierKey = @"IDENTIFIER";
      static __unsafe_unretained NSString * const kLikeCountKey = @"LIKE_COUNT";
      static __unsafe_unretained NSString * const kNumberOfRatingsKey = @"NUMBER_OF_RATINGS";

      @implementation RMPage

      - (instancetype)initWithCoder:(NSCoder *)aDecoder
      {
        if ((self = [super init])) {
          _doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];
          _identifier = [aDecoder decodeObjectForKey:kIdentifierKey];
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

      - (id)copyWithZone:(NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %zd; \n\t numberOfRatings: %tu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, _likeCount, _numberOfRatings];
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
        } else if (self == nil || object == nil || ![object isKindOfClass:[self class]]) {
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
