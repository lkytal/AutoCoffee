var coffee, gulp, watch;

gulp = require('gulp');

coffee = require('gulp-coffee');

watch = require('gulp-watch');

gulp.task('coffee', function() {
  gulp.src('./test/*.coffee').pipe(coffee({
    bare: true
  })).on('error', console.log).pipe(gulp.dest('.//test/'));
  return gulp.src('./*.coffee').pipe(coffee({
    bare: true
  })).on('error', console.log).pipe(gulp.dest('.//'));
});

gulp.task('watch', function() {
  gulp.src('./*.coffee').pipe(watch(function(files) {
    return files.pipe(coffee({
      bare: true
    })).pipe(gulp.dest('./'));
  }));
  return gulp.src('./test/*.coffee').pipe(watch(function(files) {
    return files.pipe(coffee({
      bare: true
    })).pipe(gulp.dest('./test/'));
  }));
});

gulp.task('default', function() {
  gulp.run('watch');
  return gulp.run('coffee');
});
