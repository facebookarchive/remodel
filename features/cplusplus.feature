Feature: Outputting C++ Value Objects

  @announce
  Scenario: Generating Header Files with no includes or excludes
    Given a file named "project/values/RMPage.value" with:
      """
      # Important and gripping comment
      # that takes up two lines.
      RMPage includes(RenderCPlusPlusFile) {
        BOOL doesUserLike
        NSString* identifier
        # And another important comment.
        # which also takes 2 lines.
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

      /**
       * Important and gripping comment
       * that takes up two lines.
       */
      @interface RMPage : NSObject <NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;
      /**
       * And another important comment.
       * which also takes 2 lines.
       */
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) NSUInteger numberOfRatings;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings NS_DESIGNATED_INITIALIZER;

      @end

      """
   And the file "project/values/RMPage.mm" should contain:
      """
      #import "RMPage.h"

      @implementation RMPage

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
