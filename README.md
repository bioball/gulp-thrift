# Gulp Thrift

Streamifies [Apache Thrift](https://thrift.apache.org/) file generation for Gulp.

Note that this library just calls Thrift directly and places all compiled files in a temporary folder, then reads the files in that folder back into the stream. Unfortunately, Thrift doesn't have an option to spit things into `STDOUT`.

**This is still a work in progress, don't use it yet**

## Installation

`npm install gulp-thrift`

https://thrift.apache.org/docs/install/os_x

## Syntax

```js
gulp.src('flubird/*.thrift')
.pipe(thrift(<options>))
.pipe(gulp.dest('./lib'))
```


An options object takes the following options

```js
{
  version: <boolean>, // prints the compiler version
  I: <array of directory strings>, // add a directory to the list of directories available to the thrift compiler
  nowarn: <boolean>, // silences thrift warnings
  strict: <boolean>, // toggles strict mode
  verbose: <boolean>, // toggles verbose mode
  debug: <boolean>, // parse debug trace to stdout
  allowNegKeys: <boolean>, // 
  allow64BitConsts: <boolean>, // do not print warnings about using 64-bit consts
  gen: <string>, // the language to compile into
  thriftPath: <string> // the location of the thrift executable
}
```


## Contribution

Submit pull requests and whatnot through Github, and write tests for them

## Tests

Install the development dependencies via `npm install`, then run the test suite with `make`.
