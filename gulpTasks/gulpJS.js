var gulp = require('gulp'),
    gulpIf = require('gulp-if'),
    del = require('del'),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    argv = require('yargs').argv,
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    stripDebug = require('gulp-strip-debug');

// Environment
var appsDir = './public/app';
var scriptsDir = './public/scripts';

gulp.task('js', function(){
    try {
        del([appsDir + '/application.js'], function (err) {
            if (!err) {
                return gulp.src([scriptsDir + '/**/*.js', appsDir + '/app.js', appsDir + '/**/*.js'])
                    .pipe(jshint())
                    .pipe(jshint.reporter('default'))
                    .pipe(sourcemaps.init())
                    .pipe(concat('application.js'))
                    .pipe(sourcemaps.write())
                    .pipe(gulpIf(argv.prod, stripDebug()))
                    .pipe(gulpIf(argv.prod, uglify({mangle: false})))
                    .pipe(gulp.dest(appsDir + '/'));
            } else {
                console.log(err);
            }
        });
    } catch(err){
        console.log(err);
    }
});