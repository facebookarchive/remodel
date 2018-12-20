# CUSTOMIZATIONS.md

You can customize most aspects of Remodel and how it behaves in your repo. You can e.g. change the superclass of generated objects, turn some features on or off or even completely change what code is generated.

**Configuration options**

You can configure Remodel on a per directory basis.

-  Create a `.valueObjectConfig` file to control the behavior of `.value` objects
-  Create a `.algebraicTypeConfig` file to control the behavior of `.adtValue` objects

A config file operates for all Remodel objects that are generated in its sub-tree in the file system. If you want to configure your whole repository, put it in the root directory.

Here is an example of what a fully qualified config file might look like:

```javascript
{
  "customBaseClass": {
    "className": "MyCustomBaseClass",
    "libraryName": "MyCustomBaseClassLibrary"
  },
  "diagnosticIgnores": [
    "-WCFString-literal"
  ],
  "defaultExcludes": [
    "RMDescription"
  ]
  "defaultIncludes": [
    "RMSubclassingRrestricted",
    "RMCoding"
  ],
  "customPluginPaths": [
    "relative/path/to/custom-plugin.js"
  ]
}
```

- **`customBaseClass`** - specifies the base class for all generated Remodel objects
- **`diagnosticIgnores`** - specifies clang warnings to want to ignore in Remodel object implementations
- **`defaultExcludes`** - excludes given plugins from beeing executed by default, if not specified in a Remodel definition
- **`defaultIncludes`** - includes given plugins to be executed by default, even if not specified in a Remodel definition
- **`customPluginPaths`** - specifies filepaths to additional custom plugins, if you want to extend the capabilities of Remodel

**Writing your own plugin**

By writing custom plugins, you can change how files are generated or generate additional methods and classes. All existing functionality is built using plugins, e.g. `RMCoding` (implements `NSCoding` in your generated objects) or `RMBuilder` (generates builder classes). You can explore the existing plugins in [`/src/plugins/`](https://github.com/facebook/remodel/tree/master/src/plugins).

An interesting walk through of what a useful plugin might look like can be found in [this blog article](https://code.facebook.com/posts/1154141864616569/building-and-managing-ios-model-objects-with-remodel/) - see "Customizing Remodel".

To add a new plugin:

1. Either create a typescript file (`.ts`) and compile it to javascript (or create a javascript file (`.js`) directly) that implements the following for [value objects](https://github.com/facebook/remodel/blob/master/src/object-spec.ts#L43) and/or the following for [algebraic data types](https://github.com/facebook/remodel/blob/master/src/algebraic-type.ts#L83).
  - You can explore the existing plugins in [`/src/plugins/`](https://github.com/facebook/remodel/tree/master/src/plugins) to see examples.
1. Register the plugin in your `.valueObjectConfig` or `.algebraicTypeConfig` as described above in "Configuration options".
1. In order to use your plugin, you have to include it in your `.value` or `.adtValue` file by adding `includes(MyCustomPlugin)`. E.g. like this:

```
// MyType.value
MyType includes(MyCustomPlugin) {
  NSString *someProperty
  NSInteger anotherProperty
}
```
