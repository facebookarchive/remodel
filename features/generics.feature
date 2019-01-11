# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Objects With Generic Types

  @announce
  Scenario: Generating Value Objects with generics
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage {
        NSDictionary<NSString *, NSNumber *> *namesToAges
        NSDictionary<NSString *, NSArray<NSNumber *> *> *namesToInventory
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

      @property (nonatomic, readonly, copy) NSDictionary<NSString *, NSNumber *> *namesToAges;
      @property (nonatomic, readonly, copy) NSDictionary<NSString *, NSArray<NSNumber *> *> *namesToInventory;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithNamesToAges:(NSDictionary<NSString *, NSNumber *> *)namesToAges namesToInventory:(NSDictionary<NSString *, NSArray<NSNumber *> *> *)namesToInventory NS_DESIGNATED_INITIALIZER;

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

      - (instancetype)initWithNamesToAges:(NSDictionary<NSString *, NSNumber *> *)namesToAges namesToInventory:(NSDictionary<NSString *, NSArray<NSNumber *> *> *)namesToInventory
      {
        if ((self = [super init])) {
          _namesToAges = [namesToAges copy];
          _namesToInventory = [namesToInventory copy];
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t namesToAges: %@; \n\t namesToInventory: %@; \n", [super description], _namesToAges, _namesToInventory];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {[_namesToAges hash], [_namesToInventory hash]};
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
          (_namesToAges == object->_namesToAges ? YES : [_namesToAges isEqual:object->_namesToAges]) &&
          (_namesToInventory == object->_namesToInventory ? YES : [_namesToInventory isEqual:object->_namesToInventory]);
      }

      @end

      """
  @announce
  Scenario: Generating an algebraic type with generics
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      SimpleADT {
        FirstSubtype {
          NSDictionary<NSString *, NSNumber *> *namesToAges
          NSDictionary<NSString *, NSArray<NSNumber *> *> *namesToInventory
        }
        %singleAttributeSubtype attributeType="NSDictionary<NSString *, NSString *> *"
        namesToAgesSingleAttribute
        %singleAttributeSubtype attributeType="NSDictionary<NSString *, NSArray<NSNumber *> *> *"
        namesToInventorySingleAttribute
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

      typedef void (^SimpleADTFirstSubtypeMatchHandler)(NSDictionary<NSString *, NSNumber *> *namesToAges, NSDictionary<NSString *, NSArray<NSNumber *> *> *namesToInventory);
      typedef void (^SimpleADTNamesToAgesSingleAttributeMatchHandler)(NSDictionary<NSString *, NSString *> *namesToAgesSingleAttribute);
      typedef void (^SimpleADTNamesToInventorySingleAttributeMatchHandler)(NSDictionary<NSString *, NSArray<NSNumber *> *> *namesToInventorySingleAttribute);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)firstSubtypeWithNamesToAges:(NSDictionary<NSString *, NSNumber *> *)namesToAges namesToInventory:(NSDictionary<NSString *, NSArray<NSNumber *> *> *)namesToInventory;

      + (instancetype)namesToAgesSingleAttribute:(NSDictionary<NSString *, NSString *> *)namesToAgesSingleAttribute;

      + (instancetype)namesToInventorySingleAttribute:(NSDictionary<NSString *, NSArray<NSNumber *> *> *)namesToInventorySingleAttribute;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchFirstSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler namesToAgesSingleAttribute:(NS_NOESCAPE __unsafe_unretained SimpleADTNamesToAgesSingleAttributeMatchHandler)namesToAgesSingleAttributeMatchHandler namesToInventorySingleAttribute:(NS_NOESCAPE __unsafe_unretained SimpleADTNamesToInventorySingleAttributeMatchHandler)namesToInventorySingleAttributeMatchHandler NS_SWIFT_NAME(match(firstSubtype:namesToAgesSingleAttribute:namesToInventorySingleAttribute:));

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
        SimpleADTSubtypesNamesToAgesSingleAttribute,
        SimpleADTSubtypesNamesToInventorySingleAttribute
      };

      @implementation SimpleADT
      {
        SimpleADTSubtypes _subtype;
        NSDictionary<NSString *, NSNumber *> *_firstSubtype_namesToAges;
        NSDictionary<NSString *, NSArray<NSNumber *> *> *_firstSubtype_namesToInventory;
        NSDictionary<NSString *, NSString *> *_namesToAgesSingleAttribute;
        NSDictionary<NSString *, NSArray<NSNumber *> *> *_namesToInventorySingleAttribute;
      }

      + (instancetype)firstSubtypeWithNamesToAges:(NSDictionary<NSString *, NSNumber *> *)namesToAges namesToInventory:(NSDictionary<NSString *, NSArray<NSNumber *> *> *)namesToInventory
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesFirstSubtype;
        object->_firstSubtype_namesToAges = namesToAges;
        object->_firstSubtype_namesToInventory = namesToInventory;
        return object;
      }

      + (instancetype)namesToAgesSingleAttribute:(NSDictionary<NSString *, NSString *> *)namesToAgesSingleAttribute
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesNamesToAgesSingleAttribute;
        object->_namesToAgesSingleAttribute = namesToAgesSingleAttribute;
        return object;
      }

      + (instancetype)namesToInventorySingleAttribute:(NSDictionary<NSString *, NSArray<NSNumber *> *> *)namesToInventorySingleAttribute
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = SimpleADTSubtypesNamesToInventorySingleAttribute;
        object->_namesToInventorySingleAttribute = namesToInventorySingleAttribute;
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
            return [NSString stringWithFormat:@"%@ - FirstSubtype \n\t namesToAges: %@; \n\t namesToInventory: %@; \n", [super description], _firstSubtype_namesToAges, _firstSubtype_namesToInventory];
            break;
          }
          case SimpleADTSubtypesNamesToAgesSingleAttribute: {
            return [NSString stringWithFormat:@"%@ - \n\t namesToAgesSingleAttribute: %@; \n", [super description], _namesToAgesSingleAttribute];
            break;
          }
          case SimpleADTSubtypesNamesToInventorySingleAttribute: {
            return [NSString stringWithFormat:@"%@ - \n\t namesToInventorySingleAttribute: %@; \n", [super description], _namesToInventorySingleAttribute];
            break;
          }
        }
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {_subtype, [_firstSubtype_namesToAges hash], [_firstSubtype_namesToInventory hash], [_namesToAgesSingleAttribute hash], [_namesToInventorySingleAttribute hash]};
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
          (_firstSubtype_namesToAges == object->_firstSubtype_namesToAges ? YES : [_firstSubtype_namesToAges isEqual:object->_firstSubtype_namesToAges]) &&
          (_firstSubtype_namesToInventory == object->_firstSubtype_namesToInventory ? YES : [_firstSubtype_namesToInventory isEqual:object->_firstSubtype_namesToInventory]) &&
          (_namesToAgesSingleAttribute == object->_namesToAgesSingleAttribute ? YES : [_namesToAgesSingleAttribute isEqual:object->_namesToAgesSingleAttribute]) &&
          (_namesToInventorySingleAttribute == object->_namesToInventorySingleAttribute ? YES : [_namesToInventorySingleAttribute isEqual:object->_namesToInventorySingleAttribute]);
      }

      - (void)matchFirstSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler namesToAgesSingleAttribute:(NS_NOESCAPE __unsafe_unretained SimpleADTNamesToAgesSingleAttributeMatchHandler)namesToAgesSingleAttributeMatchHandler namesToInventorySingleAttribute:(NS_NOESCAPE __unsafe_unretained SimpleADTNamesToInventorySingleAttributeMatchHandler)namesToInventorySingleAttributeMatchHandler
      {
        switch (_subtype) {
          case SimpleADTSubtypesFirstSubtype: {
            if (firstSubtypeMatchHandler) {
              firstSubtypeMatchHandler(_firstSubtype_namesToAges, _firstSubtype_namesToInventory);
            }
            break;
          }
          case SimpleADTSubtypesNamesToAgesSingleAttribute: {
            if (namesToAgesSingleAttributeMatchHandler) {
              namesToAgesSingleAttributeMatchHandler(_namesToAgesSingleAttribute);
            }
            break;
          }
          case SimpleADTSubtypesNamesToInventorySingleAttribute: {
            if (namesToInventorySingleAttributeMatchHandler) {
              namesToInventorySingleAttributeMatchHandler(_namesToInventorySingleAttribute);
            }
            break;
          }
        }
      }

      @end

      """
