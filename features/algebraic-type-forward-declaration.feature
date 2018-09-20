Feature: Outputting forward declarations in Algebraic Types

  @announce
  Scenario: Generating an algebraic type with forward declarations
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      %type name="SomeType"

      SimpleADT includes(UseForwardDeclarations) {
        FirstSubtype {
          %import library=RMLib
          RMProxy *firstValue
          NSUInteger secondValue
          NSArray<SomeType *> *thirdValue
        }
        SomeRandomSubtype
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
      #import <Foundation/Foundation.h>

      @class RMProxy;
      @class SomeType;

      typedef void (^SimpleADTFirstSubtypeMatchHandler)(RMProxy *firstValue, NSUInteger secondValue, NSArray<SomeType *> *thirdValue);
      typedef void (^SimpleADTSomeRandomSubtypeMatchHandler)(void);
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)firstSubtypeWithFirstValue:(RMProxy *)firstValue secondValue:(NSUInteger)secondValue thirdValue:(NSArray<SomeType *> *)thirdValue;

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      + (instancetype)someRandomSubtype;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchFirstSubtype:(SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler secondSubtype:(SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler NS_SWIFT_NAME(match(firstSubtype:someRandomSubtype:secondSubtype:));

      @end

      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      #import "SimpleADT.h"
      #import "SomeType.h"
      #import <RMLib/RMProxy.h>

      typedef NS_ENUM(NSUInteger, _SimpleADTSubtypes) {
        _SimpleADTSubtypesFirstSubtype,
        _SimpleADTSubtypesSomeRandomSubtype,
        _SimpleADTSubtypesSecondSubtype
      };

      @implementation SimpleADT
      {
        _SimpleADTSubtypes _subtype;
        RMProxy *_firstSubtype_firstValue;
        NSUInteger _firstSubtype_secondValue;
        NSArray<SomeType *> *_firstSubtype_thirdValue;
        BOOL _secondSubtype_something;
      }

      + (instancetype)firstSubtypeWithFirstValue:(RMProxy *)firstValue secondValue:(NSUInteger)secondValue thirdValue:(NSArray<SomeType *> *)thirdValue
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = _SimpleADTSubtypesFirstSubtype;
        object->_firstSubtype_firstValue = firstValue;
        object->_firstSubtype_secondValue = secondValue;
        object->_firstSubtype_thirdValue = thirdValue;
        return object;
      }

      + (instancetype)secondSubtypeWithSomething:(BOOL)something
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = _SimpleADTSubtypesSecondSubtype;
        object->_secondSubtype_something = something;
        return object;
      }

      + (instancetype)someRandomSubtype
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = _SimpleADTSubtypesSomeRandomSubtype;
        return object;
      }
      """


  @announce
  Scenario: Generating an algebraic type containing an enum with forward declarations
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      %type name=MyEnum library=SomeLibrary canForwardDeclare=false
      SimpleADT includes(UseForwardDeclarations) {
        FirstSubtype {
          %import library=RMLib
          RMProxy *firstValue
          MyEnum(NSUInteger) secondValue
        }
        SomeRandomSubtype
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
      #import <Foundation/Foundation.h>
      #import <SomeLibrary/MyEnum.h>

      @class RMProxy;

      typedef void (^SimpleADTFirstSubtypeMatchHandler)(RMProxy *firstValue, MyEnum secondValue);
      typedef void (^SimpleADTSomeRandomSubtypeMatchHandler)(void);
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)firstSubtypeWithFirstValue:(RMProxy *)firstValue secondValue:(MyEnum)secondValue;

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      + (instancetype)someRandomSubtype;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchFirstSubtype:(SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler secondSubtype:(SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler NS_SWIFT_NAME(match(firstSubtype:someRandomSubtype:secondSubtype:));

      @end

      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      #import "SimpleADT.h"
      #import <RMLib/RMProxy.h>

      typedef NS_ENUM(NSUInteger, _SimpleADTSubtypes) {
        _SimpleADTSubtypesFirstSubtype,
        _SimpleADTSubtypesSomeRandomSubtype,
        _SimpleADTSubtypesSecondSubtype
      };

      @implementation SimpleADT
      {
        _SimpleADTSubtypes _subtype;
        RMProxy *_firstSubtype_firstValue;
        MyEnum _firstSubtype_secondValue;
        BOOL _secondSubtype_something;
      }

      + (instancetype)firstSubtypeWithFirstValue:(RMProxy *)firstValue secondValue:(MyEnum)secondValue
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = _SimpleADTSubtypesFirstSubtype;
        object->_firstSubtype_firstValue = firstValue;
        object->_firstSubtype_secondValue = secondValue;
        return object;
      }

      + (instancetype)secondSubtypeWithSomething:(BOOL)something
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = _SimpleADTSubtypesSecondSubtype;
        object->_secondSubtype_something = something;
        return object;
      }

      + (instancetype)someRandomSubtype
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = _SimpleADTSubtypesSomeRandomSubtype;
        return object;
      }
      """
