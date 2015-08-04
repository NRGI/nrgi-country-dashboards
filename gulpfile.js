var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('sass', function() {
  return sass('scss/styles.scss')
    .pipe(gulp.dest('css'))
    .pipe(reload({ stream:true }));
});

// watch files for changes and reload
gulp.task('serve', ['sass'], function() {
  browserSync({
    server: {
      baseDir: ''
    }
  });

  gulp.watch(['*.html', 'scss/**/*.scss', 'js/**/*.js'], 
             ['sass'], reload);
});