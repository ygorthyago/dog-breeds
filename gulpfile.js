// Require's
var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');

// Path's
var init = {
	root: 'assets',
	sass: '/scss',
	css: '/css'
}

/*
 * Task's
 */

// CSS
gulp.task('css', function() {
    return sass(init.root + init.sass + '/main.scss')
    .on('error', sass.logError)
    .pipe(autoprefixer({
    	browsers: ['last 3 versions'],
        cascade: false
    }))
    .pipe(gulp.dest(init.root + init.css))
});

// WATCH
gulp.task('watch', function() {
    gulp.watch(init.root + init.sass + '/**/*.scss', ['css']);
});

// TEST
gulp.task('test', function() {
	console.log("It's Work!");
});