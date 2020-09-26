import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { concatMap, first, tap } from 'rxjs/operators';

import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService } from '../../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLoginComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly userService: AppUserService,
    private readonly userApiService: AppUserApiService,
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
        const authFormData = this.form.value;
        return this.userApiService.login(authFormData).pipe(
          tap(
            authData => {
              this.userService.saveUser({
                email: this.form.controls.email.value,
                token: authData.token,
              });
              void this.router.navigate(['summary']);
            },
            error => {
              void this.router.navigate(['login']); // redirect to login in case of failure
            },
          ),
        );
      }),
    );
  }

  private logUserIn(formData: { email: string; password: string }) {
    return this.userApiService.login(formData).pipe(
      tap(
        authData => {
          this.userService.saveUser({
            email: this.form.controls.email.value,
            token: authData.token,
          });
          void this.router.navigate(['summary']);
        },
        error => {
          void this.router.navigate(['login']); // redirect to login in case of failure
        },
      ),
    );
  }
}
