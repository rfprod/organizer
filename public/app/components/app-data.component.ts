import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { EventEmitterService } from '../services/event-emitter.service';
import { CustomDeferredService } from '../services/custom-deferred.service';
import { MatDatepicker } from '@angular/material';

import { TranslateService } from '../translate/translate.service';

import { UserAPIService } from '../services/user-api.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/first';

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
		private emitter: EventEmitterService,
		private userAPIService: UserAPIService,
		private translateService: TranslateService
	) {
		// console.log('this.el.nativeElement:', this.el.nativeElement);
	}

	/**
	 * Unsubscribes from infinite subscriptions.
	 */
	private ngUnsubscribe: Subject<void> = new Subject();

	/**
	 * Currently logged in user object.
	 */
	public user: any = {};

	/**
	 * UI error message.
	 */
	public errorMessage: string;

	/**
	 * Gets currently logged in user.
	 */
	private getUser(): Promise<boolean> {
		const def = new CustomDeferredService<boolean>();
		this.userAPIService.getUser().first().subscribe(
			(data: any) => {
				this.user = data;
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
		if (this.sortValue !== val) { // sort if value changed
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
		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			console.log('AppSummaryComponent consuming event:', JSON.stringify(event));
		});

		this.getUser().then(() => {
			console.log('all models updated');
			this.emitter.emitSpinnerStopEvent();
		});
	}
	public ngOnDestroy() {
		console.log('ngOnDestroy: AppDataComponent destroyed');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
