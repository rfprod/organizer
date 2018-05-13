import { Injectable, Inject } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { CustomDeferredService } from '../services/custom-deferred.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

@Injectable()
export class CustomServiceWorkerService {

	constructor(
		private emitter: EventEmitterService,
		@Inject('Window') private window: Window
	) {
		console.log('CustomServiceWorkerService init');
		this.initializeServiceWorker();
	}

	/**
	 * Unsubscribes from infinite subscriptions.
	 */
	private ngUnsubscribe: Subject<void> = new Subject();

	/**
	 * Service worker instance.
	 */
	private serviceWorker: any = this.window.navigator.serviceWorker;

	/**
	 * Service worker registration.
	 */
	private serviceWorkerRegistration: any;

	/**
	 * Registers service worker.
	 */
	private registerServiceWorker(): Promise<boolean> {
		const def = new CustomDeferredService<boolean>();
		if (this.serviceWorker) {
			console.log('serviceWorker exists in navigator, registering');
			this.serviceWorker.register('/service-worker.js', {
				scope: '/'
			}).then((registration: any) => {
				console.log('serviceWorker registration completed, registration:', registration);
				this.serviceWorkerRegistration = registration;
				def.resolve();
			});
		} else {
			console.log('serviceWorker does not exist in navigator');
			def.reject();
		}
		return def.promise;
	}

	/**
	 * Unregisters service worker.
	 */
	private unregisterServiceWorker(): Promise<boolean> {
		const def = new CustomDeferredService<boolean>();
		if (this.serviceWorker) {
			this.serviceWorker.getRegistrations().then((registrations: any) => {
				console.log('removing registrations', registrations);
				return Promise.all(registrations.map((item: any) => item.unregister())).then(() => {
					console.log('serviceWorker unregistered');
					def.resolve();
				});
			});
			this.serviceWorkerRegistration = undefined;
		} else {
			console.log('serviceWorker does not exist in navigator');
			def.resolve();
		}
		return def.promise;
	}

	/**
	 * Subscribes to EventEmitterService, listens to serviceWorker events.
	 */
	private emitterSubscribe(): void {
		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			console.log('CustomServiceWorkerService consuming event:', JSON.stringify(event));
			if (event.serviceWorker === 'initialize') {
				this.initializeServiceWorker();
			} else if (event.serviceWorker === 'deinitialize') {
				this.deinitializeServiceWorker();
			}
		});
	}

	/**
	 * Unsubscribes from EventEmitterService.
	 */
	private emitterUnsubscribe(): void {
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

	/**
	 * Initializes service worker.
	 */
	public initializeServiceWorker(): void {
		this.registerServiceWorker().then(() => {
			this.emitterSubscribe();
			this.emitter.emitEvent({serviceWorker: 'registered'});
		}).catch(() => {
			this.emitter.emitEvent({serviceWorker: 'unregistered'});
		});
	}

	/**
	 * Deinitializes service worker.
	 */
	private deinitializeServiceWorker(): void {
		this.unregisterServiceWorker().then(() => {
			this.emitter.emitEvent({serviceWorker: 'unregistered'});
		});
	}

	/**
	 * Disables service worker.
	 */
	public disableServiceWorker(): void {
		this.unregisterServiceWorker().then(() => {
			this.emitterUnsubscribe();
			this.emitter.emitEvent({serviceWorker: 'unregistered'});
		});
	}

	/**
	 * Resolves if service worker is registered or not.
	 */
	public isServiceWorkerRegistered(): boolean {
		return this.serviceWorker && typeof this.serviceWorkerRegistration !== 'undefined';
	}
}
