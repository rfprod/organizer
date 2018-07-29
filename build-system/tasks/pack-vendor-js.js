/**
 * Pack vendor js task module
 * @module build-system/tasks/pack-vendor-js
 * @see {@link module:gulpfile}
 * @summary Packs vendor js bundle.
 * @description Concatenates, and minifies vendor js files (nonangular js bundle, components related to design, styling, data visualization etc.).
 */

/**
 * Packs vendor js bundle.
 * @param {Object} gulp Gulp
 * @param {Function} plumber Gulp plumber
 * @param {Function} uglify Gulp uglify
 * @param {Function} concat Gulp concat
 * @param {Function} rename Gulp rename
 * @param {Object} config vendor js config exported from require('./build-system/config').vendor.js
 */
module.exports = (gulp, plumber, uglify, concat, rename, config) => {
	return gulp.src(config.gulp.src)
		.pipe(plumber())
		.pipe(concat('vendor-bundle.js'))
		.pipe(uglify())
		.pipe(plumber.stop())
		.pipe(rename(config.bundleName))
		.pipe(gulp.dest(config.gulp.dest));
};
