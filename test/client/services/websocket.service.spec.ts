import { TestBed } from '@angular/core/testing';

import { WebsocketService } from '../../../public/app/services/websocket.service';

describe('WebsocketService', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [],
			imports: [],
			providers: [
				{ provide: 'Window', useValue: window },
				WebsocketService
			],
			schemas: []
		}).compileComponents().then(() => {
			this.service = TestBed.get(WebsocketService) as WebsocketService;
			this.window = TestBed.get('Window') as Window;
			done();
		});
	});

	it('should be defined', () => {
		expect(this.service).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.service.host).toBeDefined();
		expect(this.service.protocol).toBeDefined();
		expect(this.service.endpoints).toEqual(jasmine.any(Object));
		expect(this.service.generateUrl).toEqual(jasmine.any(Function));
	});

	it('generateUrl must return a valid websocket url according to provided parameters', () => {
		const host = this.window.location.host;
		expect(this.service.generateUrl('dynamicServerData')).toMatch(`ws://${host}/api/app-diag/dynamic`);
	});

	it('generateUrl must return a valid websocket url according to provided parameters', () => {
		expect(this.service.generateUrl('/test')).toMatch(`Endpoint /test does not exist`);
	});

});
