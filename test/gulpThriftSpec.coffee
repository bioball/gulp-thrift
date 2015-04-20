thrift  = require '../'
gulp    = require 'gulp'
debug   = require 'gulp-debug'
path    = require 'path'
Promise = require 'bluebird'
fs      = Promise.promisifyAll require 'fs'
rimraf  = require 'rimraf'
mkdirp  = require 'mkdirp'
chai    = require 'chai'

chai.use require 'chai-fs'
chai.use require 'chai-as-promised'
chai.use require 'chai-things'

expect = chai.expect

outputDir = path.join(__dirname, 'actual')
tmpDir    = path.join(__dirname, '..', '.tmp')

describe 'gulp-thrift', ->
    
  beforeEach (done) ->
    rimraf(outputDir, done)

  beforeEach (done) ->
    mkdirp(outputDir, done)


  it 'creates thrift files', (done) ->
    gulp.src(path.join(__dirname, 'fixtures/FluBird.thrift'))
    .pipe thrift()
    .pipe gulp.dest(outputDir)
    .on 'end', ->
      fs.readdirAsync(outputDir)
      .then (files) ->
        expect(files).to.include.something.that.equals("FluBird_types.js")
        done()
    .on 'error', done

  it 'supports thrift files that output to two files', (done) ->
    gulp.src(path.join(__dirname, 'fixtures/Abatross.thrift'))
    .pipe thrift()
    .pipe gulp.dest(outputDir)
    .on 'end', ->
      fs.readdirAsync(outputDir)
      .then (files) ->
        expect(files).to.include.something.that.equals("Abatross_types.js")
        expect(files).to.include.something.that.equals("AbatrossService.js")
        done()
      .catch done
    .on 'error', done

  it 'supports other languages via the gen option', (done) ->

    gulp.src(path.join(__dirname, 'fixtures/*.thrift'))
    .pipe thrift(gen: 'java')
    .pipe gulp.dest(outputDir)
    .on 'end', ->
      fs.readdirAsync(outputDir)
      .then (files) ->
        expect(files).to.include.something.that.equals('Calculator.java')
        expect(files).to.include.something.that.equals('FluBird.java')
        done()
      .catch done
    .on 'error', done