Feature: Specifying an output directory to put results in

  @announce
  Scenario: Generating only headers
    Given a file named "project/values/RMValueTypeHeaderOnly.value" with:
      """
      # Simple file
      RMValueTypeHeaderOnly {
        BOOL doesUserLike
        NSString* identifier
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project --headers-only`
    Then the file "project/values/RMValueTypeHeaderOnly.h" should contain:
      """
      #import <Foundation/Foundation.h>

      /**
       * Simple file
       */
      @interface RMValueTypeHeaderOnly : NSObject <NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier NS_DESIGNATED_INITIALIZER;

      @end

      """
   And the file "project/values/RMValueTypeHeaderOnly.m" should not exist

  @announce
  Scenario: Generating only implementation
    Given a file named "project/values/RMValueTypeImplOnly.value" with:
      """
      # Simple file
      RMValueTypeImplOnly {
        BOOL doesUserLike
        NSString* identifier
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project --implementations-only`
   Then the file "project/values/RMValueTypeImplOnly.m" should contain:
      """
      #import "RMValueTypeImplOnly.h"

      @implementation RMValueTypeImplOnly

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
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
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {(NSUInteger)_doesUserLike, [_identifier hash]};
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

      - (BOOL)isEqual:(RMValueTypeImplOnly *)object
      {
        if (self == object) {
          return YES;
        } else if (object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          _doesUserLike == object->_doesUserLike &&
          (_identifier == object->_identifier ? YES : [_identifier isEqual:object->_identifier]);
      }

      @end

      """
   And the file "project/values/RMValueTypeImplOnly.h" should not exist
