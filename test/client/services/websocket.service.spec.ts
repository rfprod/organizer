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
			done();
		});
	});

	it('should be defined', () => {
		expect(this.service).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.service.host).toBeDefined();
		expect(this.service.wsProtocol).toBeDefined();
		expect(this.service.wsPort).toBeDefined();
		expect(this.service.generateUrl).toEqual(jasmine.any(Function));
	});

	it('generateUrl must return a valid websocket url according to provided parameters', () => {
		expect(this.service.generateUrl('/test')).toMatch('ws://localhost:[0-9]{4}/test');
	});

});
