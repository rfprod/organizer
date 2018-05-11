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

	private ngUnsubscribe: Subject<void> = new Subject();

	public user: any = {};

	public errorMessage: string;

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

	public mouseEntered(event) {
		console.log('mouse enter', event);
	}
	public mouseLeft(event) {
		console.log('mouse leave', event);
	}

/*
*	search
*/
	private searchValue: string;
	public get searchQuery(): string {
		return this.searchValue;
	}
	public set searchQuery(val: string) {
		this.searchValue = val;
	}
	public hideElement(index) {
		console.log(' > hideElement:', index, this.user.passwords[index].name);
		const result = this.user.passwords[index].name.indexOf(this.searchValue) === -1;
		console.log('result', result);
		return (this.searchValue) ? result : false;
	}

/*
*	sort
*/
	private sortValue: string;
	public get sortByCriterion(): string {
		return this.sortValue;
	}
	public set sortByCriterion(val: string) {
		if (this.sortValue !== val) { // sort if value changed
			this.sortValue = val;
			this.performSorting(val);
		}
	}
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

/*
*	datepicker
*/
	public pickerDate: string = new Date().toISOString();
	@ViewChild('datePicker') private datePicker: MatDatepicker<string>;
	public showDatePicker(event: any): void {
		console.log('showDatePicker', this.datePicker);
		this.datePicker.open();
	}

	public ngOnInit() {
		console.log('ngOnInit: AppDataComponent initialized');
		this.emitter.emitSpinnerStartEvent();
		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((event: any) => {
			console.log('/data consuming event:', JSON.stringify(event));
			// TODO
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
