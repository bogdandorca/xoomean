var gulp = require('gulp'),
    del = require('del'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    argv = require('yargs').argv,
    gulpIf = require('gulp-if');

// Environment
var styles = './public/styles';
var vendor = './public/vendor';

gulp.task('sass', function(){

    function prepareStyles(){
        return gulp.src([vendor + '/**/*.css', '!'+vendor+'/**/*.min.css', styles+'/global.scss'])
            .pipe(sass())
            .pipe(sourcemaps.init())
            .pipe(autoprefixer({
                browsers: ['last 2 versions'],
                cascade: true
            }))
            .pipe(sourcemaps.write('.'))
            .pipe(gulpIf(argv.prod, minifyCss()))
            .pipe(gulpIf(argv.prod, concat('global.css'))) /// Change name to min
            .pipe(gulpIf(!argv.prod, concat('global.css')))
            .pipe(gulp.dest(styles+'/'));
    }

    del([styles+'/global.css'], function(err){
        if(!err){
            prepareStyles();
        }
    });
    del([styles+'/global.min.css'], function(err){
        if(!err){
            prepareStyles();
        }
    });
});