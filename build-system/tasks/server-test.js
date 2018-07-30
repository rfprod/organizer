/**
 * Server test task module
 * @module build-system/tasks/server-test
 * @see {@link module:gulpfile}
 * @summary Executes server unit tests.
 * @description Executes server unit tests.
 */

/**
 * Executes server unit tests.
 * @param {Object} gulp Gulp
 * @param {Function} mocha Gulp mocha
 * @param {Object} fs NodeJS file system module
 * @param {Object} config task configuration, exported from require('./build-system/config').server.unit
 */
module.exports = (gulp, mocha, fs, config) => {
	return gulp.src(config.gulp.src, config.gulp.options)
		.pipe(mocha(config.mocha.options))
		.on('error', (error) => {
			console.log('server-test, error', error);
		})
		.once('end', () => {
			if (fs.existsSync(config.report.src)) {
				if (!fs.existsSync(config.report.dir.server)) {
					if (!fs.existsSync(config.report.dir.unit)) {
						fs.mkdirSync(config.report.dir.unit);
					}
					fs.mkdirSync(config.report.dir.server);
				}
				fs.copyFileSync(config.report.src, config.report.dest);
				fs.unlinkSync(config.report.src);
			}
		});
};
