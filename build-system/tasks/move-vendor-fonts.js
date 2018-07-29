/**
 * Move vendor fonts task module
 * @module build-system/tasks/move-vendor-fonts
 * @see {@link module:gulpfile}
 * @summary Moves vendor fonts.
 * @description Moves vendor fonts to specified location for usage in the application.
 */

/**
 * Moves vendor fonts.
 * @param {Object} gulp Gulp
 * @param {Object} config fonts config exported from require('./build-system/config').fonts
 */
module.exports = (gulp, config) => {
	return gulp.src(config.src)
		.pipe(gulp.dest(config.dest));
};
