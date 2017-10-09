Feature: Outputting Value Objects

  @announce
  Scenario: Generating FetchStatus
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage includes(RMFetchStatus) {
        BOOL doesUserLike
        NSString* identifier
        NSInteger likeCount
        RMRating* rating
        RMEnum(NSUInteger) someEnumValue
        %import library=RMCustomLibrary
        RMLibType* customLibObject
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPageFetchStatus.h" should contain:
      """
      #import <Foundation/Foundation.h>

      @interface RMPageFetchStatus : NSObject <NSCopying>

      @property (nonatomic, readonly) BOOL hasFetchedDoesUserLike;
      @property (nonatomic, readonly) BOOL hasFetchedIdentifier;
      @property (nonatomic, readonly) BOOL hasFetchedLikeCount;
      @property (nonatomic, readonly) BOOL hasFetchedRating;
      @property (nonatomic, readonly) BOOL hasFetchedSomeEnumValue;
      @property (nonatomic, readonly) BOOL hasFetchedCustomLibObject;

      - (instancetype)initWithHasFetchedDoesUserLike:(BOOL)hasFetchedDoesUserLike hasFetchedIdentifier:(BOOL)hasFetchedIdentifier hasFetchedLikeCount:(BOOL)hasFetchedLikeCount hasFetchedRating:(BOOL)hasFetchedRating hasFetchedSomeEnumValue:(BOOL)hasFetchedSomeEnumValue hasFetchedCustomLibObject:(BOOL)hasFetchedCustomLibObject NS_DESIGNATED_INITIALIZER;

      @end

      """
   And the file "project/values/RMPageFetchStatus.m" should contain:
      """
      #import "RMPageFetchStatus.h"

      @implementation RMPageFetchStatus

      - (instancetype)initWithHasFetchedDoesUserLike:(BOOL)hasFetchedDoesUserLike hasFetchedIdentifier:(BOOL)hasFetchedIdentifier hasFetchedLikeCount:(BOOL)hasFetchedLikeCount hasFetchedRating:(BOOL)hasFetchedRating hasFetchedSomeEnumValue:(BOOL)hasFetchedSomeEnumValue hasFetchedCustomLibObject:(BOOL)hasFetchedCustomLibObject
      {
        if ((self = [super init])) {
          _hasFetchedDoesUserLike = hasFetchedDoesUserLike;
          _hasFetchedIdentifier = hasFetchedIdentifier;
          _hasFetchedLikeCount = hasFetchedLikeCount;
          _hasFetchedRating = hasFetchedRating;
          _hasFetchedSomeEnumValue = hasFetchedSomeEnumValue;
          _hasFetchedCustomLibObject = hasFetchedCustomLibObject;
        }

        return self;
      }

      - (id)copyWithZone:(NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t hasFetchedDoesUserLike: %@; \n\t hasFetchedIdentifier: %@; \n\t hasFetchedLikeCount: %@; \n\t hasFetchedRating: %@; \n\t hasFetchedSomeEnumValue: %@; \n\t hasFetchedCustomLibObject: %@; \n", [super description], _hasFetchedDoesUserLike ? @"YES" : @"NO", _hasFetchedIdentifier ? @"YES" : @"NO", _hasFetchedLikeCount ? @"YES" : @"NO", _hasFetchedRating ? @"YES" : @"NO", _hasFetchedSomeEnumValue ? @"YES" : @"NO", _hasFetchedCustomLibObject ? @"YES" : @"NO"];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_hasFetchedDoesUserLike, (NSUInteger)_hasFetchedIdentifier, (NSUInteger)_hasFetchedLikeCount, (NSUInteger)_hasFetchedRating, (NSUInteger)_hasFetchedSomeEnumValue, (NSUInteger)_hasFetchedCustomLibObject};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 6; ++ii) {
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

      - (BOOL)isEqual:(RMPageFetchStatus *)object
      {
        if (self == object) {
          return YES;
        } else if (self == nil || object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _hasFetchedDoesUserLike == object->_hasFetchedDoesUserLike &&
          _hasFetchedIdentifier == object->_hasFetchedIdentifier &&
          _hasFetchedLikeCount == object->_hasFetchedLikeCount &&
          _hasFetchedRating == object->_hasFetchedRating &&
          _hasFetchedSomeEnumValue == object->_hasFetchedSomeEnumValue &&
          _hasFetchedCustomLibObject == object->_hasFetchedCustomLibObject;
      }

      @end

      """
