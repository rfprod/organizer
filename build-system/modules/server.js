/**
 * Server module
 * @module build-system/modules/server
 * @see {@link module:gulpfile}
 * @summary Server handling tasks.
 * @description Client application server handling tasks.
 */

/**
 * Server handling tasks.
 * @param {Object} gulp Gulp
 * @param {Object} node NodeJS server instance
 * @param {Object} spawn NodeJS child process spawner
 */
module.exports = (gulp, node, spawn) => {
	/**
	 * @name server
	 * @member {Function}
	 * @summary Starts application server.
	 * @description Starts client application server.
	 */
	gulp.task('server', (done) => {
		if (node) node.kill();
		node = spawn('node', ['server.js'], {stdio: 'inherit'});
		node.on('close', (code) => {
			if (code === 8) {
				console.log('Error detected, waiting for changes...');
			}
		});
		done();
	});

	/**
	 * @name server-kill
	 * @member {Function}
	 * @summary Kills application server.
	 * @description Kills client application server.
	 */
	gulp.task('server-kill', (done) => {
		if (node) node.kill();
		done();
	});
};
