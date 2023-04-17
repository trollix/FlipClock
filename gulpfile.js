import { task, watch, src, dest } from 'gulp';
var browserSync = require('browser-sync').create();
import sass from 'gulp-sass';
import { init, write } from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
  header            = require('gulp-header');
  uglify            = require('gulp-uglify');
  concat            = require('gulp-concat');
  notify            = require('gulp-notify');
  gutil             = require('gulp-util');
  rename            = require('gulp-rename');
  pkg               = require('./package.json');
;

var reportError = function (error) {
  var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';

  notify({
      title: 'Task Failed [' + error.plugin + ']',
      message: lineNumber + 'See console.',
      sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
  }).write(error);

  gutil.beep(); // Beep 'sosumi' again

  // Inspect the error object
  //console.log(error);

  // Easy error reporting
  //console.log(error.toString());

  // Pretty error reporting
  var report = '';
  var chalk = gutil.colors.white.bgRed;

  report += chalk('TASK:') + ' [' + error.plugin + ']\n';
  report += chalk('PROB:') + ' ' + error.message + '\n';
  if (error.lineNumber) { report += chalk('LINE:') + ' ' + error.lineNumber + '\n'; }
  if (error.fileName)   { report += chalk('FILE:') + ' ' + error.fileName + '\n'; }
  console.error(report);

  // Prevent the 'watch' task from stopping
  this.emit('end');
};

var banner = [
  '/* <%= pkg.name %> - v<%= pkg.version %> */',
  ''
].join('\n');

// Static Server + watching scss/html files
task('dev', ['sass', 'dist'], function() {

  browserSync.init({
    server: {
      baseDir: "examples",
      routes: {
        "/dist": "dist"
      },
      directory: true
    }
  });
  
  watch("src/flipclock/scss/**/*.scss", ['sass']);
  watch("src/flipclock/js/**/*.js", ['dist']).on('change', browserSync.reload);
  watch("examples/*.html").on('change', browserSync.reload);
});

// Minify js files
task('dist', function () {
  return src([
      'src/flipclock/js/vendor/*.js',
      'src/flipclock/js/libs/Base.js',
      'src/flipclock/js/libs/Plugins.js',
      'src/flipclock/js/libs/List.js',
      'src/flipclock/js/libs/ListItem.js',
      'src/flipclock/js/libs/EnglishAlphaList.js',
      'src/flipclock/js/libs/*.js',
      'src/flipclock/js/faces/TwentyFourHourClockFace.js',
      'src/flipclock/js/faces/*.js',
      'src/flipclock/js/lang/*.js'
    ]) //select all javascript files 
    .pipe(concat('flipclock.js')) //the name of the resulting file
    .pipe(dest('dist')) //the destination folder
    .pipe(rename('flipclock.min.js')) //minify the compiled js
    .pipe(uglify())
    .pipe(header(banner, {pkg: pkg})) //add a small version banner to the minified js
    .pipe(dest('dist'))
    .pipe(notify({ message: 'Finished minifying JavaScript'}));
});

// Compile sass into CSS & auto-inject into browsers
task('sass', function() {
  return src("src/flipclock/scss/**/*.scss")
    .pipe(init())
      .pipe(sass({outputStyle: 'compressed'}).on('error', reportError))
      .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      }))
    .pipe(write("./"))
    .pipe(dest("dist"))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Styles recompiled'}));
});

task('default', ['dev']);