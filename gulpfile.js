var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var ghPages = require('gulp-gh-pages');
var jsoncombine = require("gulp-jsoncombine");
var jeditor = require("gulp-json-editor");
var streamify = require("gulp-streamify");

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

// Combine JSON files together
gulp.task('combinedata', function() {
  dataCombiner(["source/gdp.json", "source/extractives.json"],
               "gdp-extractives-combined.json")
  dataCombiner(["source/government-debt.json", "source/petroleum-account.json"],
               "debt-petroleum.json")
  dataCombiner(["source/government-revenues.json", "source/government-expenditure.json",
    "source/extractives-revenues.json"],
               "govt-revenues-expenditure-extractives.json")
});

gulp.task('gh-deploy', function() {
  return gulp.src('./dist/**/*')
    .pipe(ghPages());
});

// Build task
gulp.task('build', ['copy_files', 'styles', 'combinedata']);

// Watch files for changes and reload
gulp.task('serve', ['copy_files', 'styles', 'combinedata'], function() {
  browserSync({
    server: {
      baseDir: './dist'
    }
  });

  gulp.watch(['app/*.html', 'app/scss/**/*.scss', 'app/js/**/*.js',
              'app/js/*.js', 'app/data/*.json'],
             ['build'], reload);
});

gulp.task('deploy', ['build', 'gh-deploy']);

// Read in various JSON files and combine them to an output file
var dataCombiner = function(source_files, output_file) {
  return gulp.src(source_files)
    .pipe(jsoncombine(output_file, function(data){
      return new Buffer (JSON.stringify(data));
    }))
    .pipe(streamify(jeditor(function(json) {
      var out = {}
      out.records = []
      for (k in json) {
        out.result = json[k].result;
        out.records = out.records.concat(json[k].records);
      }
      return out;
    })))
    .pipe(gulp.dest("./app/data"));
}