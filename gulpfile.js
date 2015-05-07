var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    ignore = require('gulp-ignore'),
    rimraf = require('gulp-rimraf'),
    merge = require('merge-stream'),
    karma = require('karma').server;

// Environment
var styles = './public/styles';

// Development
gulp.task('css-development', function(){
    return gulp.src(styles+'/**/*.scss')
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(minifyCss())
        .pipe(concat('global.css'))
        .pipe(gulp.dest(styles+'/'));
});
gulp.task('js-development', function(){

});

// Production


// Runners
gulp.task('run', function(){
    nodemon({
        script: 'index.js',
        ext: 'js jade',
        env: { 'NODE_ENV': 'development' }
    });
    gulp.watch(styles+'/**/*.scss', ['css-development']);
});
gulp.task('test', function(done){
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        action: 'run'
    }, function(){
        done();
    });
});