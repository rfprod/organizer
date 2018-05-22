import { Component, OnInit, OnDestroy, ElementRef, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { EventEmitterService } from '../services/event-emitter.service';
import { CustomServiceWorkerService } from '../services/custom-service-worker.service';
import { TranslateService } from '../translate/index';
import { UserService } from '../services/user.service';

import { ISupportedLanguage } from '../interfaces';

@Component({
	selector: 'app-nav',
	templateUrl: '/public/app/views/app-nav.html',
	host: {
		class: 'mat-body-1'
	}
})
export class AppNavComponent implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private serviceWorker: CustomServiceWorkerService,
		private userService: UserService,
		private router: Router,
		private translate: TranslateService,
		@Inject('Window') private window: Window
	) {}

	/**
	 * Component subscriptions.
	 */
	private subscriptions: any[] = [];

	/**
	 * Navigation buttons state.
	 */
	public navButtonState: any = {
		summary: false,
		login: false,
		data: false
	};

	/**
	 * Title of views.
	 */
	public viewsTitles: any = {
		summary: 'summary',
		login: 'login',
		data: 'data'
	};

	public currentViewTitle: string = '';

	/**
	 * Supported languages.
	 */
	public supportedLanguages: ISupportedLanguage[] = [
		{ key: 'en', name: 'English' },
		{ key: 'ru', name: 'Russian' }
	];

	/**
	 * Switches navigation buttons.
	 * @param event router event
	 * @param [path] path that should be activated
	 */
	public switchNavButtons(event: any, path?: string): void {
		/*
		*	accepts router event, and optionally path which contains name of activated path
		*	if path parameter is passed, event parameter will be ignored
		*/
		console.log('switchNavButtons:', event);
		const route: string = (event.route) ? event.route : (typeof event.urlAfterRedirects === 'string') ? event.urlAfterRedirects : event.url;
		// remove args from route if present, and remove leading /
		path = (!path) ? route.replace(/\?.*$/, '').substring(route.lastIndexOf('/') + 1, route.length) : path;
		console.log(' >> PATH', path);
		this.currentViewTitle = path;
		for (const b in this.navButtonState) {
			if (typeof this.navButtonState[b] === 'boolean') {
				this.navButtonState[b] = (b === path) ? true : false;
			}
		}
		console.log('navButtonState:', this.navButtonState);
	}

	/**
	 * Emits websocket stop event that should be caught by component which use websocket.
	 *
	 * Note: this function should be executed before user is sent to any external resource
	 * on click on an anchor object if a resource is loaded in the same tab.
	 */
	public stopWS(): void {
		console.log('close websocket event emitted');
		this.emitter.emitEvent({websocket: 'close'});
	}

	/**
	 * Resolves if user is logged in.
	 */
	public isLoggedIn(): boolean {
		return this.userService.getUser().token ? true : false;
	}

	/**
	 * Loggs user out.
	 */
	public logOut(): void {
		this.userService.resetUser();
		this.router.navigate(['']);
	}

	/**
	 * Selects language.
	 * @param key language key
	 */
	public selectLanguage(key: string): void {
		this.emitter.emitEvent({lang: key});
	}
	/**
	 * Resolves if language is selected.
	 * @param key language key
	 */
	public isLanguageSelected(key: string): boolean {
		return key === this.translate.currentLanguage;
	}

	/**
	 * Service worker registration state.
	 */
	public serviceWorkerRegistered: boolean = true;
	/**
	 * Toggles service worker, turn off/on.
	 */
	public toggleServiceWorker(): void {
		if (this.serviceWorkerRegistered) {
			this.emitter.emitEvent({serviceWorker: 'deinitialize'});
		} else {
			this.emitter.emitEvent({serviceWorker: 'initialize'});
		}
	}

	/**
	 * Subscribes to EventEmitterService, listens to serviceWorker events.
	 */
	private emitterSubscribe(): void {
		const sub = this.emitter.getEmitter().subscribe((event: any) => {
			console.log('AppNavComponent consuming event:', JSON.stringify(event));
			if (event.serviceWorker === 'registered') {
				this.serviceWorkerRegistered = true;
			} else if (event.serviceWorker === 'unregistered') {
				this.serviceWorkerRegistered = false;
			}
		});
		this.subscriptions.push(sub);
	}

	/**
	 * Subscribes to router events, switches nav buttons.
	 */
	private routerSubscribe(): void {
		const sub = this.router.events.subscribe((event: any) => {
			// console.log(' > ROUTER EVENT:', event);
			if (event instanceof NavigationEnd) {
				console.log(' > ROUTER > NAVIGATION END, event', event);
				this.switchNavButtons(event);
			}
		});
		this.subscriptions.push(sub);
	}

	public ngOnInit(): void {
		console.log('ngOnInit: AppNavComponent initialized');
		this.emitterSubscribe();
		this.routerSubscribe();
	}

	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppNavComponent destroyed');
		if (this.subscriptions.length) {
			for (const sub of this.subscriptions) {
				sub.unsubscribe();
			}
		}
	}
}
