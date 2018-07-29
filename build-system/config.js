const pkg = require('../package.json');

module.exports = {
	/*
	* Hashsum
	*/
	hashsum: {
		gulp: {
			src: ['./public/*', '!./public/SHA1SUMS.json', './public/app/views/**', './public/css/**', './public/webfonts/**', './public/img/**', './public/js/**']
		},
		config: {
			filename: 'public/SHA1SUMS.json',
			hash: 'sha1',
			json: true
		}
	},
	/*
	* Environment
	*/
	env: {
		sha1SumsJson: './public/SHA1SUMS.json',
		hmacSHA: 'sha256',
		envPath: './.env',
		port: '8079',
		appUrl: 'http://localhost:8079',
		appVersion: pkg.version
	},
	/*
	* Systemjs build
	*/
	systemjs: {
		gulp: {
			dest: './public/js'
		},
		baseDir: './',
		builderConfig: './systemjs.config.js',
		moduleName: 'app',
		bundleName: 'bundle.min.js',
		builderOptions: {
			minify: true,
			mangle: true
		}
	},
	/*
	* Vendor
	*/
	vendor: {
		/*
		* Vendor js
		*/
		js: {
			gulp: {
				src: [
					/*
					*	add paths to required third party js libraries here
					*/
					// angular requirements
					'./node_modules/core-js/client/shim.js',
					'./node_modules/zone.js/dist/zone.min.js',
					'./node_modules/reflect-metadata/Reflect.js',
					'./node_modules/web-animations-js/web-animations.min.js',

					'./node_modules/jquery/dist/jquery.js',

					// ng2nvd3 dependency
					'./node_modules/d3/d3.js',
					'./node_modules/nvd3/build/nv.d3.js'
				],
				dest: './public/js'
			},
			bundleName: 'vendor-bundle.min.js'
		},
		/*
		* Vendor css
		*/
		css: {
			gulp: {
				src: [
					/*
					*	add paths to required third party css files
					*/
					'./node_modules/nvd3/build/nv.d3.css',
					'./node_modules/components-font-awesome/css/fontawesome-all.css'
				],
				dest: './public/css'
			},
			bundleName: 'vendor-bundle.min.css'
		},
		/*
		* Vendor fonts
		*/
		fonts: {
			src: [
				'./node_modules/components-font-awesome/webfonts/*.*',
				// material design icons
				'./node_modules/material-design-icon-fonts/iconfont/*.eot',
				'./node_modules/material-design-icon-fonts/iconfont/*.woff2',
				'./node_modules/material-design-icon-fonts/iconfont/*.woff',
				'./node_modules/material-design-icon-fonts/iconfont/*.ttf'
			],
			dest: './public/webfonts'
		}
	},
	/*
	* Sass
	*/
	sass: {
		gulp: {
			src: ['./public/app/scss/*.scss'],
			dest: './public/css'
		},
		browsers: ['last 2 versions'],
		bundleName: 'bundle.min.css'
	},
	/*
	* Eslint
	*/
	eslint: {
		gulp: {
			src: ['./*.js', './app/**/*.js', './public/{electron.preload,service-worker}.js', './test/*.js', './test/e2e/scenarios.js', './test/server/test.js']
		},
		eslintrc: './.eslintrc.json'
	},
	/*
	* Tslint
	*/
	tslint: {
		gulp: {
			src: ['./public/app/*.ts', './public/app/**/*.ts', '!./public/app/{scss,views}/', './test/client/**/*.ts'],
		},
		options: {
			formatter: 'verbose' // 'verbose' - extended info | 'prose' - brief info
		},
		reportOptions: {
			emitError: false
		}
	}
}
