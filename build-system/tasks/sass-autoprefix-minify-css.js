/**
 * Sass task module
 * @module build-system/tasks/sass-autoprefix-minify-css
 * @see {@link module:gulpfile}
 * @summary Compiles SASS to CSS.
 * @description Compiles SASS to CSS, autoprefixes, and minifies bundle.
 */

/**
 * Compiles SASS to CSS.
 * @param {Object} gulp Gulp
 * @param {Function} plumber Gulp plumber
 * @param {Function} concat Gulp concat
 * @param {Function} rename Gulp raname
 * @param {Function} cssnano Gulp cssnano
 * @param {Function} autoprefixer Gulp autoprefixer
 * @param {Function} sass Gulp sass
 * @param {Object} config sass config exported from require('./build-system/config').sass
 */
module.exports = (gulp, plumber, concat, rename, cssnano, autoprefixer, sass, config) => {
	return gulp.src(config.gulp.src)
		.pipe(plumber())
		.pipe(concat('bundle.css'))
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: config.browsers
		}))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename(config.bundleName))
		.pipe(gulp.dest(config.gulp.dest));
};
