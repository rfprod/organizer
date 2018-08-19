import { Injectable, Inject } from '@angular/core';

import { TRANSLATIONS } from './translations'; // reference by opaque token

@Injectable()
export class TranslateService {

	constructor(
		@Inject(TRANSLATIONS) private translations: any
	) {}

	/**
	 * Current language.
	 */
	private currentLang: string;

	/**
	 * Current language getter.
	 */
	public get currentLanguage() {
		return this.currentLang;
	}

	/**
	 * Current language setter.
	 */
	public use(key: string): void {
		this.currentLang = key;
	}

	/**
	 * Private translation getter by key.
	 */
	private translate(key: string): string {
		const translation = key;
		if (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][key]) {
			return this.translations[this.currentLanguage][key];
		}
		return translation;
	}

	/**
	 * Public translation getter by key.
	 */
	public instant(key: string): string {
		return this.translate(key);
	}

}
