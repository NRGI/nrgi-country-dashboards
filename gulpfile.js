var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var ghPages = require('gulp-gh-pages');

var b = watchify(browserify({
  entries: ['./app/js/main.js', './app/js/data.js'],
  debug: true,
}));

// Copy files
gulp.task('copy_files', function() {
  return gulp.src(['app/**/*', '!app/css/**', '!app/scss/**'])
    .pipe(gulp.dest('dist'));
});

// Generate SASS from CSS
gulp.task('styles', function() {
  return sass('app/scss/styles.scss')
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({ stream:true }));
});

gulp.task('gh-deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

// Build task
gulp.task('build', ['copy_files', 'styles']);

// Watch files for changes and reload
gulp.task('serve', ['styles'], function() {
  browserSync({
    server: {
      baseDir: './dist'
    }
  });

  gulp.watch(['*.html', 'scss/**/*.scss', 'js/**/*.js'], 
             ['build'], reload);
});

gulp.task('deploy', ['build', 'gh-deploy']);
