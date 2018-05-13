import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { EventEmitterService } from '../services/event-emitter.service';
import { CustomDeferredService } from '../services/custom-deferred.service';
import { UserService } from '../services/user.service';

import { UserAPIService } from '../services/user-api.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/first';

@Component({
	selector: 'app-login',
	templateUrl: '/public/app/views/app-login.html',
	host: {
		class: 'mat-body-1'
	}
})
export class AppLoginComponent implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private fb: FormBuilder,
		private router: Router,
		private userService: UserService,
		private userAPIService: UserAPIService
	) {
		const restoredModel: any = this.userService.getUser();
		// console.log('restoredModel use model', restoredModel);
		this.loginForm = this.fb.group({
			email: [restoredModel.email, Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(3)])]
		});
	}

	/**
	 * Unsubscribes from infinite subscriptions.
	 */
	private ngUnsubscribe: Subject<void> = new Subject();

	/**
	 * UI error message.
	 */
	public errorMessage: string;

	/**
	 * Resolves if user is logged in.
	 */
	public isLoggedIn(): boolean {
		return this.userService.getUser().token ? true : false;
	}

	/**
	 * Login form.
	 */
	public loginForm: FormGroup;
	/**
	 * Resets login form.
	 */
	public resetForm(): void {
		this.loginForm.reset({
			email: null,
			password: null
		});
		this.userService.resetUser();
	}

	/**
	 * Submits login form.
	 */
	public submitForm(): void {
		console.log('SUBMIT', this.loginForm);
		if (this.loginForm.valid) {
			this.emitter.emitSpinnerStartEvent();
			this.errorMessage = null;
			const formData = this.loginForm.value;
			this.userAPIService.login(formData).first().subscribe(
				(data: any) => {
					this.userService.saveUser({ email: this.loginForm.controls.email.value, token: data.token });
					this.emitter.emitSpinnerStopEvent();
					this.router.navigate(['summary']);
				},
				(error: string) => {
					this.errorMessage = error;
					this.emitter.emitSpinnerStopEvent();
				}
			);
		} else {
			this.errorMessage = 'Invalid form input';
		}
	}

	/**
	 * Check user status.
	 */
	private checkUserStatus(): Promise<any> {
		const def = new CustomDeferredService<any>();
		this.userAPIService.getUserStatus().first().subscribe(
			(data: any) => {
				if (!data.initialized) {
					this.router.navigate(['initialize']);
				}
				def.resolve(data);
			},
			(error: string) => {
				def.reject(error);
			}
		);
		return def.promise;
	}

	public ngOnInit(): void {
		console.log('ngOnInit: AppLoginComponent initialized');
		this.emitter.emitSpinnerStartEvent();
		this.checkUserStatus()
			.then(() => {
				this.emitter.emitSpinnerStopEvent();
			})
			.catch((error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			});
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppLoginComponent destroyed');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
