# grunt-couch-data

> Synchronizes JSON fixtures with CouchDB

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-couch-data --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-couch-data');
```

## The "couch_data" task

### Overview
In your project's Gruntfile, add a section named `couch_data` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  couch_data: {
    options: {
      dbHost: 'http://localhost:5984/',
      verbose: true
    },
    dev: {
      src: 'fixtures/dev/*.json'
    },
  },
});
```

### Options

#### options.dbHost
Type: `String`
Default value: None

Specifies the Couch DB server. It must end with a slash.

#### options.verbose
Type: `Boolean`
Default value: `false`

Enables or disables verbose output.

### Usage Examples
You must specify the .json fixture files, either by providing a `files` array or by providing a files `src` array within a particular target.

#### No target
For a simple setup, just list out your fixture files in the `files` property.

```js
grunt.initConfig({
  couch_data: {
    options: {
      dbHost: 'http://localhost:5984/',
    },
    files: [ 'fixtures/*.json' ]
  }
});
```

#### Target-specific setup
You can have different fixtures loaded based on your target.

```js
grunt.initConfig({
  couch_data: {
    options: {
      dbHost: 'http://localhost:5984/',
    },
    dev: {
      src: [ 'fixtures/dev/*.json' ]
    },
    prod: {
      src: [ 'fixtures/prod/*.json' ]
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
