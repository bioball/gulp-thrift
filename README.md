# Gulp Thrift

[![Build Status](https://travis-ci.org/bioball/gulp-thrift.svg?branch=master)](https://travis-ci.org/bioball/gulp-thrift)

Streamifies [Apache Thrift](https://thrift.apache.org/) file generation for Gulp.

Note that this library just calls Thrift directly and places all compiled files in a temporary folder, then reads the files in that folder back into the stream. Unfortunately, Thrift doesn't have an option to spit things into `STDOUT`.

**This is still a work in progress, don't use it yet. I will up the version to 0.1.0 once it is ready.**

## Installation

You'll need to install Apache Thrift separately and have it available on your system. Installation instructions for OSX can be found [here](https://thrift.apache.org/docs/install/os_x).

Once you have it installed, make sure it is in your `$PATH`. Alternatively you may also point to the Thrift executable using the `thriftPath` option.

Then, install gulp-thrift using npm:

```
npm install gulp-thrift
```


## Usage

```js
gulp.src('./flubird/*.thrift')
.pipe(thrift())
.pipe(gulp.dest('./lib'))
```

## Options

### version

type: `Boolean`
<br />
default: `false`

Prints the compiler version

### includeDirs

type: `Array`
<br />
default: `[]`

List of directories to include when searching for directives

### nowarn

type: `Boolean`
<br />
default: `false`

Silence compiler warnings

### strict

type: `Boolean`
<br />
default: `false`

Toggles strict mode

### verbose

type: `Boolean`
<br />
default: false

Toggles verbose mode

### allowNegKeys

type: `Boolean`
<br />
default: `false`

Allow negative field keys (Used to preserve protocol compatibility with older .thrift files)

### allow64BitConsts

type: `Boolean`
<br />
default: `false`

Don't print warnings about using 64-bit constants

### gen

type: `String`
<br />
default: `'js'`

The language to compile into

### thriftPath

type: `String`
<br />
default: `'thrift'`

The location of the thrift compiler executable. By default, it's assumed to be in your `$PATH`.


## Contribution

Submit pull requests and whatnot through Github, and write tests for them

## Tests

Install the development dependencies via `npm install`, then run the test suite with `make`.
