import { NgModule, ModuleWithProviders } from '@angular/core';

import { TranslateService } from './translate.service';
import { TranslatePipe } from './translate.pipe';
import { TRANSLATION_PROVIDERS } from './translations';

/**
 * Translate module.
 */
@NgModule({
	declarations: [ TranslatePipe ],
	exports: [ TranslatePipe ]
})
export class TranslateModule {
	public static forRoot(): ModuleWithProviders {
		return {
			ngModule: TranslateModule,
			providers: [ TRANSLATION_PROVIDERS, TranslateService ]
		};
	}
}
