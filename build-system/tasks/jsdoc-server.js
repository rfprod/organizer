/**
 * Jsdoc Server task module
 * @module build-system/tasks/jsdoc-server
 * @see {@link module:gulpfile}
 * @summary Generates server JSdoc.
 * @description Generates JSdoc for the application server.
 */

/**
 * Generates server JSdoc.
 * @param {Object} gulp Gulp
 * @param {Function} jsdoc Gulp jsdoc
 * @param {Object} config task configuration, exported from require('./build-system/config').server.jsdoc
 */
module.exports = (gulp, jsdoc, config) => {
	return gulp.src(['README.md'].concat(config.gulp.src), config.gulp.options)
		.pipe(jsdoc(config.config));
};
