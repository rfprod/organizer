import { OverlayContainer } from '@angular/cdk/overlay';
import { APP_BASE_HREF, DatePipe, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsModule } from '@ngxs/store';

import { AppMaterialModule } from '../../modules/material/material.module';
import { WINDOW } from '../../utils/injection-tokens';
import { getWindow } from '../../utils/providers';
import { DummyComponent } from '../components/dummy.component';

/**
 * Mocks core module providers.
 */
export const mocksCoreModuleProviders: Provider[] = [
  { provide: APP_BASE_HREF, useValue: '/' },
  { provide: LocationStrategy, useClass: PathLocationStrategy },
  { provide: WINDOW, useFactory: getWindow },
  {
    provide: OverlayContainer,
    useValue: {
      getContainerElement: () => {
        return {
          classList: {
            add: (): void => null,
            remove: (): void => null,
          },
        };
      },
    },
  },
  {
    provide: MatSnackBar,
    useValue: {
      open: (): void => null,
    },
  },
  DatePipe,
];

/**
 * Mocks Core module.
 */
@NgModule({
  imports: [
    BrowserDynamicTestingModule,
    NoopAnimationsModule,
    HttpClientTestingModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    AppMaterialModule.forRoot(),
    NgxsModule.forRoot(),
    NgxsFormPluginModule.forRoot(),
    NgxsRouterPluginModule.forRoot(),
  ],
  declarations: [DummyComponent],
  exports: [
    BrowserDynamicTestingModule,
    NoopAnimationsModule,
    HttpClientTestingModule,
    RouterTestingModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    AppMaterialModule,
    NgxsModule,
    NgxsFormPluginModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MocksCoreModule {
  public static forRoot(): ModuleWithProviders<MocksCoreModule> {
    return {
      ngModule: MocksCoreModule,
      providers: [...mocksCoreModuleProviders],
    };
  }
}
