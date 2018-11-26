# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Value Objects / Algebraic Types decorated with NS_ASSUME_NONNULL_* macros

  @announce
  Scenario: Generate assertion function, when using RMAssumeNonnull and we have object types
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo includes(RMAssumeNonnull) {
        NSString *aString;
        NSString *bString;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
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

      - (instancetype)initWithAString:(NSString *)aString bString:(NSString *)bString
      {
        RMParameterAssert(aString != nil);
        RMParameterAssert(bString != nil);
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
  Scenario: Generate assertion function, when we have a single nonnull object type
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo excludes(RMAssumeNonnull) {
        %nonnull
        NSString *aString;
        NSString *bString;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
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

      @implementation RMFoo

      - (instancetype)initWithAString:(nonnull NSString *)aString bString:(NSString *)bString
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


      """

  @announce
  Scenario: Dont generate assertion function, if we have no nonnull annotations
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo excludes(RMAssumeNonnull) {
        NSInteger countA;
        NSInteger countB;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMFoo.value
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMFoo.h"

      @implementation RMFoo

      - (instancetype)initWithCountA:(NSInteger)countA countB:(NSInteger)countB
      {
        if ((self = [super init])) {
          _countA = countA;
          _countB = countB;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t countA: %lld; \n\t countB: %lld; \n", [super description], (long long)_countA, (long long)_countB];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {ABS(_countA), ABS(_countB)};
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
          _countA == object->_countA &&
          _countB == object->_countB;
      }

      @end


      """

  @announce
  Scenario: Dont generate assertion function, when using RMAssumeNonnull and we dont have nonnull object types
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo includes(RMAssumeNonnull) {
        %nullable
        NSString *stringA
        NSInteger countB
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMFoo.value
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMFoo.h"

      NS_ASSUME_NONNULL_BEGIN

      @implementation RMFoo

      - (instancetype)initWithStringA:(nullable NSString *)stringA countB:(NSInteger)countB
      {
        if ((self = [super init])) {
          _stringA = [stringA copy];
          _countB = countB;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t stringA: %@; \n\t countB: %lld; \n", [super description], _stringA, (long long)_countB];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {[_stringA hash], ABS(_countB)};
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
          _countB == object->_countB &&
          (_stringA == object->_stringA ? YES : [_stringA isEqual:object->_stringA]);
      }

      @end

      NS_ASSUME_NONNULL_END


      """

  @announce
  Scenario: Dont generate assertion function, when using RMAssumeNonnull and we dont have object types
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo includes(RMAssumeNonnull) {
        NSInteger countA;
        NSInteger countB;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMFoo.value
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "RMFoo.h"

      NS_ASSUME_NONNULL_BEGIN

      @implementation RMFoo

      - (instancetype)initWithCountA:(NSInteger)countA countB:(NSInteger)countB
      {
        if ((self = [super init])) {
          _countA = countA;
          _countB = countB;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t countA: %lld; \n\t countB: %lld; \n", [super description], (long long)_countA, (long long)_countB];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {ABS(_countA), ABS(_countB)};
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
          _countA == object->_countA &&
          _countB == object->_countB;
      }

      @end

      NS_ASSUME_NONNULL_END


      """