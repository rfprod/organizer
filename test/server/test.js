const assert = require('chai').assert,
	expect = require('chai').expect;

const webSocket = require('ws');

const request = require('request');
const cheerio = require('cheerio'),
	str = require('string');

require('dotenv').load();
const baseUrl = 'http://localhost:'+process.env.PORT;

describe('/ endpoint', function() {
	it('should load a an angular initialization page', function (done) {
		request(baseUrl+'/', function (error, response/*, body*/) {
			
			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
			
			done();
		});
	});
	it('should have title with specific text and <spamt> DOM element with no inner html', function (done) {
		request(baseUrl+'/', function (error,response,body) {
			
			const $ = cheerio.load(body);
			assert.equal(1, $('title').length);
			expect(str($('title').html()).contains('PasswordManager (PassMngr)')).to.be.ok;
			assert.equal(1, $('root').length);
			
			done();
		});
	});
});

describe('/api/app-diag/hashsum endpoint', function() {
	it('should deliver app hashsum', function(done) {
		request(baseUrl+'/api/app-diag/hashsum', function(error, response/*, body*/) {

			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);

			const responseData = JSON.parse(response.body);

			assert.isObject(responseData);
			assert.isString(responseData.hashsum);

			done();
		});
	});
});

describe('/api/app-diag/static endpoint', function() {
	it('should deliver static diagnostic information about the app platform', function (done){
		request(baseUrl+'/api/app-diag/static', function (error, response/*, body*/) {
			
			expect(error).to.be.not.ok;
			expect(response).to.be.not.a('undefined');
			expect(response.statusCode).to.be.equal(200);
	
			const responseData = JSON.parse(response.body);
			
			assert.isArray(responseData);
			assert.equal(responseData.length, 7);
			for (let index in responseData) {
				if (responseData[index]) {
					assert.isObject(responseData[index]);
					expect(responseData[index]).to.have.all.keys(['name','value']);
				}
			}
			
			done();
		});
	});
});

describe('/api/app-diag/dynamic endpoint', function() {
	it('should deliver dynamic diagnostic information about the app platform', function (done){

		const ws = new webSocket('ws://localhost:8079/api/app-diag/dynamic');

		ws.on('open', (data) => {
			console.log('ws connection opened', data);
			ws.send(JSON.stringify({action: 'get'}));
		});

		ws.on('message', (data/*, flags*/) => {
			console.log('ws incoming message', data);
			expect(data).to.be.ok;
			const response = JSON.parse(data);
			assert.isArray(response);
			assert.equal(response.length, 2);
			for (let index in response) {
				if (response[index]) {
					assert.isObject(response[index]);
					expect(response[index]).to.have.all.keys(['name','value']);
				}
			}
			ws.close();
		});

		ws.on('close', () => {
			done();
		});
	});
});
