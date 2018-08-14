import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/*
*	Some material components rely on hammerjs
*	CustomMaterialModule loads exact material modules
*/
import '../../node_modules/hammerjs/hammer.js';
import { CustomMaterialModule } from './modules/custom-material.module';

import { NvD3Component } from 'ng2-nvd3';

import { AppRoutingModule } from './app.barrel';

import { AuthGuardGeneral } from './app.barrel';
import { AnonimousGuard } from './app.barrel';

import { AppComponent } from './app.barrel';
import { AppNavComponent } from './app.barrel';
import { AppSummaryComponent } from './app.barrel';
import { AppLoginComponent } from './app.barrel';
import { AppInitializeComponent } from './app.barrel';
import { AppDataComponent } from './app.barrel';

import { TranslateModule } from './app.barrel';

import { CustomServiceWorkerService } from './app.barrel';
import { CustomDeferredService } from './app.barrel';
import { CustomHttpHandlersService } from './app.barrel';
import { EventEmitterService } from './app.barrel';
import { WebsocketService } from './app.barrel';

import { UserAPIService } from './app.barrel';
import { UserService } from './app.barrel';
import { ServerStaticDataService } from './app.barrel';
import { PublicDataService } from './app.barrel';

/**
 * Main application module.
 */
@NgModule({
	declarations: [ AppComponent, AppNavComponent, AppSummaryComponent, AppLoginComponent, AppInitializeComponent, AppDataComponent, NvD3Component ],
	imports 		: [ BrowserModule, BrowserAnimationsModule, FlexLayoutModule, CustomMaterialModule, FormsModule, ReactiveFormsModule, HttpClientModule,
									TranslateModule.forRoot(), AppRoutingModule ],
	providers 	: [ {provide: APP_BASE_HREF, useValue: '/'}, {provide: LocationStrategy, useClass: PathLocationStrategy}, { provide: 'Window', useValue: window },
									CustomServiceWorkerService, CustomDeferredService, CustomHttpHandlersService, EventEmitterService, WebsocketService, UserService, AuthGuardGeneral,
									AnonimousGuard, UserAPIService, ServerStaticDataService, PublicDataService ],
	schemas 		: [ CUSTOM_ELEMENTS_SCHEMA ],
	bootstrap 	: [ AppComponent ],
})
export class AppModule {}
