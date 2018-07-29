/**
 * Build SystemJS task module
 * @module build-system/tasks/build-system-js
 * @see {@link module:gulpfile}
 * @summary Builds application for specific roles using SystemJS.
 * @description Bundles scripts for application built for designated role.
 */

/**
 * Builds application for designated role using SystemJS.
 * @param {Object} gulp Gulp
 * @param {Function} systemjsBuilder Gulp SystemJS builder
 * @param {Object} config systemjs config exported from require('./build-system/config').systemjs
 */
module.exports = (gulp, systemjsBuilder, config) => {
	return systemjsBuilder(config.baseDir, config.builderConfig)
		.buildStatic(config.moduleName, config.bundleName, config.builderOptions)
		.pipe(gulp.dest(config.gulp.dest));
};
