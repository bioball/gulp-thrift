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
const verifyThriftPath = function (thriftPath){
  if (!fs.existsSync(thriftPath)) {
    throw new gutil.PluginError("gulp-thrift", `${ thriftPath } is not a valid executable file. Please install Thrift and have it in your $PATH, or provide it as the thriftPath argument.`)
  }
};


/**
 * Remove all items in the temp folder.
 * @return {Promise}
 */
const emptyTempFolder = function(){
  return fs.readdirAsync(tempFolder)
  .map((file) => {
    fs.unlinkAsync(path.join(tempFolder, file))
  })
  .catch((error) => {
    throw new gutil.PluginError("gulp-thrift", error)
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
const createVinylFile = function ({ filename, contents }) {
  return new File({ cwd: "/", base: path.dirname(filename), path: filename, contents: contents });
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

  opts.thriftPath = opts.thriftPath || "thrift";
  opts.gen = opts.jen || "js";
  opts.out = opts.out || tempFolder;

  verifyThriftPath(opts.thriftPath);

  // compile thrift files into a temp directory
  const writeFn = function (file) {
    return processes.push(new Promise((resolve, reject) => {
      const command = `thrift ${ createArgs(opts) } ${ file.path }`;
      if (opts.versbose) {
        gutil.log("executing command", command);
      }
      exec(command, resolve);
    }));
  };

  // read compiled files from directly into stream
  const endFn = function(){

    return Promise.all(processes)
    .then(() => {
      return fs.readdirAsync(tempFolder)
      .map((file) => { return path.join(__dirname, `../.tmp/${ file }`) })
      .map((filename) => {
        // keep a reference to the filename for each read file.
        return fs.readFileAsync(filename)
        .then((contents) => { 
          return { contents, filename };
        });
      })
      .map(createVinylFile)
      .each((file) => {
        this.queue(file)
      })
      .then(emptyTempFolder)
      .finally(() => {
        return this.queue(null);
      })
    })
    .catch((error) => {
      throw new gutil.PluginError('gulp-thrift', error)
    });
  };

  return through(writeFn, endFn)

};