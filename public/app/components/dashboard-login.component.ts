import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { EventEmitterService } from '../services/event-emitter.service';
import { UserService } from '../services/user.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/first';

@Component({
	selector: 'dashboard-login',
	templateUrl: '/public/app/views/dashboard-login.html',
	host: {
		class: 'mat-body-1'
	}
})
export class DashboardLoginComponent implements OnInit, OnDestroy {
	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private fb: FormBuilder,
		private router: Router,
		private userService: UserService
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
		console.log('localStorage.userService', JSON.stringify(localStorage.userService));
		const restoredModel: any = this.userService.getUser();
		console.log('restoredModel use model', restoredModel);
		this.loginForm = this.fb.group({
			email: [restoredModel.email, Validators.compose([Validators.required, Validators.email, Validators.minLength(7)])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(1)])]
		});
	}
	private ngUnsubscribe: Subject<void> = new Subject();
	public loginForm: FormGroup;
	public resetForm(): void {
		this.loginForm.reset({
			email: null,
			password: null
		});
		this.userService.ResetUser();
	}
	public submitForm(): void {
		console.log('SUBMIT', this.loginForm);
		if (this.loginForm.valid) {
			this.errorMessage = null;
			this.userService.SaveUser({ email: this.loginForm.controls.email.value, token: 'mockedToken' });
			this.router.navigate(['data']);
		} else {
			this.errorMessage = 'Invalid form input';
		}
	}
	public errorMessage: string;

	private emitSpinnerStartEvent(): void {
		console.log('root spinner start event emitted');
		this.emitter.emitEvent({spinner: 'start'});
	}
	private emitSpinnerStopEvent(): void {
		console.log('root spinner stop event emitted');
		this.emitter.emitEvent({spinner: 'stop'});
	}

	public ngOnInit(): void {
		console.log('ngOnInit: DashboardLoginComponent initialized');
		this.emitSpinnerStartEvent();
		this.emitter.emitEvent({appInfo: 'hide'});
		this.emitSpinnerStopEvent();
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: DashboardLoginComponent destroyed');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
