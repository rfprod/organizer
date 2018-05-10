import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { EventEmitterService } from '../../../public/app/services/event-emitter.service';
import { UserService } from '../../../public/app/services/user.service';

import { TranslateService, TranslatePipe, TRANSLATION_PROVIDERS } from '../../../public/app/translate/index';

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
					{path: 'login', component: AppLoginComponent},
					{path: 'profile', component: DummyComponent}
				])
			],
			providers: [
				{ provide: 'Window', useValue: { location: { host: 'localhost', protocol: 'http' } } },
				EventEmitterService,
				TRANSLATION_PROVIDERS,
				TranslateService,
				UserService
			],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(AppLoginComponent);
			this.component = this.fixture.componentInstance;
			spyOn(this.component, 'emitSpinnerStartEvent').and.callThrough();
			spyOn(this.component, 'emitSpinnerStopEvent').and.callThrough();
			spyOn(this.component.router, 'navigate').and.callThrough();
			this.eventEmitterSrv = TestBed.get(EventEmitterService) as EventEmitterService;
			spyOn(this.eventEmitterSrv, 'emitEvent').and.callThrough();
			this.userService = TestBed.get(UserService) as UserService;
			spyOn(this.userService, 'ResetUser').and.callThrough();
			spyOn(this.userService, 'SaveUser').and.callThrough();
			this.translateService = TestBed.get(TranslateService) as TranslateService;
			done();
		});
	});

	it('should be defined', () => {
		expect(this.component).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.component.ngUnsubscribe).toEqual(jasmine.any(Subject));
		expect(this.component.loginForm).toBeDefined(jasmine.any(FormGroup));
		expect(this.component.resetForm).toEqual(jasmine.any(Function));
		expect(this.component.submitForm).toEqual(jasmine.any(Function));
		expect(this.component.errorMessage).toBeUndefined();
		expect(this.component.emitSpinnerStartEvent).toEqual(jasmine.any(Function));
		expect(this.component.emitSpinnerStopEvent).toEqual(jasmine.any(Function));
		expect(this.component.ngOnInit).toEqual(jasmine.any(Function));
		expect(this.component.ngOnDestroy).toEqual(jasmine.any(Function));
	});

	it('emitSpinnerStartEvent should send respective event emitter message', () => {
		this.component.emitSpinnerStartEvent();
		expect(this.eventEmitterSrv.emitEvent).toHaveBeenCalledWith({ spinner: 'start' });
	});

	it('emitSpinnerStopEvent should send respective event emitter message', () => {
		this.component.emitSpinnerStopEvent();
		expect(this.eventEmitterSrv.emitEvent).toHaveBeenCalledWith({ spinner: 'stop' });
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
		expect(this.userService.SaveUser).toHaveBeenCalled();
		expect(this.component.router.navigate).toHaveBeenCalledWith(['data']);
	});

	it('should not submit a form on a respective method call if login form is not valid', () => {
		const dummy: any = {
			email: 'test',
			password: '0000'
		};
		this.component.loginForm.patchValue({ email: dummy.email, password: dummy.password });
		this.component.submitForm();
		expect(this.userService.SaveUser).not.toHaveBeenCalled();
		expect(this.component.errorMessage).toEqual('Invalid form input');
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
