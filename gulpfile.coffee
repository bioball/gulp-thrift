gulp    = require 'gulp'
babel   = require 'gulp-babel'
plumber = require 'gulp-plumber'
watch   = require 'gulp-watch'

gulp.task 'script', ->
  gulp.src('src/*.js')
  .pipe plumber()
  .pipe babel()
  .pipe gulp.dest('dist')

gulp.task 'watch', ->
  watch 'src/*.js', -> gulp.start 'script'