import { ModuleWithProviders, NgModule } from '@angular/core';

import { AppTranslatePipe } from './translate.pipe';
import { AppTranslateService } from './translate.service';
import { TRANSLATION_PROVIDERS } from './translations';

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
      providers: [TRANSLATION_PROVIDERS, AppTranslateService],
    };
  }
}
