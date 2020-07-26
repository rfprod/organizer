import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { concatMap, tap } from 'rxjs/operators';

import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService, IAppUser } from '../../services/user.service';

@Component({
  selector: 'app-initialize',
  templateUrl: './initialize.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppInitializeComponent {
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly userService: AppUserService,
    private readonly userApiService: AppUserApiService,
  ) {}

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  public initForm = this.fb.group({
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

  public userStatus: IAppUser['status'];

  public submitForm(): void {
    if (this.initForm.valid) {
      const formData = this.initForm.value;
      void this.userApiService
        .configUser(formData)
        .pipe(
          concatMap(() => {
            this.userService.saveUser({ email: this.initForm.controls.email.value });
            // make subsequent login request for user after successful initialization request
            const authFormData = this.initForm.value;
            return this.userApiService.login(authFormData).pipe(
              tap(
                authData => {
                  this.userService.saveUser({
                    email: this.initForm.controls.email.value,
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
        )
        .subscribe();
    }
  }
}
