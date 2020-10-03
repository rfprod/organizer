'use-strict';

const fs = require('fs');

const glob = require('glob');

/**
 * User module.
 * @module server/users
 */

module.exports = cwd => {
  /**
   * Default user object which is used on user initialization.
   */
  const defaultUserObject = {
    email: '',
    password: '',
    salt: '',
    token: '',
    keys: {},
    passwords: [],
    encrypted: false,
  };

  /**
   * User configuration file path.
   */
  const userConfigPath = `${cwd}/server/config/user.json`;

  /**
   * User exported passwords file path.
   */
  const userPasswordsExportPath = () => `${cwd}/server/config/export.${new Date().getTime()}.json`;

  /**
   * User private RSA key file path.
   */
  const userPrivateKeyPath = `${cwd}/server/config/rsa.private`;
  /**
   * User public RSA key file path.
   */
  const userPublicKeyPath = `${cwd}/server/config/rsa.public`;

  /**
   * @name handlers
   * @constant
   * @summary Inner methods result handlers
   * @description Inner methods result handlers
   */
  const handlers = {
    /**
     * User does not exist handler
     */
    userDoesNotExist: resolve => {
      console.log('# > user does not exist, should be initialized first');
      resolve({});
    },
    /**
     * Error updating user handler
     */
    errorUpdatingUser: (err, resolve, data) => {
      console.log('# > error updating user', err);
      resolve(JSON.parse(data.toString()));
    },
    /**
     * User was updated handler
     */
    userWasUpdated: (resolve, user) => {
      console.log(`# > ${userConfigPath} was updated`);
      resolve(user);
    },
    /**
     * Error saving user keys handler
     */
    errorSavingKeys: (err, resolve, data) => {
      console.log('# > error saving user RSA keys', err);
      resolve(JSON.parse(data.toString()));
    },
    /**
     * Keys were saved handler
     */
    keysWereSaved: (resolve, user) => {
      console.log(
        `# > keys from ${userConfigPath} were saved: ${userPrivateKeyPath}, ${userPrivateKeyPath}`,
      );
      resolve(user);
    },
  };

  /**
   * @function keyExists
   * @summary Checks if user keys exist
   * @description Checks if private or public key exists
   * @param privateKey indicates if private key should exist
   * @return {Promise} - key existence promise
   */
  function keyExists(privateKey) {
    return new Promise((resolve, reject) => {
      const keyPath = privateKey ? userPrivateKeyPath : userPublicKeyPath;
      fs.readFile(keyPath, (err, data) => {
        if (err) {
          console.log('# > private RSA key does not exist, ok');
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  /**
   * @function exportPasswords
   * @summary Exports user passwords
   * @description Saves user passwords to a separate json file
   * @param {Array} passwords encrypted passwords array
   * @return {Promise} - file saved promise
   */
  function exportPasswords(passwords) {
    if (!passwords) {
      passwords = [];
    }
    // console.log('passwords, should be encrypted', passwords);
    const exportPath = userPasswordsExportPath();
    console.log('exportPath', exportPath);
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(passwords);
      fs.writeFile(exportPath, data, err => {
        if (err) {
          console.log('error writing file while saving passwords');
          reject(err);
        }
        console.log('export success');
        resolve({ path: exportPath, passwords: passwords });
      });
    });
  }

  /**
   * @function listExportedPasswordFiles
   * @summary Lists exported user password files
   * @return {Promise} - object describing found files
   */
  function listExportedPasswordFiles() {
    return new Promise((resolve, reject) => {
      glob('server/config/export.*.json', {}, (err, files) => {
        if (err) {
          console.log('error getting exports list');
          reject(err);
        }
        console.log('esports list', files);
        resolve(files);
      });
    });
  }

  return {
    /**
     * User data paths: config, keys.
     */
    paths: {
      config: () => userConfigPath,
      keys: () =>
        new Object({
          privateRSA: userPrivateKeyPath,
          publicRSA: userPublicKeyPath,
        }),
    },
    /**
     * Holds methods for checking if private/public RSA keys exist.
     */
    keyExists: {
      privateRSA: () => keyExists(true),
      publicRSA: () => keyExists(),
    },
    /**
     * Returns, and initializes if needed, user object.
     * @return {object} - User object
     */
    user: () => {
      return new Promise(resolve => {
        fs.readFile(userConfigPath, (err, data) => {
          if (err) {
            console.log('# > user does not exist, initializing');
            fs.writeFile(userConfigPath, JSON.stringify(defaultUserObject), err => {
              if (err) {
                console.log('# > error getting user', err);
                resolve({});
              }
              console.log(`# > ${userConfigPath} was created`);
              resolve(defaultUserObject);
            });
          } else {
            resolve(JSON.parse(data.toString()));
          }
        });
      });
    },

    /**
     * Configures user object.
     * @param newValues user object with new values that should be updated
     * @return {object} - Updated user object
     */
    config: newValues => {
      return new Promise(resolve => {
        fs.readFile(userConfigPath, (err, data) => {
          if (err) {
            handlers.userDoesNotExist();
          } else {
            const user = JSON.parse(data.toString());
            if (newValues) {
              console.log('config, newValues', newValues);
              for (const [key, value] of Object.entries(newValues)) {
                if (user.hasOwnProperty(key)) {
                  user[key] = value;
                }
              }
            }
            console.log('updated user', user);
            fs.writeFile(userConfigPath, JSON.stringify(user), err => {
              if (err) {
                handlers.errorUpdatingUser(err, resolve, data);
              }
              handlers.userWasUpdated(resolve, user);
            });
          }
        });
      });
    },

    /**
     * Saves user RSA keys to files.
     * @param keyPair key pair object
     * @return {object} - Updated user object
     */
    saveKeys: keyPair => {
      return new Promise(resolve => {
        fs.readFile(userConfigPath, (err, data) => {
          if (err) {
            handlers.userDoesNotExist();
          } else {
            const user = JSON.parse(data.toString());
            if (keyPair) {
              console.log('saveKeys, keyPair', keyPair);
              fs.writeFile(userPrivateKeyPath, JSON.stringify(keyPair.private), err => {
                if (err) {
                  handlers.errorSavingKeys(err, resolve, data);
                }
                fs.writeFile(userPublicKeyPath, JSON.stringify(keyPair.public), err => {
                  if (err) {
                    handlers.errorSavingKeys(err, resolve, data);
                  }
                  handlers.keysWereSaved(resolve, user);
                });
              });
            } else {
              handlers.errorSavingKeys({ error: 'Missing keyPair parameter' }, resolve, data);
            }
          }
        });
      });
    },

    /**
     * Adds new password.
     * @return {object} - Updated user object
     */
    addPassword: newPasswordObject => {
      return new Promise(resolve => {
        fs.readFile(userConfigPath, (err, data) => {
          if (err) {
            handlers.userDoesNotExist();
          } else {
            const user = JSON.parse(data.toString());
            if (newPasswordObject) {
              newPasswordObject.timestamp = new Date().getTime();
              console.log('add password, newPasswordObject', newPasswordObject);
              user.passwords.push(newPasswordObject);
            }
            console.log('updated user', user);
            fs.writeFile(userConfigPath, JSON.stringify(user), err => {
              if (err) {
                handlers.errorUpdatingUser(err, resolve, data);
              }
              handlers.userWasUpdated(resolve, user);
            });
          }
        });
      });
    },

    /**
     * Removes a password.
     * @return {object} - Updated user object
     */
    deletePassword: passwordObject => {
      return new Promise(resolve => {
        fs.readFile(userConfigPath, (err, data) => {
          if (err) {
            handlers.userDoesNotExist();
          } else {
            const user = JSON.parse(data.toString());
            if (passwordObject) {
              console.log('delete password, passwordObject', passwordObject);
              user.passwords = user.passwords.filter(
                item =>
                  item.name !== passwordObject.name && item.password !== passwordObject.password,
              );
            }
            console.log('updated user', user);
            fs.writeFile(userConfigPath, JSON.stringify(user), err => {
              if (err) {
                handlers.errorUpdatingUser(err, resolve, data);
              }
              handlers.userWasUpdated(resolve, user);
            });
          }
        });
      });
    },

    /**
     * Exports passwords, saves to a separate file.
     */
    exportPasswords: exportPasswords,

    /**
     * Lists password exports.
     */
    listExportedPasswordFiles: listExportedPasswordFiles,
  };
};
