import { Injectable, Inject } from '@angular/core';
import { TRANSLATIONS } from './translations'; // reference by opaque token

@Injectable()
export class TranslateService {
	private _currentLanguage: string;

	public get currentLanguage() {
		/*
		*	public method for
		*	current language retrieval
		*/
		return this._currentLanguage;
	}

	// translations injection
	constructor(@Inject(TRANSLATIONS) private _translations: any) {}

	public use(key: string): void {
		// set current language
		this._currentLanguage = key;
	}

	private translate(key: string): string {
		/*
		*	private method for
		*	instant translation resolution
		*/
		const translation = key;
		if (this._translations[this.currentLanguage] && this._translations[this.currentLanguage][key]) {
			return this._translations[this.currentLanguage][key];
		}
		return translation;
	}

	public instant(key: string) {
		/*
		*	public method for
		*	instant translation resolution
		*/
		return this.translate(key);
	}

}
