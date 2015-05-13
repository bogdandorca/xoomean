var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    ignore = require('gulp-ignore'),
    concat = require('gulp-concat'),
    karma = require('karma').server,
    taskListing = require('gulp-task-listing'),
    git = require('gulp-git'),
    requireDir = require('require-dir');

// Environment
var styles = './public/styles';
var vendor = './public/vendor';
var appsDir = './public/app';

requireDir('./gulpTasks');

gulp.task('help', taskListing);

// Runners
gulp.task('run', ['img'], function(){
    nodemon({
        script: 'index.js',
        ext: 'js jade',
        env: { 'NODE_ENV': 'development' }
    });
    gulp.watch(styles+'/**/*.scss', ['sass']);
    gulp.watch(appsDir+'/**/*.js', ['js']);
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