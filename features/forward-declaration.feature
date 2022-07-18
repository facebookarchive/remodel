# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Value Objects With Forward Declarations

  @announce
  Scenario: Generating Header Files with forwards with canForwardDeclare
    Given a file named "project/values/RMPage.value" with:
      """
      # Important and gripping comment
      # that takes up two lines.
      %type name=RMSomeType library=FooLibrary
      %type name=UIViewController library=UIKit
      %type name=CustomEnum library=EnumLib canForwardDeclare=false
      %type name=WorldProtocol library=WorldKit file=HWorldProtocol
      RMPage includes(UseForwardDeclarations) {
        BOOL doesUserLike
        NSString* identifier
        CustomEnum(NSUInteger) someEnum
        # And another important comment.
        # which also takes 2 lines.
        NSInteger likeCount
        NSUInteger numberOfRatings
        RMProxy* proxy
        NSArray<RMSomeType *>* followers
        %import library=HelloKit file=HelloProtocol
        id<HelloProtocol> helloObj
        UIViewController<WorldProtocol> *worldVc
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
      #import <EnumLib/CustomEnum.h>

      @class RMProxy;
      @class RMSomeType;
      @protocol HelloProtocol;
      @protocol WorldProtocol;
      @class UIViewController;

      /**
       * Important and gripping comment
       * that takes up two lines.
       */
      @interface RMPage : NSObject <NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;
      @property (nonatomic, readonly) CustomEnum someEnum;
      /**
       * And another important comment.
       * which also takes 2 lines.
       */
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) NSUInteger numberOfRatings;
      @property (nonatomic, readonly, copy) RMProxy *proxy;
      @property (nonatomic, readonly, copy) NSArray<RMSomeType *> *followers;
      @property (nonatomic, readonly) id<HelloProtocol> helloObj;
      @property (nonatomic, readonly, copy) UIViewController<WorldProtocol> *worldVc;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      /**
       * @param likeCount And another important comment.
       *                  which also takes 2 lines.
       */
      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier someEnum:(CustomEnum)someEnum likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings proxy:(RMProxy *)proxy followers:(NSArray<RMSomeType *> *)followers helloObj:(id<HelloProtocol>)helloObj worldVc:(UIViewController<WorldProtocol> *)worldVc NS_DESIGNATED_INITIALIZER;

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
      #import "RMProxy.h"
      #import <FooLibrary/RMSomeType.h>
      #import <WorldKit/HWorldProtocol.h>
      #import <UIKit/UIViewController.h>

      @implementation RMPage

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier someEnum:(CustomEnum)someEnum likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings proxy:(RMProxy *)proxy followers:(NSArray<RMSomeType *> *)followers helloObj:(id<HelloProtocol>)helloObj worldVc:(UIViewController<WorldProtocol> *)worldVc
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _someEnum = someEnum;
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
          _proxy = [proxy copy];
          _followers = [followers copy];
          _helloObj = helloObj;
          _worldVc = [worldVc copy];
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t someEnum: %llu; \n\t likeCount: %lld; \n\t numberOfRatings: %llu; \n\t proxy: %@; \n\t followers: %@; \n\t helloObj: %@; \n\t worldVc: %@; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (unsigned long long)_someEnum, (long long)_likeCount, (unsigned long long)_numberOfRatings, _proxy, _followers, _helloObj, _worldVc];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash], _someEnum, ABS(_likeCount), _numberOfRatings, [_proxy hash], [_followers hash], [_helloObj hash], [_worldVc hash]};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 9; ++ii) {
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
          _someEnum == object->_someEnum &&
          _likeCount == object->_likeCount &&
          _numberOfRatings == object->_numberOfRatings &&
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]) &&
          (_proxy == object->_proxy ? YES : [_proxy isEqual:object->_proxy]) &&
          (_followers == object->_followers ? YES : [_followers isEqual:object->_followers]) &&
          (_helloObj == object->_helloObj ? YES : [_helloObj isEqual:object->_helloObj]) &&
          (_worldVc == object->_worldVc ? YES : [_worldVc isEqual:object->_worldVc]);
      }

      @end

      """
  @announce
  Scenario: Generating Files when defaulting to UseForwardDeclarations with canForwardDeclare
    Given a file named "project/values/RMPage.value" with:
      """
      %type name=SomeObject canForwardDeclare=false
      RMPage {
        BOOL doesUserLike
        NSString *identifier
        SomeObject *obj
        AnotherObject *obj2
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      {
        "defaultIncludes": [
          "UseForwardDeclarations"
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

      #import <Foundation/Foundation.h>
      #import "SomeObject.h"

      @class AnotherObject;

      @interface RMPage : NSObject <NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;
      @property (nonatomic, readonly, copy) SomeObject *obj;
      @property (nonatomic, readonly, copy) AnotherObject *obj2;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier obj:(SomeObject *)obj obj2:(AnotherObject *)obj2 NS_DESIGNATED_INITIALIZER;

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
      #import "AnotherObject.h"

      @implementation RMPage

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier obj:(SomeObject *)obj obj2:(AnotherObject *)obj2
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _obj = [obj copy];
          _obj2 = [obj2 copy];
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t obj: %@; \n\t obj2: %@; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, _obj, _obj2];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash], [_obj hash], [_obj2 hash]};
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
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]) &&
          (_obj == object->_obj ? YES : [_obj isEqual:object->_obj]) &&
          (_obj2 == object->_obj2 ? YES : [_obj2 isEqual:object->_obj2]);
      }

      @end

      """
  @announce
  Scenario: Generating Files with no equality and a custom base type
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage includes(UseForwardDeclarations) {
        BOOL doesUserLike
        NSString* identifier
        NSInteger likeCount
        CGFloat countIconHeight
        CGFloat countIconWidth
        NSUInteger numberOfRatings
        Foo* foo
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

      @class Foo;

      @interface RMPage : RMProxy <NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) CGFloat countIconHeight;
      @property (nonatomic, readonly) CGFloat countIconWidth;
      @property (nonatomic, readonly) NSUInteger numberOfRatings;
      @property (nonatomic, readonly, copy) Foo *foo;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount countIconHeight:(CGFloat)countIconHeight countIconWidth:(CGFloat)countIconWidth numberOfRatings:(NSUInteger)numberOfRatings foo:(Foo *)foo NS_DESIGNATED_INITIALIZER;

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
      #import "Foo.h"

      #pragma clang diagnostic push
      #pragma GCC diagnostic ignored "-Wprotocol"

      @implementation RMPage

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount countIconHeight:(CGFloat)countIconHeight countIconWidth:(CGFloat)countIconWidth numberOfRatings:(NSUInteger)numberOfRatings foo:(Foo *)foo
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _likeCount = likeCount;
          _countIconHeight = countIconHeight;
          _countIconWidth = countIconWidth;
          _numberOfRatings = numberOfRatings;
          _foo = [foo copy];
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %lld; \n\t countIconHeight: %f; \n\t countIconWidth: %f; \n\t numberOfRatings: %llu; \n\t foo: %@; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (long long)_likeCount, _countIconHeight, _countIconWidth, (unsigned long long)_numberOfRatings, _foo];
      }

      @end
      #pragma clang diagnostic pop

      """
  Scenario: Generating forward declarations for types conforming to multiple protocols
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage includes(UseForwardDeclarations) {
        UIViewController<ProtocolA, ProtocolB> *helloViewController
        HelloClass *helloObj
        NSArray<RMSomeType *>* users
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

      @protocol ProtocolA;
      @protocol ProtocolB;
      @class UIViewController;
      @class HelloClass;
      @class RMSomeType;

      @interface RMPage : NSObject <NSCopying>

      @property (nonatomic, readonly, copy) UIViewController<ProtocolA, ProtocolB> *helloViewController;
      @property (nonatomic, readonly, copy) HelloClass *helloObj;
      @property (nonatomic, readonly, copy) NSArray<RMSomeType *> *users;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithHelloViewController:(UIViewController<ProtocolA, ProtocolB> *)helloViewController helloObj:(HelloClass *)helloObj users:(NSArray<RMSomeType *> *)users NS_DESIGNATED_INITIALIZER;

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
      #import "UIViewController.h"
      #import "HelloClass.h"
      #import "RMSomeType.h"

      @implementation RMPage

      - (instancetype)initWithHelloViewController:(UIViewController<ProtocolA, ProtocolB> *)helloViewController helloObj:(HelloClass *)helloObj users:(NSArray<RMSomeType *> *)users
      {
        if ((self = [super init])) {
          _helloViewController = [helloViewController copy];
          _helloObj = [helloObj copy];
          _users = [users copy];
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t helloViewController: %@; \n\t helloObj: %@; \n\t users: %@; \n", [super description], _helloViewController, _helloObj, _users];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {[_helloViewController hash], [_helloObj hash], [_users hash]};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 3; ++ii) {
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
          (_helloViewController == object->_helloViewController ? YES : [_helloViewController isEqual:object->_helloViewController]) &&
          (_helloObj == object->_helloObj ? YES : [_helloObj isEqual:object->_helloObj]) &&
          (_users == object->_users ? YES : [_users isEqual:object->_users]);
      }

      @end

      """
  @announce
  Scenario: Generating Files with SkipImportsInImplementation results in no additional imports
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage includes(UseForwardDeclarations, SkipImportsInImplementation) {
        UIViewController<WorldProtocol> *worldVc
        RMProxy* proxy
        HelloClass *helloObj
        NSArray<RMSomeType *>* followers
        SomeClass *x
        NSInteger primitives
        AnEnun(NSUInteger) bla
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPage.m" should contain:
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

      - (instancetype)initWithWorldVc:(UIViewController<WorldProtocol> *)worldVc proxy:(RMProxy *)proxy helloObj:(HelloClass *)helloObj followers:(NSArray<RMSomeType *> *)followers x:(SomeClass *)x primitives:(NSInteger)primitives bla:(AnEnun)bla
      {
        if ((self = [super init])) {
          _worldVc = [worldVc copy];
          _proxy = [proxy copy];
          _helloObj = [helloObj copy];
          _followers = [followers copy];
          _x = [x copy];
          _primitives = primitives;
          _bla = bla;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t worldVc: %@; \n\t proxy: %@; \n\t helloObj: %@; \n\t followers: %@; \n\t x: %@; \n\t primitives: %lld; \n\t bla: %llu; \n", [super description], _worldVc, _proxy, _helloObj, _followers, _x, (long long)_primitives, (unsigned long long)_bla];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {[_worldVc hash], [_proxy hash], [_helloObj hash], [_followers hash], [_x hash], ABS(_primitives), _bla};
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
          _primitives == object->_primitives &&
          _bla == object->_bla &&
          (_worldVc == object->_worldVc ? YES : [_worldVc isEqual:object->_worldVc]) &&
          (_proxy == object->_proxy ? YES : [_proxy isEqual:object->_proxy]) &&
          (_helloObj == object->_helloObj ? YES : [_helloObj isEqual:object->_helloObj]) &&
          (_followers == object->_followers ? YES : [_followers isEqual:object->_followers]) &&
          (_x == object->_x ? YES : [_x isEqual:object->_x]);
      }

      @end

      """
  @announce
  Scenario: Generating Builders with SkipImportsInImplementation results in no additional imports
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage includes(UseForwardDeclarations, SkipImportsInImplementation, RMBuilder) {
        UIViewController<WorldProtocol> *worldVc
        RMProxy* proxy
        HelloClass *helloObj
        NSArray<RMSomeType *>* followers
        SomeClass *x
        NSInteger primitives
        AnEnun(NSUInteger) bla
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPage.m" should contain:
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

      - (instancetype)initWithWorldVc:(UIViewController<WorldProtocol> *)worldVc proxy:(RMProxy *)proxy helloObj:(HelloClass *)helloObj followers:(NSArray<RMSomeType *> *)followers x:(SomeClass *)x primitives:(NSInteger)primitives bla:(AnEnun)bla
      {
        if ((self = [super init])) {
          _worldVc = [worldVc copy];
          _proxy = [proxy copy];
          _helloObj = [helloObj copy];
          _followers = [followers copy];
          _x = [x copy];
          _primitives = primitives;
          _bla = bla;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t worldVc: %@; \n\t proxy: %@; \n\t helloObj: %@; \n\t followers: %@; \n\t x: %@; \n\t primitives: %lld; \n\t bla: %llu; \n", [super description], _worldVc, _proxy, _helloObj, _followers, _x, (long long)_primitives, (unsigned long long)_bla];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {[_worldVc hash], [_proxy hash], [_helloObj hash], [_followers hash], [_x hash], ABS(_primitives), _bla};
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
          _primitives == object->_primitives &&
          _bla == object->_bla &&
          (_worldVc == object->_worldVc ? YES : [_worldVc isEqual:object->_worldVc]) &&
          (_proxy == object->_proxy ? YES : [_proxy isEqual:object->_proxy]) &&
          (_helloObj == object->_helloObj ? YES : [_helloObj isEqual:object->_helloObj]) &&
          (_followers == object->_followers ? YES : [_followers isEqual:object->_followers]) &&
          (_x == object->_x ? YES : [_x isEqual:object->_x]);
      }

      @end

      """
    And the file "project/values/RMPageBuilder.m" should contain:
      """
      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMPage.h"
      #import "RMPageBuilder.h"

      @implementation RMPageBuilder
      {
        UIViewController<WorldProtocol> *_worldVc;
        RMProxy *_proxy;
        HelloClass *_helloObj;
        NSArray<RMSomeType *> *_followers;
        SomeClass *_x;
        NSInteger _primitives;
        AnEnun _bla;
      }

      + (instancetype)page
      {
        return [RMPageBuilder new];
      }

      + (instancetype)pageFromExistingPage:(RMPage *)existingPage
      {
        RMPageBuilder *builder = [[RMPageBuilder alloc] init];
        builder->_worldVc = [existingPage.worldVc copy];
        builder->_proxy = [existingPage.proxy copy];
        builder->_helloObj = [existingPage.helloObj copy];
        builder->_followers = [existingPage.followers copy];
        builder->_x = [existingPage.x copy];
        builder->_primitives = existingPage.primitives;
        builder->_bla = existingPage.bla;
        return builder;
      }

      - (RMPage *)build
      {
        return [[RMPage alloc] initWithWorldVc:_worldVc proxy:_proxy helloObj:_helloObj followers:_followers x:_x primitives:_primitives bla:_bla];
      }

      - (instancetype)withWorldVc:(UIViewController<WorldProtocol> *)worldVc
      {
        _worldVc = [worldVc copy];
        return self;
      }

      - (instancetype)withProxy:(RMProxy *)proxy
      {
        _proxy = [proxy copy];
        return self;
      }

      - (instancetype)withHelloObj:(HelloClass *)helloObj
      {
        _helloObj = [helloObj copy];
        return self;
      }

      - (instancetype)withFollowers:(NSArray<RMSomeType *> *)followers
      {
        _followers = [followers copy];
        return self;
      }

      - (instancetype)withX:(SomeClass *)x
      {
        _x = [x copy];
        return self;
      }

      - (instancetype)withPrimitives:(NSInteger)primitives
      {
        _primitives = primitives;
        return self;
      }

      - (instancetype)withBla:(AnEnun)bla
      {
        _bla = bla;
        return self;
      }

      @end

      """
