/**
 * Jsdoc Server task module
 * @module build-system/tasks/jsdoc-build
 * @see {@link module:gulpfile}
 * @summary Generates build system JSdoc.
 * @description Generates JSdoc for the application build system.
 */

/**
 * Generates build system JSdoc.
 * @param {Object} gulp Gulp
 * @param {Function} jsdoc Gulp jsdoc
 * @param {Object} config task configuration, exported from require('./build-system/config').build.jsdoc
 */
module.exports = (gulp, jsdoc, config) => {
	return gulp.src(['README.md'].concat(config.gulp.src), config.gulp.options)
		.pipe(jsdoc(config.config));
};
