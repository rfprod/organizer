'use-strict';

const fs = require('fs');

/**
 * User module
 * @module app/users
 */

module.exports = (cwd) => {

	const defaultUserObject = {
		name: '',
		email: '',
		password: '',
		salt: '',
		token: '',
		passwords: []
	};

	const userConfigPath = `${cwd}/data/user.json`;

	const handlers = {
		userDoesNotExist: (resolve) => {
			console.log('# > user does not exist, should be initialized first');
			resolve({});
		},
		errorUpdatingUser: (err, resolve, data) => {
			console.log('# > error updating user', err);
			resolve(JSON.parse(data.toString()));
		},
		userWasUpdated: (resolve, user) => {
			console.log(`# > ${userConfigPath} was updated`);
			resolve(user);
		}
	};

	return {
		/**
		 * Returns user object
		 * @return {object} User object
		 */
		user: () => {
			return new Promise((resolve) => {
				fs.readFile(userConfigPath, (err, data) => {
					if (err) {
						console.log('# > user does not exist, initializing');
						fs.writeFile(userConfigPath, JSON.stringify(defaultUserObject), (err) => {
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
		 * Configures user object
		 * @return {object} Updated user object
		 */
		config: (newValues) => {
			return new Promise((resolve) => {
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
						fs.writeFile(userConfigPath, JSON.stringify(user), (err) => {
							if (err) {
								handlers.errorUpdatingUser(err, resolve, data);
							}
							handlers.userWasUpdated(resolve, user);
						});
					}
				});
			});
		},

		addPassword: (newPasswordObject) => {
			return new Promise((resolve) => {
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
						fs.writeFile(userConfigPath, JSON.stringify(user), (err) => {
							if (err) {
								handlers.errorUpdatingUser(err, resolve, data);
							}
							handlers.userWasUpdated(resolve, user);
						});
					}
				});
			});
		},

		deletePassword: (passwordObject) => {
			return new Promise((resolve) => {
				fs.readFile(userConfigPath, (err, data) => {
					if (err) {
						handlers.userDoesNotExist();
					} else {
						const user = JSON.parse(data.toString());
						if (passwordObject) {
							console.log('delete password, passwordObject', passwordObject);
							user.passwords = user.passwords.filter((item) => item.name !== passwordObject.name && item.password !== passwordObject.password);
						}
						console.log('updated user', user);
						fs.writeFile(userConfigPath, JSON.stringify(user), (err) => {
							if (err) {
								handlers.errorUpdatingUser(err, resolve, data);
							}
							handlers.userWasUpdated(resolve, user);
						});
					}
				});
			});
		}
	};
};
