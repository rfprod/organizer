import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Http, BaseRequestOptions, Response, ResponseOptions, Headers } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { NvD3Component } from 'ng2-nvd3';

import { EventEmitterService } from '../../../public/app/services/event-emitter.service';
import { UserService } from '../../../public/app/services/user.service';
import { CustomHttpHandlersService } from '../../../public/app/services/custom-http-handlers.service';
import { CustomDeferredService } from '../../../public/app/services/custom-deferred.service';
import { UserAPIService } from '../../../public/app/services/user-api.service';

import { TranslateService, TranslatePipe, TRANSLATION_PROVIDERS } from '../../../public/app/translate/index';

import { ServerStaticDataService } from '../../../public/app/services/server-static-data.service';
import { PublicDataService } from '../../../public/app/services/public-data.service';
import { WebsocketService } from '../../../public/app/services/websocket.service';

import { Observable } from 'rxjs/Rx';
import { Subject } from 'rxjs/Subject';

import { FlexLayoutModule } from '@angular/flex-layout';
import '../../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from '../../../public/app/custom-material.module';

import { DummyComponent } from '../mocks/index';

import { AppSummaryComponent } from '../../../public/app/components/app-summary.component';

describe('AppSummaryComponent', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ TranslatePipe, AppSummaryComponent, NvD3Component, DummyComponent ],
			imports: [ BrowserDynamicTestingModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule,
				CustomMaterialModule, FlexLayoutModule,
				RouterTestingModule.withRoutes([
					{ path: 'login', component: DummyComponent },
					{ path: 'summary', component: AppSummaryComponent },
					{ path: 'data', component: DummyComponent }
				]) ],
			providers: [
				{ provide: 'Window', useValue: { location: { host: 'localhost', protocol: 'http' } } },
				EventEmitterService,
				UserService,
				TRANSLATION_PROVIDERS,
				TranslateService,
				BaseRequestOptions,
				MockBackend,
				{ provide: Http,
					useFactory: (mockedBackend, requestOptions) => new Http(mockedBackend, requestOptions),
					deps: [MockBackend, BaseRequestOptions]
				},
				CustomHttpHandlersService,
				{
					provide: PublicDataService,
					useFactory: (http, window, handlers) => new PublicDataService(http, window, handlers),
					deps: [Http, 'Window', CustomHttpHandlersService]
				},
				{
					provide: ServerStaticDataService,
					useFactory: (http, window, handlers) => new ServerStaticDataService(http, window, handlers),
					deps: [Http, 'Window', CustomHttpHandlersService]
				},
				{
					provide: WebsocketService,
					useFactory: (window) => new WebsocketService(window),
					deps: ['Window']
				},
				{
					provide: UserAPIService,
					useFactory: (http, win, handlers) => new UserAPIService(http, win, handlers),
					deps: [Http, 'Window', CustomHttpHandlersService]
				}
			],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(AppSummaryComponent);
			this.component = this.fixture.componentInstance;
			this.eventEmitterSrv = TestBed.get(EventEmitterService) as EventEmitterService;
			spyOn(this.eventEmitterSrv, 'emitEvent').and.callThrough();
			this.serverStaticDataSrv = TestBed.get(ServerStaticDataService) as ServerStaticDataService;
			this.publicDataSrv = TestBed.get(PublicDataService) as PublicDataService;
			this.translateService = TestBed.get(TranslateService) as TranslateService;
			this.userAPIService = TestBed.get(UserAPIService) as UserAPIService;
			spyOn(this.userAPIService, 'getUser').and.callThrough();
			spyOn(this.userAPIService, 'configUser').and.callThrough();
			this.backend = TestBed.get(MockBackend) as MockBackend;
			done();
		});
	});

	afterEach(() => this.backend.verifyNoPendingRequests());

	it('should be defined', () => {
		expect(this.component).toBeDefined();
	});

	it('should have variables defined', () => {
		expect(this.component.ngUnsubscribe).toEqual(jasmine.any(Subject));
		expect(this.component.chartOptions).toEqual(jasmine.any(Object));
		expect(this.component.chartOptions.chart).toBeDefined();
		expect(this.component.chartOptions.chart).toEqual({
			type: jasmine.any(String),
			height: jasmine.any(Number),
			donut: jasmine.any(Boolean),
			x: jasmine.any(Function),
			y: jasmine.any(Function),
			showLabels: jasmine.any(Boolean),
			labelSunbeamLayout: jasmine.any(Boolean),
			pie: {
				startAngle: jasmine.any(Function),
				endAngle: jasmine.any(Function)
			},
			duration: jasmine.any(Number),
			title: jasmine.any(String),
			legend: {
				margin: {
					top: jasmine.any(Number),
					right: jasmine.any(Number),
					bottom: jasmine.any(Number),
					left: jasmine.any(Number)
				}
			}
		});
		expect(this.component.appUsageData).toEqual(jasmine.any(Array));
		expect(this.component.serverData).toEqual({
			static: jasmine.any(Array),
			dynamic: jasmine.any(Array)
		});
		expect(this.component.wsEndpoint).toBeDefined();
		expect(this.component.wsEndpoint).toEqual('/api/app-diag/dynamic');
		expect(this.component.ws).toEqual(jasmine.any(WebSocket));
		expect(this.component.getServerStaticData).toBeDefined();
		expect(this.component.getPublicData).toBeDefined();
		expect(this.component.nvd3).toEqual(jasmine.any(NvD3Component));
		expect(this.component.ngOnInit).toBeDefined();
		expect(this.component.ngOnDestroy).toBeDefined();
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
