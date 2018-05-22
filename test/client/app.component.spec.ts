import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { EventEmitterService } from '../../public/app/services/event-emitter.service';
import { CustomDeferredService } from '../../public/app/services/custom-deferred.service';
import { CustomServiceWorkerService } from '../../public/app/services/custom-service-worker.service';

import { TranslateService, TranslatePipe, TRANSLATION_PROVIDERS } from '../../public/app/translate/index';

import { ISupportedLanguage } from '../../public/app/interfaces';

import { FlexLayoutModule } from '@angular/flex-layout';
import '../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from '../../public/app/custom-material.module';

import { DummyComponent, AppNavComponentMock, AppInfoComponentMock } from './mocks/index';

import { AppComponent } from '../../public/app/app.component';

describe('AppComponent', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ TranslatePipe, AppComponent, AppNavComponentMock, AppInfoComponentMock, DummyComponent ],
			imports: [ BrowserDynamicTestingModule, NoopAnimationsModule, CustomMaterialModule, FlexLayoutModule, RouterTestingModule.withRoutes([
				{path: '', component: DummyComponent},
			]) ],
			providers: [
				{
					provide: 'Window',
					useValue: {
						location: window.location,
						navigator: {
							language: 'en',
							languages: ['en'],
							serviceWorker: window.navigator.serviceWorker
						}
					},
					localStorage: window.localStorage,
					sessionStorage: window.sessionStorage,
				},
				CustomServiceWorkerService,
				EventEmitterService,
				TRANSLATION_PROVIDERS,
				TranslateService,
			],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(AppComponent);
			this.component = this.fixture.componentInstance;
			this.emitterService = TestBed.get(EventEmitterService) as EventEmitterService;
			this.translateService = TestBed.get(TranslateService) as TranslateService;
			this.serviseWorker = TestBed.get(CustomServiceWorkerService) as CustomServiceWorkerService;
			done();
		});
	});

	it('should be defined', () => {
		expect(this.component).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.component.subscriptions).toEqual(jasmine.any(Array));
		expect(this.component.showSpinner).toEqual(jasmine.any(Boolean));
		expect(this.component.showSpinner).toBeFalsy();
		expect(this.component.supportedLanguages).toEqual([
			{ key: 'en', name: 'English' },
			{ key: 'ru', name: 'Russian' }
		]);
		expect(this.component.startSpinner).toEqual(jasmine.any(Function));
		expect(this.component.stopSpinner).toEqual(jasmine.any(Function));
		expect(this.component.isCurrentLanguage).toEqual(jasmine.any(Function));
		expect(this.component.selectLanguage).toEqual(jasmine.any(Function));
		expect(this.component.ngOnInit).toEqual(jasmine.any(Function));
		expect(this.component.ngOnDestroy).toEqual(jasmine.any(Function));
	});

	it('should control spinner correctly', () => {
		expect(this.component.showSpinner).toBeFalsy();
		this.component.startSpinner();
		expect(this.component.showSpinner).toBeTruthy();
		this.component.stopSpinner();
		expect(this.component.showSpinner).toBeFalsy();
	});

	it('isCurrentLanguage should return boolean', () => {
		expect(this.component.isCurrentLanguage('en')).toEqual(jasmine.any(Boolean));
	});

	it('selectLanguage should set current language if it is not the same as selected', () => {
		expect(this.component.isCurrentLanguage('en')).toBeFalsy();
		this.component.selectLanguage('en');
		expect(this.component.isCurrentLanguage('en')).toBeTruthy();
		this.component.selectLanguage('ru');
		expect(this.component.isCurrentLanguage('ru')).toBeTruthy();
		this.component.selectLanguage('ru');
		expect(this.component.isCurrentLanguage('ru')).toBeTruthy();
	});

	it('should be initialized with English language if user does not prefer Russian', () => {
		this.component.ngOnInit();
		expect(this.component.isCurrentLanguage('en')).toBeTruthy();
	});

	it('should be initialized with Russian language if user prefers it', () => {
		this.component.window.navigator.language = 'ru-RU';
		this.component.ngOnInit();
		expect(this.component.isCurrentLanguage('ru')).toBeTruthy();
	});

	it('should listen to event emitter and take action if message is correct', () => {
		this.component.ngOnInit();

		expect(this.component.showSpinner).toBeFalsy();
		this.emitterService.emitter.emit({ spinner: 'start' });
		expect(this.component.showSpinner).toBeTruthy();
		this.emitterService.emitter.emit({ spinner: 'stop' });
		expect(this.component.showSpinner).toBeFalsy();
		this.emitterService.emitter.emit({ spinner: 'ziii' });
		expect(this.component.showSpinner).toBeFalsy(); // nothing happens

		expect(this.component.isCurrentLanguage('en')).toBeTruthy();
		this.emitterService.emitter.emit({ lang: 'ru' });
		expect(this.component.isCurrentLanguage('ru')).toBeTruthy();
		this.emitterService.emitter.emit({ lang: 'en' });
		expect(this.component.isCurrentLanguage('en')).toBeTruthy();
		this.emitterService.emitter.emit({ lang: 'ziii' });
		expect(this.component.isCurrentLanguage('en')).toBeTruthy(); // nothing happens

		this.emitterService.emitter.emit({ unrecognized_key: 'value' }); //
		expect(this.component.showSpinner).toBeFalsy(); // nothing happens
		expect(this.component.isCurrentLanguage('en')).toBeTruthy(); // nothing happens
	});

	/*
	*	TODO:app.component router events
	*
	it('should listen to router events and take action', () => {
		this.component.ngOnInit();
		this.component.router.navigate('').then(() => {
			// expect some event
		});
	});
	*/

	it('should be properly destroyed', () => {
		this.component.ngOnInit();
		for (const sub of this.component.subscriptions) {
			spyOn(sub, 'unsubscribe').and.callThrough();
		}
		this.component.ngOnDestroy();
		for (const sub of this.component.subscriptions) {
			expect(sub.unsubscribe).toHaveBeenCalled();
		}
	});
});
