import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDatepicker } from '@angular/material';

import { EventEmitterService } from '../services/event-emitter.service';
import { CustomDeferredService } from '../services/custom-deferred.service';
import { UserService } from '../services/user.service';

import { UserAPIService } from '../services/user-api.service';

@Component({
	selector: 'app-data',
	templateUrl: '/public/app/views/app-data.html',
	host: {
		class: 'mat-body-1'
	}
})
export class AppDataComponent implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private fb: FormBuilder,
		private emitter: EventEmitterService,
		private userService: UserService,
		private userAPIService: UserAPIService
	) {
		// console.log('this.el.nativeElement:', this.el.nativeElement);
		this.resetPasswordForm();
	}

	/**
	 * Component subscriptions.
	 */
	private subscriptions: any[] = [];

	/**
	 * Currently logged in user object.
	 */
	public user: any = {};

	/**
	 * Exported passwords list.
	 */
	public exportedPasswords: string[] = [];

	/**
	 * UI error message.
	 */
	public errorMessage: string;

	/**
	 * Gets currently logged in user.
	 */
	private getUser(): Promise<boolean> {
		const def = new CustomDeferredService<boolean>();
		this.userAPIService.getUser().subscribe(
			(data: any) => {
				this.user = data;
				this.userService.saveUser(this.user);
				def.resolve(true);
			},
			(error: string) => {
				this.errorMessage = error;
				def.reject(false);
			},
			() => console.log('getUser done')
		);
		return def.promise;
	}

	/**
	 * Get exported passwords list.
	 */
	public getExportedPasswordsList(): Promise<boolean> {
		const def = new CustomDeferredService<boolean>();
		this.userAPIService.listExportedPasswordFiles().subscribe(
			(data: any) => {
				this.exportedPasswords = data;
				def.resolve(true);
			},
			(error: string) => {
				this.errorMessage = error;
				def.reject(false);
			},
			() => console.log('getExportedPasswordsList done')
		);
		return def.promise;
	}

	/**
	 * New password form.
	 */
	public passwordForm: FormGroup;
	/**
	 * Resets new password form.
	 */
	private resetPasswordForm(): void {
		this.passwordForm = this.fb.group({
			name: ['', Validators.compose([Validators.required])],
			password: ['', Validators.compose([Validators.required])]
		});
	}
	/**
	 * Adds user password.
	 */
	public addPassword(): void {
		this.emitter.emitSpinnerStartEvent();
		const formData: any = this.passwordForm.value;
		this.userAPIService.addPassword(formData).subscribe(
			(data: any) => {
				this.getUser().then(() => {
					this.resetPasswordForm();
					this.emitter.emitSpinnerStopEvent();
				});
			},
			(error: string) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}
	/**
	 * Deletes user password.
	 * @param id local model array index
	 */
	public deletePassword(id: number): void {
		this.emitter.emitSpinnerStartEvent();
		const formData: any = this.user.passwords[id];
		this.userAPIService.deletePassword(formData).subscribe(
			(data: any) => {
				this.getUser().then(() => {
					this.resetPasswordForm();
					this.emitter.emitSpinnerStopEvent();
				});
			},
			(error: string) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}
	/**
	 * Encrypts user passwords with user public RSA key.
	 */
	public encryptPasswords(): void {
		this.emitter.emitSpinnerStartEvent();
		this.userAPIService.encryptPasswords().subscribe(
			(data: any) => {
				this.getUser().then(() => {
					this.emitter.emitSpinnerStopEvent();
				});
			},
			(error: string) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}
	/**
	 * Decrypts user passwords with user private RSA key.
	 */
	public decryptPasswords(): void {
		this.emitter.emitSpinnerStartEvent();
		this.userAPIService.decryptPasswords().subscribe(
			(data: any) => {
				this.getUser().then(() => {
					this.emitter.emitSpinnerStopEvent();
				});
			},
			(error: string) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}
	/**
	 * Export user passwords encrypted with keypair.
	 */
	public exportPasswords(): void {
		this.emitter.emitSpinnerStartEvent();
		this.userAPIService.exportPasswords().subscribe(
			(data: any) => {
				console.log('TODO, let user save file to an arbitrary path, data', data);
				this.emitter.emitSpinnerStopEvent();
			},
			(error: string) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}

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
	 * Resolves if DOM element should be hidden or not.
	 * @param index element array index
	 */
	public hideElement(index: number): boolean {
		console.log(' > hideElement:', index, this.user.passwords[index].name);
		const result = this.user.passwords[index].name.indexOf(this.searchValue) === -1;
		console.log('result', result);
		return (this.searchValue) ? result : false;
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
		if (this.sortValue !== val) { // sort if value has changed
			this.sortValue = val;
			this.performSorting(val);
		}
	}
	/**
	 * Sorts data model by property.
	 * @param val property which values should be used to sort model
	 */
	private performSorting(val: string): void {
		if (val === 'registered') {
			this.user.passwords.sort((a, b) => parseInt(a[val], 10) - parseInt(b[val], 10));
		} else if (val === 'role') {
			this.user.passwords.sort((a, b) => {
				if (a[val] < b[val]) { return -1; }
				if (a[val] > b[val]) { return 1; }
				return 0;
			});
		} else if (val === '') {
			/*
			*	sort by name if sorting is set to none
			*/
			this.user.passwords.sort((a, b) => a.name - b.name);
		}
	}

	/**
	 * Datepicker date.
	 */
	public pickerDate: string = new Date().toISOString();
	/**
	 * Datepicker view child reference.
	 */
	@ViewChild('datePicker') private datePicker: MatDatepicker<string>;
	/**
	 * Shows datepicker.
	 */
	public showDatePicker(event: any): void {
		console.log('showDatePicker', this.datePicker);
		this.datePicker.open();
	}

	public ngOnInit() {
		console.log('ngOnInit: AppDataComponent initialized');
		this.emitter.emitSpinnerStartEvent();

		const sub = this.emitter.getEmitter().subscribe((event: any) => {
			console.log('AppSummaryComponent consuming event:', JSON.stringify(event));
		});
		this.subscriptions.push(sub);

		this.getUser()
			.then(() => this.getExportedPasswordsList())
			.then(() => {
			console.log('all models updated');
			this.emitter.emitSpinnerStopEvent();
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AppDataComponent destroyed');
		if (this.subscriptions.length) {
			for (const sub of this.subscriptions) {
				sub.unsubscribe();
			}
		}
	}
}
