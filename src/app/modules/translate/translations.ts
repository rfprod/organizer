import { InjectionToken } from '@angular/core';

import { LANG_EN_NAME, LANG_EN_TRANSLATIONS } from './lang-en';
import { LANG_RU_NAME, LANG_RU_TRANSLATIONS } from './lang-ru';

/**
 * Translation injection token.
 */
export const TRANSLATIONS = new InjectionToken('translations');

export interface IUiDictionary {
  [key: string]: Record<string, string>;
}

/**
 * Translations dictionary.
 */
const dictionary: IUiDictionary = {
  [LANG_EN_NAME]: LANG_EN_TRANSLATIONS,
  [LANG_RU_NAME]: LANG_RU_TRANSLATIONS,
};

/**
 * Translation providers.
 */
export const TRANSLATION_PROVIDERS = [{ provide: TRANSLATIONS, useValue: dictionary }];
