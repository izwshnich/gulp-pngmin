'use strict';

// require modules
var gulp = require('gulp'),
    pngmin = require('./lib/pngmin');

// test 
gulp.task('test', function() {
  gulp.src('examples/images/*.png')
    .pipe(pngmin())
    .pipe(gulp.dest('examples/optimized_images'));
});
