'use strict';

/**
 * Server module
 * @module server
 */

/**
 * @name express
 * @constant
 * @summary Express server
 * @description Express server
 */
const express = require('express');

/**
 * @name compression
 * @constant
 * @summary Compression for Express server
 * @description Compression for Express server
 */
const compression = require('compression');

/**
 * @name bodyParser
 * @constant
 * @summary Body parser
 * @description Body parser for Express server
 */
const bodyParser = require('body-parser');

/**
 * @name routes
 * @constant
 * @summary Express server Routes
 * @description Express server Routes
 * @see {@link module:server/routes/index}
 */
const routes = require('./server/routes/index.js');

/**
 * @name session
 * @constant
 * @summary Express server session
 * @description Express server session
 */
const session = require('express-session');

/**
 * @name FileStore
 * @constant
 * @summary Express server session storage
 * @description Express server session storage
 */
const FileStore = require('session-file-store')(session);

/**
 * @name app
 * @constant
 * @summary Express application
 * @description Express application
 */
const app = express();

/**
 * @name expressWs
 * @constant
 * @summary Websocket for Express application
 * @description Websocket for Express application
 */
const expressWs = require('express-ws')(app); // eslint-disable-line no-unused-vars

/**
 * @name jwt
 * @constant
 * @summary JWT simple module
 * @description JWT utilities
 */
const jwt = require('jwt-simple');

/**
 * @name crypto
 * @constant
 * @summary NodeJS Crypto module
 * @description Cryptographic utilities
 */
const crypto = require('crypto');

/**
 * @name keypair
 * @constant
 * @summary RSA keys module
 * @description RSA keys utilities
 */
const keypair = require('keypair');

/**
 * @name path
 * @constant
 * @summary Directory paths utility module
 * @description Directory paths utility module
 */
const fs = require('fs');

require('dotenv').config();

process.title = 'organizer';

/**
 * @name cwd
 * @constant
 * @summary Current directory of the main Server script - server.js
 * @description Correct root path for all setups, it should be used for all file references for the server and its modules like filePath: cwd + '/actual/file.extension'. Built Electron app contains actual app in resources/app(.asar) subdirectory, so it is essential to prefer __dirname usage over process.cwd() to get the value.
 */
const cwd = __dirname;

/**
 * Sessions management.
 */
app.use(
  session({
    secret: 'secretPASSMNGR',
    store: new FileStore(),
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 1, // 1 day
    },
  }),
);

/**
 * Use compression for all responses.
 */
app.use(
  compression({
    threshold: 0,
    level: -1,
  }),
);

/**
 * Request parameters middleware
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', express.static(cwd + '/dist/organizer'));

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
  const regX = process.env.DEV_MODE
    ? /(api|css|webfonts|logs|img|js|node_modules)/
    : /(api|css|webfonts|img|js)/;
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
      req.session.views = typeof req.session.views === 'undefined' ? 1 : req.session.views + 1;
      req.session.viewTimestamp = new Date().getTime();
    }
    res.sendFile(cwd + '/dist/organizer/index.html');
  }
});

// headers config for all Express routes
app.all('/*', function (req, res, next) {
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

/**
 * @name SrvInfo
 * @constant
 * @summary Server information module
 * @description Static, and dynamic server data
 * @see {@link module:server/utils/srv-info}
 */
const SrvInfo = require('./server/utils/srv-info.js');
/**
 * @name Users
 * @constant
 * @summary Users module
 * @description User model, and user utility methods
 * @see {@link module:server/users}
 */
const Users = require('./server/models/users')(cwd);
/**
 * @name appData
 * @constant
 * @summary Application data
 * @description Uses data from Users module
 * @see {@link module:server/users}
 */
const appData = {
  paths: Users.paths,
  keyExists: Users.keyExists,
  user: Users.user,
  config: Users.config,
  saveKeys: Users.saveKeys,
  addPassword: Users.addPassword,
  deletePassword: Users.deletePassword,
  exportPasswords: Users.exportPasswords,
  listExportedPasswordFiles: Users.listExportedPasswordFiles,
};
/**
 * @name cryptoUtils
 * @constant
 * @summary Server information module
 * @description Static, and dynamic server data
 * @see {@link module:server/utils/crypto-utils}
 */
const cryptoUtils = require('./server/utils/crypto-utils')(crypto, jwt, keypair);

routes(app, cwd, fs, SrvInfo, appData, cryptoUtils);

/**
 * @name port
 * @summary Application port
 * @description Application port
 */
const port = process.env.PORT || 8080;

/**
 * @function terminator
 * @summary Terminator function
 * @description Terminates application
 */
function terminator(sig) {
  if (typeof sig === 'string') {
    console.log(`\n${Date(Date.now())}: Received signal ${sig} - terminating app...\n`);
    process.exit(0);
  }
}

/**
 * Termination handlers.
 */
(() => {
  process.on('exit', () => {
    terminator('exit');
  });
  [
    'SIGHUP',
    'SIGINT',
    'SIGQUIT',
    'SIGILL',
    'SIGTRAP',
    'SIGABRT',
    'SIGBUS',
    'SIGFPE',
    'SIGUSR1',
    'SIGSEGV',
    'SIGUSR2',
    'SIGTERM',
  ].forEach(element => {
    process.on(element, () => {
      terminator(element);
    });
  });
})();

app.listen(port, () => {
  console.log(`\n# > START > NO IP > Node.js listening on port ${port}...\n`);
});
