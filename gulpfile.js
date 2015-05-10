var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    ignore = require('gulp-ignore'),
    del = require('del'),
    merge = require('merge-stream'),
    karma = require('karma').server,
    taskListing = require('gulp-task-listing'),
    git = require('gulp-git'),
    requireDir = require('require-dir');

// Environment
var styles = './public/styles';
var vendor = './public/vendor';

gulp.task('help', taskListing);

// Development
gulp.task('css-development', function(){
    del([styles+'/global.css']);
    del([styles+'/global.min.css']);
    return gulp.src(styles+'/**/*.scss')
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(concat('global.css'))
        .pipe(gulp.dest(styles+'/'));
});
gulp.task('js-development', function(){

});

// Production
gulp.task('css-production', function(){
    del([styles+'/global.css']);
    del([styles+'/global.min.css']);
    return gulp.src([styles+'/**/*.scss', vendor + '/**/*.css', '!'+vendor+'/**/*.min.css'])
        .pipe(sass())
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(minifyCss())
        .pipe(concat('global.min.css'))
        .pipe(gulp.dest(styles+'/'));
});

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