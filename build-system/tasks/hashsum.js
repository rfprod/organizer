/**
 * Hashsum task module
 * @module build-system/tasks/hashsum
 * @see {@link module:gulpfile}
 * @summary Generates hashsum which identifies build.
 * @description After build SHA1SUMS.json is generated with sha1 sums for different files, then sha256 is calculated using stringified file contents.
 * @param gulp Gulp
 * @param hashsum Hashsum
 * @param config hashsum config exported from require('../config').hashsum
 */

/**
 * Generates hashsum which identifies build.
 * @param {Object} gulp Gulp
 * @param {Function} hashsum Hashsum
 * @param {Object} config hashsum config exported from require('./build-system/config').hashsum
 */
module.exports = (gulp, hashsum, config) => {
	return gulp.src(config.gulp.src)
		.pipe(hashsum(config.config));
};
