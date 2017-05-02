# CUSTOMIZE.md

There are a few ways you can customize how Remodel behaves in your repo. 

**Writing your own plugin**

The field information in the `.value` file can be used to generate other useful utilities. For example, support for generating coding methods is built as plugin. To see more about the built-in Remodel plug-ins see here (). An interesting walk through of what a useful plugin might look like can be found in the blog article [here](https://code.facebook.com/posts/1154141864616569/building-and-managing-ios-model-objects-with-remodel/) under ‘Customizing Remodel'.

To build a plugin:

* Create a js file that implements the following for [valueObjects](https://github.com/facebook/remodel/blob/master/src/object-spec.ts#L44), and the following for [algebraicDataTypes](https://github.com/facebook/remodel/blob/master/src/algebraic-type.ts#L84).
* Update your `.valueObjectConfig` or `.algebraicTypeConfig`  like so:

```
{
  "customPluginPaths": [
    "relative/path/to/custom-plug-in.js"
  ]
}
```

* In the relevant `.value` file or `.adtValue` file, add `includes(MyPlugin)` to the Remodel definition.
* For more detail on what a a plugin might look like, check out some of the built in [plugins](https://github.com/facebook/remodel/tree/master/src/plugins)

**Other configuration options**

Some other advanced customization options are also supported in config files. To customize adtValues the relevant file is `.algebraicTypeConfig` while for value objects, `.valueObjectConfig` is the config file. Note that a config file operates for all Remodel objects that are generated in its sub-tree on the file system. 

Here is an example of what a fully qualified config file might look like:

```
{
  "customBaseClass": { "className": "MyCustomBaseClass", "libraryName": "MyCustomBaseClassLibrary" },
  "diagnosticIgnores": [ "-WCFString-literal" ],
  "defaultExcludes": [
    "RMDescription",
   ],
}
```

* **customBaseClass** - specifies the base class for all the Remodel objects.
* **diagnosticIgnores** - specifies clang warnings to want to ignore in Remodel object implementations.
* **defaultExcludes** - specifies on-by-default plugins to turn-off unless explicitly included in a given Remodel definition.

