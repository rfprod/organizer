import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService } from '../../services/user.service';

const passwordMinLength = 3;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLoginComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly userService: AppUserService,
    private readonly userAPIService: AppUserApiService,
  ) {}

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  /**
   * Login form.
   */
  public loginForm = this.fb.group({
    email: ['', Validators.compose([Validators.required, Validators.email])],
    password: [
      '',
      Validators.compose([Validators.required, Validators.minLength(passwordMinLength)]),
    ],
  });

  public ngOnInit() {
    const restoredModel = this.userService.getUser();
    this.loginForm.patchValue({ email: restoredModel.email, password: '' });
    this.loginForm.updateValueAndValidity();
  }

  /**
   * Resolves if user is logged in.
   */
  public isLoggedIn(): boolean {
    return this.userService.getUser().token ? true : false;
  }

  /**
   * Resets login form.
   */
  public resetForm(): void {
    this.loginForm.reset({
      email: null,
      password: null,
    });
    this.userService.resetUser();
  }

  /**
   * Submits login form.
   */
  public submitForm(): void {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      void this.userAPIService
        .login(formData)
        .pipe(
          tap(data => {
            this.userService.saveUser({
              email: this.loginForm.controls.email.value,
              token: data.token,
            });
            void this.router.navigate(['summary']);
          }),
        )
        .subscribe();
    }
  }
}
