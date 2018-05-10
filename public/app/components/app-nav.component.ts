import { Component, OnInit, OnDestroy, ElementRef, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { EventEmitterService } from '../services/event-emitter.service';
import { CustomServiceWorkerService } from '../services/custom-service-worker.service';
import { TranslateService } from '../translate/index';
import { UserService } from '../services/user.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

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

	private ngUnsubscribe: Subject<void> = new Subject();

	public navButtonState: any = {
		help: false,
		intro: false,
		login: false,
		data: false
	};

	public supportedLanguages: any[] = [
		{ key: 'en', name: 'English' },
		{ key: 'ru', name: 'Russian' }
	];

	public switchNavButtons(event: any, path?: string): void {
		/*
		*	accepts router event, and optionally path which contains name of activated path
		*	if path parameter is passed, event parameter will be ignored
		*/
		console.log('switchNavButtons:', event);
		const route: string = (event.route) ? event.route : (typeof event.urlAfterRedirects === 'string') ? event.urlAfterRedirects : event.url;
		// remove args from route if present
		path = (!path) ? route.replace(/\?.*$/, '').substring(route.lastIndexOf('/') + 1, route.length) : path;
		console.log(' >> PATH', path);
		for (const b in this.navButtonState) {
			if (typeof this.navButtonState[b] === 'boolean') {
				this.navButtonState[b] = (b === path) ? true : false;
			}
		}
		console.log('navButtonState:', this.navButtonState);
	}

	public stopWS(): void {
		/*
		*	this function should be executed before user is sent to any external resource
		*	on click on an anchor object if a resource is loaded in the same tab
		*/
		console.log('close websocket event emitted');
		this.emitter.emitEvent({websocket: 'close'});
	}

	public logOut(): void {
		const token = this.userService.getUser().token;
		this.userService.SaveUser({ token: '' });
		this.router.navigate(['']);
	}

	public selectLanguage(key: string): void {
		this.emitter.emitEvent({lang: key});
	}
	public isLanguageSelected(key: string): boolean {
		return key === this.translate.currentLanguage;
	}

	public serviceWorkerRegistered: boolean = true; // registered by default
	public toggleServiceWorker(): void {
		if (this.serviceWorkerRegistered) {
			this.emitter.emitEvent({serviceWorker: 'deinitialize'});
		} else {
			this.emitter.emitEvent({serviceWorker: 'initialize'});
		}
	}

	private emitterSubscribe(): void {
		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((message: any) => {
			console.log('AppNavComponent consuming event:', JSON.stringify(message));
			if (message.serviceWorker === 'registered') {
				this.serviceWorkerRegistered = true;
			} else if (message.serviceWorker === 'unregistered') {
				this.serviceWorkerRegistered = false;
			}
		});
	}

	private routerSubscribe(): void {
		this.router.events.takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			// console.log(' > ROUTER EVENT:', event);
			if (event instanceof NavigationEnd) {
				console.log(' > ROUTER > NAVIGATION END, event', event);
				this.switchNavButtons(event);
			}
		});
	}

	public ngOnInit(): void {
		console.log('ngOnInit: AppNavComponent initialized');
		this.emitterSubscribe();
		this.routerSubscribe();
	}

	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppNavComponent destroyed');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
