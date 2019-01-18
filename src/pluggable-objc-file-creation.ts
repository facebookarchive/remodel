/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Code = require('./code');
import Either = require('./either');
import Error = require('./error');
import File = require('./file');
import FileWriter = require('./file-writer');
import FunctionUtils = require('./function-utils');
import List = require('./list');
import Maybe = require('./maybe');
import ObjC = require('./objc');
import ObjCCommentUtils = require('./objc-comment-utils');
import ObjCFileCreation = require('./objc-file-creation');
import OutputControl = require('./output-control');
import path = require('path');

export interface ObjCGenerationPlugIn<T> {
  additionalFiles: (typeInformation: T) => Code.File[];
  blockTypes: (typeInformation: T) => ObjC.BlockType[];
  classMethods: (typeInformation: T) => ObjC.Method[];
  comments: (typeInformation: T) => ObjC.Comment[];
  enumerations: (typeInformation: T) => ObjC.Enumeration[];
  fileTransformation: (writeRequest: FileWriter.Request) => FileWriter.Request;
  fileType: (typeInformation: T) => Maybe.Maybe<Code.FileType>;
  forwardDeclarations: (typeInformation: T) => ObjC.ForwardDeclaration[];
  functions: (typeInformation: T) => ObjC.Function[];
  imports: (typeInformation: T) => ObjC.Import[];
  instanceVariables: (typeInformation: T) => ObjC.InstanceVariable[];
  instanceMethods: (typeInformation: T) => ObjC.Method[];
  macros: (typeInformation: T) => ObjC.Macro[];
  properties: (typeInformation: T) => ObjC.Property[];
  protocols: (typeInformation: T) => ObjC.Protocol[];
  staticConstants: (typeInformation: T) => ObjC.Constant[];
  validationErrors: (typeInformation: T) => Error.Error[];
  nullability: (typeInformation: T) => Maybe.Maybe<ObjC.ClassNullability>;
  subclassingRestricted: (typeInformation: T) => boolean;
  requiredIncludesToRun: string[];
}

export interface ObjCGenerationRequest<T> {
  diagnosticIgnores: List.List<string>;
  baseClassLibraryName: Maybe.Maybe<string>;
  baseClassName: string;
  path: File.AbsoluteFilePath;
  outputPath: Maybe.Maybe<File.AbsoluteFilePath>;
  outputFlags: OutputControl.OutputFlags;
  typeInformation: T;
}

export interface ObjCGenerationTypeInfoProvider<T> {
  additionalTypesForType: (typeInformation: T) => T[];
  typeNameForType: (typeInformation: T) => string;
  commentsForType: (typeInformation: T) => string[];
}

interface ObjCRenderingOptions {
  renderHeader: boolean;
  renderImpl: boolean;
}

