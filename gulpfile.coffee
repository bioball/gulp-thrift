gulp    = require 'gulp'
coffee  = require 'gulp-coffee'
plumber = require 'gulp-plumber'
watch   = require 'gulp-watch'

gulp.task 'coffee', ->
  gulp.src('src/*.coffee')
  .pipe plumber()
  .pipe coffee()
  .pipe gulp.dest('dist')

gulp.task 'watch', ->
  watch 'src/*.coffee', -> gulp.start 'coffee'