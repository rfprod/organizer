import { Inject, Injectable } from '@angular/core';

import { IUiDictionary, TRANSLATIONS } from './translations';

@Injectable({
  providedIn: 'root',
})
export class AppTranslateService {
  constructor(@Inject(TRANSLATIONS) private readonly translations: IUiDictionary) {}

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
    if (
      Boolean(this.translations[this.currentLanguage]) &&
      this.translations[this.currentLanguage][key]
    ) {
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
