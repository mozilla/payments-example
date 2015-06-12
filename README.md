This is an example site that sells products with Mozilla's
[payment system](https://github.com/mozilla/payments-env).

The deps are committed to the tree so all you should need is to checkout this branch.

## Adding deps

Deps are installed via bower or npm. Where possible use npm.

By default `node_modules` and `bower_components` are ignored. If you've
added a new dependency update the grunt copy task to copy the new lib
files into place and commit them.

## Updating existing deps.

Use the grunt tasks to clean and copy the lib files.

```
npm install
bower install
grunt clean copy
```
