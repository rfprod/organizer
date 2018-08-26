'use strict';

/**
 * Gulpfile module
 * @module gulpfile
 * @description Main gulp file
 */

/*
* TODO separate into modules
*/

/**
 * @name config
 * @constant
 * @summary Gulp tasks configuration
 * @description Configuration object for Gulp tasks
 */
const config = require('./build-system/config');

/**
 * @name gulp
 * @constant
 * @summary Gulp
 * @description Gulp
 */
const gulp = require('gulp');

/**
 * @name runSequence
 * @constant
 * @summary Sequential runner for gulp
 * @description Sequential runner for gulp
 */
const runSequence = require('run-sequence');

/**
 * @name concat
 * @constant
 * @summary Gulp concat
 * @description Gulp concat
 */
const concat = require('gulp-concat');

/**
 * @name rename
 * @constant
 * @summary Gulp rename
 * @description Gulp rename
 */
const rename = require('gulp-rename');

/**
 * @name eslint
 * @constant
 * @summary Gulp eslint
 * @description Gulp eslint
 */
const eslint = require('gulp-eslint');

/**
 * @name tslint
 * @constant
 * @summary Gulp tslint
 * @description Gulp tslint
 */
const tslint = require('gulp-tslint');

/**
 * @name plumber
 * @constant
 * @summary Gulp plumber
 * @description Gulp plumber
 */
const plumber = require('gulp-plumber');

/**
 * @name mocha
 * @constant
 * @summary Gulp mocha
 * @description Gulp mocha
 */
const mocha = require('gulp-mocha');

/**
 * @name karmaServer
 * @constant
 * @summary Karma server
 * @description Karma server
 */
const karmaServer = require('karma').Server;

/**
 * @name uglify
 * @constant
 * @summary Gulp uglify
 * @description Gulp uglify
 */
const uglify = require('gulp-uglify');

/**
 * @name sass
 * @constant
 * @summary Gulp sass
 * @description Gulp sass
 */
const sass = require('gulp-sass');

/**
 * @name cssnano
 * @constant
 * @summary Gulp cssnano
 * @description Gulp cssnano
 */
const cssnano = require('gulp-cssnano');

/**
 * @name autoprefixer
 * @constant
 * @summary Gulp autoprefixer
 * @description Gulp autoprefixer
 */
const autoprefixer = require('gulp-autoprefixer');

/**
 * @name systemjsBuilder
 * @constant
 * @summary Gulp systemjs builder
 * @description Gulp systemjs builder
 */
const systemjsBuilder = require('gulp-systemjs-builder');

/**
 * @name hashsum
 * @constant
 * @summary Gulp hashsum
 * @description Gulp hashsum
 */
const hashsum = require('gulp-hashsum');

/**
 * @name crypto
 * @constant
 * @summary Node crypto
 * @description Node crypto
 */
const crypto = require('crypto');

/**
 * @name fs
 * @constant
 * @summary Node fs
 * @description Node fs
 */
const fs = require('fs');

/**
 * @name spawn
 * @constant
 * @summary Node child process spawner
 * @description Node child process spawner
 */
const spawn = require('child_process').spawn;

/**
 * @name node
 * @summary NodeJS client application server instance.
 */
let node;

/**
 * @name tsc
 * @summary Typescript Compiler instance.
 */
let tsc;

/**
 * @name protractor
 * @summary Protractor instance.
 */
let protractor;

/**
 * @name hashsum
 * @member {Function}
 * @summary Hashsum identifies build.
 * @description After build SHA1SUMS.json is generated with sha1 sums for different files, then sha256 is calculated using stringified file contents.
 * @see {@link module:build-system/tasks/hashsum}
 */
gulp.task('hashsum', () => {
	return require('./build-system/tasks/hashsum')(gulp, hashsum, config.hashsum);
});

/**
 * @name Create environment import
 * @see {@link module:build-system/modules/create-environment}
 */
require('./build-system/modules/create-environment')(gulp, fs, crypto, config.env);

