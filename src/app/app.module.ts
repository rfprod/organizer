import { APP_BASE_HREF, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppAuthComponent } from './components/auth/auth.component';
import { AppChatComponent } from './components/chat/chat.component';
import { AppDataComponent } from './components/data/data.component';
import { AppNavComponent } from './components/navbar/navbar.component';
import { AppRootComponent } from './components/root/root.component';
import { AppSummaryComponent } from './components/summary/summary.component';
import { AppAutofocusDirective } from './directives/autofocus/autofocus.directive';
import { AppAutoscrollDirective } from './directives/autoscroll/autoscroll.directive';
import { AppMaterialModule } from './modules/material/material.module';
import { AppTranslateModule } from './modules/translate/translate.module';
import { NAVIGATOR, WINDOW } from './utils/injection-tokens';
import { getNavigator, getWindow } from './utils/providers';

/**
 * Main application module.
 */
@NgModule({
  declarations: [
    AppRootComponent,
    AppNavComponent,
    AppSummaryComponent,
    AppAuthComponent,
    AppDataComponent,
    AppChatComponent,
    AppAutoscrollDirective,
    AppAutofocusDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppMaterialModule.forRoot(),
    AppTranslateModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase, 'organizer-833bc'),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    { provide: WINDOW, useFactory: getWindow },
    { provide: NAVIGATOR, useFactory: getNavigator },
  ],
  bootstrap: [AppRootComponent],
})
export class AppModule {
  constructor(private readonly matIconRegistry: MatIconRegistry) {
    /**
     *	register fontawesome for usage in mat-icon by adding directives
     *	fontSet="fab" fontIcon="fa-icon"
     *	fontSet="fas" fontIcon="fa-icon"
     *
     *	note: free plan includes only fab (font-awesome-brands) and fas (font-awesome-solid) groups
     *
     *	icons reference: https://fontawesome.com/icons/
     */
    this.matIconRegistry.registerFontClassAlias('fontawesome-all');
  }
}
