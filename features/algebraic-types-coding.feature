# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Algebraic Types

  @announce
  Scenario: Generating an algebraic type with coding
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      SimpleADT {
        FirstSubtype {
          NSString *firstValue
          NSUInteger secondValue
        }
        SecondSubtype {
          BOOL something
        }
      }
      """
    And a file named "project/.algebraicTypeConfig" with:
      """
      {
        "defaultIncludes": [
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

      typedef void (^SimpleADTFirstSubtypeMatchHandler)(NSString *firstValue, NSUInteger secondValue);
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      @interface SimpleADT : NSObject <NSCopying, NSCoding>

      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue;

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchFirstSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler secondSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler NS_SWIFT_NAME(match(firstSubtype:secondSubtype:));

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

      static __unsafe_unretained NSString * const kCodedSubtypeKey = @"CODED_SUBTYPE";
      static __unsafe_unretained NSString * const kFirstSubtypeFirstValueKey = @"FIRST_SUBTYPE_FIRST_VALUE";
      static __unsafe_unretained NSString * const kFirstSubtypeSecondValueKey = @"FIRST_SUBTYPE_SECOND_VALUE";
      static __unsafe_unretained NSString * const kSecondSubtypeSomethingKey = @"SECOND_SUBTYPE_SOMETHING";

      typedef NS_ENUM(NSUInteger, SimpleADTSubtypes) {
        SimpleADTSubtypesFirstSubtype,
        SimpleADTSubtypesSecondSubtype
      };

      @implementation SimpleADT
      {
        SimpleADTSubtypes _subtype;
        NSString *_firstSubtype_firstValue;
        NSUInteger _firstSubtype_secondValue;
        BOOL _secondSubtype_something;
      }

      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesFirstSubtype;
        object->_firstSubtype_firstValue = firstValue;
        object->_firstSubtype_secondValue = secondValue;
        return object;
      }

      + (instancetype)secondSubtypeWithSomething:(BOOL)something
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesSecondSubtype;
        object->_secondSubtype_something = something;
        return object;
      }

      - (nullable instancetype)initWithCoder:(NSCoder *)aDecoder
      {
        if ((self = [super init])) {
          NSString *codedSubtype = [aDecoder decodeObjectForKey:kCodedSubtypeKey];
          if([codedSubtype isEqualToString:@"SUBTYPE_FIRST_SUBTYPE"]) {
            _firstSubtype_firstValue = (id)[aDecoder decodeObjectForKey:kFirstSubtypeFirstValueKey];
            _firstSubtype_secondValue = [aDecoder decodeIntegerForKey:kFirstSubtypeSecondValueKey];
            _subtype = SimpleADTSubtypesFirstSubtype;
          }
          else if([codedSubtype isEqualToString:@"SUBTYPE_SECOND_SUBTYPE"]) {
            _secondSubtype_something = [aDecoder decodeBoolForKey:kSecondSubtypeSomethingKey];
            _subtype = SimpleADTSubtypesSecondSubtype;
          }
          else {
            [[NSException exceptionWithName:@"InvalidSubtypeException" reason:@"nil or unknown subtype provided" userInfo:@{@"subtype": codedSubtype}] raise];
          }
        }
        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case SimpleADTSubtypesFirstSubtype: {
            return [NSString stringWithFormat:@"%@ - FirstSubtype \n\t firstValue: %@; \n\t secondValue: %llu; \n", [super description], _firstSubtype_firstValue, (unsigned long long)_firstSubtype_secondValue];
            break;
          }
          case SimpleADTSubtypesSecondSubtype: {
            return [NSString stringWithFormat:@"%@ - SecondSubtype \n\t something: %@; \n", [super description], _secondSubtype_something ? @"YES" : @"NO"];
            break;
          }
        }
      }

      - (void)encodeWithCoder:(NSCoder *)aCoder
      {
        switch (_subtype) {
          case SimpleADTSubtypesFirstSubtype: {
            [aCoder encodeObject:_firstSubtype_firstValue forKey:kFirstSubtypeFirstValueKey];
            [aCoder encodeInteger:_firstSubtype_secondValue forKey:kFirstSubtypeSecondValueKey];
            [aCoder encodeObject:@"SUBTYPE_FIRST_SUBTYPE" forKey:kCodedSubtypeKey];
            break;
          }
          case SimpleADTSubtypesSecondSubtype: {
            [aCoder encodeBool:_secondSubtype_something forKey:kSecondSubtypeSomethingKey];
            [aCoder encodeObject:@"SUBTYPE_SECOND_SUBTYPE" forKey:kCodedSubtypeKey];
            break;
          }
        }
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {_subtype, [_firstSubtype_firstValue hash], _firstSubtype_secondValue, (NSUInteger)_secondSubtype_something};
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

      - (BOOL)isEqual:(SimpleADT *)object
      {
        if (self == object) {
          return YES;
        } else if (object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _subtype == object->_subtype &&
          _firstSubtype_secondValue == object->_firstSubtype_secondValue &&
          _secondSubtype_something == object->_secondSubtype_something &&
          (_firstSubtype_firstValue == object->_firstSubtype_firstValue ? YES : [_firstSubtype_firstValue isEqual:object->_firstSubtype_firstValue]);
      }

      - (void)matchFirstSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler secondSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler
      {
        switch (_subtype) {
          case SimpleADTSubtypesFirstSubtype: {
            if (firstSubtypeMatchHandler) {
              firstSubtypeMatchHandler(_firstSubtype_firstValue, _firstSubtype_secondValue);
            }
            break;
          }
          case SimpleADTSubtypesSecondSubtype: {
            if (secondSubtypeMatchHandler) {
              secondSubtypeMatchHandler(_secondSubtype_something);
            }
            break;
          }
        }
      }

      @end

      """
