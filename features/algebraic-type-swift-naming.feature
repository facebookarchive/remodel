# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Name Certain Methods Differently for Swift

  @announce
  Scenario: Generating an algebraic type containing various combinations of capital letters
    Given a file named "project/values/SimpleADT.adtValue" with:
      """
      # What a beautiful ADT
      %library name=MyLib
      %type name=RMSomeObject library=SomeLib file=AnotherFile
      %type name=RMFooObject
      %type name=RMSomeEnum canForwardDeclare=false
      # What is not to love?!
      SimpleADT {
        # Capital letters at front
        XYZSubtype {
          NSUInteger firstValue
        }
        # Capital letters in middle
        MiddleXYZSubtype {
          NSUInteger firstValue
        }
        # Capital letters at end
        SubtypeXYZ {
          NSUInteger firstValue
        }
        # Capital letters only
        XYZ {
          NSUInteger firstValue
        }
        # Standard capitalization
        StandardSubtype {
          NSUInteger firstValue
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
      #import <SomeLib/AnotherFile.h>
      #import <MyLib/RMFooObject.h>
      #import <MyLib/RMSomeEnum.h>

      typedef void (^SimpleADTXYZSubtypeMatchHandler)(NSUInteger firstValue);
      typedef void (^SimpleADTMiddleXYZSubtypeMatchHandler)(NSUInteger firstValue);
      typedef void (^SimpleADTSubtypeXYZMatchHandler)(NSUInteger firstValue);
      typedef void (^SimpleADTXYZMatchHandler)(NSUInteger firstValue);
      typedef void (^SimpleADTStandardSubtypeMatchHandler)(NSUInteger firstValue);

      /**
       * What a beautiful ADT
       * What is not to love?!
       */
      @interface SimpleADT : NSObject <NSCopying>

      /**
       * Capital letters in middle
       */
      + (instancetype)middleXYZSubtypeWithFirstValue:(NSUInteger)firstValue NS_SWIFT_NAME(middleXYZSubtype(firstValue:));

      + (instancetype)new NS_UNAVAILABLE;

      /**
       * Standard capitalization
       */
      + (instancetype)standardSubtypeWithFirstValue:(NSUInteger)firstValue NS_SWIFT_NAME(standardSubtype(firstValue:));

      /**
       * Capital letters at end
       */
      + (instancetype)subtypeXYZWithFirstValue:(NSUInteger)firstValue NS_SWIFT_NAME(subtypeXYZ(firstValue:));

      /**
       * Capital letters at front
       */
      + (instancetype)xYZSubtypeWithFirstValue:(NSUInteger)firstValue NS_SWIFT_NAME(xyzSubtype(firstValue:));

      /**
       * Capital letters only
       */
      + (instancetype)xYZWithFirstValue:(NSUInteger)firstValue NS_SWIFT_NAME(xyz(firstValue:));

      - (instancetype)init NS_UNAVAILABLE;

      - (void)matchXYZSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTXYZSubtypeMatchHandler)xYZSubtypeMatchHandler middleXYZSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTMiddleXYZSubtypeMatchHandler)middleXYZSubtypeMatchHandler subtypeXYZ:(NS_NOESCAPE __unsafe_unretained SimpleADTSubtypeXYZMatchHandler)subtypeXYZMatchHandler xYZ:(NS_NOESCAPE __unsafe_unretained SimpleADTXYZMatchHandler)xYZMatchHandler standardSubtype:(NS_NOESCAPE __unsafe_unretained SimpleADTStandardSubtypeMatchHandler)standardSubtypeMatchHandler NS_SWIFT_NAME(match(xyzSubtype:middleXYZSubtype:subtypeXYZ:xyz:standardSubtype:));

      @end
      """
