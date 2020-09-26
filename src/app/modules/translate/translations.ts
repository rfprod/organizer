import { InjectionToken } from '@angular/core';

import { LANG_EN_NAME, LANG_EN_TRANSLATIONS } from './lang-en';
import { LANG_RU_NAME, LANG_RU_TRANSLATIONS } from './lang-ru';
import {
  ISupportedLanguage,
  IUiDictionary,
  SUPPORTED_LANGUAGE_KEY,
} from './translations.interface';

export const TRANSLATIONS = new InjectionToken<IUiDictionary>('translations');

export const dictionary: IUiDictionary = {
  [LANG_EN_NAME]: LANG_EN_TRANSLATIONS,
  [LANG_RU_NAME]: LANG_RU_TRANSLATIONS,
};

/**
 * Translation dictionaries provider.
 */
export const translationProviders = [{ provide: TRANSLATIONS, useValue: dictionary }];

export const supportedLanguages: ISupportedLanguage[] = [
  { key: SUPPORTED_LANGUAGE_KEY.ENGLISH, name: 'English' },
  { key: SUPPORTED_LANGUAGE_KEY.RUSSIAN, name: 'Russian' },
];
