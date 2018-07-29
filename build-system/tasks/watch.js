/**
 * Watch task module
 * @module build-system/tasks/watch
 * @see {@link module:gulpfile}
 * @summary Watches project files, and triggers respective tasks.
 * @description Watches project files, and triggers respective tasks on file changes.
 */

module.exports = {
	/**
	 * Watches all files, triggers all tasks - default development mode.
	 * @param {Object} gulp Gulp
	 */
	all: (gulp) => {
		gulp.watch(['./server.js', './app/**/*.js'], ['server']); // watch server and database changes, and restart server
		gulp.watch(['./test/server/*.js'], ['server-test']); // watch server tests changes, and run tests
		gulp.watch(['./gulpfile.js'], ['pack-vendor-js', 'pack-vendor-css', 'move-vendor-fonts']); // watch gulpfile changes, and repack vendor assets
		gulp.watch('./public/app/scss/*.scss', ['sass-autoprefix-minify-css']); // watch app scss-source changes, and pack application css bundle
		gulp.watch(['./public/app/*.ts', './public/app/**/*.ts', './test/client/**/*.ts', './tslint.json'], ['spawn-rebuild-app']); // watch app ts-source chages, and rebuild app js bundle
		gulp.watch(['./*.js', './app/**/*.js', './public/{electron.preload,service-worker}.js', './test/*.js', './test/e2e/scenarios.js', './test/server/test.js', './.eslintignore', './.eslintrc.json'], ['eslint']); // watch js file changes, and lint
	},

	/**
	 * Watches js/ts files and lints them.
	 * @param {Object} gulp Gulp
	 */
	lint: (gulp) => {
		gulp.watch(['./*.js', './app/**/*.js', './public/{electron.preload,service-worker}.js', './test/*.js', './test/e2e/scenarios.js', './test/server/test.js', './.eslintignore', './.eslintrc.json'], ['eslint']); // watch js file changes, and lint
		gulp.watch(['./public/app/*.ts', './public/app/**/*.ts', './test/client/**/*.ts', './tslint.json'], ['tslint']); // watch ts files and lint on change
	},

	/**
	 * Watches client files and executes tests.
	 * @param {Object} gulp Gulp
	 */
	test: (gulp) => {
		gulp.watch(['./public/app/*.ts', './public/app/**/*.ts', './test/client/**/*.ts'], ['compile-and-test']); // watch app source changes, and compile and test
		gulp.watch(['./test/karma.conf.js','./test/karma.test-shim.js'], ['client-unit-test']); // watch karma configs changes, and test
	}
};
