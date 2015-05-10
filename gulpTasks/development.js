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