var gulp = require('gulp'),
    gulpIf = require('gulp-if'),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    argv = require('yargs').argv,
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    stripDebug = require('gulp-strip-debug');

// Env
var appsDir = './public/app';
var scriptsDir = './public/scripts';

gulp.task('js', function(){
    del([appsDir+'/application.js']);
    return gulp.src([appsDir + '/app.js', appsDir + '/**/*.js', scriptsDir + '/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(sourcemaps.init())
        .pipe(concat('application.js'))
        .pipe(sourcemaps.write())
        .pipe(stripDebug())
        .pipe(gulpIf(argv.prod, uglify({mangle: false})))
        .pipe(gulp.dest(appsDir+'/'));
});