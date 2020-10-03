import { ChangeDetectionStrategy, Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { of } from 'rxjs';
import { concatMap, first, map, tap } from 'rxjs/operators';

import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService, IAppUser } from '../../services/user.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.scss'],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppDataComponent implements OnInit {
  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: AppUserService,
    private readonly userApiService: AppUserApiService,
  ) {}

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  /**
   * Currently logged in user object.
   */
  public user$ = this.userService.user$;

  /**
   * Exported passwords list.
   */
  public exportedPasswordFiles: string[] = [];

  /**
   * New password form.
   */
  public form = this.fb.group({
    name: ['', Validators.compose([Validators.required])],
    password: ['', Validators.compose([Validators.required])],
  });

  /**
   * Datepicker date.
   */
  public pickedDate: string = new Date().toISOString();

  /**
   * Filters search value.
   */
  private searchValue = '';

  /**
   * Filters search query getter.
   */
  public get searchQuery(): string {
    return this.searchValue;
  }

  /**
   * Filters search query setter.
   * @param val search value to be set
   */
  public set searchQuery(val: string) {
    this.searchValue = val;
  }

  /**
   * Filters sort value.
   */
  private sortValue = '';

  /**
   * Filters sort value getter.
   */
  public get sortByCriterion(): string {
    return this.sortValue;
  }

  /**
   * Filters search value setter.
   * @param val sort value to be set
   */
  public set sortByCriterion(val: string) {
    if (this.sortValue !== val) {
      // sort if value has changed
      this.sortValue = val;
      this.performSorting(val);
    }
  }

  /**
   * Datepicker view child reference.
   */
  @ViewChild('datePicker') private readonly datePicker!: MatDatepicker<string>;

  /**
   * Gets currently logged in user.
   */
  private getUser() {
    return this.userApiService.getUser().pipe(
      concatMap(user => {
        this.userService.saveUser(user);
        return this.userService.user$
          .pipe(
            first(),
            map(savedUser => savedUser.status),
          )
          .pipe(
            tap(status => {
              const newStatusObject = {
                status: {
                  ...status,
                  encrypted: ((user as unknown) as IAppUser & { encrypted: boolean }).encrypted,
                },
              };
              this.userService.saveUser(newStatusObject);
            }),
          );
      }),
    );
  }

  /**
   * Get exported passwords list.
   */
  public getExportedPasswordsList() {
    return this.userApiService.listExportedPasswordFiles().pipe(
      tap(result => {
        this.exportedPasswordFiles = [...result];
      }),
    );
  }

  /**
   * Resets new password form.
   */
  private resetPasswordForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
    });
  }

  /**
   * Adds user password.
   */
  public addPassword(): void {
    const formData = this.form.value;
    void this.userApiService
      .addPassword(formData)
      .pipe(
        concatMap(() => this.getUser()),
        tap(() => {
          this.resetPasswordForm();
        }),
      )
      .subscribe();
  }

  /**
   * Deletes user password.
   * @param id local model array index
   */
  public deletePassword(id: number): void {
    void this.userService.user$
      .pipe(
        first(),
        concatMap(user => {
          const formData = user.status?.passwords[id];
          return typeof formData !== 'undefined'
            ? this.userApiService.deletePassword(formData).pipe(
                concatMap(() => this.getUser()),
                tap(() => {
                  this.resetPasswordForm();
                }),
              )
            : of(null);
        }),
      )
      .subscribe();
  }

  /**
   * Encrypts user passwords with user public RSA key.
   */
  public encryptPasswords(): void {
    void this.userApiService
      .encryptPasswords()
      .pipe(concatMap(() => this.getUser()))
      .subscribe();
  }

  /**
   * Decrypts user passwords with user private RSA key.
   */
  public decryptPasswords(): void {
    void this.userApiService
      .decryptPasswords()
      .pipe(concatMap(() => this.getUser()))
      .subscribe();
  }

  /**
   * Export user passwords encrypted with keypair.
   * TODO: let user save file to an arbitrary path.
   */
  public exportPasswords(): void {
    void this.userApiService
      .exportPasswords()
      .pipe(concatMap(() => this.getExportedPasswordsList()))
      .subscribe();
  }

  /**
   * Resolves if DOM element should be hidden or not.
   * @param index element array index
   */
  public hideElement$ = (index: number) => {
    return this.userService.user$.pipe(
      map(user => {
        if (typeof user.status !== 'undefined' && user.status.passwords > 0) {
          const result = Boolean(user.passwords[index].name.includes(this.searchValue));
          return this.searchValue ? !result : false;
        }
        return false;
      }),
    );
  };

  /**
   * Sorts data model by property.
   * @param val property which values should be used to sort model
   */
  private performSorting(val: string): void {
    void this.userService.user$
      .pipe(
        first(),
        tap(user => {
          const sorted = { ...user };
          if (val === 'timestamp') {
            sorted.passwords.sort((a, b) => b[val] - a[val]);
          } else if (val === '') {
            /*
             *	sort by name if sorting is set to none
             */
            sorted.passwords.sort((a, b) => a.name.localeCompare(b.name));
          }
          this.userService.saveUser(sorted);
        }),
      )
      .subscribe();
  }

  /**
   * Shows datepicker.
   */
  public showDatePicker(): void {
    this.datePicker.open();
  }

  public ngOnInit() {
    void this.getUser().subscribe();
    void this.getExportedPasswordsList().subscribe();
  }
}
