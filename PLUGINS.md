#Plugins in Remodel

In Remodel, plugins both act as an extensibility point and provide important default behavior.

Some plugins are on by default, and those can be turned off by using the `excludes` keyword. Any non-default can be turned on by using the `includes` keyword.

Below is a complete list of the plugins available with Remodel. The first three are special — the generally should all be turned off or on at the same time and, together, they make Remodel generate immutable value objects.

**Immutable Value Object Plugins**

* `RMImmutableProperties` Generates immutable, copy-on-write properties for each attribute in a given Remodel .value file. Other plugins often assume that these properties exist, so if you were excluding this, it would probably either be in a very specialized scenario or because you're replacing it with a custom plugin that did something similar.

    *Applies by default to .value files. Since .adtValue's don't generate public properties, does not apply to them.*

* `RMEquality` Generates the `isEqual:` and `hash` functions. These functions will compare the current object by looking at the values of its properties rather than by looking at its pointer identity.

    *Applies by default to .value and .adtValue files.*

* `RMCopying` Generates a trivial implement of the `NSCopying` protocol on the value object. Since Remodel objects created with these plugins are immutable and compared based on their values, simply returning a pointer to `self` is the best behavior: it's far more efficient than doing a 'deep copy' and it's output looks and acts exactly the same to a caller.

    *Applies by default to .value and .adtValue files.*

**Other Core Plugins**

* `RMCoding` Generates the `initWithCoder:` and `encodeWithCoder:` methods. Having these methods allow you  use to NSCoder to transform a `.value` object file into an NSData object that can easily be sent over the network or saved to disk.

    *Applies to .value and .adtValue files, but not by default.*

* `RMDescription` Generates an implementation of the `description` method that prints out of the values of the properties on this object. This can be very useful for logging.

    *Applies by default to .value and .adtValue files.*

**Special Use Plugins**

* `RMBuilder` including this plugin will cause a separate file to be generated that makes it easier to instantiate the .value file with only a subset of the properties. This will be useful in two cases.

    First;y, inside of your unit tests you generally only want to specify the minimum number of properties that the test particularly depends on. With builders you can avoid directly calling the initializer which means that you will not have to update every one of your tests when you decide to add a new property onto a value object.

    Secondly, sometimes in code you want to make an instance of a Remodel object that has all the fields from a different instance except for maybe one or two properties. The builder enables this scenario as well.

    *Applies to .value files.*

* `RMFetchStatus` generates a field and a separate object that tracks which properties on the `.value` object are present.

    This is useful when your `.value` object can come from a sparse fetch. For example, imagine the scenario where you have an object that comes from the server with a certain set of fields, but more can be fetched based on user interaction.  If there are a lot of different permutations around what might be fetched, it could be impractical to make a separate type for each set of possible fields.

    In these cases, it can be helpful to have a separate tracking of what's fetched. Keep in mind that there are drawbacks to using these. Significantly, every time a property is accessed, you have to remember to check the fetchStatus property, which means these objects are error prone.

    If you are considering using making a `FetchStatus` object, remember that there are other options as well - making an ADT or breaking your value object into sub objects. Either of these will go a long way towards allowing the compiler to help you validate that you're accessing data in right way.

    *Applies to .value files.*
