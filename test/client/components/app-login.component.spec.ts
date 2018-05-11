import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Http, BaseRequestOptions, Response, ResponseOptions, Headers } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { EventEmitterService } from '../../../public/app/services/event-emitter.service';
import { UserService } from '../../../public/app/services/user.service';
import { CustomHttpHandlersService } from '../../../public/app/services/custom-http-handlers.service';
import { CustomDeferredService } from '../../../public/app/services/custom-deferred.service';
import { UserAPIService } from '../../../public/app/services/user-api.service';

import { TranslateService, TranslatePipe, TRANSLATION_PROVIDERS } from '../../../public/app/translate/index';

import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

import { FlexLayoutModule } from '@angular/flex-layout';
import '../../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from '../../../public/app/custom-material.module';

import { DummyComponent } from '../mocks/index';

import { AppLoginComponent } from '../../../public/app/components/app-login.component';

describe('AppLoginComponent', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ TranslatePipe, AppLoginComponent, DummyComponent ],
			imports: [ BrowserDynamicTestingModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule,
				CustomMaterialModule, FlexLayoutModule,
				RouterTestingModule.withRoutes([
					{ path: 'login', component: AppLoginComponent },
					{ path: 'summary', component: DummyComponent },
					{ path: 'data', component: DummyComponent }
				])
			],
			providers: [
				{ provide: 'Window', useValue: { location: { host: 'localhost', protocol: 'http' } } },
				EventEmitterService,
				TRANSLATION_PROVIDERS,
				TranslateService,
				UserService,
				CustomHttpHandlersService,
				BaseRequestOptions,
				MockBackend,
				{ provide: Http,
					useFactory: (mockedBackend, requestOptions) => new Http(mockedBackend, requestOptions),
					deps: [MockBackend, BaseRequestOptions]
				},
				{
					provide: UserAPIService,
					useFactory: (http, win, handlers) => new UserAPIService(http, win, handlers),
					deps: [Http, 'Window', CustomHttpHandlersService]
				}
			],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(AppLoginComponent);
			this.component = this.fixture.componentInstance;
			spyOn(this.component.router, 'navigate').and.callThrough();
			this.eventEmitterSrv = TestBed.get(EventEmitterService) as EventEmitterService;
			spyOn(this.eventEmitterSrv, 'emitEvent').and.callThrough();
			this.userService = TestBed.get(UserService) as UserService;
			spyOn(this.userService, 'ResetUser').and.callThrough();
			spyOn(this.userService, 'SaveUser').and.callThrough();
			this.translateService = TestBed.get(TranslateService) as TranslateService;
			this.userAPIService = TestBed.get(UserAPIService) as UserAPIService;
			spyOn(this.userAPIService, 'login').and.callThrough();
			this.backend = TestBed.get(MockBackend) as MockBackend;
			done();
		});
	});

	afterEach(() => this.backend.verifyNoPendingRequests());

	it('should be defined', () => {
		expect(this.component).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.component.ngUnsubscribe).toEqual(jasmine.any(Subject));
		expect(this.component.loginForm).toBeDefined(jasmine.any(FormGroup));
		expect(this.component.resetForm).toEqual(jasmine.any(Function));
		expect(this.component.submitForm).toEqual(jasmine.any(Function));
		expect(this.component.errorMessage).toBeUndefined();
		expect(this.component.ngOnInit).toEqual(jasmine.any(Function));
		expect(this.component.ngOnDestroy).toEqual(jasmine.any(Function));
	});

	it('should reset form on a respective method call', () => {
		this.component.resetForm();
		expect(this.component.loginForm.controls.email.value).toBeNull();
		expect(this.component.loginForm.controls.password.value).toBeNull();
		expect(this.userService.ResetUser).toHaveBeenCalled();
	});

	it('should submit a form on a respective method call if login form is valid', () => {
		const dummy: any = {
			email: 'test@email.tld',
			password: '0000'
		};
		this.component.loginForm.patchValue({ email: dummy.email, password: dummy.password });
		this.component.submitForm();
		expect(this.userAPIService.login).toHaveBeenCalled();
	});

	it('should not submit a form on a respective method call if login form is not valid', () => {
		const dummy: any = {
			email: 'test',
			password: '0000'
		};
		this.component.loginForm.patchValue({ email: dummy.email, password: dummy.password });
		this.component.submitForm();
		expect(this.userAPIService.login).not.toHaveBeenCalled();
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
