/**
 * Eslint task module
 * @module build-system/tasks/eslint
 * @see {@link module:gulpfile}
 * @summary Lints JavaScript codebase.
 * @description Calls gulp-eslint with specified config.
 */

/**
 * Lints JavaScript codebase.
 * @param {Object} gulp Gulp
 * @param {Function} eslint Gulp eslint
 * @param {Object} config eslint config exported from require('./build-system/config').eslint
 */
module.exports = (gulp, eslint, config) => {
	return gulp.src(config.gulp.src) // uses ignore list from .eslintignore
		.pipe(eslint(config.eslintrc))
		.pipe(eslint.format());
};
