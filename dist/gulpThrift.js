(function() {
  var File, Promise, _, createArgs, emptyTempFolder, es, exec, fs, gulpThrift, gutil, mkdirp, path, tempFolder, through, verifyThriftPath;

  createArgs = require('./createArgs');

  es = require('event-stream');

  through = require('through');

  _ = require('lodash');

  path = require('path');

  mkdirp = require('mkdirp');

  exec = require('child_process').exec;

  Promise = require('bluebird');

  fs = Promise.promisifyAll(require('fs'));

  File = require('vinyl');

  gutil = require('gulp-util');

  tempFolder = path.join(__dirname, "../.tmp");

  mkdirp.sync(tempFolder);

  verifyThriftPath = function(path) {
    if (!fs.existsSync(path)) {
      throw new Error(path + " is not a valid executable file");
    }
  };

  emptyTempFolder = function() {
    return fs.readdirAsync(tempFolder).map(function(file) {
      return fs.unlinkAsync(path.join(tempFolder, file));
    })["catch"](function(error) {
      return console.error(error);
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
   * @returns {Stream}                      A through stream
   *
   * @example
   * var thrift = require('gulp-thrift')
   * gulp.src('file.thrift')
   * .pipe(thrift({ gen: 'js' }))
   * .pipe(gulp.dest('./lib'))
   */

  module.exports = gulpThrift = function(opts) {
    var endFn, processes, writeFn;
    if (opts == null) {
      opts = {};
    }
    if (opts.thriftPath) {
      verifyThriftPath(opts.thriftPath);
    }
    processes = [];
    opts.thriftPath || (opts.thriftPath = "thrift");
    opts.gen || (opts.gen = "js");
    opts.out = tempFolder;
    writeFn = function(file) {
      return processes.push(new Promise((function(_this) {
        return function(resolve, reject) {
          var command;
          command = "thrift " + (createArgs(opts)) + " " + file.path;
          if (opts.versbose) {
            gutil.log("executing command", command);
          }
          return exec(command, resolve);
        };
      })(this)));
    };
    endFn = function() {
      return Promise.all(processes).then((function(_this) {
        return function() {
          return fs.readdirAsync(tempFolder).then(function(files) {
            return _.map(files, function(file) {
              return path.join(__dirname, "../.tmp/" + file);
            });
          }).map(function(filename) {
            return fs.readFileAsync(filename).then(function(contents) {
              return {
                contents: contents,
                filename: filename
              };
            });
          }).map(function(obj) {
            var file;
            file = new File({
              cwd: "/",
              base: path.dirname(obj.filename),
              path: obj.filename,
              contents: obj.contents
            });
            return _this.queue(file);
          })["finally"](function() {
            emptyTempFolder();
            return _this.queue(null);
          });
        };
      })(this))["catch"](function(error) {
        throw new gutil.PluginError('gulp-thrift', error);
      });
    };
    return through(writeFn, endFn);
  };

}).call(this);
