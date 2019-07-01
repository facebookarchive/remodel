# Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.

Feature: Outputting Value Objects with a Plugin-Defined Custom Base Class

    @announce
    Scenario: Generating files with a Plugin-Defined Custom Base Class
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
                    baseClass: function(valueType) {
                        return { value: {
                            className: "TestBaseClass",
                            libraryName: {value: "TestBaseClassLibrary"},
                        }};
                    },
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
                        return {
                            value: undefined
                        };
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
                        return [];
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
                        return {
                            value: undefined
                        };
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

            #import <TestBaseClassLibrary/TestBaseClass.h>
            #import <Foundation/Foundation.h>

            @interface RMPage : TestBaseClass <NSCopying>

            @property (nonatomic, readonly) BOOL doesUserLike;
            @property (nonatomic, readonly, copy) NSString *identifier;
            @property (nonatomic, readonly) NSInteger likeCount;
            @property (nonatomic, readonly) NSUInteger numberOfRatings;

            + (instancetype)new NS_UNAVAILABLE;

            - (instancetype)init NS_UNAVAILABLE;

            - (instancetype)initWithDoesUserLike:(BOOL)doesUserLike identifier:(NSString *)identifier likeCount:(NSInteger)likeCount numberOfRatings:(NSUInteger)numberOfRatings NS_DESIGNATED_INITIALIZER;

            @end
            """
