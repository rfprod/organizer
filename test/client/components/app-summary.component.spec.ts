import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { EventEmitterService } from '../../../public/app/services/event-emitter.service';
import { UserService } from '../../../public/app/services/user.service';
import { CustomHttpHandlersService } from '../../../public/app/services/custom-http-handlers.service';
import { UserAPIService } from '../../../public/app/services/user-api.service';

import { TranslateService, TranslatePipe, TRANSLATION_PROVIDERS } from '../../../public/app/translate/index';

import { ServerStaticDataService } from '../../../public/app/services/server-static-data.service';
import { PublicDataService } from '../../../public/app/services/public-data.service';
import { WebsocketService } from '../../../public/app/services/websocket.service';

import { FlexLayoutModule } from '@angular/flex-layout';
import '../../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from '../../../public/app/modules/custom-material.module';

import { DummyComponent } from '../mocks/index';

import { AppSummaryComponent } from '../../../public/app/components/app-summary.component';

describe('AppSummaryComponent', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ TranslatePipe, AppSummaryComponent, DummyComponent ],
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
		expect(this.component.subscriptions).toEqual(jasmine.any(Array));
		expect(this.component.appUsageData).toEqual(jasmine.any(Array));
		expect(this.component.drawChart).toEqual(jasmine.any(Function));
		expect(this.component.serverData).toEqual({
			static: jasmine.any(Array),
			dynamic: jasmine.any(Array)
		});
		expect(this.component.ws).toEqual(jasmine.any(WebSocket));
		expect(this.component.errorMessage).toBeUndefined();
		expect(this.component.getServerStaticData).toBeDefined();
		expect(this.component.getPublicData).toBeDefined();
		expect(this.component.userStatus).toBeDefined();
		expect(this.component.getUserStatus).toBeDefined();
		expect(this.component.generateKeypair).toBeDefined();
		expect(this.component.showModal).toBeDefined();
		expect(this.component.toggleModal).toBeDefined();
		expect(this.component.ngOnInit).toBeDefined();
		expect(this.component.ngOnDestroy).toBeDefined();
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
