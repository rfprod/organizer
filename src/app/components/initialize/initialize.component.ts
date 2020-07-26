import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { concatMap, tap } from 'rxjs/operators';

import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService, IAppUser } from '../../services/user.service';

@Component({
  selector: 'app-initialize',
  templateUrl: './initialize.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppInitializeComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly userService: AppUserService,
    private readonly userAPIService: AppUserApiService,
  ) {}

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  public initForm: FormGroup;

  public userStatus: IAppUser['status'];

  public resetForm(): void {
    this.initForm = this.fb.group({
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
    this.userService.resetUser();
  }

  public submitForm(): void {
    if (this.initForm.valid) {
      const formData = this.initForm.value;
      void this.userAPIService
        .configUser(formData)
        .pipe(
          concatMap(() => {
            this.userService.saveUser({ email: this.initForm.controls.email.value });
            // make subsequent login request for user after successful initialization request
            const authFormData = this.initForm.value;
            return this.userAPIService.login(authFormData).pipe(
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

  private checkUserStatus() {
    return this.userAPIService.getUserStatus().pipe(
      tap(data => {
        this.userStatus = data;
      }),
    );
  }

  public ngOnInit(): void {
    this.resetForm();
    void this.checkUserStatus()
      .pipe(
        tap(data => {
          if (data.initialized) {
            void this.router.navigate(['login']);
          }
        }),
      )
      .subscribe();
  }
}