/**
 * @name Server handling tasks import
 * @see {@link module:build-system/modules/server}
 */
require('./build-system/modules/server')(gulp, node, spawn);

/**
 * @name tsc
 * @member {Function}
 * @summary Compiles client.
 * @description Compiles client typescript files.
 */
gulp.task('tsc', (done) => {
	if (tsc) tsc.kill();
	tsc = spawn('tsc', [], {stdio: 'inherit'});
	tsc.on('close', (code) => {
		if (code === 8) {
			console.log('Error detected, waiting for changes...');
		} else {
			done();
		}
	});
});

/**
 * @name generate-logs-index
 * @member {Function}
 * @summary Generates logs index file.
 * @description Generates an html-file which serves as a logs index.
 * @see {@link module:build-system/tasks/generate-logs-index}
 */
gulp.task('generate-logs-index', (done) => {
	return require('./build-system/tasks/generate-logs-index')(fs, done);
});

/**
 * @name jsdoc-server
 * @member {Function}
 * @summary Generates server jsdoc.
 * @description Generates jsdoc for client application server.
 * @see {@link module:build-system/tasks/jsdoc-server}
 */
gulp.task('jsdoc-server', () => {
	const jsdoc = require('gulp-jsdoc3');
	return require('./build-system/tasks/jsdoc-server')(gulp, jsdoc, config.server.jsdoc);
});

/**
 * @name jsdoc-build
 * @member {Function}
 * @summary Generates build system jsdoc.
 * @description Generates jsdoc for client application build system.
 * @see {@link module:build-system/tasks/jsdoc-build}
 */
gulp.task('jsdoc-build-system', () => {
	const jsdoc = require('gulp-jsdoc3');
	return require('./build-system/tasks/jsdoc-build-system')(gulp, jsdoc, config.build.jsdoc);
});

/**
 * @name typedoc-client
 * @member {Function}
 * @summary Generates client typedoc.
 * @description Generates typedoc for client application.
 * @see {@link module:build-system/tasks/typedoc}
 */
gulp.task('typedoc-client', () => {
	const typedoc = require('gulp-typedoc');
	return require('./build-system/tasks/typedoc')(gulp, typedoc, config.client.typedoc);
});

/**
 * @name server-test
 * @member {Function}
 * @summary Executes server unit tests.
 * @description Executes server unit tests, generates test report.
 * @see {@link module:build-system/tasks/server-test}
 */
gulp.task('server-test', () => {
	return require('./build-system/tasks/server-test')(gulp, mocha, fs, config.server.unit);
});

/**
 * @name karmaSRV
 * @summary Karma server instance.
 */
let karmaSRV;
/**
 * @name client-unit-test
 * @member {Function}
 * @summary Executes client unit tests in watch mode.
 * @description Executes client unit tests in watch mode, generates test report.
 */
gulp.task('client-unit-test', (done) => {
	if (!karmaSRV) {
		karmaSRV = new karmaServer({
			configFile: require('path').resolve('test/karma.conf.js'),
			singleRun: false,
			autoWatch: true
		});

		karmaSRV.on('browser_error', (browser, err) => {
			console.log('=====\nKarma > Run Failed\n=====\n', err);
			throw err;
		});

		karmaSRV.on('run_complete', (browsers, results) => {
			if (results.failed) {
				console.log('=====\nKarma > Tests Failed\n=====\n', results);
			} else {
				console.log('=====\nKarma > Complete With No Failures\n=====\n', results);
			}
			done();
		});

		karmaSRV.start();
	} else {
		console.log('<<<<< karmaSRV already running >>>>>');
		karmaSRV.refreshFiles();
	}
});

/**
 * @name client-unit-test-single-run
 * @member {Function}
 * @summary Executes client unit tests in single run mode.
 * @description Executes client unit tests in single run mode, generates test report.
 */
