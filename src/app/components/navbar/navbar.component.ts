import { ChangeDetectionStrategy, Component, HostBinding, Inject, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { first, tap } from 'rxjs/operators';
import { SUPPORTED_LANGUAGE_KEY, supportedLanguages } from 'src/app/modules/translate';

import { AppTranslateService } from '../../modules/translate/translate.service';
import { AppUserService } from '../../services/user.service';
import { WINDOW } from '../../utils/injection-tokens';

@Component({
  selector: 'app-nav',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNavComponent implements OnInit {
  public readonly isLoggedIn$ = this.userService.isLoggedIn$;

  public readonly selectedLanguage$ = this.translate.language$;

  /**
   * Supported languages.
   */
  public supportedLanguages = [...supportedLanguages];

  constructor(
    private readonly userService: AppUserService,
    private readonly router: Router,
    private readonly translate: AppTranslateService,
    private readonly dateAdapter: DateAdapter<Date>,
    @Inject(WINDOW) private readonly window: Window,
  ) {}

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  /**
   * Loggs user out.
   */
  public logOut(): void {
    this.userService.resetUser();
    void this.router.navigate(['']);
  }

  /**
   * Selects language.
   *
   * @param key language key
   */
  public selectLanguage(key: SUPPORTED_LANGUAGE_KEY): void {
    void this.translate.language$
      .pipe(
        first(),
        tap(lng => {
          if (lng !== key) {
            this.translate.use(key);
            this.setDatepickersLocale(key);
          }
        }),
      )
      .subscribe();
  }

  /**
   * Sets datepicker locale depending on currently selected language.
   *
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
    const userPreference =
      nav.language === 'ru-RU' || nav.language === 'ru' || nav.languages[0] === 'ru'
        ? SUPPORTED_LANGUAGE_KEY.RUSSIAN
        : SUPPORTED_LANGUAGE_KEY.ENGLISH;
    this.selectLanguage(userPreference);
  }
}
