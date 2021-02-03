![Remodel](images/logo.png)

# Remodel

## An Objective-C code generation tool specialized for quickly creating and editing model objects

Remodel is a tool that helps iOS and OS X developers avoid repetitive code by generating Objective-C models that support coding, value comparison, and immutability.

For more on Remodel, see our [blog post](https://code.facebook.com/posts/1154141864616569/building-and-managing-ios-model-objects-with-remodel/).

## Installation

```sh
$ npm install -g remodel-gen
```

## Usage

In order to create a new value type you must first create a `.value` file wherever you want the corresponding Objective-C files to be created. That file should declare both the properties you want the new value object to have, as well as the types of those properties.


For example, here is a simple contact object:

```objc
AddressBookContact {
  NSUInteger identifier
  NSString *name
  NSArray<NSString *> *phoneNumbers
}
```

Once you have created the `.value`  file you can now generate the corresponding Objective-C objects. There are a couple of ways to do this.

```sh
# generates this specific value file
$ remodel-gen Path/To/AddressBookModels/AddressBookContact.value

# generates all .values in this sub-directory (and all child directories)
$ remodel-gen Path/To/AddressBookModels/
```

The script should output the following line for each model object it generates: "Generating <ObjectSpecName>".

If there are any obvious typos the system should detect it and give an error message.

## Annotations

Remodel also supports adding annotations to top level objects as well as individual attributes . These allow us to supply the generator with the extra information that is sometimes required to generate a object correctly.

For example, Remodel guesses that any types it needs to import are defined in the same library as the file it's generating.

```objc
// AddressBookContact.value
AddressBookContact {
  NSUInteger identifier
  NSString *name
  NSArray<PhoneNumber *> *phoneNumbers
}

// AddressBookContact.h
# import "PhoneNumber.h"

@implemention AddressBookContact
...
@end
```


This assumption works for many cases, but sometimes we need to import types from other libraries or when the name of the file containing the type we're importing doesn't match  doesn't match that type's name.

To afford for this, we have a type attribute that lets the consumer specify more details about a type they are trying to generate:

```objc
%type name="PhoneNumber" library="PhoneNumberLib" file="PhoneNumberTypes"
AddressBookContact {
  NSUInteger identifier
  NSString *name
  PhoneNumber *phoneNumbers
}

// This will generate an import in AddressBookContact.h that looks like:
# import <PhoneNumberLib/PhoneNumberTypes.h>
// instead of:
# import "PhoneNumber.h"
```

Another important annotation is library. This will make things easier for you if you are using header maps. For example:

```objc
%type name="PhoneNumber" library="PhoneNumberLib" file="PhoneNumberTypes"
%library name="AddressBookContact"
AddressBookContact {
  NSUInteger identifier
  NSString *name
  PhoneNumber *phoneNumbers
  ContactActivityState *state
}

// This will generate imports in AddressBookContact.h that looks like:
# import <PhoneNumberLib/PhoneNumberTypes.h>
# import <AddressBookContact/ContactActivityState.h>
```

## Handling non-object types

Sometimes, we need to support a type that does not derive from `NSObject`, for example an enumeration.

Consider:

```objc
typedef NS_ENUM(NSInteger, ContactType) {
...
}
```

If we want use this in a Remodel object we'll have to tell it that is an underlying type, since knowing that type will allow it to generate the correct description and encode/decode methods.

```objc
%type name=ContactType library=TypeLib file=ContactEnumDefines canForwardDeclare=false
AddressBookContact {
  NSUInteger identifier
  NSString *name
  ContactType(NSInteger) type;
}
```

## Attribute types should implement NSCopying

Remodel is specialized for building immutable value objects, so by default, it assumes that all attributes types conform to `NSCopying`. Unfortunately, it's not possible to know at generation time or compile time if an object conforms to `NSCopying`. Therefore the following will generate an exception at runtime.

```objc
// Counter example
AddressBookContact {
  NSUInteger identifier
  NSString *name
  UIView *myView // this does not work because UIView does not conform to NSCopying
}
```

Likewise, Remodel does not support attributes with protocol types  at this time since, in general, data should not be protocolized.

```objc
// Counter example
AddressBookContact {
  NSUInteger identifier
  NSString *name
  id<NSCopying> myInfo // This will cause a generation time failure since Remodel does not support protocol types for attributes
}
```

## Comments

Remodel supports adding comments to the objects it generates.

```objc
# Represents a contact in the AddressBook system
AddressBookContact {
  NSUInteger identifier
  # The full name of this contact, formatted for the current locale and to be displayed directly in the UI
  NSString *name
}
```

## Plugins

`.value` files can choose which features they want Remodel to include in their generated files. For example, to generate coding/decoding methods, you can use the `RMCoding` plugin:

```objc
AddressBookContact includes(RMCoding) {
  NSUInteger identifier
  NSString *name
  PhoneNumber *phoneNumbers
}
```

The inclusion of the `RMCoding` plugin will cause `Remodel` to generate `AddressBookContact`  as conforming to `NSCoding` along with the appropriate encode/decode methods. Note that `PhoneNumber` must itself conform to  `NSCoding`, otherwise there will be an error when we try to compile  `AddressBookContact`.

A complete list of plugins included in Remodel can be found [here](PLUGINS.md)

## Algebraic Data Types

Algebraic data types (ADT) are a cousin to the immutable value objects Remodel generates. ADTs allow clean expression of abstract data. For example, consider the case of two mutually exclusive sources for a contact, each with its owns means of identification.

```objc
AddressBookContact {
  // set if contact is synced from AD
  uint64_t activeDirectoryId
  // set if the contact was imported from email
  NSString *email
}
```

With a setup like this, it's pretty easy to create invalid objects and it's unclear how much validation consumers should do. For example:

```objc
// There is no easy way to know that the following object is invalid
AddressBookContact *contact = [[AddressBookContact alloc] initWithActiveDirectoryId:1 email:@"email@email.com"];

// Also, methods or functions that interact with Contacts have to deal with the fact that they may receive invalid contact configurations
AddressBookContact *contact = GetContact();
Assert(contact.activeDirectoryId != 0 || contact.email.length > 0);
Assert(!(contact.activeDirectoryId != 0 && contact.email.length > 0));
```

Using an ADT we can express this data more cleanly:

```objc
// AddressBookContactIdentifier.adtValue

AddressBookContactIdentifier {
  ActiveDirectory {
    uint64_t activeDirectoryId
  }
  email {
    NSString *email
  }
}

// AddressBookContact.value
AddressBookContact {
  AddressBookContactIdentifier *identifier;
  ...
}
```

Methods or functions using `AddressBookContact` would now look like

```objc
AddressBookContact *contact = GetContact();
[contact.identifier
   matchActiveDirectory:^(uint64_t activeDirectoryId) {
     // handle AD contact
   }
   email:^(NSString *email) {
    // handle email contact
   }
 ];
```

Likewise, creating a `AddressBookContactIdentifier` is a lot clearer, since the object only allows valid configurations:

```objc
AddressBookContactIdentifier *identifier = [AddressBookContactIdentifier activeDirectoryWithId:_id];
```

To generate ADTs, use the `generateAlgebraicDataTypes` command.

```sh
$ remodel-gen Path/To/AddressBookModels/AddressBookContactIdentifier.adtValue
```

## Configuring and Customing Remodel

For advanced users, there are few ways to tailor how Remodel works in your repo. These are documented in their own [file](CUSTOMIZATIONS.md).

## Contributing

We welcome pull requests. Please see our docs on [contributing](CONTRIBUTING.md) for details

## License

Copyright (c) 2016-present, Facebook, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
