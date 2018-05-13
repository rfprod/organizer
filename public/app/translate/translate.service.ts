import { Injectable, Inject } from '@angular/core';
import { TRANSLATIONS } from './translations'; // reference by opaque token

@Injectable()
export class TranslateService {

	constructor(
		@Inject(TRANSLATIONS) private _translations: any
	) {}

	/**
	 * Current language.
	 */
	private _currentLanguage: string;

	/**
	 * Current language getter.
	 */
	public get currentLanguage() {
		return this._currentLanguage;
	}

	/**
	 * Current language setter.
	 */
	public use(key: string): void {
		this._currentLanguage = key;
	}

	/**
	 * Private translation getter by key.
	 */
	private translate(key: string): string {
		const translation = key;
		if (this._translations[this.currentLanguage] && this._translations[this.currentLanguage][key]) {
			return this._translations[this.currentLanguage][key];
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
