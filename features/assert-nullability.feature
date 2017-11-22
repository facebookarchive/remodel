Feature: Outputting Value Objects / Algebraic Types decorated with NS_ASSUME_NONNULL_* macros

  @announce
  Scenario: Generate assertion function, when using RMAssumeNonnull and we have object types
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo includes(RMAssumeNonnull) {
        NSString *aString;
        NSString *bString;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
      """
      #import "RMFoo.h"

      static void RMParameterAssert(BOOL condition) {
        NSParameterAssert(condition);
      }

      NS_ASSUME_NONNULL_BEGIN

      @implementation RMFoo

      - (instancetype)initWithAString:(NSString *)aString bString:(NSString *)bString
      {
        RMParameterAssert(aString != nil);
        RMParameterAssert(bString != nil);
        if ((self = [super init])) {
          _aString = [aString copy];
          _bString = [bString copy];
        }

        return self;
      }
      """

  @announce
  Scenario: Generate assertion function, when we have a single nonnull object type
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo excludes(RMAssumeNonnull) {
        %nonnull
        NSString *aString;
        NSString *bString;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
      """
      #import "RMFoo.h"

      static void RMParameterAssert(BOOL condition) {
        NSParameterAssert(condition);
      }

      @implementation RMFoo

      - (instancetype)initWithAString:(nonnull NSString *)aString bString:(NSString *)bString
      {
        RMParameterAssert(aString != nil);
        if ((self = [super init])) {
          _aString = [aString copy];
          _bString = [bString copy];
        }

        return self;
      }
      """

  @announce
  Scenario: Dont generate assertion function, if we have no nonnull annotations
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo excludes(RMAssumeNonnull) {
        NSInteger countA;
        NSInteger countB;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
      """
      #import "RMFoo.h"

      @implementation RMFoo

      - (instancetype)initWithCountA:(NSInteger)countA countB:(NSInteger)countB
      {
        if ((self = [super init])) {
          _countA = countA;
          _countB = countB;
        }

        return self;
      }
      """

  @announce
  Scenario: Dont generate assertion function, when using RMAssumeNonnull and we dont have nonnull object types
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo includes(RMAssumeNonnull) {
        %nullable
        NSString *stringA
        NSInteger countB
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
      """
      #import "RMFoo.h"

      NS_ASSUME_NONNULL_BEGIN

      @implementation RMFoo

      - (instancetype)initWithStringA:(nullable NSString *)stringA countB:(NSInteger)countB
      {
        if ((self = [super init])) {
          _stringA = [stringA copy];
          _countB = countB;
        }

        return self;
      }
      """

  @announce
  Scenario: Dont generate assertion function, when using RMAssumeNonnull and we dont have object types
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo includes(RMAssumeNonnull) {
        NSInteger countA;
        NSInteger countB;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.m" should contain:
      """
      #import "RMFoo.h"

      NS_ASSUME_NONNULL_BEGIN

      @implementation RMFoo

      - (instancetype)initWithCountA:(NSInteger)countA countB:(NSInteger)countB
      {
        if ((self = [super init])) {
          _countA = countA;
          _countB = countB;
        }

        return self;
      }
      """