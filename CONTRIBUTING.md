# Contributing to Remodel

We want to make contributing to this project as easy and transparent as possible.

Before you dig in, you should keep in mind that Remodel has an extensibility model that should allow significant customization without having to change Remodel code itself. See the README and examples for more on our plugin framework.

In the cases where Remodel itself does need updates, we will welcome your pull requests.

## Code of Conduct
The code of conduct is described in [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Our Development Process

We use GitHub to sync code to and from our internal repository. We'll use GitHub to track issues and feature requests, as well as accept pull requests.

To set up your repro, use the standard practice:

```sh
git clone https://github.com/facebook/remodel && cd remodel && npm install
```

## Pull Requests

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests. See more on this below.
3. If you've changed APIs, update the documentation.
4. Ensure that the existing acceptance and unit test suites pass.
5. Make sure your code lints.
6. If you haven't already, complete the Contributor License Agreement ("CLA").

## Testing your code

Remodel has both acceptance tests and unit tests.

## Acceptance Tests

The acceptance tests are meant to be high level and should generally be thought of as using the script the same way a developer would. Our acceptance tests are able to run full Remodel generations, allowing verification that our features work as expected, end-to-end.

Generally, if you are adding a feature, you should also write an acceptance test that validates  your new behavior. You should do this before you start writing the code. This allows you to decide on an API ahead of time, and once your acceptance test passes, you'll know you have a working feature.

Acceptance tests are represented in `.feature` files that we run with Cucumber. They are found under the 'Features' folder.

You can run existing acceptance tests by going to the Remodel directory and calling:

`bin/runAcceptanceTests`

Rather than hand-editing all tests to reflect your changes, you can "resnapshot" failing tests by running `bin/runAcceptanceTests --world-parameters '{"resnapshot": true}'`. You can forcibly resnapshot all tests by running `bin/runAcceptanceTests --world-parameters '{"forceResnapshot": true}'`. Make sure to inspect your changes if you use these options!

## Unit Tests

We also have unit tests, which cover smaller, individual pieces of Remodel. If you are adding new exported methods to an object or a new object which exposes functionality, please also add unit test for it.

You can run existing unit test by going to the Remodel directory and calling:

`bin/runUnitTests`

## Contributor License Agreement ("CLA")

In order to accept your pull request, we need you to submit a CLA. You only need to do this once to work on any of Facebook's open source projects.
Complete your CLA here: https://code.facebook.com/cla

## Issues

We use GitHub issues to track public bugs. Please ensure your description is clear and has sufficient instructions to be able to reproduce the issue.
Facebook has a [bounty program](https://www.facebook.com/whitehat/) for the safe disclosure of security bugs. In those cases, please go through the process outlined on that page and do not file a public issue.

## Coding Style

* 2 spaces for indentation rather than tabs
* Remodel is written in a functional style, which generally means preferring immutable state and keeping that state separated from behavior.

## License

By contributing to Remodel, you agree that your contributions will be licensed under its MIT license.
