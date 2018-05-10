'use-strict';

const fs = require('fs');

/**
 * User module
 * @module app/users
 */

module.exports = (cwd) => {

	return {
		/**
		 * Returns user object
		 * @return {object} User object
		 */
		user: () => {
			fs.readFile(cwd + '/data/user.json', (err, data) => {
				if (err) {
					console.log('# > user does not exist, initialize');
					fs.writeFile(cwd + '/data/user.json', {}, (err) => {
						if (err) throw err;
						console.log(`# > ${cwd}/data/user.json was created`);
						return {};
					});
				} else {
					return data;
				}
			});
		}
	}
};
