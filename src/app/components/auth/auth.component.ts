import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { concatMap, first, tap } from 'rxjs/operators';

import { AppTranslateService } from '../../modules/translate/translate.service';
import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService } from '../../services/user.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppAuthComponent implements OnInit {
  public readonly language$ = this.translate.language$;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly userService: AppUserService,
    private readonly userApiService: AppUserApiService,
    private readonly translate: AppTranslateService,
  ) {}

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  /**
   * Login form.
   */
  public form = this.fb.group({
    email: ['', Validators.compose([Validators.required, Validators.email])],
    password: [
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern(/[a-z]+/),
        Validators.pattern(/[A-Z]+/),
        Validators.pattern(/\d+/),
      ]),
    ],
  });

  public ngOnInit() {
    void this.userService.user$
      .pipe(
        first(),
        tap(user => {
          this.form.patchValue({ email: user.email, password: '' });
          this.form.updateValueAndValidity();
        }),
      )
      .subscribe();
  }

  /**
   * Resets login form.
   */
  public resetForm(): void {
    this.form.reset({
      email: null,
      password: null,
    });
    this.userService.resetUser();
  }

  /**
   * Submits login form.
   */
  public submitForm(): void {
    if (this.form.valid) {
      void this.userService.user$
        .pipe(
          first(),
          concatMap(user => {
            const formData: { email: string; password: string } = this.form.value;
            return user.token ? this.logUserIn(formData) : this.initializeUser(formData);
          }),
        )
        .subscribe();
    }
  }

  private initializeUser(formData: { email: string; password: string }) {
    return this.userApiService.configUser(formData).pipe(
      concatMap(() => {
        // make subsequent login request for user after successful initialization request
        const loginFormData = this.form.value;
        return this.userApiService.login(loginFormData).pipe(
          tap(
            loginData => {
              this.userService.saveUser({
                email: this.form.controls.email.value,
                token: loginData.token,
              });
              void this.router.navigate(['summary']);
            },
            error => {
              void this.router.navigate(['auth']); // redirect to login in case of failure
            },
          ),
        );
      }),
    );
  }

  private logUserIn(formData: { email: string; password: string }) {
    return this.userApiService.login(formData).pipe(
      tap(
        loginData => {
          this.userService.saveUser({
            email: this.form.controls.email.value,
            token: loginData.token,
          });
          void this.router.navigate(['summary']);
        },
        error => {
          void this.router.navigate(['auth']); // redirect to login in case of failure
        },
      ),
    );
  }
}
