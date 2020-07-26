import { ChangeDetectionStrategy, Component, HostBinding, Inject, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';

import { ISupportedLanguage } from '../../interfaces/supported-language.interface';
import { AppTranslateService } from '../../modules/translate/translate.service';
import { AppUserService } from '../../services/user.service';
import { WINDOW } from '../../utils/injection-tokens';

@Component({
  selector: 'app-nav',
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNavComponent implements OnInit {
  constructor(
    private readonly userService: AppUserService,
    private readonly router: Router,
    private readonly translate: AppTranslateService,
    private readonly dateAdapter: DateAdapter<Date>,
    @Inject(WINDOW) private readonly window: Window,
  ) {}

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  /**
   * Supported languages.
   */
  public supportedLanguages: ISupportedLanguage[] = [
    { key: 'en', name: 'English' },
    { key: 'ru', name: 'Russian' },
  ];

  /**
   * Resolves if user is logged in.
   */
  public isLoggedIn(): boolean {
    return this.userService.getUser().token ? true : false;
  }

  /**
   * Loggs user out.
   */
  public logOut(): void {
    this.userService.resetUser();
    void this.router.navigate(['']);
  }

  /**
   * Resolves if language is selected.
   * @param key language key
   */
  public isLanguageSelected(key: string): boolean {
    return key === this.translate.currentLanguage;
  }

  /**
   * Selects language.
   * @param key language key
   */
  public selectLanguage(key: string): void {
    if (!this.isLanguageSelected(key)) {
      this.translate.use(key);
      this.setDatepickersLocale(key);
    }
  }

  /**
   * Sets datepicker locale depending on currently selected language.
   * @param key language key
   */
  private setDatepickersLocale(key: string): void {
    if (key === 'ru') {
      this.dateAdapter.setLocale('ru');
    } else {
      this.dateAdapter.setLocale('en');
    }
  }

  public ngOnInit(): void {
    /**
     * check preferred language, respect preference if dictionary exists
     *	for now there are only dictionaries only: English, Russian
     *	set Russian if it is preferred, else use English
     */
    const nav = this.window.navigator;
    const userPreference: string =
      nav.language === 'ru-RU' || nav.language === 'ru' || nav.languages[0] === 'ru' ? 'ru' : 'en';
    this.selectLanguage(userPreference);
  }
}
