/**
 * Create environment file task module
 * @module build-system/tasks/create-env-file
 * @see {@link module:gulpfile}
 * @summary Creates environment file.
 * @description Creates .env file containing environment variables.
 */

/**
 * Writes environment file to disk.
 * @param {Object} fs NodeJS file system module
 * @param {Object} crypto NodeJS crypto module
 * @param {Object} config environment config exported from require('./build-system/config').env
 * @param {String} env Environment file as a string
 * @param {Function} done Done function
 */
function createEnvFile(fs, crypto, config, env, done) {
	fs.readFile(config.sha1SumsJson, (err, data) => {
		if (err) throw err;
		const hash = crypto.createHmac(config.hmacSHA, data.toString()).digest('hex');
		console.log('BUILD_HASH', hash);
		env += 'BUILD_HASH=' + hash + '\n';
		fs.writeFile(config.envPath, env, (err) => {
			if (err) throw err;
			console.log('# > ENV > .env file was created');
			done();
		});
	});
}

/**
 * Creates environment file.
 * @param {Object} fs NodeJS file system module
 * @param {Object} crypto NodeJS crypto module
 * @param {Object} util Gulp gulp util
 * @param {Object} config environment config exported from require('./build-system/config').env
 * @param {String} port Application port
 * @param {String} appUrl Application url
 * @param {String} appVersion Application version from package.json
 * @param {(null|'production')} nodeEnv Indicates if node environment if production or not
 * @param {(null|true|false)} devMode Indicates if environment is development or not
 * @param {(null|false|true)} electron Indicates if environment is electron or not
 * @param {(null|false|true)} electronSec Indicates if electron security warnings are enabled
 * @param {Function} done Done function
 */
module.exports = (fs, crypto, config, nodeEnv, devMode, electron, electronSec, done) => {
	fs.readFile('./' + config.envFileName, (err, data) => {
		const port = `PORT=${config.port}\n`;
		const appUrl = `APP_URL=${config.appUrl}\n`;
		const appVersion = `APP_VERSION=${config.appVersion}\n`;
		const nodeEnvParam = (nodeEnv !== null) ? `NODE_ENV=${nodeEnv}\n` : '';
		const devModeParam = (devMode !== null) ? `DEV_MODE=${devMode}\n` : '';
		const electronParam = (electron !== null) ? 'ELECTRON=true\n' : '';
		const electronSecurityWarnings = (electronSec !== null) ? 'ELECTRON_ENABLE_SECURITY_WARNINGS=true\n' : '';
		const env = port + appUrl + appVersion + nodeEnvParam + devModeParam + electronParam + electronSecurityWarnings;
		if (err) {
			createEnvFile(fs, crypto, config, env, done);
		} else {
			if (data.toString() === env) {
				console.log('# > ENV > .env file is correct');
				done();
			} else {
				createEnvFile(fs, crypto, config, env, done);
			}
		}
	});
};
