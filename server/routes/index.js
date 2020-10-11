'use strict';

/**
 * Server Routes module
 * @module app/routes/index
 * @param {object} app Express application
 * @param {object} expressWs Express websocket
 * @param {object} cwd Current working directory
 * @param {object} fs Filesystem access module
 * @param {object} SrvInfo Server information
 * @param {object} appData User data
 * @param {object} cryptoUtils Cryptographic utility
 */
module.exports = function (app, expressWs, cwd, fs, SrvInfo, appData, cryptoUtils) {
  /**
   * Serves Application root (index page).
   * @name Public index
   * @path {GET} /
   * @code {200}
   * @response {html} index.html Application index file
   */
  app.get('/', (req, res) => {
    res.sendFile(cwd + '/dist/organizer/index.html', {
      headers: {
        Views: req.session.views,
      },
    });
  });

  /**
   * Returns application build hashsum from .env file.
   * Is used by service worker when caching.
   * @name App-diag build hashsum
   * @path {GET} /api/app-diag/hashsum
   * @code {200}
   * @response {object} - Object with hashsum key
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
   * @response {array} - Array of objects with user sessions data
   */
  app.get('/api/app-diag/usage', (req, res) => {
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
          y: new Date(contents.cookie.expires).getTime() % 160000000,
        };
        output.push(item);
      }
      output.sort((a, b) => {
        if (a.y < b.y) {
          return 1;
        }
        if (a.y > b.y) {
          return -1;
        }
        return 0;
      });
      if (output.length > 10) {
        output.length = 10;
      }
      res.json(output);
    });
  });

  /**
   * Returns static server diagnostic data.
   * @name App-diag static
   * @path {GET} /api/app-diag/static
   * @code {200}
   * @response {array} - Server static data
   */
  app.get('/api/app-diag/static', (req, res) => {
    res.format({
      'application/json': () => {
        res.send(SrvInfo['static']());
      },
    });
  });

  /**
   * Returns dynamic server diagnostic data.
   * @name App-diag dynamic
   * @path {WS} /api/app-diag/dynamic
   * @code {200}
   * @response {array} - Server dynamic data
   */
  app.ws('/api/app-diag/dynamic', ws => {
    console.log('websocket opened /app-diag/dynamic');

    let sender = null;

    ws.on('message', msg => {
      const message = JSON.parse(msg);
      function sendData() {
        ws.send(JSON.stringify(SrvInfo['dynamic']()), err => {
          if (err) throw err;
        });
      }
      if (message.action === 'get') {
        console.log('ws open, data sending started');
        sendData();
        sender = setInterval(() => {
          sendData();
        }, 5000);
      }
      if (message.action === 'pause') {
        console.log('ws open, data sending paused');
        clearInterval(sender);
      }
    });
    ws.on('close', () => {
      console.log('/api/app-diag/dynamic: Client disconnected.');
      if (ws._socket) {
        ws._socket.setKeepAlive(true);
      }
      clearInterval(sender);
    });
    ws.on('error', error => {
      console.log('/api/app-diag/dynamic: error', error);
    });
  });

  const chatSockets = expressWs.getWss('/api/chat');

  /**
   * Chat socket.
   * @name Chat
   * @path {WS} /api/chat
   * @code {200}
   */
  app.ws('/api/chat', ws => {
    console.log('/api/chat: client connected: chatSockets', chatSockets.clients.size);

    chatSockets.clients.forEach(client => {
      client.send(
        JSON.stringify({
          sender: 'System',
          text: `Client connected. Clients: ${chatSockets.clients.size}`,
        }),
        err => {
          if (err) throw err;
        },
      );
    });

    ws.on('message', message => {
      chatSockets.clients.forEach(client => {
        client.send(message, err => {
          if (err) throw err;
        });
      });
    });

    ws.on('close', () => {
      console.log('/api/chat: client disconnected: chatSockets', chatSockets.clients.size);
      chatSockets.clients.forEach(client => {
        client.send(
          JSON.stringify({
            sender: 'System',
            text: `Client disconnected. Clients: ${chatSockets.clients.size}`,
          }),
          err => {
            if (err) throw err;
          },
        );
      });
      if (ws._socket) {
        ws._socket.setKeepAlive(true);
      }
    });

    ws.on('error', error => {
      console.log('/api/chat, error', error);
    });
  });

  const errorMessage = {
    create: { error: 'Error creating user, check server logs for details' },
    status: { error: 'Error getting user status, check server logs for details' },
    login: { error: 'Error logging user in, check server logs for details' },
    config: { error: 'Error updating user, check server logs for details' },
    invalidEmailPass: { error: 'Invalid email and/or password' },
    keysExist: { error: 'At least one user RSA key already exist' },
    keysDoNotExist: { error: 'User RSA keys do not exist' },
    exportPasswords: { error: 'Error saving file while exporting passwords.' },
  };

  /**
   * User login endpoint.
   * @name User login
   * @path {POST} /api/user/login
   * @code {200}
   * @code {404} failed config
   * @code {401} invalid creadentials
   * @code {500} error logging user in
   * @response {object} - Object with session token
   */
  app.post('/api/user/login', async (req, res) => {
    const user = await appData.user();
    if (Object.keys(user).length) {
      if (user.email === req.body.email && user.password === req.body.password) {
        const payload = {
          email: user.email,
          created: new Date().getTime(),
        };
        let salt = user.salt;
        if (salt.length < 48) {
          // TODO validate randomized value
          salt = cryptoUtils.generateSalt();
        }
        const tokenObj = cryptoUtils.generateJWToken(payload, salt);
        const formData = { salt: tokenObj.salt, token: tokenObj.token };
        const updatedUser = await appData.config(formData);
        if (Object.keys(updatedUser).length) {
          res.json({ token: tokenObj.token });
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
   * @response {object} - Current user object
   */
  app.get('/api/user', async (req, res) => {
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
   * @response {object} - Current user status object
   */
  app.get('/api/user/status', async (req, res) => {
    const user = await appData.user();
    if (Object.keys(user).length) {
      const status = {
        initialized: user.email && user.password ? true : false,
        encryption: user.keys.public && user.keys.private ? true : false,
        passwords: user.passwords.length || 0,
        encrypted: user.encrypted ? true : false,
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
   * @response {object} - Updated user object
   */
  app.post('/api/user/config', async (req, res) => {
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
   * @response {object} - Updated user object
   */
  app.post('/api/user/password/add', async (req, res) => {
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
   * @response {object} - Updated user object
   */
  app.post('/api/user/password/delete', async (req, res) => {
    console.log('req.body', req.body);
    const user = await appData.deletePassword(req.body);
    if (Object.keys(user).length) {
      res.json(user);
    } else {
      res.status(404).json(errorMessage.config);
    }
  });

  /**
   * Generates RSA key pair for application user.
   * @name Generate RSA key pair
   * @path {GET} /api/user/rsa/generate
   * @code {200}
   * @code {500} error getting user status
   * @response {object} - Updated user object
   */
  app.get('/api/user/rsa/generate', async (req, res) => {
    appData.keyExists
      .publicRSA()
      .then(() => appData.keyExists.privateRSA())
      .then(() => {
        console.log('user RSA keys exist');
        res.status(412).json(errorMessage.keysExist);
      })
      .catch(async () => {
        console.log('keys do not exist, ok to go on');
        const keysObject = cryptoUtils.generateKeypair();
        const saveKeys = await appData.saveKeys(keysObject);
        const userConfig = { keys: keysObject };
        const user = await appData.config(userConfig);
        if (Object.keys(saveKeys).length && Object.keys(user).length) {
          res.json(user);
        } else {
          res.status(500).json(errorMessage.config);
        }
      });
  });

  /**
   * Encrypts user passwords with generated RSA keypair.
   * @name Encrypt user passwords
   * @path {GET} /api/user/rsa/encrypt
   * @code {200}
   * @code {500} error getting user status
   * @response {object} - Updated user object
   */
  app.get('/api/user/rsa/encrypt', async (req, res) => {
    appData.keyExists
      .publicRSA()
      .then(() => appData.keyExists.privateRSA())
      .catch(() => {
        console.log('keys do not exist');
        res.status(412).json(errorMessage.keysDoNotExist);
      })
      .then(async () => {
        console.log('user RSA keys exist, ok to go on');
        const user = await appData.user();
        if (Object.keys(user).length) {
          user.passwords = user.passwords.map(item => {
            item.password = cryptoUtils.encryptString(item.password, user.keys.public);
            return item;
          });
          const updatedUser = await appData.config({
            passwords: [...user.passwords],
            encrypted: true,
          });
          res.json(updatedUser);
        } else {
          res.status(500).json(errorMessage.config);
        }
      });
  });

  /**
   * Decrypts user passwords with generated RSA keypair.
   * @name Decrypt user passwords
   * @path {GET} /api/user/rsa/decrypt
   * @code {200}
   * @code {500} error getting user status
   * @response {object} - Updated user object
   */
  app.get('/api/user/rsa/decrypt', async (req, res) => {
    appData.keyExists
      .publicRSA()
      .then(() => appData.keyExists.privateRSA())
      .catch(() => {
        console.log('keys do not exist');
        res.status(412).json(errorMessage.keysDoNotExist);
      })
      .then(async () => {
        console.log('user RSA keys exist, ok to go on');
        const user = await appData.user();
        if (Object.keys(user).length) {
          user.passwords = user.passwords.map(item => {
            item.password = cryptoUtils.decryptString(item.password, user.keys.private);
            return item;
          });
          const updatedUser = await appData.config({ passwords: user.passwords, encrypted: false });
          res.json(updatedUser);
        } else {
          res.status(500).json(errorMessage.config);
        }
      });
  });

  /**
   * Saves user passwords to a separate file, encrypts saved passwords with current keypair.
   * @name Export user passwords
   * @path {GET} /api/user/passwords/export
   * @code {200}
   * @code {500} error saving user passwords
   * @response {object} - Information object about exported file
   */
  app.get('/api/user/passwords/export', async (req, res) => {
    appData.keyExists
      .publicRSA()
      .then(() => appData.keyExists.privateRSA())
      .catch(() => {
        console.log('keys do not exist');
        res.status(412).json(errorMessage.keysDoNotExist);
      })
      .then(async () => {
        console.log('user RSA keys exist, ok to go on');
        const user = await appData.user();
        if (Object.keys(user).length) {
          if (!user.encrypted) {
            // encrypt password if not encrypted
            user.passwords = user.passwords.map(item => {
              item.password = cryptoUtils.encryptString(item.password, user.keys.public);
              return item;
            });
          }
          const exportInfo = await appData.exportPasswords(user.passwords);
          res.json(exportInfo);
        } else {
          res.status(500).json(errorMessage.exportPasswords);
        }
      });
  });

  /**
   * Lists exported password files.
   * @name /api/user/passwords/exported list exported user passwords
   * @path {GET} /api/user/passwords/exported
   * @code {200}
   * @code {500} error listing user passwords
   * @response {object} - object with exported files info
   */
  app.get('/api/user/passwords/list/exported', async (req, res) => {
    appData
      .listExportedPasswordFiles()
      .then(files => {
        console.log('exported password files', files);
        res.json(files);
      })
      .catch(error => {
        console.log('error listing exported passwords', error);
        res.status(400).json(error);
      });
  });
};
