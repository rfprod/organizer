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
		salt: ''
	};

	return {
		/**
		 * Returns user object
		 * @return {object} User object
		 */
		user: () => {
			return new Promise((resolve) => {
				fs.readFile(cwd + '/data/user.json', (err, data) => {
					if (err) {
						console.log('# > user does not exist, initialize');
						fs.writeFile(cwd + '/data/user.json', JSON.stringify(defaultUserObject), (err) => {
							if (err) {
								console.log('# > error getting user', err);
								resolve({});
							}
							console.log(`# > ${cwd}/data/user.json was created`);
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
				fs.readFile(cwd + '/data/user.json', (err, data) => {
					if (err) {
						console.log('# > user does not exist, should be initialized first');
						resolve({});
					} else {
						const user = JSON.parse(data.toString());
						if (newValues) {
							for (const [key, value] of Object.entries(user)) {
								user[key] = newValues[key] ? value : user[key];
							}
						}
						resolve(user);
					}
				});
			});
		}
	};
};
