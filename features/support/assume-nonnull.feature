Feature: Outputting Value Objects decorated with NS_ASSUME_NONNULL_* macros

  @announce
  Scenario: Generation header and method files with the NS_ASSUME_NONNULL_* macros
    Given a file named "project/values/RMFoo.value" with:
      """
      RMFoo includes(RMAssumeNonnull) {
        NSString *aString;
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      { }
      """
    When I run `../../bin/generate project`
    Then the file "project/values/RMFoo.h" should contain:
      """
      #import <Foundation/Foundation.h>

      NS_ASSUME_NONNULL_BEGIN

      @interface RMFoo : NSObject <NSCopying>

      @property (nonatomic, readonly, copy) NSString *aString;

      - (instancetype)initWithAString:(NSString *)aString;

      @end

      NS_ASSUME_NONNULL_END

      """
    And the file "project/values/RMFoo.m" should contain:
      """
      #import "RMFoo.h"

      NS_ASSUME_NONNULL_BEGIN

      @implementation RMFoo

      - (instancetype)initWithAString:(NSString *)aString
      {
        if ((self = [super init])) {
          _aString = [aString copy];
        }

        return self;
      }

      - (id)copyWithZone:(NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t aString: %@; \n", [super description], _aString];
      }

      - (NSUInteger)hash
      {
        NSUInteger subhashes[] = {[_aString hash]};
        NSUInteger result = subhashes[0];
        for (int ii = 1; ii < 1; ++ii) {
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

      - (BOOL)isEqual:(RMFoo *)object
      {
        if (self == object) {
          return YES;
        } else if (self == nil || object == nil || ![object isKindOfClass:[self class]]) {
          return NO;
        }
        return
          (_aString == object->_aString ? YES : [_aString isEqual:object->_aString]);
      }

      @end

      NS_ASSUME_NONNULL_END

      """
