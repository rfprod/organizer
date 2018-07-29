/**
 * Pack vendor css task module
 * @module build-system/tasks/pack-vendor-css
 * @see {@link module:gulpfile}
 * @summary Packs vendor css bundle.
 * @description Concatenates, and minifies vendor css files.
 */

/**
 * Packs vendor css bundle.
 * @param {Object} gulp Gulp
 * @param {Function} plumber Gulp plumber
 * @param {Function} cssnano Gulp cssnano
 * @param {Function} concat Gulp concat
 * @param {Function} rename Gulp rename
 * @param {Object} config vendor css config exported from require('./build-system/config').vendor.css
 */
module.exports = (gulp, plumber, cssnano, concat, rename, config) => {
	return gulp.src(config.gulp.src)
		.pipe(plumber())
		.pipe(concat('vendor-bundle.js'))
		.pipe(cssnano())
		.pipe(plumber.stop())
		.pipe(rename(config.bundleName))
		.pipe(gulp.dest(config.gulp.dest));
};
