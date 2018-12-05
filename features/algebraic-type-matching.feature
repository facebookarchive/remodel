# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting expected Algebraic Type matching methods

  @announce
  Scenario: Generating an algebraic type with a bool matcher
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      SimpleADT includes(BoolMatching) excludes(VoidMatching) {
        subtypeA
        subtypeB
      }
      """
    And a file named "project/.algebraicTypeConfig" with:
      """
      {
        "defaultExcludes": [
          "RMCoding"
         ]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/SimpleADT.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is SimpleADT.adtValue
       */

      #import <Foundation/Foundation.h>

      typedef BOOL (^SimpleADTBooleanSubtypeAMatchHandler)(void);
      typedef BOOL (^SimpleADTBooleanSubtypeBMatchHandler)(void);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)subtypeA;

      + (instancetype)subtypeB;

      - (instancetype)init NS_UNAVAILABLE;

      - (BOOL)matchBooleanSubtypeA:(NS_NOESCAPE __unsafe_unretained SimpleADTBooleanSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(NS_NOESCAPE __unsafe_unretained SimpleADTBooleanSubtypeBMatchHandler)subtypeBMatchHandler NS_SWIFT_NAME(match(subtypeA:subtypeB:));

      @end


      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is SimpleADT.adtValue
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "SimpleADT.h"

      typedef NS_ENUM(NSUInteger, SimpleADTSubtypes) {
        SimpleADTSubtypesSubtypeA,
        SimpleADTSubtypesSubtypeB
      };

      @implementation SimpleADT
      {
        SimpleADTSubtypes _subtype;
      }

      + (instancetype)subtypeA
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesSubtypeA;
        return object;
      }

      + (instancetype)subtypeB
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesSubtypeB;
        return object;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case SimpleADTSubtypesSubtypeA: {
            return [NSString stringWithFormat:@"%@ - subtypeA \n", [super description]];
            break;
          }
          case SimpleADTSubtypesSubtypeB: {
            return [NSString stringWithFormat:@"%@ - subtypeB \n", [super description]];
            break;
          }
        }
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {_subtype};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 1; ++ii) {
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

      - (BOOL)isEqual:(SimpleADT *)object
      {
        if (self == object) {
          return YES;
        } else if (object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _subtype == object->_subtype;
      }

      - (BOOL)matchBooleanSubtypeA:(NS_NOESCAPE __unsafe_unretained SimpleADTBooleanSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(NS_NOESCAPE __unsafe_unretained SimpleADTBooleanSubtypeBMatchHandler)subtypeBMatchHandler
      {
        __block BOOL result = NO;
        switch (_subtype) {
          case SimpleADTSubtypesSubtypeA: {
            if (subtypeAMatchHandler) {
              result = subtypeAMatchHandler();
            }
            break;
          }
          case SimpleADTSubtypesSubtypeB: {
            if (subtypeBMatchHandler) {
              result = subtypeBMatchHandler();
            }
            break;
          }
        }
        return result;
      }

      @end


      """

  @announce
  Scenario: Generating an algebraic type with a integer matcher
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      SimpleADT includes(IntegerMatching) excludes(VoidMatching) {
        subtypeA
        subtypeB
      }
      """
    And a file named "project/.algebraicTypeConfig" with:
      """
      {
        "defaultExcludes": [
          "RMCoding"
         ]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/SimpleADT.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is SimpleADT.adtValue
       */

      #import <Foundation/Foundation.h>

      typedef NSInteger (^SimpleADTIntegerSubtypeAMatchHandler)(void);
      typedef NSInteger (^SimpleADTIntegerSubtypeBMatchHandler)(void);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)subtypeA;

      + (instancetype)subtypeB;

      - (instancetype)init NS_UNAVAILABLE;

      - (NSInteger)matchIntegerSubtypeA:(NS_NOESCAPE __unsafe_unretained SimpleADTIntegerSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(NS_NOESCAPE __unsafe_unretained SimpleADTIntegerSubtypeBMatchHandler)subtypeBMatchHandler NS_SWIFT_NAME(match(subtypeA:subtypeB:));

      @end


      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is SimpleADT.adtValue
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "SimpleADT.h"

      typedef NS_ENUM(NSUInteger, SimpleADTSubtypes) {
        SimpleADTSubtypesSubtypeA,
        SimpleADTSubtypesSubtypeB
      };

      @implementation SimpleADT
      {
        SimpleADTSubtypes _subtype;
      }

      + (instancetype)subtypeA
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesSubtypeA;
        return object;
      }

      + (instancetype)subtypeB
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesSubtypeB;
        return object;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case SimpleADTSubtypesSubtypeA: {
            return [NSString stringWithFormat:@"%@ - subtypeA \n", [super description]];
            break;
          }
          case SimpleADTSubtypesSubtypeB: {
            return [NSString stringWithFormat:@"%@ - subtypeB \n", [super description]];
            break;
          }
        }
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {_subtype};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 1; ++ii) {
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

      - (BOOL)isEqual:(SimpleADT *)object
      {
        if (self == object) {
          return YES;
        } else if (object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _subtype == object->_subtype;
      }

      - (NSInteger)matchIntegerSubtypeA:(NS_NOESCAPE __unsafe_unretained SimpleADTIntegerSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(NS_NOESCAPE __unsafe_unretained SimpleADTIntegerSubtypeBMatchHandler)subtypeBMatchHandler
      {
        __block NSInteger result = 0;
        switch (_subtype) {
          case SimpleADTSubtypesSubtypeA: {
            if (subtypeAMatchHandler) {
              result = subtypeAMatchHandler();
            }
            break;
          }
          case SimpleADTSubtypesSubtypeB: {
            if (subtypeBMatchHandler) {
              result = subtypeBMatchHandler();
            }
            break;
          }
        }
        return result;
      }

      @end


      """

  @announce
  Scenario: Generating an algebraic type with a double matcher
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      SimpleADT includes(DoubleMatching) excludes(VoidMatching) {
        subtypeA
        subtypeB
      }
      """
    And a file named "project/.algebraicTypeConfig" with:
      """
      {
        "defaultExcludes": [
          "RMCoding"
         ]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/SimpleADT.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is SimpleADT.adtValue
       */

      #import <Foundation/Foundation.h>

      typedef double (^SimpleADTDoubleSubtypeAMatchHandler)(void);
      typedef double (^SimpleADTDoubleSubtypeBMatchHandler)(void);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)subtypeA;

      + (instancetype)subtypeB;

      - (instancetype)init NS_UNAVAILABLE;

      - (double)matchDoubleSubtypeA:(NS_NOESCAPE __unsafe_unretained SimpleADTDoubleSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(NS_NOESCAPE __unsafe_unretained SimpleADTDoubleSubtypeBMatchHandler)subtypeBMatchHandler NS_SWIFT_NAME(match(subtypeA:subtypeB:));

      @end


      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is SimpleADT.adtValue
       */

      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "SimpleADT.h"

      typedef NS_ENUM(NSUInteger, SimpleADTSubtypes) {
        SimpleADTSubtypesSubtypeA,
        SimpleADTSubtypesSubtypeB
      };

      @implementation SimpleADT
      {
        SimpleADTSubtypes _subtype;
      }

      + (instancetype)subtypeA
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesSubtypeA;
        return object;
      }

      + (instancetype)subtypeB
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesSubtypeB;
        return object;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case SimpleADTSubtypesSubtypeA: {
            return [NSString stringWithFormat:@"%@ - subtypeA \n", [super description]];
            break;
          }
          case SimpleADTSubtypesSubtypeB: {
            return [NSString stringWithFormat:@"%@ - subtypeB \n", [super description]];
            break;
          }
        }
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {_subtype};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 1; ++ii) {
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

      - (BOOL)isEqual:(SimpleADT *)object
      {
        if (self == object) {
          return YES;
        } else if (object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _subtype == object->_subtype;
      }

      - (double)matchDoubleSubtypeA:(NS_NOESCAPE __unsafe_unretained SimpleADTDoubleSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(NS_NOESCAPE __unsafe_unretained SimpleADTDoubleSubtypeBMatchHandler)subtypeBMatchHandler
      {
        __block double result = 0.0f;
        switch (_subtype) {
          case SimpleADTSubtypesSubtypeA: {
            if (subtypeAMatchHandler) {
              result = subtypeAMatchHandler();
            }
            break;
          }
          case SimpleADTSubtypesSubtypeB: {
            if (subtypeBMatchHandler) {
              result = subtypeBMatchHandler();
            }
            break;
          }
        }
        return result;
      }

      @end


      """

  @announce
  Scenario: Generating an algebraic type with a generic matcher
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      SimpleADT includes(GenericMatching) excludes(VoidMatching) {
        subtypeA
        subtypeB
      }
      """
    And a file named "project/.algebraicTypeConfig" with:
      """
      {
        "defaultExcludes": [
          "RMCoding"
         ]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/SimpleADTMatcher.h" should contain:
      """
      #import <Foundation/Foundation.h>
      #import "SimpleADT.h"

      __attribute__((objc_subclassing_restricted)) 
      @interface SimpleADTMatcher<__covariant ObjectType> : NSObject

      typedef ObjectType (^SimpleADTObjectTypeSubtypeAMatchHandler)(void);
      typedef ObjectType (^SimpleADTObjectTypeSubtypeBMatchHandler)(void);

      + (ObjectType)match:(SimpleADT *)simpleADT subtypeA:(NS_NOESCAPE __unsafe_unretained SimpleADTObjectTypeSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(NS_NOESCAPE __unsafe_unretained SimpleADTObjectTypeSubtypeBMatchHandler)subtypeBMatchHandler;

      @end


      """
   And the file "project/values/SimpleADTMatcher.m" should contain:
      """
      #if  ! __has_feature(objc_arc)
      #error This file must be compiled with ARC. Use -fobjc-arc flag (or convert project to ARC).
      #endif

      #import "SimpleADTMatcher.h"

      @implementation SimpleADTMatcher

      + (id)match:(SimpleADT *)simpleADT subtypeA:(NS_NOESCAPE __unsafe_unretained SimpleADTObjectTypeSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(NS_NOESCAPE __unsafe_unretained SimpleADTObjectTypeSubtypeBMatchHandler)subtypeBMatchHandler
      {
        __block id result = nil;

        SimpleADTSubtypeAMatchHandler matchSubtypeA = ^(void) {
          result = subtypeAMatchHandler();
        };

        SimpleADTSubtypeBMatchHandler matchSubtypeB = ^(void) {
          result = subtypeBMatchHandler();
        };

        [simpleADT matchSubtypeA:matchSubtypeA subtypeB:matchSubtypeB];

        return result;
      }



      @end


      """
