import { TestBed } from '@angular/core/testing';
import { Response, ResponseOptions, Headers } from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { CustomHttpHandlersService } from '../../../public/app/services/custom-http-handlers.service';

describe('CustomHttpHandlersService', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [],
			imports: [],
			providers: [ CustomHttpHandlersService ],
			schemas: []
		}).compileComponents().then(() => {
			this.service = TestBed.get(CustomHttpHandlersService) as CustomHttpHandlersService;
			done();
		});
	});

	it('should be defined', () => {
		expect(this.service).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.service.extractObject).toEqual(jasmine.any(Function));
		expect(this.service.extractArray).toEqual(jasmine.any(Function));
		expect(this.service.handleError).toEqual(jasmine.any(Function));
	});

	it('extractArray should return an Array', () => {
		expect(this.service.extractArray(new Response(new ResponseOptions({ body: [ {x: 'x'}, {y: 'y'} ], status: 200, headers: new Headers({}) })))).toEqual(jasmine.any(Array));
	});

	it('extractArray should return an empty Array if no data is present', () => {
		expect(this.service.extractArray(null)).toEqual(jasmine.any(Array));
	});

	it('extractObject should return an Object', () => {
		expect(this.service.extractObject(new Response(new ResponseOptions({ body: {}, status: 200, headers: new Headers({}) })))).toEqual(jasmine.any(Object));
	});

	it('extractObject should return an empty Object if not data is present', () => {
		expect(this.service.extractObject(null)).toEqual(jasmine.any(Object));
	});

	it('handleError should return an Observable', () => {
		expect(this.service.handleError({ errors: [{ detail: 'error' }]})).toEqual(jasmine.any(Observable));
	});

	it('handleError should handle errors properly', () => {
		expect(this.service.handleError({ _body: JSON.stringify({}), message: 'some error message', status: '400', statusText: 'error status text' })).toEqual(Observable.throw('some error message'));
		expect(this.service.handleError({ _body: JSON.stringify({}), status: '400', statusText: 'error status text' })).toEqual(Observable.throw('400 - error status text'));
		expect(this.service.handleError({ status: '400', statusText: 'error status text' })).toEqual(Observable.throw('400 - error status text'));
		expect(this.service.handleError({})).toEqual(Observable.throw('Server error'));
	});

});
