/**
 * gulp-thrift
 * Streamified Thrift file generation for Gulp.js
 * (c) 2015 Daniel Chao
 * May be distributed under the MIT license. 
 */

const createArgs   = require('./createArgs');
const through      = require('through');
const _            = require('lodash');
const path         = require('path');
const mkdirp       = require('mkdirp');
const { exec }     = require('child_process');
const Promise      = require('bluebird');
const fs           = Promise.promisifyAll(require('fs'));
const File         = require('vinyl');
const gutil        = require('gulp-util');
const syncExec     = require('sync-exec')

const tempFolder = path.join(__dirname, "../.tmp")
mkdirp.sync(tempFolder)


/**
 * determine whether the executable for opts.thriftPath is valid or not. Will throw error if not valid.
 * 
 * @private
 * 
 * @param  {String}     thriftPath      the path for the thrift executable
 * @return {Undefined}
 */
const verifyThriftPath = function (thriftPath) {

  if (thriftPath && fs.existsSync(thriftPath)) {
    return;
  } else {
    const { stdout } = syncExec("which thrift");
    if (stdout) {
      return;
    }
  }

  throw new gutil.PluginError("gulp-thrift", `${ gutil.colors.yellow(thriftPath) } is not a valid executable. Please install Thrift and have it in your $PATH, or provide its location as the thriftPath option.

  For installation instructions:
  https://thrift.apache.org/docs/install/
  `)
};


/**
 * Remove all items in the temp folder.
 *
 * @private
 * 
 * @return {Promise}
 */
const emptyTempFolder = function(){
  return fs.readdirAsync(tempFolder)
  .map((file) => {
    return fs.unlinkAsync(path.join(tempFolder, file))
  })
  .catch((error) => {
    throw new gutil.PluginError("gulp-thrift", error)
  });
};

/**
 * given a filepath, read it out of disk and wrap it as a vinyl file object.
 *
 * @private
 * 
 * @param  {Array}    arr
 * @param  {String}   arr.filename
 * @return {String}   arr.contents
 */
const readAsVinylFile = function (filepath) {
  return fs.readFileAsync(filepath)
  .then((contents) => {
    return new File({ cwd: "/", base: path.dirname(filepath), path: filepath, contents: contents });
  });
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

module.exports = function gulpThrift (opts = {}) {

  var processes = [];

  opts.gen        = opts.gen || "js";
  opts.out        = opts.out || tempFolder;
  opts.thriftPath = opts.thriftPath || "thrift";

  verifyThriftPath(opts.thriftPath);

  // compile thrift files into a temp directory
  const writeFn = function (file) {
    return processes.push(new Promise((resolve, reject) => {
      const command = `${ opts.thriftPath } ${ createArgs(opts) } ${ file.path }`;
      if (opts.versbose) {
        gutil.log("executing command", command);
      }
      exec(command, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    }));
  };

  // read compiled files from directory into stream
  const endFn = function(){

    return Promise.all(processes)
    .then(function(){
      return fs.readdirAsync(tempFolder);
    })
    .map((file) => { 
      return path.join(__dirname, `../.tmp/${ file }`) 
    })
    .map(readAsVinylFile)
    .each((file) => { 
      return this.queue(file) 
    })
    .then(emptyTempFolder)
    .then(() => { 
      return this.queue(null) 
    })
    .catch(function(error){
      throw new gutil.PluginError('gulp-thrift', error)
    });
  };

  return through(writeFn, endFn)

};