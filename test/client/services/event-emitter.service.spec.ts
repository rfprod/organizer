import { TestBed } from '@angular/core/testing';

import { EventEmitterService } from '../../../public/app/services/event-emitter.service';

describe('EventEmitterService', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [],
			imports: [],
			providers: [
				{ provide: 'Window', useValue: window },
				EventEmitterService
			],
			schemas: []
		}).compileComponents().then(() => {
			this.service = TestBed.get(EventEmitterService) as EventEmitterService;
			done();
		});
	});

	it('should be defined', () => {
		expect(this.service).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.service.emitter).toBeDefined();
		expect(this.service.getEmitter).toEqual(jasmine.any(Function));
		expect(this.service.emitEvent).toEqual(jasmine.any(Function))		
		expect(this.service.emitSpinnerStartEvent).toEqual(jasmine.any(Function));
		expect(this.service.emitSpinnerStopEvent).toEqual(jasmine.any(Function));
	});

	it('getEmitter should return emitter', () => {
		expect(this.service.getEmitter()).toEqual(this.service.emitter);
	});

});
