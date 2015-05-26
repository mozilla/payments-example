This is an example site that sells products with Mozilla's
[payment system](https://github.com/mozilla/payments-env).

The deps are committed to the tree so all you should need is to checkout this branch.

## Updating or adding deps

Get [bower](http://bower.io/) and update dependencies by running:

    bower install

By default `bower_components` is ignored. If you've added a new dependency
run `git add -f bower_components/<whatever>/*.js` changing the lib name and
file extension to add as necessary.
