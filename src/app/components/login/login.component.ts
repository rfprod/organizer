import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService } from '../../services/user.service';

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
  ) {
    const restoredModel = this.userService.getUser();
    const passwordMinLength = 3;
    this.loginForm = this.fb.group({
      email: [restoredModel.email, Validators.compose([Validators.required, Validators.email])],
      password: [
        '',
        Validators.compose([Validators.required, Validators.minLength(passwordMinLength)]),
      ],
    });
  }

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  /**
   * Login form.
   */
  public loginForm: FormGroup;

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

  /**
   * Check user status.
   */
  private checkUserStatus() {
    return this.userAPIService.getUserStatus().pipe(
      tap(data => {
        if (!Boolean(data.initialized)) {
          void this.router.navigate(['initialize']);
        }
      }),
    );
  }

  public ngOnInit(): void {
    void this.checkUserStatus().subscribe();
  }
}
