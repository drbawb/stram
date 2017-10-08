var gulp = require('gulp');

// deps
var browserify = require('browserify');
var babel  = require('gulp-babel');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');

// source streaming
var buffer = require('vinyl-buffer');
var merge  = require('merge-stream');
var source = require('vinyl-source-stream');

/**
 * Combines `models.js` + `canvas.js`  via `clients.js` -> `bundle.js`
 *
 * These files compose the `alleluia client bundle`:
 *   * The text-mode client and canvas are initialized.
 */
gulp.task('browserify', function() {
	var license = gulp.src('./assets/javascripts/piper-client/license.js');

	var bundler = browserify('./assets/javascripts/piper-client/client.js')
		.bundle()
		.pipe(source('combined.js'))
		.pipe(buffer());
		
	return merge(license, bundler)
		   .pipe(concat('bundle.js'))
       .pipe(babel())
	     .pipe(gulp.dest('./public/javascripts/alleluia'));
});

gulp.task('lint', function() {
		gulp.src("./assets/javascripts/piper-client/**/*.js")
			.pipe(jshint())
			.pipe(jshint.reporter('default'));
});

gulp.task('default', ['browserify']);
