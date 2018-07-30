/**
 * Client typedoc task module
 * @module build-system/tasks/typedoc
 * @see {@link module:gulpfile}
 * @summary Generates client Typedoc.
 * @description Generates Typedoc for the application client.
 */

/**
 * Generates client Typedoc.
 * @param {Object} gulp Gulp
 * @param {Function} typedoc Gulp typedoc
 * @param {Object} config task configuration, exported from require('./build-system/config').client.typedoc
 */
module.exports = (gulp, typedoc, config) => {
	return gulp.src(config.gulp.src, config.gulp.options)
		.pipe(typedoc(config.config));
};
