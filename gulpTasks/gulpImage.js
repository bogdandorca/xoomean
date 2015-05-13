var gulp = require('gulp'),
    imagemin = require('gulp-imagemin'),
    jpegtran = require('imagemin-jpegtran'),
    del = require('del');

gulp.task('img', function(){
    del(['./public/img/prod/**/*'], function(err){
        if(!err) {
            console.log('Deleted previous images...');
            return gulp.src(['./public/img/**/*', '!./public/img/prod'])
                .pipe(imagemin({
                    progressive: true,
                    svgoPlugins: [{removeViewBox: false}],
                    use: [jpegtran()]
                }))
                .pipe(gulp.dest('./public/img/prod'));
        }
    });
});