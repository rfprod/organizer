'use strict';

/*global browser, expect, element, by */

/*
*	API DOC: http://www.protractor.org/#/api
*/

describe('Ng2NMC e2e: ', function() {

	it('should load index view', function() {
		//browser.ignoreSynchronization = true;
		//browser.waitForAngularEnabled(true);
		browser.getCurrentUrl().then(function(url) {
			expect(url).toMatch('/intro$');
		});

		var navButtons = element.all(by.css('root'));
		expect(navButtons.count()).toBe(1);
	});

/*
*   some old tests as a quick example
*
	describe('indexCtrl', function() {

		beforeEach(function() {
			browser.get('/');
		});

		it('should filter the labels list as a user types into the search box', function() {

			var labelsList = element.all(by.repeater('label in publicData[1].labels'));
			var query = element(by.model('labelSearchQuery'));

			query.sendKeys('ram records');
			expect(labelsList.count()).toBe(1);

			query.clear();
			query.sendKeys('barcode recordings');
			expect(labelsList.count()).toBe(1);
		});

		it('should be possible to control labels order via the drop down select box', function() {

			var labelName = element.all(by.repeater('label in publicData[1].labels').column('label.username'));

			function getNames() {
				return labelName.map(function(elm) {
					return elm.getText();
				});
			}

			expect(getNames()).toMatch(/^RAM Records/);
			
			element(by.model('orderProp')).element(by.css('option[value="username"]')).click();

			expect(getNames()).toMatch(/^B/);
		});

	});
*/
});
