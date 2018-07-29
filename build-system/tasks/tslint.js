/**
 * Tslint task module
 * @module build-system/tasks/tslint
 * @see {@link module:gulpfile}
 * @summary Lints Typescript codebase.
 * @description Calls gulp-tslint with specified config.
 */

/**
 * Lints Typescript codebase.
 * @param {Object} gulp Gulp
 * @param {Function} tslint Gulp tslint
 * @param {Object} task configuration, exported from require('./build-system/config').tslint
 */
module.exports = (gulp, tslint, config) => {
	return gulp.src(config.gulp.src)
		.pipe(tslint(config.options))
		.pipe(tslint.report(config.reportOptions));
};
