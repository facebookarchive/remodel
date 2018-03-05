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
      #import <Foundation/Foundation.h>

      typedef BOOL (^SimpleADTBooleanSubtypeAMatchHandler)(void);
      typedef BOOL (^SimpleADTBooleanSubtypeBMatchHandler)(void);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)subtypeA;

      + (instancetype)subtypeB;

      - (instancetype)init NS_UNAVAILABLE;

      - (BOOL)matchBooleanSubtypeA:(SimpleADTBooleanSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(SimpleADTBooleanSubtypeBMatchHandler)subtypeBMatchHandler;

      @end
      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      - (BOOL)matchBooleanSubtypeA:(SimpleADTBooleanSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(SimpleADTBooleanSubtypeBMatchHandler)subtypeBMatchHandler
      {
        __block BOOL result = NO;
        switch (_subtype) {
          case _SimpleADTSubtypessubtypeA: {
            if (subtypeAMatchHandler) {
              result = subtypeAMatchHandler();
            }
            break;
          }
          case _SimpleADTSubtypessubtypeB: {
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
      #import <Foundation/Foundation.h>

      typedef NSInteger (^SimpleADTIntegerSubtypeAMatchHandler)(void);
      typedef NSInteger (^SimpleADTIntegerSubtypeBMatchHandler)(void);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)subtypeA;

      + (instancetype)subtypeB;

      - (instancetype)init NS_UNAVAILABLE;

      - (NSInteger)matchIntegerSubtypeA:(SimpleADTIntegerSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(SimpleADTIntegerSubtypeBMatchHandler)subtypeBMatchHandler;

      @end
      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      - (NSInteger)matchIntegerSubtypeA:(SimpleADTIntegerSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(SimpleADTIntegerSubtypeBMatchHandler)subtypeBMatchHandler
      {
        __block NSInteger result = 0;
        switch (_subtype) {
          case _SimpleADTSubtypessubtypeA: {
            if (subtypeAMatchHandler) {
              result = subtypeAMatchHandler();
            }
            break;
          }
          case _SimpleADTSubtypessubtypeB: {
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
      #import <Foundation/Foundation.h>

      typedef double (^SimpleADTDoubleSubtypeAMatchHandler)(void);
      typedef double (^SimpleADTDoubleSubtypeBMatchHandler)(void);

      @interface SimpleADT : NSObject <NSCopying>

      + (instancetype)new NS_UNAVAILABLE;

      + (instancetype)subtypeA;

      + (instancetype)subtypeB;

      - (instancetype)init NS_UNAVAILABLE;

      - (double)matchDoubleSubtypeA:(SimpleADTDoubleSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(SimpleADTDoubleSubtypeBMatchHandler)subtypeBMatchHandler;

      @end
      """
   And the file "project/values/SimpleADT.m" should contain:
      """
      - (double)matchDoubleSubtypeA:(SimpleADTDoubleSubtypeAMatchHandler)subtypeAMatchHandler subtypeB:(SimpleADTDoubleSubtypeBMatchHandler)subtypeBMatchHandler
      {
        __block double result = 0.0f;
        switch (_subtype) {
          case _SimpleADTSubtypessubtypeA: {
            if (subtypeAMatchHandler) {
              result = subtypeAMatchHandler();
            }
            break;
          }
          case _SimpleADTSubtypessubtypeB: {
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
