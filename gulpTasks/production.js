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