gulp.task('client-unit-test-single-run', (done) => {
	if (!karmaSRV) {
		karmaSRV = new karmaServer({
			configFile: require('path').resolve('test/karma.conf.js'),
			singleRun: true
		});

		karmaSRV.on('browser_error', (browser, err) => {
			console.log('=====\nKarma > Run Failed\n=====\n', err);
			throw err;
		});

		karmaSRV.on('run_complete', (browsers, results) => {
			if (results.failed) {
				console.log('=====\nKarma > Tests Failed\n=====\n', results);
			} else {
				console.log('=====\nKarma > Complete With No Failures\n=====\n', results);
			}
			done();
		});

		karmaSRV.start();
	} else {
		console.log('<<<<< karmaSRV already running >>>>>');
	}
});

/**
 * @name client-e2e-test
 * @member {Function}
 * @summary Executes client e2e tests.
 * @description Executes client e2e tests, generates test report.
 */
gulp.task('client-e2e-test', () => {
	if (protractor) protractor.kill();
	protractor = spawn('npm', ['run', 'protractor'], {stdio: 'inherit'});
});

/**
 * @name build-system-js
 * @member {Function}
 * @summary Builds application for all roles.
 * @description Bundles scripts for application built for all roles.
 * @see {@link module:build-system/tasks/build-system-js}
 */
gulp.task('build-system-js', () => {
	return require('./build-system/tasks/build-system-js')(gulp, systemjsBuilder, config.systemjs);
});

/**
 * @name pack-vendor-js
 * @member {Function}
 * @summary Packs vendor js bundle.
 * @description Concatenates, and minifies vendor js files (nonangular js bundle, components related to design, styling, data visualization etc.).
 * @see {@link module:build-system/tasks/pack-vendor-js}
 */
gulp.task('pack-vendor-js', () => {
	return require('./build-system/tasks/pack-vendor-js')(gulp, plumber, uglify, concat, rename, config.vendor.js);
});

/**
 * @name pack-vendor-css
 * @member {Function}
 * @summary Packs vendor css bundle.
 * @description Concatenates, and minifies vendor css files.
 * @see {@link module:build-system/tasks/pack-vendor-css}
 */
gulp.task('pack-vendor-css', () => {
	return require('./build-system/tasks/pack-vendor-css')(gulp, plumber, cssnano, concat, rename, config.vendor.css);
});

/**
 * @name move-vendor-fonts
 * @member {Function}
 * @summary Moves vendor fonts.
 * @description Moves vendor fonts to specified location for usage in the application.
 * @see {@link module:build-system/tasks/move-vendor-fonts}
 */
gulp.task('move-vendor-fonts', () => {
	return require('./build-system/tasks/move-vendor-fonts')(gulp, config.vendor.fonts);
});

/**
 * @name sass-autoprefix-minify-css
 * @member {Function}
 * @summary Compiles SASS to CSS.
 * @description Compiles SASS to CSS, autoprefixes, and minifies bundle.
 * @see {@link module:build-system/tasks/sass-autoprefix-minify-css}
 */
gulp.task('sass-autoprefix-minify-css', () => {
	return require('./build-system/tasks/sass-autoprefix-minify-css')(gulp, plumber, concat, rename, cssnano, autoprefixer, sass, config.sass);
});

/**
 * @name eslint
 * @member {Function}
 * @summary Lints JavaScript codebase.
 * @description Calls gulp-eslint with specified config.
 * @see {@link module:build-system/tasks/eslint}
 */
gulp.task('eslint', () => {
	return require('./build-system/tasks/eslint')(gulp, eslint, config.eslint);
});

/**
 * @name tslint
 * @member {Function}
 * @summary Lints Typescript codebase.
 * @description Calls gulp-tslint with specified config.
 * @see {@link module:build-system/tasks/tslint}
 */
gulp.task('tslint', () => {
	return require('./build-system/tasks/tslint')(gulp, tslint, config.tslint);
});

/**
 * @name lint
 * @member {Function}
 * @summary Lints Typescript, and JavsScript codebase.
 * @description Calls gulp tasks: tslint, eslint.
 * @see {@link module:build-system/tasks/tslint}
 * @see {@link module:build-system/tasks/eslint}
 */
