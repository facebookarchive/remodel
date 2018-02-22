Feature: Outputting Value Objects

  @announce
  Scenario: Generating a class that prohibits subclassing
    Given a file named "project/values/RMFoo.value" with:
      """
      # some class comment
      RMFoo includes(RMSubclassingRestricted) {
        NSString* x
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    And the file "project/values/RMFoo.h" should contain:
      """
      #import <Foundation/Foundation.h>

      /**
       * some class comment
       */
      __attribute__((objc_subclassing_restricted)) 
      @interface RMFoo : NSObject <NSCopying>

      @property (nonatomic, readonly, copy) NSString *x;
      """

  @announce
  Scenario: Generating a class that allows subclassing
    Given a file named "project/values/RMFoo.value" with:
      """
      # some class comment
      RMFoo excludes(RMSubclassingRestricted) {
        NSString* x
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    And the file "project/values/RMFoo.h" should contain:
      """
      #import <Foundation/Foundation.h>

      /**
       * some class comment
       */
      @interface RMFoo : NSObject <NSCopying>

      @property (nonatomic, readonly, copy) NSString *x;
      """
