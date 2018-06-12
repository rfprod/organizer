import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { EventEmitterService } from '../../../public/app/services/event-emitter.service';
import { CustomServiceWorkerService } from '../../../public/app/services/custom-service-worker.service';
import { CustomHttpHandlersService } from '../../../public/app/services/custom-http-handlers.service';
import { CustomDeferredService } from '../../../public/app/services/custom-deferred.service';
import { UserService } from '../../../public/app/services/user.service';

import { TranslateService, TranslatePipe, TRANSLATION_PROVIDERS } from '../../../public/app/translate/index';

import { FlexLayoutModule } from '@angular/flex-layout';
import '../../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from '../../../public/app/modules/custom-material.module';

import { AuthGuardGeneral } from '../../../public/app/services/auth-guard-general.service';
import { AnonimousGuard } from '../../../public/app/services/anonimous-guard.service';

import { DummyComponent } from '../mocks/index';

import { AppNavComponent } from '../../../public/app/components/app-nav.component';

describe('AppNavComponent', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ TranslatePipe, AppNavComponent, DummyComponent ],
			imports: [ NoopAnimationsModule, FlexLayoutModule, CustomMaterialModule, RouterTestingModule.withRoutes([
				{path: 'login', component: DummyComponent},
				{path: 'summary', component: DummyComponent},
				{path: 'data', component: DummyComponent},
				{path: '', redirectTo: 'login', pathMatch: 'full'},
				{path: '**', redirectTo: 'login'}
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
			schemas: [ CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ]
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(AppNavComponent);
			this.component = this.fixture.componentInstance;
			spyOn(this.component, 'switchNavButtons').and.callThrough();
			spyOn(this.component.router, 'navigate').and.callThrough();
			this.eventEmitterSrv = TestBed.get(EventEmitterService) as EventEmitterService;
			spyOn(this.eventEmitterSrv, 'emitEvent').and.callThrough();
			this.userService = TestBed.get(UserService) as UserService;
			spyOn(this.userService, 'resetUser').and.callThrough();
			this.translateService = TestBed.get(TranslateService) as TranslateService;
			done();
		});
	});

	it('should be defined', () => {
		expect(this.component).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.component.subscriptions).toEqual(jasmine.any(Array));
		expect(this.component.navButtonState).toEqual(jasmine.objectContaining({
			summary: false,
			login: false,
			data: false
		}));
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
		this.component.switchNavButtons({ url: 'summary'});
		expect(this.component.navButtonState.summary).toBeTruthy();

		this.component.switchNavButtons({ url: 'summary?arg=random'});
		expect(this.component.navButtonState.summary).toBeTruthy();

		this.component.switchNavButtons({ url: 'login'});
		expect(this.component.navButtonState.login).toBeTruthy();

		this.component.switchNavButtons({ url: 'data'});
		expect(this.component.navButtonState.data).toBeTruthy();

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

	it('should listen to router events and take action', (done) => {
		this.component.ngOnInit();
		this.component.router.navigate(['']).then(() => {
			expect(this.component.switchNavButtons).toHaveBeenCalled();
			done();
		});
	});

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
