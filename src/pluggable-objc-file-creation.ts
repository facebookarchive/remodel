/**
 * Copyright (c) 2016-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as Code from './code';
import * as Either from './either';
import * as Error from './error';
import * as File from './file';
import * as FileWriter from './file-writer';
import * as List from './list';
import * as Maybe from './maybe';
import * as ObjC from './objc';
import * as ObjCCommentUtils from './objc-comment-utils';
import * as ObjCFileCreation from './objc-file-creation';
import * as OutputControl from './output-control';
import * as path from 'path';

export interface ObjCGenerationPlugIn<T> {
  additionalFiles: (typeInformation: T) => Code.File[];
  transformBaseFile: (typeInformation: T, baseFile: Code.File) => Code.File;
  baseClass: (typeInformation: T) => Maybe.Maybe<ObjC.BaseClass>;
  blockTypes: (typeInformation: T) => ObjC.BlockType[];
  classMethods: (typeInformation: T) => ObjC.Method[];
  comments: (typeInformation: T) => ObjC.Comment[];
  enumerations: (typeInformation: T) => ObjC.Enumeration[];
  transformFileRequest: (
    writeRequest: FileWriter.Request,
  ) => FileWriter.Request;
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
  structs: (typeInformation: T) => Code.Struct[];
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

function buildStructs<T>(
  typeInformation: T,
  soFar: Code.Struct[],
  plugin: ObjCGenerationPlugIn<T>,
): Code.Struct[] {
  return soFar.concat(plugin.structs(typeInformation));
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
            return Either.Left<Error.Error, Maybe.Maybe<Code.FileType>>(
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
        requiresCPlusPlus: false,
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
  file?: Code.File,
) => Either.Either<Error.Error, Code.File> {
  return function(
    typeInformation: T,
    typeName: string,
    comments: string[],
    file?: Code.File,
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
    const nullabilityEither = List.foldl<
      ObjCGenerationPlugIn<T>,
      Either.Either<Error.Error, Maybe.Maybe<ObjC.ClassNullability>>
    >(
      (soFar, plugin) => buildNullability(typeInformation, soFar, plugin),
      Either.Right<Error.Error, Maybe.Maybe<ObjC.ClassNullability>>(
        Maybe.Nothing<ObjC.ClassNullability>(),
      ),
      plugins,
    );

    const nullability = Either.match(
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
      nullabilityEither,
    );

    const customPluginBaseClass: Either.Either<
      Error.Error,
      Maybe.Maybe<ObjC.BaseClass>
    > = List.foldl(
      (currentEither, nextPlugin) => {
        return Either.mbind(maybeCurrentBaseClass => {
          const maybeNextBaseClass = nextPlugin.baseClass(typeInformation);

          return Maybe.match(
            // If we have two conflicting base classes from different plugins,
            // we need to fail as there's no way to choose a class to generate.
            ([currentBaseClass, nextBaseClass]) =>
              Either.Left(
                Error.Error(
                  `Conflicting base classes ${currentBaseClass.className} and ${
                    nextBaseClass.className
                  }`,
                ),
              ),
            // If we only have one of the two, then we can continue with
            // whichever one happens to be present.
            () =>
              Either.Right(Maybe.or(maybeNextBaseClass, maybeCurrentBaseClass)),
            Maybe.and(maybeCurrentBaseClass, maybeNextBaseClass),
          );
        }, currentEither);
      },
      // We start with Nothing rather than with the configuration-specified base
      // class so that we don't always produce an error.
      Either.Right(Maybe.Nothing<ObjC.BaseClass>()),
      plugins,
    );

    // Allow the plugin-specified base class to override the one that was
    // specified in the configuration file.
    const baseClass: Either.Either<Error.Error, ObjC.BaseClass> = Either.map(
      maybeCustom =>
        Maybe.match(
          custom => custom,
          () => ({className: baseClassName, libraryName: baseClassLibraryName}),
          maybeCustom,
        ),
      customPluginBaseClass,
    );

    return Either.map(([maybeFileType, baseClass]) => {
      const fileType = Maybe.match(
        function(fileType: Code.FileType) {
          return fileType;
        },
        function() {
          return Code.FileType.ObjectiveC;
        },
        maybeFileType,
      );

      const functions = List.foldl<ObjCGenerationPlugIn<T>, ObjC.Function[]>(
        (soFar, plugin) => buildFunctions(typeInformation, soFar, plugin),
        [],
        plugins,
      );

      const classes = createClassesForObjectSpecType<T>(
        typeInformation,
        typeName,
        comments,
        baseClass.className,
        functions,
        plugins,
        nullability,
      );

      const imports = importListWithBaseImportAppended(
        baseClass.className,
        baseClass.libraryName,
        List.foldl<ObjCGenerationPlugIn<T>, ObjC.Import[]>(
          (soFar, plugin) => buildImports(typeInformation, soFar, plugin),
          [],
          plugins,
        ),
      );

      const enumerations = List.foldl<
        ObjCGenerationPlugIn<T>,
        ObjC.Enumeration[]
      >(
        (soFar, plugin) => buildEnumerations(typeInformation, soFar, plugin),
        [],
        plugins,
      );

      const forwardDeclarations = List.foldl<
        ObjCGenerationPlugIn<T>,
        ObjC.ForwardDeclaration[]
      >(
        (soFar, plugin) =>
          buildForwardDeclarations(typeInformation, soFar, plugin),
        [],
        plugins,
      );

      const blockTypes = List.foldl<ObjCGenerationPlugIn<T>, ObjC.BlockType[]>(
        (soFar, plugin) => buildBlockTypes(typeInformation, soFar, plugin),
        [],
        plugins,
      );

      const staticConstants = List.foldl<
        ObjCGenerationPlugIn<T>,
        ObjC.Constant[]
      >(
        (soFar, plugin) => buildStaticConstants(typeInformation, soFar, plugin),
        [],
        plugins,
      );

      const macros = List.foldl<ObjCGenerationPlugIn<T>, ObjC.Macro[]>(
        (soFar, plugin) => buildMacros(typeInformation, soFar, plugin),
        [],
        plugins,
      );

      const structs = List.foldl<ObjCGenerationPlugIn<T>, Code.Struct[]>(
        (soFar, plugin) => buildStructs(typeInformation, soFar, plugin),
        [],
        plugins,
      );

      const finalFunctions = classes.length > 0 ? [] : functions;

      if (file != null) {
        var newFile = file;
        newFile.imports = file.imports.concat(
          List.foldl<ObjCGenerationPlugIn<T>, ObjC.Import[]>(
            (soFar, plugin) => buildImports(typeInformation, soFar, plugin),
            [],
            plugins,
          ),
        );
        newFile.enumerations = file.enumerations.concat(enumerations);
        newFile.forwardDeclarations = file.forwardDeclarations.concat(
          forwardDeclarations,
        );
        newFile.blockTypes = file.blockTypes.concat(blockTypes);
        newFile.diagnosticIgnores = file.diagnosticIgnores.concat(
          List.toArray(diagnosticIgnores),
        );
        newFile.staticConstants = file.staticConstants.concat(staticConstants);
        newFile.functions = file.functions.concat(finalFunctions);
        newFile.macros = file.macros.concat(macros);
        newFile.classes = file.classes.concat(classes);
        newFile.structs = file.structs.concat(structs);
        return newFile;
      } else {
        return {
          name: typeName,
          type: fileType,
          imports: imports,
          comments: commentListWithPathToValueFile(
            pathToValueFile,
            List.foldl<ObjCGenerationPlugIn<T>, ObjC.Comment[]>(
              (soFar, plugin) => buildComments(typeInformation, soFar, plugin),
              [],
              plugins,
            ),
          ),
          enumerations: enumerations,
          forwardDeclarations: forwardDeclarations,
          blockTypes: blockTypes,
          diagnosticIgnores: List.toArray(diagnosticIgnores),
          staticConstants: staticConstants,
          functions: finalFunctions,
          nullability: classes.length > 0 ? undefined : nullability,
          macros: macros,
          classes: classes,
          structs: structs,
          namespaces: [],
        };
      }
    }, Either.and(fileType, baseClass));
  };
}

function createClassesForObjectSpecType<T>(
  typeInformation: T,
  typeName: string,
  comments: string[],
  baseClassName: string,
  functions: ObjC.Function[],
  plugins: List.List<ObjCGenerationPlugIn<T>>,
  nullability: ObjC.ClassNullability,
): ObjC.Class[] {
  const classMethods = List.foldl<ObjCGenerationPlugIn<T>, ObjC.Method[]>(
    (soFar, plugin) => buildClassMethods(typeInformation, soFar, plugin),
    [],
    plugins,
  ).sort(sortInstanceMethodComparitor);

  const instanceMethods = List.foldl<ObjCGenerationPlugIn<T>, ObjC.Method[]>(
    (soFar, plugin) => buildInstanceMethods(typeInformation, soFar, plugin),
    [],
    plugins,
  ).sort(sortInstanceMethodComparitor);

  const properties = List.foldl<ObjCGenerationPlugIn<T>, ObjC.Property[]>(
    (soFar, plugin) => buildProperties(typeInformation, soFar, plugin),
    [],
    plugins,
  );

  const instanceVariables = List.foldl<
    ObjCGenerationPlugIn<T>,
    ObjC.InstanceVariable[]
  >(
    (soFar, plugin) => buildInstanceVariables(typeInformation, soFar, plugin),
    [],
    plugins,
  );

  const implementedProtocols = List.foldr<
    ObjCGenerationPlugIn<T>,
    ObjC.Protocol[]
  >(
    (soFar, plugin) => buildProtocols(typeInformation, soFar, plugin),
    [],
    plugins,
  );

  const classDefintionMaybe = createClassIfNecessary(
    classMethods,
    instanceMethods,
    properties,
    instanceVariables,
    functions,
    implementedProtocols,
    comments,
    typeName,
    baseClassName,
    nullability,
    List.foldr<ObjCGenerationPlugIn<T>, boolean>(
      (soFar, plugin) =>
        checkSubclassingRestricted(typeInformation, soFar, plugin),
      false,
      plugins,
    ),
  );

  return Maybe.match(
    function(classInfo) {
      return [classInfo];
    },
    function() {
      return [];
    },
    classDefintionMaybe,
  );
}

function createClassIfNecessary(
  classMethods: ObjC.Method[],
  instanceMethods: ObjC.Method[],
  properties: ObjC.Property[],
  instanceVariables: ObjC.InstanceVariable[],
  functions: ObjC.Function[],
  implementedProtocols: ObjC.Protocol[],
  comments: string[],
  typeName: string,
  baseClassName: string,
  nullability: ObjC.ClassNullability,
  subclassingRestricted: boolean,
): Maybe.Maybe<ObjC.Class> {
  if (
    classMethods.length > 0 ||
    instanceMethods.length > 0 ||
    properties.length > 0 ||
    instanceVariables.length > 0 ||
    implementedProtocols.length > 0 ||
    subclassingRestricted
  ) {
    return Maybe.Just({
      baseClassName: baseClassName,
      covariantTypes: [],
      comments: ObjCCommentUtils.commentsAsBlockFromStringArray(comments),
      classMethods: classMethods,
      functions: functions,
      inlineBlockTypedefs: [],
      instanceMethods: instanceMethods,
      name: typeName,
      properties: properties,
      instanceVariables: instanceVariables,
      implementedProtocols: implementedProtocols,
      nullability: nullability,
      subclassingRestricted: subclassingRestricted,
    });
  }

  return Maybe.Nothing<ObjC.Class>();
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

function transformFileWithPlugins<T>(
  baseFile: Code.File,
  typeInformation: T,
  plugins: List.List<ObjCGenerationPlugIn<T>>,
): Code.File {
  return List.foldl<ObjCGenerationPlugIn<T>, Code.File>(
    (soFar, plugin) => plugin.transformBaseFile(typeInformation, soFar),
    baseFile,
    plugins,
  );
}

function buildFileWriteRequest<T>(
  request: ObjCGenerationRequest<T>,
  typeInfoProvider: ObjCGenerationTypeInfoProvider<T>,
  plugins: List.List<ObjCGenerationPlugIn<T>>,
): Either.Either<Error.Error[], FileWriter.FileWriteRequest> {
  const classFileFromTypeInfo: (
    typeInformation: T,
    typeName: string,
    comments: string[],
    file?: Code.File,
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

  // In single-file output mode, everything goes into the same file, and
  // we don't listen to any of the output control flags for not outputting
  // the base file.
  if (request.outputFlags.singleFile) {
    const baseFileOrError = classFileFromTypeInfo(
      request.typeInformation,
      typeInfoProvider.typeNameForType(request.typeInformation),
      typeInfoProvider.commentsForType(request.typeInformation),
    )
      .map(function(file: Code.File) {
        return transformFileWithPlugins(
          file,
          request.typeInformation,
          filteredPlugins,
        );
      })
      .mbind(function(file: Code.File) {
        // gather additional type files, then merge them into our base file
        const extraTypes = typeInfoProvider.additionalTypesForType(
          request.typeInformation,
        );
        return extraTypes.reduce(function(
          prev: Either.Either<Error.Error, Code.File>,
          type: T,
        ) {
          return prev.mbind(function(prevFile: Code.File) {
            return classFileFromTypeInfo(
              type,
              typeInfoProvider.typeNameForType(type),
              typeInfoProvider.commentsForType(type),
              prevFile,
            )
              .map(function(file: Code.File) {
                return transformFileWithPlugins(file, type, filteredPlugins);
              })
              .map(function(file: Code.File) {
                // plugins can add headers we don't want, as it's tough to know whether you
                // are the main type, or an additional type when generating the file, so for
                // now I am just going to filter the headers out.
                var newFile = file;
                newFile.imports = file.imports.filter(function(
                  value: ObjC.Import,
                ) {
                  return (
                    value.file != typeInfoProvider.typeNameForType(type) + '.h'
                  );
                });
                newFile.forwardDeclarations = file.forwardDeclarations.concat([
                  ObjC.ForwardDeclaration.ForwardClassDeclaration(
                    typeInfoProvider.typeNameForType(type),
                  ),
                ]);
                return newFile;
              });
          });
        },
        Either.Right<Error.Error, Code.File>(file));
      });

    const fileWriteRequestOrError: Either.Either<
      Error.Error,
      FileWriter.FileWriteRequest
    > = Either.mbind(function(file: Code.File) {
      const emptyRequest = Either.Right<
        Error.Error,
        FileWriter.FileWriteRequest
      >({
        name: typeInfoProvider.typeNameForType(request.typeInformation),
        requests: List.of<FileWriter.Request>(),
      });

      const result = fileCreationRequestContainingAdditionalFile(
        request.outputFlags,
        outputPath,
        emptyRequest,
        file,
      );
      return result;
    }, baseFileOrError);

    return fileCreationRequestContainingArrayOfPossibleError(
      fileWriteRequestOrError,
    );
  } else {
    const typeInfos = [request.typeInformation].concat(
      typeInfoProvider.additionalTypesForType(request.typeInformation),
    );

    // each type info will manifest as its own file, regardless of whether
    // the single-file output flag is set.
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

      // add files from plugins, or merge them into our base file
      // We'll end up with an array of files. If single file is set,
      // we will only have one entry in the array.
      const filesToWrite: Either.Either<
        Error.Error,
        Code.File[]
      > = classFile.map(function(files: Code.File[]) {
        const additionalFiles: Code.File[] = List.foldl<
          ObjCGenerationPlugIn<T>,
          Code.File[]
        >(
          (soFar, plugin) => buildAdditionalFiles(type, soFar, plugin),
          [],
          filteredPlugins,
        );
        return files.concat(additionalFiles);
      });

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
      }, filesToWrite);

      return fileCreationRequestContainingArrayOfPossibleError(
        completeFileCreationRequest,
      );
    });

    // Unify all write requests
    return allFileRequests.reduce(function(
      soFar: Either.Either<Error.Error[], FileWriter.FileWriteRequest>,
      current: Either.Either<Error.Error[], FileWriter.FileWriteRequest>,
    ) {
      return Either.map(function(
        request: FileWriter.FileWriteRequest,
      ): FileWriter.FileWriteRequest {
        return {
          name: request.name,
          requests: List.append(request.requests, current.right!.requests),
        };
      },
      soFar);
    });
  }
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
              requests: List.map(plugin.transformFileRequest, request.requests),
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
