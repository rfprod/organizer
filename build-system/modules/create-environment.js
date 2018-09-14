/**
 * Create environment module
 * @module build-system/modules/create-environment
 * @see {@link module:gulpfile}
 * @summary Environment creation tasks.
 * @description Environment creation tasks.
 */

/**
 * @name createEnvTaskPath Create env taks path
 * @constant
 * @summary Create env file taks path
 * @description Create env file taks path
 */
const createEnvTaskPath = '../tasks/create-env-file';

/**
 * Environment creation tasks.
 * @param {Object} gulp Gulp
 * @param {Object} fs NodeJS file system module
 * @param {Object} crypto NodeJS crypto module
 * @param {Object} config Gulp environment config exported from require('./build-system/config').env
 */
module.exports = (gulp, fs, crypto, config) => {
	/**
	 * @name create-env
	 * @member {Function}
	 * @summary Create electron environment file.
	 * @description Creates .env file containing environment variables for single core setup.
	 * @see {@link module:build-system/tasks/create-env-file}
	 */
	gulp.task('create-env', (done) => {
		const nodeEnv = null;
		const devMode = false;
		const electron = null;
		const electronSec = null;
		return require(createEnvTaskPath)(fs, crypto, config, nodeEnv, devMode, electron, electronSec, done);
	});

	/**
	 * @name create-env-cluster
	 * @member {Function}
	 * @summary Create electron environment file.
	 * @description Creates .env file containing environment variables for nodejs cluster setup.
	 * @see {@link module:build-system/tasks/create-env-file}
	 */
	gulp.task('create-env-cluster', (done) => {
		const nodeEnv = null;
		const devMode = true;
		const electron = null;
		const electronSec = null;
		return require(createEnvTaskPath)(fs, crypto, config, nodeEnv, devMode, electron, electronSec, done);
	});

	/**
	 * @name create-env-electron
	 * @member {Function}
	 * @summary Create electron environment file.
	 * @description Creates .env file containing electron environment variables.
	 * @see {@link module:build-system/tasks/create-env-file}
	 */
	gulp.task('create-env-electron', (done) => {
		const nodeEnv = 'production';
		const devMode = null;
		const electron = true;
		const electronSec = true;
		return require(createEnvTaskPath)(fs, crypto, config, nodeEnv, devMode, electron, electronSec, done);
	});
};
