# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Value Objects / Algebraic Types decorated with NS_ASSUME_NONNULL_* macros

  @announce
  Scenario: Generation header and method files for Value Objects with the NS_ASSUME_NONNULL_* macros
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo includes(RMAssumeNonnull) {
        NSString *aString;
        %nullable
        NSString *bString;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMFoo.value
       */

      #import <Foundation/Foundation.h>

      NS_ASSUME_NONNULL_BEGIN

      @interface RMFoo : NSObject <NSCopying>

      @property (nonatomic, readonly, copy) NSString *aString;
      @property (nonatomic, readonly, copy, nullable) NSString *bString;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithAString:(NSString *)aString bString:(nullable NSString *)bString NS_DESIGNATED_INITIALIZER;

      @end

      NS_ASSUME_NONNULL_END

      """
    And the file "project/values/RMFoo.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMFoo.value
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMFoo.h"

      #define RMParameterAssert(condition) NSCParameterAssert((condition))

      NS_ASSUME_NONNULL_BEGIN

      @implementation RMFoo

      - (instancetype)initWithAString:(NSString *)aString bString:(nullable NSString *)bString
      {
        RMParameterAssert(aString != nil);
        if ((self = [super init])) {
          _aString = [aString copy];
          _bString = [bString copy];
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t aString: %@; \n\t bString: %@; \n", [super description], _aString, _bString];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {[_aString hash], [_bString hash]};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 2; ++ii) {
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

      - (BOOL)isEqual:(RMFoo *)object
      {
        if (self == object) {
          return YES;
        } else if (object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          (_aString == object->_aString ? YES : [_aString isEqual:object->_aString]) &&
          (_bString == object->_bString ? YES : [_bString isEqual:object->_bString]);
      }

      @end

      NS_ASSUME_NONNULL_END

      """

  @announce
  Scenario: Generation header and method files for Value Objects with the NS_ASSUME_NONNULL_* macros
    Given a file named "project/values/RMFoo.adtValue" with:
      """
      RMFoo includes(RMAssumeNonnull) {
        Bar
        Baz {
          NSString *aString
          %nullable
          NSString *bString
        }
      }
      """
    And a file named "project/.algebraicTypeConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMFoo.adtValue
       */

      #import <Foundation/Foundation.h>

      NS_ASSUME_NONNULL_BEGIN
      typedef void (^RMFooBarMatchHandler)(void);
      NS_ASSUME_NONNULL_END
      NS_ASSUME_NONNULL_BEGIN
      typedef void (^RMFooBazMatchHandler)(NSString *aString, NSString *_Nullable bString);
      NS_ASSUME_NONNULL_END

      NS_ASSUME_NONNULL_BEGIN

      @interface RMFoo : NSObject <NSCopying>

      + (instancetype)bar;

      + (instancetype)bazWithAString:(NSString *)aString bString:(nullable NSString *)bString;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchBar:(nullable NS_NOESCAPE __unsafe_unretained RMFooBarMatchHandler)barMatchHandler baz:(nullable NS_NOESCAPE __unsafe_unretained RMFooBazMatchHandler)bazMatchHandler NS_SWIFT_NAME(match(bar:baz:));

      @end

      NS_ASSUME_NONNULL_END

      """
    And the file "project/values/RMFoo.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMFoo.adtValue
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMFoo.h"

      typedef NS_ENUM(NSUInteger, RMFooSubtypes) {
        RMFooSubtypesBar,
        RMFooSubtypesBaz
      };

      #define RMParameterAssert(condition) NSCParameterAssert((condition))

      NS_ASSUME_NONNULL_BEGIN

      @implementation RMFoo
      {
        RMFooSubtypes _subtype;
        NSString *_baz_aString;
        NSString *_baz_bString;
      }

      + (instancetype)bar
      {
        RMFoo *object = [(id)self new];
        object->_subtype = RMFooSubtypesBar;
        return object;
      }

      + (instancetype)bazWithAString:(NSString *)aString bString:(nullable NSString *)bString
      {
        RMParameterAssert(aString != nil);
        RMFoo *object = [(id)self new];
        object->_subtype = RMFooSubtypesBaz;
        object->_baz_aString = aString;
        object->_baz_bString = bString;
        return object;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case RMFooSubtypesBar: {
            return [NSString stringWithFormat:@"%@ - Bar \n", [super description]];
            break;
          }
          case RMFooSubtypesBaz: {
            return [NSString stringWithFormat:@"%@ - Baz \n\t aString: %@; \n\t bString: %@; \n", [super description], _baz_aString, _baz_bString];
            break;
          }
        }
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {_subtype, [_baz_aString hash], [_baz_bString hash]};
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

      - (BOOL)isEqual:(RMFoo *)object
      {
        if (self == object) {
          return YES;
        } else if (object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _subtype == object->_subtype &&
          (_baz_aString == object->_baz_aString ? YES : [_baz_aString isEqual:object->_baz_aString]) &&
          (_baz_bString == object->_baz_bString ? YES : [_baz_bString isEqual:object->_baz_bString]);
      }

      - (void)matchBar:(nullable NS_NOESCAPE __unsafe_unretained RMFooBarMatchHandler)barMatchHandler baz:(nullable NS_NOESCAPE __unsafe_unretained RMFooBazMatchHandler)bazMatchHandler
      {
        switch (_subtype) {
          case RMFooSubtypesBar: {
            if (barMatchHandler) {
              barMatchHandler();
            }
            break;
          }
          case RMFooSubtypesBaz: {
            if (bazMatchHandler) {
              bazMatchHandler(_baz_aString, _baz_bString);
            }
            break;
          }
        }
      }

      @end

      NS_ASSUME_NONNULL_END

      """
