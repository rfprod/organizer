import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AppDataComponent } from './components/data/data.component';
import { AppInitializeComponent } from './components/initialize/initialize.component';
import { AppLoginComponent } from './components/login/login.component';
import { AppNavComponent } from './components/navbar/navbar.component';
import { AppSummaryComponent } from './components/summary/summary.component';
import { AppMaterialModule } from './modules/material/material.module';
import { AppTranslateModule } from './modules/translate/translate.module';
import { AppAnonimousGuard } from './services/anonimous-guard.service';
import { AppAuthGuardGeneral } from './services/auth-guard-general.service';
import { AppHttpHandlersService } from './services/http-handlers.service';
import { AppPublicDataService } from './services/public-data.service';
import { AppServerStaticDataService } from './services/server-static-data.service';
import { AppUserApiService } from './services/user-api.service';
import { AppUserService } from './services/user.service';
import { AppWebsocketService } from './services/websocket.service';
import { WINDOW } from './utils/injection-tokens';

/**
 * Main application module.
 */
@NgModule({
  declarations: [
    AppComponent,
    AppNavComponent,
    AppSummaryComponent,
    AppLoginComponent,
    AppInitializeComponent,
    AppDataComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppTranslateModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: WINDOW, useValue: window },
    AppHttpHandlersService,
    AppWebsocketService,
    AppUserService,
    AppAuthGuardGeneral,
    AppAnonimousGuard,
    AppUserApiService,
    AppServerStaticDataService,
    AppPublicDataService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
