Feature: Outputting Algebraic Types

  @announce
  Scenario: Generating an algebraic type containing values in each subtype
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      %library name=MyLib
      %type name=RMSomeObject library=SomeLib file=AnotherFile
      %type name=RMFooObject
      %type name=RMSomeEnum canForwardDeclare=false
      SimpleADT {
        FirstSubtype {
          NSString *firstValue
          NSUInteger secondValue
        }
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
      typedef void (^SimpleADTSomeRandomSubtypeMatchHandler)();
      typedef void (^SimpleADTSomeAttributeSubtypeMatchHandler)(NSUInteger someAttributeSubtype);
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)firstSubtypeWithFirstValue:(NSString *)firstValue secondValue:(NSUInteger)secondValue;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      + (instancetype)someAttributeSubtype:(NSUInteger)someAttributeSubtype;

      + (instancetype)someRandomSubtype;

      - (void)matchFirstSubtype:(SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler someAttributeSubtype:(SimpleADTSomeAttributeSubtypeMatchHandler)someAttributeSubtypeMatchHandler secondSubtype:(SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler;

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
        SimpleADT *object = [[SimpleADT alloc] init];
        object->_subtype = _SimpleADTSubtypesFirstSubtype;
        object->_firstSubtype_firstValue = firstValue;
        object->_firstSubtype_secondValue = secondValue;
        return object;
      }

      + (instancetype)secondSubtypeWithSomething:(BOOL)something
      {
        SimpleADT *object = [[SimpleADT alloc] init];
        object->_subtype = _SimpleADTSubtypesSecondSubtype;
        object->_secondSubtype_something = something;
        return object;
      }

      + (instancetype)someAttributeSubtype:(NSUInteger)someAttributeSubtype
      {
        SimpleADT *object = [[SimpleADT alloc] init];
        object->_subtype = _SimpleADTSubtypesSomeAttributeSubtype;
        object->_someAttributeSubtype = someAttributeSubtype;
        return object;
      }

      + (instancetype)someRandomSubtype
      {
        SimpleADT *object = [[SimpleADT alloc] init];
        object->_subtype = _SimpleADTSubtypesSomeRandomSubtype;
        return object;
      }

      - (id)copyWithZone:(NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            return [NSString stringWithFormat:@"%@ - FirstSubtype \n\t firstValue: %@; \n\t secondValue: %tu; \n", [super description], _firstSubtype_firstValue, _firstSubtype_secondValue];
            break;
          }
          case _SimpleADTSubtypesSomeRandomSubtype: {
            return [NSString stringWithFormat:@"%@ - SomeRandomSubtype \n", [super description]];
            break;
          }
          case _SimpleADTSubtypesSomeAttributeSubtype: {
            return [NSString stringWithFormat:@"%@ - \n\t someAttributeSubtype: %tu; \n", [super description], _someAttributeSubtype];
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
        } else if (self == nil || object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _subtype == object->_subtype &&
          _firstSubtype_secondValue == object->_firstSubtype_secondValue &&
          _someAttributeSubtype == object->_someAttributeSubtype &&
          _secondSubtype_something == object->_secondSubtype_something &&
          (_firstSubtype_firstValue == object->_firstSubtype_firstValue ? YES : [_firstSubtype_firstValue isEqual:object->_firstSubtype_firstValue]);
      }

      - (void)matchFirstSubtype:(SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler someAttributeSubtype:(SimpleADTSomeAttributeSubtypeMatchHandler)someAttributeSubtypeMatchHandler secondSubtype:(SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            firstSubtypeMatchHandler(_firstSubtype_firstValue, _firstSubtype_secondValue);
            break;
          }
          case _SimpleADTSubtypesSomeRandomSubtype: {
            someRandomSubtypeMatchHandler();
            break;
          }
          case _SimpleADTSubtypesSomeAttributeSubtype: {
            someAttributeSubtypeMatchHandler(_someAttributeSubtype);
            break;
          }
          case _SimpleADTSubtypesSecondSubtype: {
            secondSubtypeMatchHandler(_secondSubtype_something);
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

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      - (void)matchFirstSubtype:(SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler secondSubtype:(SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler;

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
        SimpleADT *object = [[SimpleADT alloc] init];
        object->_subtype = _SimpleADTSubtypesFirstSubtype;
        object->_firstSubtype_firstValue = firstValue;
        object->_firstSubtype_secondValue = secondValue;
        return object;
      }

      + (instancetype)secondSubtypeWithSomething:(BOOL)something
      {
        SimpleADT *object = [[SimpleADT alloc] init];
        object->_subtype = _SimpleADTSubtypesSecondSubtype;
        object->_secondSubtype_something = something;
        return object;
      }

      - (id)copyWithZone:(NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            return [NSString stringWithFormat:@"%@ - FirstSubtype \n\t firstValue: %@; \n\t secondValue: %tu; \n", [super description], _firstSubtype_firstValue, _firstSubtype_secondValue];
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
        } else if (self == nil || object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _subtype == object->_subtype &&
          _firstSubtype_secondValue == object->_firstSubtype_secondValue &&
          _secondSubtype_something == object->_secondSubtype_something &&
          (_firstSubtype_firstValue == object->_firstSubtype_firstValue ? YES : [_firstSubtype_firstValue isEqual:object->_firstSubtype_firstValue]);
      }

      - (void)matchFirstSubtype:(SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler secondSubtype:(SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            firstSubtypeMatchHandler(_firstSubtype_firstValue, _firstSubtype_secondValue);
            break;
          }
          case _SimpleADTSubtypesSecondSubtype: {
            secondSubtypeMatchHandler(_secondSubtype_something);
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
      typedef void (^SimpleADTSomeRandomSubtypeMatchHandler)();
      typedef void (^SimpleADTSecondSubtypeMatchHandler)(BOOL something);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)firstSubtypeWithFirstValue:(Foo *)firstValue secondValue:(NSUInteger)secondValue;

      + (instancetype)secondSubtypeWithSomething:(BOOL)something;

      + (instancetype)someRandomSubtype;

      - (void)matchFirstSubtype:(SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler secondSubtype:(SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler;

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
        SimpleADT *object = [[SimpleADT alloc] init];
        object->_subtype = _SimpleADTSubtypesFirstSubtype;
        object->_firstSubtype_firstValue = firstValue;
        object->_firstSubtype_secondValue = secondValue;
        return object;
      }

      + (instancetype)secondSubtypeWithSomething:(BOOL)something
      {
        SimpleADT *object = [[SimpleADT alloc] init];
        object->_subtype = _SimpleADTSubtypesSecondSubtype;
        object->_secondSubtype_something = something;
        return object;
      }

      + (instancetype)someRandomSubtype
      {
        SimpleADT *object = [[SimpleADT alloc] init];
        object->_subtype = _SimpleADTSubtypesSomeRandomSubtype;
        return object;
      }

      - (id)copyWithZone:(NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            return [NSString stringWithFormat:@"%@ - FirstSubtype \n\t firstValue: %@; \n\t secondValue: %tu; \n", [super description], _firstSubtype_firstValue, _firstSubtype_secondValue];
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
        } else if (self == nil || object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _subtype == object->_subtype &&
          _firstSubtype_secondValue == object->_firstSubtype_secondValue &&
          _secondSubtype_something == object->_secondSubtype_something &&
          (_firstSubtype_firstValue == object->_firstSubtype_firstValue ? YES : [_firstSubtype_firstValue isEqual:object->_firstSubtype_firstValue]);
      }

      - (void)matchFirstSubtype:(SimpleADTFirstSubtypeMatchHandler)firstSubtypeMatchHandler someRandomSubtype:(SimpleADTSomeRandomSubtypeMatchHandler)someRandomSubtypeMatchHandler secondSubtype:(SimpleADTSecondSubtypeMatchHandler)secondSubtypeMatchHandler
      {
        switch (_subtype) {
          case _SimpleADTSubtypesFirstSubtype: {
            firstSubtypeMatchHandler(_firstSubtype_firstValue, _firstSubtype_secondValue);
            break;
          }
          case _SimpleADTSubtypesSomeRandomSubtype: {
            someRandomSubtypeMatchHandler();
            break;
          }
          case _SimpleADTSubtypesSecondSubtype: {
            secondSubtypeMatchHandler(_secondSubtype_something);
            break;
          }
        }
      }

      @end

      """
