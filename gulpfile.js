var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    ignore = require('gulp-ignore'),
    del = require('del'),
    concat = require('gulp-concat'),
    karma = require('karma').server,
    taskListing = require('gulp-task-listing'),
    git = require('gulp-git'),
    requireDir = require('require-dir'),
    argv = require('yargs').argv,
    gulpIf = require('gulp-if');

// Environment
var styles = './public/styles';
var vendor = './public/vendor';

requireDir('./gulpTasks');

gulp.task('help', taskListing);

// Runners
gulp.task('run', function(){
    nodemon({
        script: 'index.js',
        ext: 'js jade',
        env: { 'NODE_ENV': 'development' }
    });
    gulp.watch(styles+'/**/*.scss', ['sass', 'js']);
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