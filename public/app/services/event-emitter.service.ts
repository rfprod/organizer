import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class EventEmitterService {

	private emitter: EventEmitter<object> = new EventEmitter();

	public getEmitter(): EventEmitter<object> {
		return this.emitter;
	}

	public emitEvent(object): void {
		this.emitter.emit(object);
	}

	public emitSpinnerStartEvent(): void {
		this.emitter.emit({spinner: 'start'});
	}
	public emitSpinnerStopEvent(): void {
		this.emitter.emit({spinner: 'stop'});
	}

}
