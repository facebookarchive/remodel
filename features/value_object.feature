# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Value Objects

  @announce
  Scenario: Generating Header Files with no includes or excludes
    Given a file named "project/values/RMPage.value" with:
      """
      # Important and gripping comment
      # that takes up two lines.
      %library name=MyLib
      %type name=RMSomeType library=FooLibrary
      # And an extra comment here for good measure.
      RMPage {
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
      #import <FooLibrary/RMSomeType.h>

      /**
       * Important and gripping comment
       * that takes up two lines.
       * And an extra comment here for good measure.
       */
      @interface RMPage : NSObject <NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) uint32_t numberOfRatings;
      @property (nonatomic, readonly, copy) RMSomeType *someType;
      @property (nonatomic, readonly, unsafe_unretained) Class someClass;
      @property (nonatomic, readonly, copy) dispatch_block_t someBlock;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(uint32_t)numberOfRatings someType:(RMSomeType *)someType someClass:(Class)someClass someBlock:(dispatch_block_t)someBlock NS_DESIGNATED_INITIALIZER;

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

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %lld; \n\t numberOfRatings: %u; \n\t someType: %@; \n\t someClass: %@; \n\t someBlock: %@; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (long long)_likeCount, _numberOfRatings, _someType, _someClass, _someBlock];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash], ABS(_likeCount), _numberOfRatings, [_someType hash], [_someClass hash], [_someBlock hash]};
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
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]) &&
          (_someType == object->_someType ? YES : [_someType isEqual:object->_someType]) &&
          (_someClass == object->_someClass ? YES : [_someClass isEqual:object->_someClass]) &&
          (_someBlock == object->_someBlock ? YES : [_someBlock isEqual:object->_someBlock]);
      }

      @end

      """
  @announce
  Scenario: Generating Files with no equality and a custom base type
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage {
        BOOL doesUserLike
        NSString* identifier
        NSInteger likeCount
        CGFloat countIconHeight
        CGFloat countIconWidth
        NSUInteger numberOfRatings
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      {
        "customBaseClass": { "className": "RMProxy", "libraryName": "RMProxyLib" },
        "diagnosticIgnores": ["-Wprotocol"],
        "defaultExcludes": [
          "RMEquality"
         ]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPage.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMPage.value
       */

      #import <RMProxyLib/RMProxy.h>
      #import <Foundation/Foundation.h>
      #import <CoreGraphics/CGBase.h>

      @interface RMPage : RMProxy <NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) CGFloat countIconHeight;
      @property (nonatomic, readonly) CGFloat countIconWidth;
      @property (nonatomic, readonly) NSUInteger numberOfRatings;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount countIconHeight:(CGFloat)countIconHeight countIconWidth:(CGFloat)countIconWidth numberOfRatings:(NSUInteger)numberOfRatings NS_DESIGNATED_INITIALIZER;

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

      #pragma clang diagnostic push
      #pragma GCC diagnostic ignored "-Wprotocol"

      @implementation RMPage

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount countIconHeight:(CGFloat)countIconHeight countIconWidth:(CGFloat)countIconWidth numberOfRatings:(NSUInteger)numberOfRatings
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _likeCount = likeCount;
          _countIconHeight = countIconHeight;
          _countIconWidth = countIconWidth;
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
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %lld; \n\t countIconHeight: %f; \n\t countIconWidth: %f; \n\t numberOfRatings: %llu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (long long)_likeCount, _countIconHeight, _countIconWidth, (unsigned long long)_numberOfRatings];
      }

      @end
      #pragma clang diagnostic pop

      """
  @announce
  Scenario: Generating comments
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage {
        # Does the user like this?
        BOOL doesUserLike
        # Some identifier
        # that we wrote
        # many lines of
        # comments about
        NSString* identifier
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

      @interface RMPage : NSObject <NSCopying>

      /**
       * Does the user like this?
       */
      @property (nonatomic, readonly) BOOL doesUserLike;
      /**
       * Some identifier
       * that we wrote
       * many lines of
       * comments about
       */
      @property (nonatomic, readonly, copy) NSString *identifier;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      /**
       * @param doesUserLike Does the user like this?
       * @param identifier Some identifier
       *                   that we wrote
       *                   many lines of
       *                   comments about
       */
      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier NS_DESIGNATED_INITIALIZER;

      @end

      """
