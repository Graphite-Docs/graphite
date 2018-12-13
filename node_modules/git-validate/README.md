# git-validate

This is a super simple framework to facilitate creating your own modules similar to [precommit-hook](https://github.com/nlf/precommit-hook).

## Usage

This module isn't intended to be used directly in your projects (thought it can be), but rather as the dependency of a module that you create that will act as a template of sorts.

To create a validate module, first make a new directory and use `npm init` to initialize your module:

```bash
mkdir validate-nlf
cd validate-nlf
npm init
```

Follow the prompts, and when complete install this module:

```bash
npm install --save git-validate
```

Now, let's say we want to provide a default `.jshintrc` file, let's go ahead and create that file in our new directory and fill it with some options:

```bash
vim jshintrc
```

```javascript
{
  "node": true,

  "curly": true,
  "latedef": true,
  "quotmark": true,
  "undef": true,
  "unused": true,
  "trailing": true
}
```

Note that we saved the file as `jshintrc` without the leading dot.

Next, let's create our install script:

```bash
vim install.js
```

```javascript
var Validate = require('git-validate');

Validate.copy('jshintrc', '.jshintrc');
```

This instructs **git-validate** to copy the `jshintrc` file in our module to `.jshintrc` in the root of the project that installs it.

Now we edit our `package.json` to tell it about our install script:

```javascript
  "scripts": {
    "install": "node install.js"
  }
```

And that's it for the simplest possible example. Now anytime you install `validate-nlf` you'll automatically get a `.jshintrc` file in your project.

This wouldn't be any fun without the git hooks though, so let's extend it a bit further to make sure that `jshint` is run any time a user tries to `git commit` after installing our module. We can do that by configuring the hook in our install script like so:

```javascript
Validate.installScript('lint', 'jshint .');
Validate.configureHook('pre-commit', ['lint']);
```

Great, that's it!

Now when a user installs your package the `installScript` method will see if they already have a script in their package.json named `lint`, if they do not it will add one that runs `"jshint ."`. The second line will also check their package.json for a `pre-commit` key, which is used to configure that specific git hook. If the key does not exist, it will be added with the value `["lint"]` telling git-validate to run the "lint" script on `pre-commit`.


## The Details

**git-validate** exports a few methods to be used for creating your custom hooks.

### `copy`

Copy a file or directory from your hook to a target project.

```javascript
Validate.copy(source, target, options);
```

Where `source` is a path relative to your install script, and `target` is a path relative to the root of the project that is installing the module. For example if my module has the layout:

```
bin/install
jshintrc
```

And I wish for the file `jshintrc` to be placed in the root of projects as `.jshintrc` when running `bin/install`, I would call `Validate.copy('../jshintrc', '.jshintrc')`.

Note that `source` may be a file *or* a directory. If a directory is specified than a new directory will be created at `target` and the *full contents* of source will be copied to the `target` directory recursively.

The only `option` currently available is `overwrite`. When set to `true` overwrite will *always* copy the given file, overwriting any existing destination file. If this is not set, `copy` will instead silently fail and leave the old file in place.


### `installHooks`

Install one or more git hooks to the current repo.

```javascript
Validate.installHooks('pre-commit');
Validate.installHooks(['pre-commit', 'pre-push']);
```

This method will copy the hook script to the appropriate path in your repo's `.git/hooks` path.

### `configureHook`

Provide a default configuration for a given hook.

```javascript
Validate.configureHook('pre-commit', ['lint', 'test']);
```

would write

```javascript
{
  "pre-commit": ["lint", "test"]
}
```

to your package.json, but *only* if the `"pre-commit"` key was not already set, or you specify so explicitly:

```javascript
{
  "pre-commit": ["test"]
}
```

with:

```javascript
var overwrite = true;
Validate.configureHook('pre-commit', ['lint', 'test'], overwrite);
```

would change package.json to:

```javascript
{
  "pre-commit": ["lint", "test"]
}
```


### `installScript`

Configure a script (if it is not already configured) for the project via package.json.

```javascript
Validate.installScript('test', 'lab -a code');
```

would write

```javascript
{
  "scripts": {
    "test": "lab -a code"
  }
}
```

to your package.json. If the `"test"` script was already defined, this method will do nothing.


## Configuration

In addition to the `scripts` property, your package.json file will be parsed and checked for keys matching the name of your git hooks (e.g. `pre-commit`, `pre-push`, etc) and used to provide a list of hooks to be run for each hook. The keys must be an array of script names to be run. If any of the scripts are not defined, they will be skipped and a message will be printed showing that no script was found.

### per-branch hooks

It is possible to run scripts only for a specific branch by specifying the key in your `package.json` as `hook-name#branch`:

```javascript
{
  "pre-commit": ["lint", "test"],
  "pre-commit#dev": ["lint"]
}
```

In the above example, when run in the `dev` branch only the `lint` script will be run, however in all other branches both `lint` and `test` will be run.
