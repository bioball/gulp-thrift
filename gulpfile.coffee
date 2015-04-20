gulp    = require 'gulp'
babel   = require 'gulp-babel'
plumber = require 'gulp-plumber'
watch   = require 'gulp-watch'
thrift  = require './'

gulp.task 'script', ->
  gulp.src('src/*.js')
  .pipe plumber()
  .pipe babel()
  .pipe gulp.dest('dist')


gulp.task 'thrift', ->
  gulp.src('./test/fixtures/Abatross.thrift')
  .pipe thrift()
  .pipe gulp.dest('./test/actual')

gulp.task 'watch', ->
  watch 'src/*.js', -> gulp.start 'script'