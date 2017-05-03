Feature: Outputting Objects

  @announce
  Scenario: Generating Header Files with no includes or excludes
    Given a file named "project/values/RMPage.object" with:
      """
      # Important and gripping comment
      # that takes up two lines.
      %library name=MyLib
      %type name=RMSomeObject library=SomeLib file=AnotherFile
      %type name=RMFooObject
      %type name=RMSomeEnum canForwardDeclare=false
      %type name=RMSomeType library=FooLibrary
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
    And a file named "project/.objectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPage.h" should contain:
      """
      #import <Foundation/Foundation.h>
      #import <SomeLib/AnotherFile.h>
      #import <MyLib/RMFooObject.h>
      #import <MyLib/RMSomeEnum.h>
      #import <FooLibrary/RMSomeType.h>

      /**
       * Important and gripping comment
       * that takes up two lines.
       */
      @interface RMPage : NSObject <NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly) NSString *identifier;
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) uint32_t numberOfRatings;
      @property (nonatomic, readonly) RMSomeType *someType;
      @property (nonatomic, readonly, unsafe_unretained) Class someClass;
      @property (nonatomic, readonly) dispatch_block_t someBlock;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(uint32_t)numberOfRatings someType:(RMSomeType *)someType someClass:(Class)someClass someBlock:(dispatch_block_t)someBlock;

      @end

      """
   And the file "project/values/RMPage.m" should contain:
      """
      #import "RMPage.h"

      @implementation RMPage

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(uint32_t)numberOfRatings someType:(RMSomeType *)someType someClass:(Class)someClass someBlock:(dispatch_block_t)someBlock
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = identifier;
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
          _someType = someType;
          _someClass = someClass;
          _someBlock = someBlock;
        }

        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %zd; \n\t numberOfRatings: %u; \n\t someType: %@; \n\t someClass: %@; \n\t someBlock: %@; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, _likeCount, _numberOfRatings, _someType, _someClass, _someBlock];
      }

      @end

      """
  @announce
  Scenario: Generating Files with no equality and a custom base type
    Given a file named "project/values/RMPage.object" with:
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
    And a file named "project/.objectConfig" with:
      """
      {
        "customBaseClass": { "className": "RMProxy", "libraryName": "RMProxyLib" },
        "diagnosticIgnores": ["-Wprotocol"],
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPage.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMPage.object
       */

      #import <RMProxyLib/RMProxy.h>
      #import <Foundation/Foundation.h>
      #import <CoreGraphics/CGBase.h>

      @interface RMPage : RMProxy

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly) NSString *identifier;
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) CGFloat countIconHeight;
      @property (nonatomic, readonly) CGFloat countIconWidth;
      @property (nonatomic, readonly) NSUInteger numberOfRatings;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount countIconHeight:(CGFloat)countIconHeight countIconWidth:(CGFloat)countIconWidth numberOfRatings:(NSUInteger)numberOfRatings;

      @end

      """
   And the file "project/values/RMPage.m" should contain:
      """
      #import "RMPage.h"

      #pragma clang diagnostic push
      #pragma GCC diagnostic ignored "-Wprotocol"

      @implementation RMPage

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount countIconHeight:(CGFloat)countIconHeight countIconWidth:(CGFloat)countIconWidth numberOfRatings:(NSUInteger)numberOfRatings
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = identifier;
          _likeCount = likeCount;
          _countIconHeight = countIconHeight;
          _countIconWidth = countIconWidth;
          _numberOfRatings = numberOfRatings;
        }

        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %zd; \n\t countIconHeight: %f; \n\t countIconWidth: %f; \n\t numberOfRatings: %tu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, _likeCount, _countIconHeight, _countIconWidth, _numberOfRatings];
      }

      @end
      #pragma clang diagnostic pop

      """
