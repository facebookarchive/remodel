# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Objects With Nullability Annotations

  @announce
  Scenario: Generating Value Objects with Nullability
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage {
        %nullable
        NSString *name
        %nonnull
        NSString *identifier
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

      @property (nonatomic, readonly, copy, nullable) NSString *name;
      @property (nonatomic, readonly, copy, nonnull) NSString *identifier;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithName:(nullable NSString *)name identifier:(nonnull NSString *)identifier NS_DESIGNATED_INITIALIZER;

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

      #define RMParameterAssert(condition) NSCParameterAssert((condition))

      @implementation RMPage

      - (instancetype)initWithName:(nullable NSString *)name identifier:(nonnull NSString *)identifier
      {
        RMParameterAssert(identifier != nil);
        if ((self = [super init])) {
          _name = [name copy];
          _identifier = [identifier copy];
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t name: %@; \n\t identifier: %@; \n", [super description], _name, _identifier];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {[_name hash], [_identifier hash]};
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

      - (BOOL)isEqual:(RMPage *)object
      {
        if (self == object) {
          return YES;
        } else if (object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          (_name == object->_name ? YES : [_name isEqual:object->_name]) &&
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]);
      }

      @end


      """
  @announce
  Scenario: Generating an algebraic type with nullability
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      SimpleADT {
        FirstSubtype {
          %nonnull
          NSString *firstValue
          NSUInteger secondValue
        }
        SomeRandomSubtype
        %nullable
        %singleAttributeSubtype attributeType="NSNumber*"
        someAttributeSubtype
        SecondSubtype {
          BOOL something
        }
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

      typedef void (^SimpleADTFirstSubtypeMatchHandler)(NSString *_Nonnull firstValue, NSUInteger secondValue);
      typedef void (^SimpleADTSomeRandomSubtypeMatchHandler)(void);
      typedef void (^SimpleADTSomeAttributeSubtypeMatchHandler)(NSNumber *_Nullable someAttributeSubtype);
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)firstSubtypeWithFirstValue:(nonnull NSString *)firstValue secondValue:(NSUInteger)secondValue;

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      + (instancetype)someAttributeSubtype:(nullable NSNumber *)someAttributeSubtype;

      + (instancetype)someRandomSubtype;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchFirstSubtype:(NS_NOESCAPE SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(NS_NOESCAPE SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler someAttributeSubtype:(NS_NOESCAPE SimpleADTSomeAttributeSubtypeMatchHandler)someAttributeSubtypeMatchHandler secondSubtype:(NS_NOESCAPE SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler NS_SWIFT_NAME(match(firstSubtype:someRandomSubtype:someAttributeSubtype:secondSubtype:));

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
        SimpleADTSubtypesFirstSubtype,
        SimpleADTSubtypesSomeRandomSubtype,
        SimpleADTSubtypesSomeAttributeSubtype,
        SimpleADTSubtypesSecondSubtype
      };

      #define RMParameterAssert(condition) NSCParameterAssert((condition))

      @implementation SimpleADT
      {
        SimpleADTSubtypes _subtype;
        NSString *_firstSubtype_firstValue;
        NSUInteger _firstSubtype_secondValue;
        NSNumber *_someAttributeSubtype;
        BOOL _secondSubtype_something;
      }

      + (instancetype)firstSubtypeWithFirstValue:(nonnull NSString *)firstValue secondValue:(NSUInteger)secondValue
      {
        RMParameterAssert(firstValue != nil);
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

      + (instancetype)someAttributeSubtype:(nullable NSNumber *)someAttributeSubtype
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesSomeAttributeSubtype;
        object->_someAttributeSubtype = someAttributeSubtype;
        return object;
      }

      + (instancetype)someRandomSubtype
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesSomeRandomSubtype;
        return object;
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
          case SimpleADTSubtypesSomeRandomSubtype: {
            return [NSString stringWithFormat:@"%@ - SomeRandomSubtype \n", [super description]];
            break;
          }
          case SimpleADTSubtypesSomeAttributeSubtype: {
            return [NSString stringWithFormat:@"%@ - \n\t someAttributeSubtype: %@; \n", [super description], _someAttributeSubtype];
            break;
          }
          case SimpleADTSubtypesSecondSubtype: {
            return [NSString stringWithFormat:@"%@ - SecondSubtype \n\t something: %@; \n", [super description], _secondSubtype_something ? @"YES" : @"NO"];
            break;
          }
        }
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {_subtype, [_firstSubtype_firstValue hash], _firstSubtype_secondValue, [_someAttributeSubtype hash], (NSUInteger)_secondSubtype_something};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 5; ++ii) {
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
          (_firstSubtype_firstValue == object->_firstSubtype_firstValue ? YES : [_firstSubtype_firstValue isEqual:object->_firstSubtype_firstValue]) &&
          (_someAttributeSubtype == object->_someAttributeSubtype ? YES : [_someAttributeSubtype isEqual:object->_someAttributeSubtype]);
      }

      - (void)matchFirstSubtype:(NS_NOESCAPE SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(NS_NOESCAPE SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler someAttributeSubtype:(NS_NOESCAPE SimpleADTSomeAttributeSubtypeMatchHandler)someAttributeSubtypeMatchHandler secondSubtype:(NS_NOESCAPE SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler
      {
        switch (_subtype) {
          case SimpleADTSubtypesFirstSubtype: {
            if (firstSubtypeMatchHandler) {
              firstSubtypeMatchHandler(_firstSubtype_firstValue, _firstSubtype_secondValue);
            }
            break;
          }
          case SimpleADTSubtypesSomeRandomSubtype: {
            if (someRandomSubtypeMatchHandler) {
              someRandomSubtypeMatchHandler();
            }
            break;
          }
          case SimpleADTSubtypesSomeAttributeSubtype: {
            if (someAttributeSubtypeMatchHandler) {
              someAttributeSubtypeMatchHandler(_someAttributeSubtype);
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
