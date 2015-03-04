# Gulp Thrift

Streamifies [Thrift](https://thrift.apache.org/) file generation.

## Installation

`npm install gulp-thrift`

NOTE: You'll need to install the thrift command line tool first, and have `thrift` in your `$PATH`. Instructions below:

https://thrift.apache.org/docs/install/os_x

## Usage

Here's a sample gulpfile.js using gulp-thrift.

```js
var gulp = require('gulp');
var thrift = require('gulp-thrift');

gulp.task('thrift', function(){
  return gulp.src('account.thrift')
  .pipe(thrift({ jQuery: true, gen: 'js' }))
  .pipe(gulp.dest('./lib/thrift'));
});

```

You can pass in an object of functions in into thrift. The following options are available to you:

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
  gen: <string> // the language to compile into
}
```

