# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Value Objects With A Custom Plugin

  @announce
  Scenario: Generating Files with a custom plugin
    Given a file named "project/values/RMPage.value" with:
      """
      RMPage {
        BOOL doesUserLike
        NSString* identifier
        NSInteger likeCount
        NSUInteger numberOfRatings
      }
      """
    And a file named "project/.valueObjectConfig" with:
      """
      {
        "defaultIncludes": [
          "CustomPlugin"
        ],
        "defaultExcludes": [
          "RMEquality"
         ],
         "customPluginPaths": [
          "plugins/custom-plugin.js"
         ]
      }
      """
    And a file named "project/plugins/custom-plugin.js" with:
      """
      function createPlugin() {
        return {
          additionalFiles: function (valueType) {
            return [];
          },
          transformBaseFile: function (valueType, baseFile) {
            return baseFile;
          },
          additionalTypes: function (valueType) {
            return [];
          },
          attributes: function (valueType) {
            return [];
          },
          classMethods: function (valueType) {
            return [];
          },
          transformFileRequest: function (request) {
            return request;
          },
          fileType: function (valueType) {
            return null;
          },
          forwardDeclarations: function(valueType) {
            return [];
          },
          functions: function (valueType) {
            return [];
          },
          headerComments: function (valueType) {
            return [];
          },
          implementedProtocols: function (valueType) {
            return [
              {
                name: 'NSSomething'
              }
            ];
          },
          imports: function (valueType) {
            return [];
          },
          instanceMethods: function (valueType) {
            return [];
          },
          macros: function (valueType) {
            return [];
          },
          properties: function (valueType) {
            return [];
          },
          requiredIncludesToRun: ['CustomPlugin'],
          staticConstants: function (valueType) {
            return [];
          },
          validationErrors: function (valueType) {
            return [];
          },
          nullability: function (valueType) {
            return null;
          },
          subclassingRestricted: function (valueType) {
            return false;
          }
        };
      }
      exports.createPlugin = createPlugin;
    """
    When I run `../../bin/generate project`
    Then the file "project/values/RMPage.h" should contain:
      """
      /**
       * This file is generated using the remodel generation script.
       * The name of the input file is RMPage.value
       */

      #import <Foundation/Foundation.h>

      @interface RMPage : NSObject <NSSomething, NSCopying>

      @property (nonatomic, readonly) BOOL doesUserLike;
      @property (nonatomic, readonly, copy) NSString *identifier;
      @property (nonatomic, readonly) NSInteger likeCount;
      @property (nonatomic, readonly) NSUInteger numberOfRatings;

      + (instancetype)new NS_UNAVAILABLE;

      - (instancetype)init NS_UNAVAILABLE;

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings NS_DESIGNATED_INITIALIZER;

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

      - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings
      {
        if ((self = [super init])) {
          _doesUserLike = doesUserLike;
          _identifier = [identifier copy];
          _likeCount = likeCount;
          _numberOfRatings = numberOfRatings;
        }

        return self;
      }

      - (id)copyWithZone:(nullable NSZone *)zone
      {
        return self;
      }

      - (NSString *)description
      {
        return [NSString stringWithFormat:@"%@ - \n\t doesUserLike: %@; \n\t identifier: %@; \n\t likeCount: %lld; \n\t numberOfRatings: %llu; \n", [super description], _doesUserLike ? @"YES" : @"NO", _identifier, (long long)_likeCount, (unsigned long long)_numberOfRatings];
      }

      @end

      """
