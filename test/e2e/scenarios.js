'use strict';

/*
*	API DOC: http://www.protractor.org/#/api
*/

describe('Password Manager e2e: ', function() {

	it('should load index view', function() {
		//browser.ignoreSynchronization = true;
		//browser.waitForAngularEnabled(true);
		browser.getCurrentUrl().then(function(url) {
			expect(url).toMatch('/intro$');
		});

		var navButtons = element.all(by.css('root'));
		expect(navButtons.count()).toBe(1);
	});

});
