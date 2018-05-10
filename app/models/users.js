'use-strict';

/**
 * Users Mock module
 * @module app/mocks/users
 * @see module/app/mocks/barrel
 */

module.exports = {
	/**
	 * Returns mocked users list
	 * @return {array} Users list
	 */
	users: () => {
		const sampleObj = {
			id:	'0',
			email: 'username@domain.tld',
			firstName: 'first name',
			lastName: 'last name',
			city:	'city',
			country: 'country',
			role:	'user',
			registered: new Date().getTime() - 10000000,
			lastLogin: new Date().getTime() - 500000
		};
		const sampleObjectKeys = Object.keys(sampleObj);
		let output = [];
		for (let i = 0, max = 2; i < max; i++) {
			if (!i) { output.push(sampleObj); }
			else {
				const newObject = {
					id: i,
					email: sampleObj.email.replace(/username/, 'username_' + i),
					role: (i % 2 === 0) ? 'user' : 'admin',
					registered: new Date().getTime() - 100000000,
					lastLogin: new Date().getTime() - 5000000
				};
				for (const key of sampleObjectKeys) {
					if (!newObject.hasOwnProperty(key) && key !== 'registered' && key !== 'lastLogin') {
						newObject[key] = sampleObj[key] + ' ' + i;
					}
				}
				output.push(newObject);
			}
		}
		return output;
	}
};
