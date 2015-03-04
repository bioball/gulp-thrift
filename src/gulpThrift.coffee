createArgs   = require './createArgs'
es           = require 'event-stream'
through      = require 'through'
_            = require 'lodash'
path         = require 'path'
mkdirp       = require 'mkdirp'
{ exec }     = require 'child_process'
Promise      = require 'bluebird'
fs           = Promise.promisifyAll require 'fs'
File         = require 'vinyl'


tempFolder = path.join(__dirname, "../.tmp")
mkdirp.sync(tempFolder)

verifyThriftPath = (path) ->
  if (!fs.existsSync(path))
    throw new Error("#{ path } is not a valid executable file")

emptyTempFolder = ->
  fs.readdirAsync(tempFolder)
  .map (file) ->
    fs.unlinkAsync(path.join(tempFolder, file))
  .catch (error) ->
    console.error(error)

###*
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
###

module.exports = gulpThrift = (opts = {}) ->

  verifyThriftPath(opts.thriftPath) if opts.thriftPath

  processes = [];

  opts.thriftPath ||= "thrift"
  opts.gen ||= "js"
  opts.out = tempFolder

  # compile thrift files into a temp directory
  writeFn = (file) ->
    processes.push new Promise (resolve, reject) =>
      command = "thrift #{ createArgs(opts) } #{ file.path }"
      if opts.versbose
        console.log("executing command", command)
      exec command, resolve

  # read compiled files from directly into stream
  endFn = ->

    Promise.all(processes)
    .then =>

      fs.readdirAsync tempFolder
      .then (files) ->
        _.map(files, (file) -> path.join(__dirname, "../.tmp/#{ file }"))
      .map (filename) ->
        fs.readFileAsync(filename)
        .then (contents) -> { contents, filename }
      .map (obj) =>
        file = new File(cwd: "/", base: path.dirname(obj.filename), path: obj.filename, contents: obj.contents)
        @queue(file)
      .finally =>
        emptyTempFolder()
        @queue(null)
    .catch (errors) =>
      @emit('error', errors)

  return through(writeFn, endFn)

