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
      @implementation RMPage

      - (nullable instancetype)initWithCoder:(NSCoder *)aDecoder
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
      - (nullable instancetype)initWithCoder:(NSCoder *)aDecoder
      {
        if ((self = [super init])) {
          _doesUserLike = [aDecoder decodeBoolForKey:kDoesUserLikeKey];
          if (_doesUserLike == NO) {
            _doesUserLike = [aDecoder decodeBoolForKey:@"old_does_user_like"];
          }
          _identifier = [aDecoder decodeObjectForKey:kIdentifierKey];
          if (_identifier == nil) {
            _identifier = [aDecoder decodeObjectForKey:@"old_identifier"];
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
      """
