import { ChangeDetectionStrategy, Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { concatMap, tap } from 'rxjs/operators';

import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService, IAppUser } from '../../services/user.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  public user = {} as IAppUser;

  /**
   * Exported passwords list.
   */
  public exportedPasswords: string[] = [];

  /**
   * New password form.
   */
  public passwordForm: FormGroup;

  /**
   * Datepicker date.
   */
  public pickedDate: string = new Date().toISOString();

  /**
   * Filters search value.
   */
  private searchValue: string;

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
  private sortValue: string;

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
  @ViewChild('datePicker') private readonly datePicker: MatDatepicker<string>;

  /**
   * Gets currently logged in user.
   */
  private getUser() {
    return this.userApiService.getUser().pipe(
      tap(data => {
        this.user = data;
        this.userService.saveUser(this.user);
      }),
    );
  }

  /**
   * Get exported passwords list.
   */
  public getExportedPasswordsList() {
    return this.userApiService.listExportedPasswordFiles();
  }

  /**
   * Resets new password form.
   */
  private resetPasswordForm(): void {
    this.passwordForm = this.fb.group({
      name: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required])],
    });
  }

  /**
   * Adds user password.
   */
  public addPassword(): void {
    const formData = this.passwordForm.value;
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
    const formData = this.user.status.passwords[id];
    void this.userApiService
      .deletePassword(formData)
      .pipe(
        concatMap(() => this.getUser()),
        tap(() => {
          this.resetPasswordForm();
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
    void this.userApiService.exportPasswords().subscribe();
  }

  /**
   * Resolves if DOM element should be hidden or not.
   * @param index element array index
   */
  public hideElement(index: number): boolean {
    const result = !this.user.status.passwords[index].name.includes(this.searchValue);
    return this.searchValue ? result : false;
  }

  /**
   * Sorts data model by property.
   * @param val property which values should be used to sort model
   */
  private performSorting(val: string): void {
    if (val === 'registered') {
      this.user.status.passwords.sort((a, b) => parseInt(a[val], 10) - parseInt(b[val], 10));
    } else if (val === 'role') {
      this.user.status.passwords.sort((a, b) => {
        if (a[val] < b[val]) {
          return -1;
        }
        if (a[val] > b[val]) {
          return 1;
        }
        return 0;
      });
    } else if (val === '') {
      /*
       *	sort by name if sorting is set to none
       */
      this.user.status.passwords.sort((a, b) => Number(a.name) - Number(b.name));
    }
  }

  /**
   * Shows datepicker.
   */
  public showDatePicker(): void {
    this.datePicker.open();
  }

  public ngOnInit() {
    this.resetPasswordForm();
    void this.getUser().subscribe();
    void this.getExportedPasswordsList();
  }
}