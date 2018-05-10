import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class EventEmitterService {
	private emitter: EventEmitter<object> = new EventEmitter();
	public emitEvent(object) {
		this.emitter.emit(object);
	}
	public getEmitter() {
		return this.emitter;
	}
}
