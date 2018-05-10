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
module.exports = function(app, cwd, fs, SrvInfo, appData) {

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
		ws.on('error', () => {console.log('Persistent websocket: ERROR');});
	});

	/**
	 * Returns application user.
	 * @name Application user
	 * @path {GET} /api/user
	 * @code {200}
	 * @response {object} {} object
	 */
	app.get('/api/user', (req, res) => {
		res.json(appData.user());
	});
};
