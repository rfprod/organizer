import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { EventEmitterService } from '../../../public/app/services/event-emitter.service';
import { CustomServiceWorkerService } from '../../../public/app/services/custom-service-worker.service';
import { UserService } from '../../../public/app/services/user.service';

import { TranslateService, TranslatePipe, TRANSLATION_PROVIDERS } from '../../../public/app/translate/index';

import { Subject } from 'rxjs/Subject';

import { FlexLayoutModule } from '@angular/flex-layout';
import '../../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from '../../../public/app/custom-material.module';

import { DummyComponent } from '../mocks/index';

import { AppNavComponent } from '../../../public/app/components/app-nav.component';

describe('AppNavComponent', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ TranslatePipe, AppNavComponent, DummyComponent ],
			imports: [ NoopAnimationsModule, FlexLayoutModule, CustomMaterialModule, RouterTestingModule.withRoutes([
				{path: 'intro', component: DummyComponent},
				{path: 'login', component: DummyComponent},
				{path: 'data', component: DummyComponent},
				{path: '', redirectTo: 'intro', pathMatch: 'full'},
				{path: '**', redirectTo: 'intro'}
			]) ],
			providers: [
				{ provide: 'Window', useValue: window },
				EventEmitterService,
				CustomServiceWorkerService,
				UserService,
				TRANSLATION_PROVIDERS,
				TranslateService,
				{provide: APP_BASE_HREF, useValue: '/'}
			],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(AppNavComponent);
			this.component = this.fixture.componentInstance;
			spyOn(this.component, 'switchNavButtons').and.callThrough();
			spyOn(this.component.router, 'navigate').and.callThrough();
			this.eventEmitterSrv = TestBed.get(EventEmitterService) as EventEmitterService;
			spyOn(this.eventEmitterSrv, 'emitEvent').and.callThrough();
			this.userService = TestBed.get(UserService) as UserService;
			spyOn(this.userService, 'ResetUser').and.callThrough();
			this.translateService = TestBed.get(TranslateService) as TranslateService;
			done();
		});
	});

	it('should be defined', () => {
		expect(this.component).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.component.ngUnsubscribe).toEqual(jasmine.any(Subject));
		expect(this.component.navButtonsState).toEqual(jasmine.any(Array));
		expect(this.component.navButtonsState.length).toEqual(4);
		expect(this.component.navButtonsState.reduce((a, b) => !b ? a + 1 : a, 0)).toEqual(5);
		expect(this.component.hideNavbar).toEqual(jasmine.any(Boolean));
		expect(this.component.hideNavbar).toBeFalsy();
		expect(this.component.supportedLanguages).toEqual([
			{ key: 'en', name: 'English' },
			{ key: 'ru', name: 'Russian' }
		]);
		expect(this.component.switchNavButtons).toEqual(jasmine.any(Function));
		expect(this.component.stopWS).toEqual(jasmine.any(Function));
		expect(this.component.logOut).toEqual(jasmine.any(Function));
		expect(this.component.selectLanguage).toEqual(jasmine.any(Function));
		expect(this.component.ngOnInit).toEqual(jasmine.any(Function));
		expect(this.component.ngOnDestroy).toEqual(jasmine.any(Function));
	});

	it('should switch nav buttons correctly', () => {
		expect(this.component.navButtonsState.filter((item) => item).length).toEqual(0);
		this.component.switchNavButtons({ url: 'intro'});
		expect(this.component.hideNavbar).toBeFalsy();
		expect(this.component.navButtonsState[1]).toBeTruthy();

		this.component.switchNavButtons({ url: 'intro?arg=random'});
		expect(this.component.hideNavbar).toBeFalsy();
		expect(this.component.navButtonsState[1]).toBeTruthy();

		this.component.switchNavButtons({ url: 'login'});
		expect(this.component.navButtonsState[2]).toBeTruthy();

		this.component.switchNavButtons({ url: 'data'});
		expect(this.component.hideNavbar).toBeFalsy();
		expect(this.component.navButtonsState[3]).toBeTruthy();

		this.component.switchNavButtons({ url: 'data'}, 'help');
		expect(this.component.hideNavbar).toBeFalsy();
		expect(this.component.navButtonsState[0]).toBeTruthy();
	});

	it('should emit websocket control message on stopWS method call', () => {
		this.component.stopWS();
		expect(this.eventEmitterSrv.emitEvent).toHaveBeenCalledWith({ websocket: 'close' });
	});

	it('should emit translate service control message on selectLanguage method call', () => {
		this.component.selectLanguage('en');
		expect(this.eventEmitterSrv.emitEvent).toHaveBeenCalledWith({ lang: 'en' });
	});

	it('should reset user and navigate to index view on logOut method call', () => {
		this.component.logOut();
		expect(this.component.router.navigate).toHaveBeenCalledWith(['']);
	});

	it('should listen to router events and take action if condition is met on init', (done) => {
		this.component.ngOnInit();
		this.component.router.navigate(['']).then(() => {
			expect(this.component.switchNavButtons).toHaveBeenCalled();
			expect(this.component.navButtonsState[1]).toBeTruthy();
			done();
		});
	});

	it('should be properly destroyed', () => {
		this.component.ngOnInit();
		spyOn(this.component.ngUnsubscribe, 'next').and.callThrough();
		spyOn(this.component.ngUnsubscribe, 'complete').and.callThrough();
		this.component.ngOnDestroy();
		expect(this.component.ngUnsubscribe.next).toHaveBeenCalled();
		expect(this.component.ngUnsubscribe.complete).toHaveBeenCalled();
	});

});
