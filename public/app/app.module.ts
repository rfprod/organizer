import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { AuthGuardGeneral } from './services/auth-guard-general.service';
import { AnonimousGuard } from './services/anonimous-guard.service';

/*
*	Some material components rely on hammerjs
*	CustomMaterialModule loads exact material modules
*/
import '../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from './modules/custom-material.module';

import { AppComponent } from './app.component';
import { AppNavComponent } from './components/app-nav.component';
import { AppSummaryComponent } from './components/app-summary.component';
import { AppLoginComponent } from './components/app-login.component';
import { AppInitializeComponent } from './components/app-initialize.component';
import { AppDataComponent } from './components/app-data.component';

import { TRANSLATION_PROVIDERS, TranslatePipe, TranslateService } from './translate/index';

import { CustomServiceWorkerService } from './services/custom-service-worker.service';
import { CustomDeferredService } from './services/custom-deferred.service';
import { CustomHttpHandlersService } from './services/custom-http-handlers.service';
import { EventEmitterService } from './services/event-emitter.service';
import { WebsocketService } from './services/websocket.service';

import { UserAPIService } from './services/user-api.service';
import { UserService } from './services/user.service';
import { ServerStaticDataService } from './services/server-static-data.service';
import { PublicDataService } from './services/public-data.service';

import { NvD3Component } from 'ng2-nvd3';

@NgModule({
	declarations: [ AppComponent, TranslatePipe, AppNavComponent, AppSummaryComponent, AppLoginComponent, AppInitializeComponent, AppDataComponent, NvD3Component ],
	imports 		: [ BrowserModule, BrowserAnimationsModule, FlexLayoutModule, CustomMaterialModule, FormsModule, ReactiveFormsModule, HttpClientModule, RouterModule.forRoot(APP_ROUTES) ],
	providers 	: [ {provide: APP_BASE_HREF, useValue: '/'}, {provide: LocationStrategy, useClass: PathLocationStrategy}, { provide: 'Window', useValue: window }, TRANSLATION_PROVIDERS, TranslateService, CustomServiceWorkerService, CustomDeferredService, CustomHttpHandlersService, EventEmitterService, WebsocketService, UserService, AuthGuardGeneral, AnonimousGuard, UserAPIService, ServerStaticDataService, PublicDataService ],
	schemas 		: [ CUSTOM_ELEMENTS_SCHEMA ],
	bootstrap 	: [ AppComponent ],
})
export class AppModule {}
