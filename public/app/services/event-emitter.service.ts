import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class EventEmitterService {

	/**
	 * Event emitter.
	 */
	private emitter: EventEmitter<object> = new EventEmitter();

	/**
	 * Gets event emitter.
	 */
	public getEmitter(): EventEmitter<object> {
		return this.emitter;
	}

	/**
	 * Emits arbitrary event.
	 */
	public emitEvent(object): void {
		this.emitter.emit(object);
	}

	/**
	 * Emits spinner start event.
	 */
	public emitSpinnerStartEvent(): void {
		this.emitter.emit({spinner: 'start'});
	}
	/**
	 * Emits spinner stop event.
	 */
	public emitSpinnerStopEvent(): void {
		this.emitter.emit({spinner: 'stop'});
	}

}