gulp.task('lint', (done) => {
	runSequence('eslint', 'tslint', done);
});

/**
 * @name watch
 * @member {Function}
 * @summary Default development mode watchers.
 * @description Watches all files, triggers all tasks - default development mode.
 * @see {@link module:build-system/tasks/watch}
 */
gulp.task('watch', () => {
	return require('./build-system/tasks/watch').all(gulp);
});

/**
 * @name watch-and-lint
 * @member {Function}
 * @summary Linting watchers.
 * @description Watches all js/ts files, triggers respective linting tasks.
 * @see {@link module:build-system/tasks/watch}
 */
gulp.task('watch-and-lint', () => {
	return require('./build-system/tasks/watch').lint(gulp);
});

/**
 * @name watch-client-and-test
 * @member {Function}
 * @summary Client testing watchers.
 * @description Watches client files, triggers respective testing tasks.
 * @see {@link module:build-system/tasks/watch}
 */
gulp.task('watch-client-and-test', () => {
	return require('./build-system/tasks/watch').test(gulp);
});

/**
 * @name compile-and-test
 * @member {Function}
 * @summary Compiles and tests client in signe run mode.
 * @description Compiles and tests client in signe run mode.
 */
gulp.task('compile-and-test', (done) => {
	runSequence('tsc', 'client-unit-test-single-run', done);
});

/**
 * @name build
 * @member {Function}
 * @summary Builds client application from existing compiles ts-code.
 * @description Builds client application from existing compiles ts-code.
 */
gulp.task('build', (done) => {
	runSequence('build-system-js', 'pack-vendor-js', 'pack-vendor-css', 'move-vendor-fonts', 'sass-autoprefix-minify-css', 'hashsum', done);
});

/**
 * @name compile-and-build
 * @member {Function}
 * @summary Compiles and builds client application.
 * @description Compiles and builds client application.
 */
gulp.task('compile-and-build', (done) => {
	runSequence('tsc', 'build', 'create-env', done);
});

/**
 * @name compile-and-build-electron
 * @member {Function}
 * @summary Compiles and builds client application for electron environment.
 * @description Compiles and builds client application for electron environment.
 */
gulp.task('compile-and-build-electron', (done) => {
	runSequence('tsc', 'build', 'create-env-electron', done);
});

/**
 * @name rebuild-app
 * @member {Function}
 * @summary Rebuilds (compiles and builds) client application.
 * @description Rebuilds (compiles and builds) client application.
 */
gulp.task('rebuild-app', (done) => { // should be used in watcher to rebuild the app on *.ts file changes
	runSequence('tslint', 'tsc', 'build-system-js', 'hashsum', done);
});

/**
 * @name rebuildApp
 * @summary Rebuild app spawned process instance.
 */
let rebuildApp;
/**
 * @name spawn-rebuild-app
 * @member {Function}
 * @summary Spawns rebuild app task.
 * @description Spawns rebuild app task (is used in development watchers).
 */
gulp.task('spawn-rebuild-app', (done) => {
	if (rebuildApp) rebuildApp.kill();
	rebuildApp = spawn('gulp', ['rebuild-app'], {stdio: 'inherit'});
	rebuildApp.on('close', (code) => {
		console.log(`rebuildApp closed with code ${code}`);
	});
	done();
});

/**
 * @name default
 * @member {Function}
 * @summary Default development start sequence.
 * @description Default development start sequence: lint, compile-and-build, server, watch.
 * @see {@link module:gulpfile}
 * @see {@link module:build-system/tasks/watch}
 */
gulp.task('default', (done) => {
	runSequence('lint', 'compile-and-build', 'server', 'watch', done);
});

