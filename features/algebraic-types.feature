Feature: Outputting Algebraic Types

  @announce
  Scenario: Generating an algebraic type containing values in each subtype and comments
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      # What a beautiful ADT
      %library name=MyLib
      %type name=RMSomeObject library=SomeLib file=AnotherFile
      %type name=RMFooObject
      %type name=RMSomeEnum canForwardDeclare=false
      # What is not to love?!
      SimpleADT {
        # Really good type,
        # always use this
        FirstSubtype {
          NSString *firstValue
          NSUInteger secondValue
        }
        # This is a strange one
        SomeRandomSubtype
        %singleAttributeSubtype attributeType="NSUInteger"
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
      #import <Foundation/Foundation.h>
      #import <SomeLib/AnotherFile.h>
      #import <MyLib/RMFooObject.h>
      #import <MyLib/RMSomeEnum.h>

      typedef void (^SimpleADTFirstSubtypeMatchHandler)(NSString *firstValue, NSUInteger secondValue);
      typedef void (^SimpleADTSomeRandomSubtypeMatchHandler)(void);
      typedef void (^SimpleADTSomeAttributeSubtypeMatchHandler)(NSUInteger someAttributeSubtype);
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      /**
       * What a beautiful ADT
       * What is not to love?!
       */
      @interface SimpleADT : NSObject <NSCopying>

      /**
       * Really good type,
       * always use this
       */
      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue;
      
      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      + (instancetype)someAttributeSubtype:(NSUInteger)someAttributeSubtype;

      /**
       * This is a strange one
       */
      + (instancetype)someRandomSubtype;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchFirstSubtype:(NS_NOESCAPE SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(NS_NOESCAPE SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler someAttributeSubtype:(NS_NOESCAPE SimpleADTSomeAttributeSubtypeMatchHandler)someAttributeSubtypeMatchHandler secondSubtype:(NS_NOESCAPE SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler NS_SWIFT_NAME(match(firstSubtype:someRandomSubtype:someAttributeSubtype:secondSubtype:));

      @end

      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      #import "SimpleADT.h"

      typedef NS_ENUM(NSUInteger, _SimpleADTSubtypes) {
        _SimpleADTSubtypesFirstSubtype,
        _SimpleADTSubtypesSomeRandomSubtype,
        _SimpleADTSubtypesSomeAttributeSubtype,
        _SimpleADTSubtypesSecondSubtype
      };

      @implementation SimpleADT
      {
        _SimpleADTSubtypes _subtype;
        NSString *_firstSubtype_firstValue;
        NSUInteger _firstSubtype_secondValue;
        NSUInteger _someAttributeSubtype;
        BOOL _secondSubtype_something;
      }

      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue
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

      + (instancetype)someAttributeSubtype:(NSUInteger)someAttributeSubtype
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = _SimpleADTSubtypesSomeAttributeSubtype;
        object->_someAttributeSubtype = someAttributeSubtype;
        return object;
      }

      + (instancetype)someRandomSubtype
      {
        SimpleADT *object = [(id)self new];
        object->_subtype = _SimpleADTSubtypesSomeRandomSubtype;
        return object;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            return [NSString stringWithFormat:@"%@ - FirstSubtype \n\t firstValue: %@; \n\t secondValue: %llu; \n", [super description], _firstSubtype_firstValue, (unsigned long long)_firstSubtype_secondValue];
            break;
          }
          case _SimpleADTSubtypesSomeRandomSubtype: {
            return [NSString stringWithFormat:@"%@ - SomeRandomSubtype \n", [super description]];
            break;
          }
          case _SimpleADTSubtypesSomeAttributeSubtype: {
            return [NSString stringWithFormat:@"%@ - \n\t someAttributeSubtype: %llu; \n", [super description], (unsigned long long)_someAttributeSubtype];
            break;
          }
          case _SimpleADTSubtypesSecondSubtype: {
            return [NSString stringWithFormat:@"%@ - SecondSubtype \n\t something: %@; \n", [super description], _secondSubtype_something ? @"YES" : @"NO"];
            break;
          }
        }
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {_subtype, [_firstSubtype_firstValue hash], _firstSubtype_secondValue, _someAttributeSubtype, (NSUInteger)_secondSubtype_something};
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
          _someAttributeSubtype == object->_someAttributeSubtype &&
          _secondSubtype_something == object->_secondSubtype_something &&
          (_firstSubtype_firstValue == object->_firstSubtype_firstValue ? YES : [_firstSubtype_firstValue isEqual:object->_firstSubtype_firstValue]);
      }

      - (void)matchFirstSubtype:(NS_NOESCAPE SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(NS_NOESCAPE SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler someAttributeSubtype:(NS_NOESCAPE SimpleADTSomeAttributeSubtypeMatchHandler)someAttributeSubtypeMatchHandler secondSubtype:(NS_NOESCAPE SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            if (firstSubtypeMatchHandler) {
              firstSubtypeMatchHandler(_firstSubtype_firstValue, _firstSubtype_secondValue);
            }
            break;
          }
          case _SimpleADTSubtypesSomeRandomSubtype: {
            if (someRandomSubtypeMatchHandler) {
              someRandomSubtypeMatchHandler();
            }
            break;
          }
          case _SimpleADTSubtypesSomeAttributeSubtype: {
            if (someAttributeSubtypeMatchHandler) {
              someAttributeSubtypeMatchHandler(_someAttributeSubtype);
            }
            break;
          }
          case _SimpleADTSubtypesSecondSubtype: {
            if (secondSubtypeMatchHandler) {
              secondSubtypeMatchHandler(_secondSubtype_something);
            }
            break;
          }
        }
      }

      @end

      """
  @announce
  Scenario: Generating an algebraic type containing values in each subtype and a different base type
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
        "customBaseClass": { "className": "NSProxy"},
        "diagnosticIgnores": ["-Wprotocol"],
        "defaultExcludes": [
          "RMCoding"
         ]
      }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/SimpleADT.h" should contain:
      """
      #import <Foundation/Foundation.h>

      typedef void (^SimpleADTFirstSubtypeMatchHandler)(NSString *firstValue, NSUInteger secondValue);
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      @interface SimpleADT : NSProxy <NSCopying>

      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue;

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchFirstSubtype:(NS_NOESCAPE SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler secondSubtype:(NS_NOESCAPE SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler NS_SWIFT_NAME(match(firstSubtype:secondSubtype:));

      @end

      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      #import "SimpleADT.h"

      #pragma clang diagnostic push
      #pragma GCC diagnostic ignored "-Wprotocol"

      typedef NS_ENUM(NSUInteger, _SimpleADTSubtypes) {
        _SimpleADTSubtypesFirstSubtype,
        _SimpleADTSubtypesSecondSubtype
      };

      @implementation SimpleADT
      {
        _SimpleADTSubtypes _subtype;
        NSString *_firstSubtype_firstValue;
        NSUInteger _firstSubtype_secondValue;
        BOOL _secondSubtype_something;
      }

      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue
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

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            return [NSString stringWithFormat:@"%@ - FirstSubtype \n\t firstValue: %@; \n\t secondValue: %llu; \n", [super description], _firstSubtype_firstValue, (unsigned long long)_firstSubtype_secondValue];
            break;
          }
          case _SimpleADTSubtypesSecondSubtype: {
            return [NSString stringWithFormat:@"%@ - SecondSubtype \n\t something: %@; \n", [super description], _secondSubtype_something ? @"YES" : @"NO"];
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

      - (void)matchFirstSubtype:(NS_NOESCAPE SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler secondSubtype:(NS_NOESCAPE SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            if (firstSubtypeMatchHandler) {
              firstSubtypeMatchHandler(_firstSubtype_firstValue, _firstSubtype_secondValue);
            }
            break;
          }
          case _SimpleADTSubtypesSecondSubtype: {
            if (secondSubtypeMatchHandler) {
              secondSubtypeMatchHandler(_secondSubtype_something);
            }
            break;
          }
        }
      }

      @end
      #pragma clang diagnostic pop

      """
  @announce
  Scenario: Generating an algebraic type with forward declarations
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      SimpleADT includes(UseForwardDeclarations) {
        FirstSubtype {
          Foo *firstValue
          NSUInteger secondValue
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

      @class Foo;

      typedef void (^SimpleADTFirstSubtypeMatchHandler)(Foo *firstValue, NSUInteger secondValue);
      typedef void (^SimpleADTSomeRandomSubtypeMatchHandler)(void);
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)firstSubtypeWithFirstValue:(Foo *)firstValue secondValue:(NSUInteger)secondValue;

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      + (instancetype)someRandomSubtype;

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchFirstSubtype:(NS_NOESCAPE SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(NS_NOESCAPE SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler secondSubtype:(NS_NOESCAPE SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler NS_SWIFT_NAME(match(firstSubtype:someRandomSubtype:secondSubtype:));

      @end

      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      #import "SimpleADT.h"
      #import "Foo.h"

      typedef NS_ENUM(NSUInteger, _SimpleADTSubtypes) {
        _SimpleADTSubtypesFirstSubtype,
        _SimpleADTSubtypesSomeRandomSubtype,
        _SimpleADTSubtypesSecondSubtype
      };

      @implementation SimpleADT
      {
        _SimpleADTSubtypes _subtype;
        Foo *_firstSubtype_firstValue;
        NSUInteger _firstSubtype_secondValue;
        BOOL _secondSubtype_something;
      }

      + (instancetype)firstSubtypeWithFirstValue:(Foo *)firstValue secondValue:(NSUInteger)secondValue
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

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            return [NSString stringWithFormat:@"%@ - FirstSubtype \n\t firstValue: %@; \n\t secondValue: %llu; \n", [super description], _firstSubtype_firstValue, (unsigned long long)_firstSubtype_secondValue];
            break;
          }
          case _SimpleADTSubtypesSomeRandomSubtype: {
            return [NSString stringWithFormat:@"%@ - SomeRandomSubtype \n", [super description]];
            break;
          }
          case _SimpleADTSubtypesSecondSubtype: {
            return [NSString stringWithFormat:@"%@ - SecondSubtype \n\t something: %@; \n", [super description], _secondSubtype_something ? @"YES" : @"NO"];
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

      - (void)matchFirstSubtype:(NS_NOESCAPE SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(NS_NOESCAPE SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler secondSubtype:(NS_NOESCAPE SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            if (firstSubtypeMatchHandler) {
              firstSubtypeMatchHandler(_firstSubtype_firstValue, _firstSubtype_secondValue);
            }
            break;
          }
          case _SimpleADTSubtypesSomeRandomSubtype: {
            if (someRandomSubtypeMatchHandler) {
              someRandomSubtypeMatchHandler();
            }
            break;
          }
          case _SimpleADTSubtypesSecondSubtype: {
            if (secondSubtypeMatchHandler) {
              secondSubtypeMatchHandler(_secondSubtype_something);
            }
            break;
          }
        }
      }

      @end

      """
