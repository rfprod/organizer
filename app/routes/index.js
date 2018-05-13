'use strict';

/**
 * Server Routes module
 * @module app/routes/index
 * @param {object} app Express application
 * @param {object} cwd Current working directory
 * @param {object} fs Filesystem access module
 * @param {object} SrvInfo Server information
 * @param {object} appData User data
 */
module.exports = function(app, cwd, fs, SrvInfo, appData, cryptoUtils) {

	/**
	 * Serves Application root (index page).
	 * @name Public index
	 * @path {GET} /
	 * @code {200}
	 * @response {html} index.html Application index file
	 */
	app.get('/', (req, res) => {
		res.sendFile(cwd + '/public/index.html', {
			headers: {
				'Views': req.session.views
			}
		});
	});

	/**
	 * Serves service worker on root path to capture root scope
	 * @name Service worker
	 * @path {GET} /service-worker.js
	 * @code {200}
	 * @response {js} service-worker.js Service worker
	 */
	app.get('/service-worker.js', (req, res) => {
		res.sendFile(cwd + '/public/service-worker.js');
	});

	/**
	 * Returns application build hashsum from .env file.
	 * Is used by service worker when caching.
	 * @name App-diag build hashsum
	 * @path {GET} /api/app-diag/hashsum
	 * @code {200}
	 * @response {object} {} Object with hashsum key
	 */
	app.get('/api/app-diag/hashsum', (req, res) => {
		console.log('process.env.BUILD_HASH', process.env.BUILD_HASH);
		res.json({ hashsum: process.env.BUILD_HASH || 'NA' });
	});

	/**
	 * Returns user sessions codes list with views count.
	 * This endpoint is used for d3 chart demonstration purposes.
	 * @name App-diag usage
	 * @path {GET} /api/app-diag/usage
	 * @code {200}
	 * @response {array} [] Array of objects
	 */
	app.get('/api/app-diag/usage', (req, res) => {
		/*
		*	reports user sessions codes list with views count
		*/
		let filesList;
		fs.readdir(cwd + '/sessions', (err, data) => {
			if (err) throw err;
			// console.log('data', data);
			filesList = data.filter(item => item !== '.gitkeep');
			const output = [];
			for (const file of filesList) {
				const contents = JSON.parse(fs.readFileSync(cwd + '/sessions/' + file).toString());
				const item = {
					key: file.substring(0, 6),
					y: contents.views
				};
				output.push(item);
			}
			output.sort((a, b) => {
				if (a.y < b.y) { return 1;}
				if (a.y > b.y) { return -1;}
				return 0;
			});
			if (output.length > 10) { output.length = 10; }
			res.json(output);
		});
	});

	/**
	 * Returns static server diagnostic data.
	 * @name App-diag static
	 * @path {GET} /api/app-diag/static
	 * @code {200}
	 * @response {object} {} Object with array of key/value pairs
	 */
	app.get('/api/app-diag/static', (req, res) => {
		res.format({
			'application/json': () => {
				res.send(SrvInfo['static']());
			}
		});
	});

	/**
	 * Returns dynamic server diagnostic data.
	 * @name App-diag dynamic
	 * @path {WS} /api/app-diag/dynamic
	 * @code {200}
	 * @response {object} {} Object with array of key/value pairs
	 */
	app.ws('/api/app-diag/dynamic', (ws) => {
		console.log('websocket opened /app-diag/dynamic');
		let sender = null;
		ws.on('message', (msg) => {
			console.log('message:',msg);
			function sendData () {
				ws.send(JSON.stringify(SrvInfo['dynamic']()), (err) => {if (err) throw err;});
			}
			if (JSON.parse(msg).action === 'get') {
				console.log('ws open, data sending started');
				sendData();
				sender = setInterval(() => {
					sendData();
				}, 5000);
			}
			if (JSON.parse(msg).action === 'pause') {
				console.log('ws open, data sending paused');
				clearInterval(sender);
			}
		});
		ws.on('close', () => {
			console.log('Persistent websocket: Client disconnected.');
			if (ws._socket) {
				ws._socket.setKeepAlive(true);
			}
			clearInterval(sender);
		});
		ws.on('error', () => {
			console.log('Persistent websocket: ERROR');
		});
	});

	const errorMessage = {
		create: { error: 'Error creating user, check server logs for details'},
		status: { error: 'Error getting user status, check server logs for details'},
		login: { error: 'Error logging user in, check server logs for details'},
		config: { error: 'Error updating user, check server logs for details'},
		invalidEmailPass: { error: 'Invalid email and/or password' }
	};

	/**
	 * User login endpoint.
	 * @name User login
	 * @path {POST} /api/user/login
	 * @code {200}
	 * @code {404} failed config
	 * @code {401} invalid creadentials
	 * @code {500} error logging user in
	 * @response {object} {} object with session token
	 */
	app.post('/api/user/login', async(req, res) => {
		const user = await appData.user();
		if (Object.keys(user).length) {
			if (user.email === req.body.email && user.password === req.body.password) {
				const payload = {
					email: user.email,
					created: new Date().getTime()
				};
				let salt = user.salt;
				if (salt.length < 48) { // TODO validate randomized value
					salt = cryptoUtils.generateSalt();
				}
				const tokenObj = cryptoUtils.generateJWToken(payload, salt);
				const formData = { salt: tokenObj.salt, token: tokenObj.token };
				const updatedUser = await appData.config(formData);
				if (Object.keys(updatedUser).length) {
					res.json({ token : tokenObj.token });
				} else {
					res.status(404).json(errorMessage.config);
				}
			} else {
				res.status(401).json(errorMessage.invalidEmailPass);
			}
		} else {
			res.status(500).json(errorMessage.login);
		}
	});

	/**
	 * Application user.
	 * @name Application user
	 * @path {GET} /api/user
	 * @code {200}
	 * @code {500} error creating user
	 * @response {object} {} Current user object
	 */
	app.get('/api/user', async(req, res) => {
		const user = await appData.user();
		if (Object.keys(user).length) {
			res.json(user);
		} else {
			res.status(500).json(errorMessage.create);
		}
	});

	/**
	 * Application user status.
	 * @name Application user status
	 * @path {GET} /api/user/status
	 * @code {200}
	 * @code {500} error getting user status
	 * @response {object} {} Current user status object
	 */
	app.get('/api/user/status', async(req, res) => {
		const user = await appData.user();
		if (Object.keys(user).length) {
			const status = {
				initialized: user.email && user.password ? true : false,
				encryption: user.salt ? true : false,
				passwords: user.passwords.length || 0
			};
			res.json(status);
		} else {
			res.status(500).json(errorMessage.status);
		}
	});

	/**
	 * Application user config, sets user values.
	 * @name Application user config
	 * @path {POST} /api/user/config
	 * @code {200}
	 * @code {404} user does not exist
	 * @response {object} {} Updated user object
	 */
	app.post('/api/user/config', async(req, res) => {
		console.log('req.body', req.body);
		const user = await appData.config(req.body);
		if (Object.keys(user).length) {
			res.json(user);
		} else {
			res.status(404).json(errorMessage.config);
		}
	});

	/**
	 * Add user password.
	 * @name Add password
	 * @path {POST} /api/user/password/add
	 * @code {200}
	 * @code {404} user does not exist
	 * @response {object} {} Updated user object
	 */
	app.post('/api/user/password/add', async(req, res) => {
		console.log('req.body', req.body);
		const user = await appData.addPassword(req.body);
		if (Object.keys(user).length) {
			res.json(user);
		} else {
			res.status(404).json(errorMessage.config);
		}
	});

	/**
	 * Delete user password.
	 * @name Delete password
	 * @path {POST} /api/user/password/delete
	 * @code {200}
	 * @code {404} user does not exist
	 * @response {object} {} Updated user object
	 */
	app.post('/api/user/password/delete', async(req, res) => {
		console.log('req.body', req.body);
		const user = await appData.deletePassword(req.body);
		if (Object.keys(user).length) {
			res.json(user);
		} else {
			res.status(404).json(errorMessage.config);
		}
	});
};