/*
*	build electron app dist for windows, linux
*
*	requires mono installation for Ubuntu, see here http://www.mono-project.com/download/
*
*	NOTE before packing/building: package.json must contain
*	{...
*		'main': 'main.js',
*	...}
*
*	after installation execute: gulp electron-packager-win
*
*	after previous task is completed execute: gulp electron-winstaller
*	or use a single sequence of tasks, execure: gulp build-electron-win
*
*	when running on windows port 8079 may be in use, execute the following:
*	netstat -ano | findstr 8079
*	taskkill /F /PID <fond_task_PID>
*
*	electronPackagerIgnore is an array of regexps to be ignored on electron app packaging
*/
const electronPackagerIgnore = [ // exclude
	/\/desktop/, // builds and dists
	/\/build-system/, // build system tasks
	/\/public\/app\/(components|directives|scss|services|translate|.*\.ts|.*\.js)/, // client app source code
	/\/logs/, // logs
	/\/node_modules\/(@angular|gulp.*|karma.*|jasmine.*|mocha.*|@types|(remap-)?istanbul)/, // not needed node_modules
	/\/test\/(client|e2e|server\/.*\.js|.*\.js)/, // tests source code
	/\/build-system/, // gulp-based build system
	/\/\.(editorconfig|eslintignore|eslintrc\.json|gitattributes|gitignore)/, // configuration files matching pattern: .config_filename
	/\/(tsconfig|tslint|jsdoc*)\.json/, // json configuration
	/\/README\.md/, // readme
	/\/.*\.sh/, // bash scripts
	/\/systemjs\..*/ // systemjs configs
	// /\/package(-lock)?\.json/ // package.json and package-lock.json
];
gulp.task('electron-packager-win', (done) => {
	const electronPackager = require('electron-packager');
	electronPackager({
		dir: './',
		out: './desktop/win/build',
		ignore: electronPackagerIgnore,
		overwrite: true,
		asar: true,
		arch: 'x64',
		platform: 'win32',
		win32metadata: {
			'requested-execution-level': 'requireAdministrator' // asInvoker, hightstAvailable, requireAdministrator
		}
	}).then(
		(appPaths) => {
			console.log(`package successful, appPaths ${appPaths}`);
			done();
		},
		(error) => {
			console.log(`error packaging electron app ${error}`);
			throw error;
		}
	);
});
gulp.task('electron-packager-nix', (done) => {
	const electronPackager = require('electron-packager');
	electronPackager({
		dir: './',
		out: './desktop/nix/build',
		ignore: electronPackagerIgnore,
		overwrite: true,
		asar: true,
		arch: 'x64',
		platform: 'linux'
	}).then(
		(appPaths) => {
			console.log(`package successful, appPaths ${appPaths}`);
			done();
		},
		(error) => {
			console.log(`error packaging electron app ${error}`);
			throw error;
		}
	);
});
gulp.task('electron-winstaller', (done) => {
	const electronWinstaller = require('electron-winstaller');
	electronWinstaller.createWindowsInstaller({
		appDirectory: './desktop/win/build/password-manager-win32-x64',
		outputDirectory: './desktop/win/dist',
		authors: 'rfprod'
	}).then(
		() => {
			console.log('build successful');
			done();
		},
		(error) => {
			console.log(`error building electron app for windows ${error}`);
			throw error;
		}
	);
});
gulp.task('electron-debinstaller', (done) => {
	const electronDebInstaller = require('electron-installer-debian');
	electronDebInstaller({
		src: './desktop/nix/build/password-manager-linux-x64',
		dest: './desktop/nix/dist',
		maintainer: 'rfprod',
		arch: 'amd64',
		categories: ['Internet'],
		lintianOverrides: ['changelog-file-missing-in-native-package']
	}, (error, options) => {
		if (error) {
			console.log(`error building electron app for debian ${error}`);
			throw error;
		}
		console.log(`successful build with options ${options}`);
		done();
	});
});
gulp.task('build-electron-win', (done) => {
	runSequence('compile-and-build-electron', 'electron-packager-win', 'electron-winstaller', done);
});
gulp.task('build-electron-deb', (done) => {
	runSequence('compile-and-build-electron', 'electron-packager-nix', 'electron-debinstaller', done);
});

process.on('exit', (code) => {
	console.log(`PROCESS EXIT CODE ${code}`);
});
