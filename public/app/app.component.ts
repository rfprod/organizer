import { Component, OnInit, OnDestroy, ElementRef, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { EventEmitterService } from './services/event-emitter.service';
import { TranslateService } from './translate/index';
import { CustomServiceWorkerService } from './services/custom-service-worker.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { MatIconRegistry, DateAdapter } from '@angular/material';

import { ISupportedLanguage } from './interfaces';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

declare let $: JQueryStatic;

@Component({
	selector: 'root',
	template: `
		<app-nav></app-nav>
		<router-outlet></router-outlet>
		<span id="spinner" *ngIf="showSpinner">
			<mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
		</span>
	`,
	animations: [
		trigger('empty', [])
	]
})
export class AppComponent implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private translate: TranslateService,
		private router: Router,
		private matIconRegistry: MatIconRegistry,
		private dateAdapter: DateAdapter<any>,
		private serviceWorker: CustomServiceWorkerService,
		@Inject('Window') private window: Window
	) {
		// console.log('this.el.nativeElement', this.el.nativeElement);
	}

	/**
	 * Unsubscribes from infinite subscriptions.
	 */
	private ngUnsubscribe: Subject<void> = new Subject();

	/**
	 * Indicates spinner visibility.
	 */
	public showSpinner: boolean = false;
	/**
	 * Sets spinner visible to true.
	 */
	private startSpinner(): void {
		this.showSpinner = true;
	}
	/**
	 * Sets spinner visible to false.
	 */
	private stopSpinner(): void {
		this.showSpinner = false;
	}

	/**
	 * Supported languages.
	 */
	private supportedLanguages: ISupportedLanguage[] = [
		{ key: 'en', name: 'English' },
		{ key: 'ru', name: 'Russian' }
	];
	/**
	 * Resolves if language is current.
	 * @param key language key
	 */
	private isCurrentLanguage(key: string): boolean {
		return key === this.translate.currentLanguage;
	}
	/**
	 * Selects language.
	 * @param key language key
	 */
	private selectLanguage(key: string): void {
		if (!this.isCurrentLanguage(key)) {
			this.translate.use(key);
			this.setDatepickersLocale(key);
		}
	}

	/**
	 * Sets datepicker locale depending on currently selected language.
	 * @param key language key
	 */
	private setDatepickersLocale(key: string): void {
		console.log('language change, key', key, 'this.dateAdapter', this.dateAdapter);
		if (key === 'ru') {
			this.dateAdapter.setLocale('ru');
		} else {
			this.dateAdapter.setLocale('en');
		}
	}

	public ngOnInit(): void {
		console.log('ngOnInit: AppComponent initialized');

		/*
		* Remove initialization text.
		*/
		$('#init').remove();

		/*
		* Subscribe to event emitter service.
		*/
		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			console.log(' > AppComponent consuming event:', event);
			if (event.spinner) {
				if (event.spinner === 'start') { // spinner control message
					console.log('starting spinner');
					this.startSpinner();
				} else if (event.spinner === 'stop') { // spinner control message
					console.log('stopping spinner');
					this.stopSpinner();
				}
			}
			if (event.lang) {
				console.log('switch language', event.lang);
				if (this.supportedLanguages.filter((item: any) => item.key === event.lang).length) {
					// switch language only if it is present in supportedLanguages array
					this.selectLanguage(event.lang);
				} else {
					console.log('selected language is not supported');
				}
			}
		});

		/*
		* Subscribe to date adapter locale changes.
		*/
		this.dateAdapter.localeChanges.takeUntil(this.ngUnsubscribe).subscribe(() => {
			console.log('> AppComponent, dateAdapter.localeChanges, changed according to the language');
		});

		/*
		* Subscribe to router events.
		*/
		this.router.events.takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			console.log(' > AppComponent, ROUTER EVENT:', event);
		});

		/*
		* check preferred language, respect preference if dictionary exists
		*	for now there are only dictionaries only: English, Russian
		*	set Russian if it is preferred, else use English
		*/
		const nav: any = this.window.navigator;
		const userPreference: string = (nav.language === 'ru-RU' || nav.language === 'ru' || nav.languages[0] === 'ru') ? 'ru' : 'en';
		// set default language
		this.selectLanguage(userPreference);

		/*
		*	register fontawesome for usage in mat-icon by adding directives
		*	fontSet="fab" fontIcon="fa-icon"
		*	fontSet="fas" fontIcon="fa-icon"
		*
		*	note: free plan includes only fab (font-awesome-brands) and fas (font-awesome-solid) groups
		*
		*	icons reference: https://fontawesome.com/icons/
		*/
		this.matIconRegistry.registerFontClassAlias('fontawesome-all');
	}

	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppComponent destroyed');
		this.serviceWorker.disableServiceWorker();
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}

}