function buildImports<T>(
  typeInformation: T,
  soFar: ObjC.Import[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Import[] {
  return soFar.concat(plugin.imports(typeInformation));
}

function buildStaticConstants<T>(
  typeInformation: T,
  soFar: ObjC.Constant[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Constant[] {
  return soFar.concat(plugin.staticConstants(typeInformation));
}

function buildBlockTypes<T>(
  typeInformation: T,
  soFar: ObjC.BlockType[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.BlockType[] {
  return soFar.concat(plugin.blockTypes(typeInformation));
}

function buildClassMethods<T>(
  typeInformation: T,
  soFar: ObjC.Method[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Method[] {
  return soFar.concat(plugin.classMethods(typeInformation));
}

function buildEnumerations<T>(
  typeInformation: T,
  soFar: ObjC.Enumeration[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Enumeration[] {
  return soFar.concat(plugin.enumerations(typeInformation));
}

function buildInstanceMethods<T>(
  typeInformation: T,
  soFar: ObjC.Method[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Method[] {
  return soFar.concat(plugin.instanceMethods(typeInformation));
}

function buildProperties<T>(
  typeInformation: T,
  soFar: ObjC.Property[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Property[] {
  return soFar.concat(plugin.properties(typeInformation));
}

function buildInstanceVariables<T>(
  typeInformation: T,
  soFar: ObjC.InstanceVariable[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.InstanceVariable[] {
  return soFar.concat(plugin.instanceVariables(typeInformation));
}

function buildProtocols<T>(
  typeInformation: T,
  soFar: ObjC.Protocol[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Protocol[] {
  return soFar.concat(plugin.protocols(typeInformation));
}

function checkSubclassingRestricted<T>(
  typeInformation: T,
  soFar: boolean,
  plugin: ObjCGenerationPlugIn<T>,
): boolean {
  return soFar || plugin.subclassingRestricted(typeInformation);
}

function buildFileType<T>(
  typeInformation: T,
  soFar: Either.Either<Error.Error, Maybe.Maybe<Code.FileType>>,
  plugin: ObjCGenerationPlugIn<T>,
): Either.Either<Error.Error, Maybe.Maybe<Code.FileType>> {
  return Either.mbind(function(maybeExistingType: Maybe.Maybe<Code.FileType>) {
    return Maybe.match(
      function(existingType: Code.FileType) {
        return Maybe.match(
          function(newType: Code.FileType) {
            if (newType === existingType) {
              return Either.Right<Error.Error, Maybe.Maybe<Code.FileType>>(
                Maybe.Just(newType),
              );
            }
            throw Either.Left<Error.Error, Maybe.Maybe<Code.FileType>>(
              Error.Error('conflicting file type requirements'),
            );
          },
          function() {
            return Either.Right<Error.Error, Maybe.Maybe<Code.FileType>>(
              Maybe.Just(existingType),
            );
          },
          plugin.fileType(typeInformation),
        );
      },
      function() {
        return Either.Right<Error.Error, Maybe.Maybe<Code.FileType>>(
          plugin.fileType(typeInformation),
        );
      },
      maybeExistingType,
    );
  }, soFar);
}

function buildNullability<T>(
  typeInformation: T,
  soFar: Either.Either<Error.Error, Maybe.Maybe<ObjC.ClassNullability>>,
  plugin: ObjCGenerationPlugIn<T>,
): Either.Either<Error.Error, Maybe.Maybe<ObjC.ClassNullability>> {
  return Either.mbind(function(
    maybeExistingType: Maybe.Maybe<ObjC.ClassNullability>,
  ) {
    return Maybe.match(
      function(existingType: ObjC.ClassNullability) {
        return Maybe.match(
          function(newType: ObjC.ClassNullability) {
            if (newType === existingType) {
              return Either.Right<
                Error.Error,
                Maybe.Maybe<ObjC.ClassNullability>
              >(Maybe.Just(newType));
            }
            throw Either.Left<Error.Error, Maybe.Maybe<ObjC.ClassNullability>>(
              Error.Error('conflicting file type requirements'),
            );
          },
          function() {
            return Either.Right<
              Error.Error,
              Maybe.Maybe<ObjC.ClassNullability>
            >(Maybe.Just(existingType));
          },
          plugin.nullability(typeInformation),
        );
      },
      function() {
        return Either.Right<Error.Error, Maybe.Maybe<ObjC.ClassNullability>>(
          plugin.nullability(typeInformation),
        );
      },
      maybeExistingType,
    );
  },
  soFar);
}

function buildForwardDeclarations<T>(
  typeInformation: T,
  soFar: ObjC.ForwardDeclaration[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.ForwardDeclaration[] {
  return soFar.concat(plugin.forwardDeclarations(typeInformation));
}

function buildFunctions<T>(
  typeInformation: T,
  soFar: ObjC.Function[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Function[] {
  return soFar.concat(plugin.functions(typeInformation));
}

function buildMacros<T>(
  typeInformation: T,
  soFar: ObjC.Macro[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Macro[] {
  return soFar.concat(plugin.macros(typeInformation));
}

function buildComments<T>(
  typeInformation: T,
  soFar: ObjC.Comment[],
  plugin: ObjCGenerationPlugIn<T>,
): ObjC.Comment[] {
  return soFar.concat(plugin.comments(typeInformation));
}

function buildAdditionalFiles<T>(
  typeInformation: T,
  soFar: Code.File[],
  plugin: ObjCGenerationPlugIn<T>,
): Code.File[] {
  return soFar.concat(plugin.additionalFiles(typeInformation));
}

function buildValidationErrors<T>(
  typeInformation: T,
  soFar: Error.Error[],
  plugin: ObjCGenerationPlugIn<T>,
): Error.Error[] {
  return soFar.concat(plugin.validationErrors(typeInformation));
}

function strComparator(str1: string, str2: string): number {
  if (str1 > str2) {
    return 1;
  } else if (str1 < str2) {
    return -1;
  } else {
    return 0;
  }
}

function sortInstanceMethodComparitor(
  method1: ObjC.Method,
  method2: ObjC.Method,
): number {
  const significantKeyword1 = method1.keywords[0].name;
  const significantKeyword2 = method2.keywords[0].name;
  const firstIsInit = significantKeyword1.indexOf('init') !== -1;
  const secondIsInit = significantKeyword2.indexOf('init') !== -1;

  if (firstIsInit) {
    if (secondIsInit) {
      return strComparator(significantKeyword1, significantKeyword2);
    } else {
      return -1;
    }
  } else {
    if (secondIsInit) {
      return 1;
    } else {
      return strComparator(significantKeyword1, significantKeyword2);
    }
  }
}

function importListWithBaseImportAppended(
  baseClassName: string,
  baseClassLibraryName: Maybe.Maybe<string>,
  pluginImports: ObjC.Import[],
): ObjC.Import[] {
  return Maybe.match(
    function(libraryName: string): ObjC.Import[] {
      const importForBaseClass: ObjC.Import = {
        file: baseClassName + '.h',
        isPublic: true,
        library: baseClassLibraryName,
      };
      return [importForBaseClass].concat(pluginImports);
    },
    function(): ObjC.Import[] {
      return pluginImports;
    },
    baseClassLibraryName,
  );
}

function commentListWithPathToValueFile(
  pathToValueFile: File.AbsoluteFilePath,
  comments: ObjC.Comment[],
): ObjC.Comment[] {
  const commentsToUse = comments || [];

  return commentsToUse.concat(
    ObjCCommentUtils.commentsAsBlockFromStringArray([
      'This file is generated using the remodel generation script.',
      'The name of the input file is ' +
        path.basename(pathToValueFile.absolutePath),
    ]),
  );
}

function classFileCreationFunctionWithBaseClassAndPlugins<T>(
  baseClassName: string,
  baseClassLibraryName: Maybe.Maybe<string>,
  diagnosticIgnores: List.List<string>,
  pathToValueFile: File.AbsoluteFilePath,
  plugins: List.List<ObjCGenerationPlugIn<T>>,
): (
  typeInformation: T,
  typeName: string,
  comments: string[],
) => Either.Either<Error.Error, Code.File> {
  return function(
    typeInformation: T,
    typeName: string,
    comments: string[],
  ): Either.Either<Error.Error, Code.File> {
    const fileType = List.foldl<
      ObjCGenerationPlugIn<T>,
      Either.Either<Error.Error, Maybe.Maybe<Code.FileType>>
    >(
      (soFar, plugin) => buildFileType(typeInformation, soFar, plugin),
      Either.Right<Error.Error, Maybe.Maybe<Code.FileType>>(
        Maybe.Nothing<Code.FileType>(),
      ),
      plugins,
    );
    const nullability = List.foldl<
      ObjCGenerationPlugIn<T>,
      Either.Either<Error.Error, Maybe.Maybe<ObjC.ClassNullability>>
    >(
      (soFar, plugin) => buildNullability(typeInformation, soFar, plugin),
      Either.Right<Error.Error, Maybe.Maybe<ObjC.ClassNullability>>(
        Maybe.Nothing<ObjC.ClassNullability>(),
      ),
      plugins,
    );
    return Either.map(function(maybeFileType) {
      const fileType = Maybe.match(
        function(fileType: Code.FileType) {
          return fileType;
        },
        function() {
          return Code.FileType.ObjectiveC();
        },
        maybeFileType,
      );
      return {
        name: typeName,
        type: fileType,
        imports: importListWithBaseImportAppended(
          baseClassName,
          baseClassLibraryName,
          List.foldl<ObjCGenerationPlugIn<T>, ObjC.Import[]>(
            (soFar, plugin) => buildImports(typeInformation, soFar, plugin),
            [],
            plugins,
          ),
        ),
        comments: commentListWithPathToValueFile(
          pathToValueFile,
          List.foldl<ObjCGenerationPlugIn<T>, ObjC.Comment[]>(
            (soFar, plugin) => buildComments(typeInformation, soFar, plugin),
            [],
            plugins,
          ),
        ),
        enumerations: List.foldl<ObjCGenerationPlugIn<T>, ObjC.Enumeration[]>(
          (soFar, plugin) => buildEnumerations(typeInformation, soFar, plugin),
          [],
          plugins,
        ),
        forwardDeclarations: List.foldl<
          ObjCGenerationPlugIn<T>,
          ObjC.ForwardDeclaration[]
        >(
          (soFar, plugin) =>
            buildForwardDeclarations(typeInformation, soFar, plugin),
          [],
          plugins,
        ),
        blockTypes: List.foldl<ObjCGenerationPlugIn<T>, ObjC.BlockType[]>(
          (soFar, plugin) => buildBlockTypes(typeInformation, soFar, plugin),
          [],
          plugins,
        ),
        diagnosticIgnores: List.toArray(diagnosticIgnores),
        staticConstants: List.foldl<ObjCGenerationPlugIn<T>, ObjC.Constant[]>(
          (soFar, plugin) =>
            buildStaticConstants(typeInformation, soFar, plugin),
          [],
          plugins,
        ),
        functions: [],
        macros: List.foldl<ObjCGenerationPlugIn<T>, ObjC.Macro[]>(
          (soFar, plugin) => buildMacros(typeInformation, soFar, plugin),
          [],
          plugins,
        ),
        classes: [
          {
            baseClassName: baseClassName,
            covariantTypes: [],
            comments: ObjCCommentUtils.commentsAsBlockFromStringArray(comments),
            classMethods: List.foldl<ObjCGenerationPlugIn<T>, ObjC.Method[]>(
              (soFar, plugin) =>
                buildClassMethods(typeInformation, soFar, plugin),
              [],
              plugins,
            ).sort(sortInstanceMethodComparitor),
            functions: List.foldl<ObjCGenerationPlugIn<T>, ObjC.Function[]>(
              (soFar, plugin) => buildFunctions(typeInformation, soFar, plugin),
              [],
              plugins,
            ),
            instanceMethods: List.foldl<ObjCGenerationPlugIn<T>, ObjC.Method[]>(
              (soFar, plugin) =>
                buildInstanceMethods(typeInformation, soFar, plugin),
              [],
              plugins,
            ).sort(sortInstanceMethodComparitor),
            name: typeName,
            properties: List.foldl<ObjCGenerationPlugIn<T>, ObjC.Property[]>(
              (soFar, plugin) =>
                buildProperties(typeInformation, soFar, plugin),
              [],
              plugins,
            ),
            instanceVariables: List.foldl<
              ObjCGenerationPlugIn<T>,
              ObjC.InstanceVariable[]
            >(
              (soFar, plugin) =>
                buildInstanceVariables(typeInformation, soFar, plugin),
              [],
              plugins,
            ),
            implementedProtocols: List.foldr<
              ObjCGenerationPlugIn<T>,
              ObjC.Protocol[]
            >(
              (soFar, plugin) => buildProtocols(typeInformation, soFar, plugin),
              [],
              plugins,
            ),
            extensionName: Maybe.Nothing<string>(),
            nullability: Either.match(
              function() {
                return ObjC.ClassNullability.default;
              },
              function(maybeNullability: Maybe.Maybe<ObjC.ClassNullability>) {
                return Maybe.match(
                  function(nullability: ObjC.ClassNullability) {
                    return nullability;
                  },
                  function() {
                    return ObjC.ClassNullability.default;
                  },
                  maybeNullability,
                );
              },
              nullability,
            ),
            subclassingRestricted: List.foldr<ObjCGenerationPlugIn<T>, boolean>(
              (soFar, plugin) =>
                checkSubclassingRestricted(typeInformation, soFar, plugin),
              false,
              plugins,
            ),
          },
        ],
        structs: [],
        namespaces: [],
      };
    }, fileType);
  };
}

function fileCreationRequestContainingArrayOfPossibleError(
  fileCreationRequest: Either.Either<Error.Error, FileWriter.FileWriteRequest>,
): Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
  return Either.match(
    function(
      error: Error.Error,
    ): Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
      return Either.Left([error]);
    },
    function(
      fileWriteRequest: FileWriter.FileWriteRequest,
    ): Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
      return Either.Right(fileWriteRequest);
    },
    fileCreationRequest,
  );
}

function fileWriteRequestContainingAdditionalFile(
  outputFlags: OutputControl.OutputFlags,
  containingFolderPath: File.AbsoluteFilePath,
  file: Code.File,
  fileWriteRequest: FileWriter.FileWriteRequest,
): Either.Either<Error.Error, FileWriter.FileWriteRequest> {
  const fileCreationRequestForAdditionalFile: Either.Either<
    Error.Error,
    FileWriter.FileWriteRequest
  > = ObjCFileCreation.fileCreationRequest(
    containingFolderPath,
    file,
    outputFlags.emitHeaders,
    outputFlags.emitImplementations,
  );

  return Either.map(function(
    fileWriteRequestForAdditionalFile: FileWriter.FileWriteRequest,
  ): FileWriter.FileWriteRequest {
    const updatedRequest: FileWriter.FileWriteRequest = {
      name: fileWriteRequest.name,
      requests: List.append(
        fileWriteRequest.requests,
        fileWriteRequestForAdditionalFile.requests,
      ),
    };
    return updatedRequest;
  },
  fileCreationRequestForAdditionalFile);
}

function fileCreationRequestContainingAdditionalFile(
  renderOptions: OutputControl.OutputFlags,
  containingFolderPath: File.AbsoluteFilePath,
  fileCreationRequest: Either.Either<Error.Error, FileWriter.FileWriteRequest>,
  file: Code.File,
): Either.Either<Error.Error, FileWriter.FileWriteRequest> {
  return Either.mbind((fileWriteRequest: FileWriter.FileWriteRequest) => {
    return fileWriteRequestContainingAdditionalFile(
      renderOptions,
      containingFolderPath,
      file,
      fileWriteRequest,
    );
  }, fileCreationRequest);
}

function buildFileWriteRequest<T>(
  request: ObjCGenerationRequest<T>,
  typeInfoProvider: ObjCGenerationTypeInfoProvider<T>,
  plugins: List.List<ObjCGenerationPlugIn<T>>,
): Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
  const typeInfos = [request.typeInformation].concat(
    typeInfoProvider.additionalTypesForType(request.typeInformation),
  );

  const classFileFromTypeInfo: (
    typeInformation: T,
    typeName: string,
    comments: string[],
  ) => Either.Either<
    Error.Error,
    Code.File
  > = classFileCreationFunctionWithBaseClassAndPlugins(
    request.baseClassName,
    request.baseClassLibraryName,
    request.diagnosticIgnores,
    request.path,
    plugins,
  );

  const outputPath: File.AbsoluteFilePath = Maybe.match(
    function(file: File.AbsoluteFilePath): File.AbsoluteFilePath {
      return file;
    },
    function(): File.AbsoluteFilePath {
      const fullPathAsString: string = File.getAbsolutePathString(request.path);
      return File.getAbsoluteFilePath(path.dirname(fullPathAsString));
    },
    request.outputPath,
  );

  // filter down to the plugins that we want to emit if we are filtered
  const filteredPlugins = List.filter(function(p) {
    return OutputControl.ShouldEmitPluginFile(
      request.outputFlags,
      p.requiredIncludesToRun[0],
    );
  }, plugins);

  const allFileRequests = typeInfos.map(function(type: T) {
    // build base file if we are allowed to
    const classFile: Either.Either<
      Error.Error,
      Code.File[]
    > = OutputControl.ShouldEmitObject(request.outputFlags)
      ? classFileFromTypeInfo(
          type,
          typeInfoProvider.typeNameForType(type),
          typeInfoProvider.commentsForType(type),
        ).map(function(file: Code.File) {
          return [file];
        })
      : Either.Right<Error.Error, Code.File[]>([]);

    // add files from plugins
    const allFiles: Either.Either<Error.Error, Code.File[]> = classFile.map(
      function(files: Code.File[]) {
        const additionalFiles: Code.File[] = List.foldl<
          ObjCGenerationPlugIn<T>,
          Code.File[]
        >(
          (soFar, plugin) => buildAdditionalFiles(type, soFar, plugin),
          [],
          filteredPlugins,
        );
        return files.concat(additionalFiles);
      },
    );

    // create file write requests for each file
    const completeFileCreationRequest: Either.Either<
      Error.Error,
      FileWriter.FileWriteRequest
    > = Either.mbind(function(files: Code.File[]) {
      return files.reduce(
        function(
          soFar: Either.Either<Error.Error, FileWriter.FileWriteRequest>,
          currentFile: Code.File,
        ) {
          return fileCreationRequestContainingAdditionalFile(
            request.outputFlags,
            outputPath,
            soFar,
            currentFile,
          );
        },
        Either.Right<Error.Error, FileWriter.FileWriteRequest>({
          name: typeInfoProvider.typeNameForType(type),
          requests: List.of<FileWriter.Request>(),
        }),
      );
    }, allFiles);

    return fileCreationRequestContainingArrayOfPossibleError(
      completeFileCreationRequest,
    );
  });

  return allFileRequests.reduce(function(
    soFar: Either.Either<Error.Error[], FileWriter.FileWriteRequest>,
    current: Either.Either<Error.Error[], FileWriter.FileWriteRequest>,
  ) {
    return Either.map(function(
      request: FileWriter.FileWriteRequest,
    ): FileWriter.FileWriteRequest {
      return {
        name: request.name,
        requests: List.append(request.requests, current.right.requests),
      };
    },
    soFar);
  });
}

function valueObjectsToCreateWithPlugins<T>(
  plugins: List.List<ObjCGenerationPlugIn<T>>,
  typeInformation: T,
): Either.Either<Error.Error[], T> {
  const validationErrors: Error.Error[] = List.foldl<
    ObjCGenerationPlugIn<T>,
    Error.Error[]
  >(
    (soFar, plugin) => buildValidationErrors(typeInformation, soFar, plugin),
    [],
    plugins,
  );
  if (validationErrors.length > 0) {
    return Either.Left<Error.Error[], T>(validationErrors);
  } else {
    return Either.Right<Error.Error[], T>(typeInformation);
  }
}

export function fileWriteRequest<T>(
  request: ObjCGenerationRequest<T>,
  typeInfoProvider: ObjCGenerationTypeInfoProvider<T>,
  plugins: List.List<ObjCGenerationPlugIn<T>>,
): Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
  const validatedRequest: Either.Either<
    Error.Error[],
    T
  > = valueObjectsToCreateWithPlugins(plugins, request.typeInformation);

  return Either.match(
    function(errors: Error.Error[]) {
      return Either.Left<Error.Error[], FileWriter.FileWriteRequest>(
        errors.map(function(error: Error.Error) {
          return Error.Error(
            '[' + request.path.absolutePath + ']' + Error.getReason(error),
          );
        }),
      );
    },
    function(typeInformation: T) {
      const eitherRequest: Either.Either<
        Error.Error[],
        FileWriter.FileWriteRequest
      > = buildFileWriteRequest(request, typeInfoProvider, plugins);
      return List.foldr(
        function(
          soFar: Either.Either<Error.Error[], FileWriter.FileWriteRequest>,
          plugin: ObjCGenerationPlugIn<T>,
        ): Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
          return Either.map(function(
            request: FileWriter.FileWriteRequest,
          ): FileWriter.FileWriteRequest {
            const writeRequest: FileWriter.FileWriteRequest = {
              name: request.name,
              requests: List.map(plugin.fileTransformation, request.requests),
            };
            return writeRequest;
          },
          soFar);
        },
        eitherRequest,
        plugins,
      );
    },
    validatedRequest,
  );
}
