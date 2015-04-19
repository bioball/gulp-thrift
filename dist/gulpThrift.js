'use strict';

var createArgs = require('./createArgs');
var through = require('through');
var _ = require('lodash');
var path = require('path');
var mkdirp = require('mkdirp');

var _require = require('child_process');

var exec = _require.exec;

var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var File = require('vinyl');
var gutil = require('gulp-util');

var tempFolder = path.join(__dirname, '../.tmp');
mkdirp.sync(tempFolder);

/**
 * determine whether the executable for opts.thriftPath is valid or not. Will throw error if not valid.
 * 
 * @private
 * 
 * @param  {String}     thriftPath      the path for the thrift executable
 * @return {Undefined}
 */
var verifyThriftPath = function verifyThriftPath(thriftPath) {
  if (!fs.existsSync(thriftPath)) {
    throw new gutil.PluginError('gulp-thrift', '' + thriftPath + ' is not a valid executable file. Please install Thrift and have it in your $PATH, or provide it as the thriftPath argument.');
  }
};

/**
 * Remove all items in the temp folder.
 * @return {Promise}
 */
var emptyTempFolder = function emptyTempFolder() {
  return fs.readdirAsync(tempFolder).map(function (file) {
    fs.unlinkAsync(path.join(tempFolder, file));
  })['catch'](function (error) {
    throw new gutil.PluginError('gulp-thrift', error);
  });
};

/**
 * create a vinyl file from filename and contents.
 *
 * @private
 * 
 * @param  {Object}   obj
 * @param  {String}   obj.filename
 * @return {String}   obj.contents
 */
var createVinylFile = function createVinylFile(_ref) {
  var filename = _ref.filename;
  var contents = _ref.contents;

  return new File({ cwd: '/', base: path.dirname(filename), path: filename, contents: contents });
};

/**
 * @description  
 * streamifies file generation
 *
 * @param {Object} opts 
 * @param {String} opts.version           outputs compiler version
 * @param {Array} opts.I                  include in directories searched for included directives
 * @param {Boolean} opts.nowarn           suppress compiler warnings
 * @param {Boolean} opts.strict           toggle strict compiler warnings
 * @param {Boolean} opts.recurse          generate all included files
 * @param {Boolean} opts.verbose          verbose mode
 * @param {Boolean} opts.allowNegKeys     Allow negative field keys
 * @param {Boolean} opts.allow64bitConsts Don't print warnings about 64-bit constants
 * @param {String} opts.gen               The language to compile into
 * @param {String} opts.thriftPath        location of the thrift executable
 * @returns {Stream}                      A transform stream
 *
 * @example
 * var thrift = require('gulp-thrift')
 * gulp.src('file.thrift')
 * .pipe(thrift({ gen: 'js' }))
 * .pipe(gulp.dest('./lib'))
 */

module.exports = function gulpThrift() {
  var opts = arguments[0] === undefined ? {} : arguments[0];

  var processes = [];

  opts.thriftPath = opts.thriftPath || 'thrift';
  opts.gen = opts.jen || 'js';
  opts.out = opts.out || tempFolder;

  verifyThriftPath(opts.thriftPath);

  // compile thrift files into a temp directory
  var writeFn = function writeFn(file) {
    return processes.push(new Promise(function (resolve, reject) {
      var command = 'thrift #{ createArgs(opts) } #{ file.path }';
      if (opts.versbose) {
        gutil.log('executing command', command);
      }
      exec(command, resolve);
    }));
  };

  // read compiled files from directly into stream
  var endFn = function endFn() {
    var _this = this;

    return Promise.all(processes).then(function () {
      return fs.readdirAsync(tempFolder).map(function (file) {
        return path.join(__dirname, '../.tmp/' + file);
      }).map(function (filename) {
        // keep a reference to the filename for each read file.
        return fs.readFileAsync(filename).then(function (contents) {
          return { contents: contents, filename: filename };
        });
      }).map(createVinylFile).each(function (file) {
        _this.queue(file);
      }).then(emptyTempFolder)['finally'](function () {
        return _this.queue(null);
      });
    })['catch'](function (error) {
      throw new gutil.PluginError('gulp-thrift', error);
    });
  };

  return through(writeFn, endFn);
};