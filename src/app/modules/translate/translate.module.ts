import { ModuleWithProviders, NgModule } from '@angular/core';

import { AppTranslatePipe } from './translate.pipe';
import { translationProviders } from './translations';

/**
 * Translate module.
 */
@NgModule({
  declarations: [AppTranslatePipe],
  exports: [AppTranslatePipe],
})
export class AppTranslateModule {
  public static forRoot(): ModuleWithProviders<AppTranslateModule> {
    return {
      ngModule: AppTranslateModule,
      providers: [...translationProviders, AppTranslatePipe],
    };
  }
}
