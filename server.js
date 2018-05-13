'use strict';

const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const routes = require('./app/routes/index.js');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const app = express();
const expressWs = require('express-ws')(app); // eslint-disable-line no-unused-vars
const jwt = require('jwt-simple');
const crypto = require('crypto');
const keypair = require('keypair');
const cluster = require('cluster');
const os = require('os');
const fs = require('fs');

let clusterStop = false;

require('dotenv').load();

process.title = 'passmngr';

const cwd = __dirname;

app.use(session({
	secret: 'secretPASSMNGR',
	store: new FileStore,
	resave: true,
	saveUninitialized: false,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 1 // 1 day 
	}
}));

/*
*	use compression for all responses
*/
app.use(compression({
	threshold: 0,
	level: -1
}));

/*
* request parameters middleware
*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/public', express.static(cwd + '/public'));
if (process.env.DEV_MODE) {
	console.log('\n# > DEV_MODE variable present > Node.js will serve /logs with coverage report\n');
	app.use('/logs', express.static(cwd + '/logs'));
	/*
	*	Next three lines are for applicatoin debugging if nothing else helps
	*/
	app.use('/node_modules', express.static(cwd + '/node_modules'));
	app.use('/systemjs.config.js', express.static(cwd + '/systemjs.config.js'));
	app.use('/systemjs.config.extras.js', express.static(cwd + '/systemjs.config.extras.js'));
}
app.use((req, res, next) => {
	/*
	*	this is required for angular to load urls properly when user requests url directly, e.g.
	*	current conditions: client index page is served fro all request
	*	which do not include control words: api, css, fonts, img, js
	*	control words explanation:
	*	api - is part of path that returnd data over REST API
	* css, fonts, img, js - are directories containing client files
	*/
	// console.log('req.path:', req.path);
	// console.log('SESSION', req.session);
	const regX = (process.env.DEV_MODE) ? /(api|css|webfonts|logs|img|js|node_modules)/ : /(api|css|webfonts|img|js)/;
	/*
	*	in DEV_MODE (when env variable value is set)
	*	node does not serve angular app if path includes a word 'logs' - root for different logs and reports
	*	WARNING: this exposes all /logs folder with all of its contents
	*/
	if (regX.test(req.path)) {
		return next();
	} else {
		if (typeof req.session.viewTimestamp === 'undefined') {
			req.session.viewTimestamp = new Date().getTime();
			req.session.views = 1;
		} else if (new Date().getTime() - req.session.viewTimestamp > 10000) {
			req.session.views = (typeof req.session.views === 'undefined') ? 1 : req.session.views + 1;
			req.session.viewTimestamp = new Date().getTime();
		}
		res.sendFile(cwd + '/public/index.html');
	}
});

// headers config for all Express routes
app.all('/*', function(req, res, next) {
	// CORS headers
	res.header('Access-Control-Allow-Origin', '*'); // restrict it to the required domain if needed
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
	// add headers to be exposed
	res.header('Access-Control-Expose-Headers', 'Views');
	// cache control
	res.header('Cache-Control', 'public, no-cache, no-store, must-ravalidate, max-age=0');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	// handle OPTIONS method
	if (req.method == 'OPTIONS') res.status(200).end();
	else next();
});

const SrvInfo = require('./app/utils/srv-info.js');
const Users = require('./app/models/users')(cwd);
const appData = {
	paths: Users.paths,
	keyExists: Users.keyExists,
	user: Users.user,
	config: Users.config,
	saveKeys: Users.saveKeys,
	addPassword: Users.addPassword,
	deletePassword: Users.deletePassword
};
const cryptoUtils = require('./app/utils/crypto-utils')(crypto, jwt, keypair);

routes(app, cwd, fs, SrvInfo, appData, cryptoUtils);

const port = process.env.PORT || 8079,
	ip = process.env.IP;

function terminator (sig) {
	if (typeof sig === 'string') {
		console.log(`\n${Date(Date.now())}: Received signal ${sig} - terminating app...\n`);
		if (cluster.isMaster && !clusterStop) {
			cluster.fork();
		} else {
			process.exit(0);
			if (!cluster.isMaster) { console.log(`${Date(Date.now())}: Node server stopped`); }
		}
	}
}

(() => {
	/*
	*   termination handlers
	*/
	process.on('exit', () => { terminator('exit'); });
	// Removed 'SIGPIPE' from the list - bugz 852598.
	['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
		'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
	].forEach((element) => {
		process.on(element, () => {
			clusterStop = true;
			terminator(element);
		});
	});
})();

if (cluster.isMaster && process.env.DEV_MODE === 'true') {
	const workersCount = os.cpus().length;
	console.log(`\n# > START > CLUSTER > Node.js listening on ${ip}:${port}...\n`);
	console.log(`Cluster setup, workers count: ${workersCount}`);
	for (let i = 0; i < workersCount; i++) {
		console.log('Starting worker', i);
		cluster.fork();
	}
	cluster.on('online', (worker,error) => {
		if (error) throw error;
		console.log('Worker pid',worker.process.pid,'is online');
	});
	cluster.on('exit', (worker, code, signal) => {
		console.log('Worker pid',worker.process.pid,'exited with code',code,'and signal',signal);
		if (!clusterStop) {
			console.log('Starting a new worker...');
			cluster.fork();
		}
	});
} else if (ip) {
	app.listen(port, ip, () => {
		console.log(`\n# > START > IP > Node.js listening on ${ip}:${port}...\n`);
	});
} else {
	app.listen(port, () => {
		console.log(`\n# > START > NO IP > Node.js listening on port ${port}...\n`);
	});
}
