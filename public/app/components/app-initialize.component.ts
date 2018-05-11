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
	selector: 'app-initialize',
	templateUrl: '/public/app/views/app-initialize.html',
	host: {
		class: 'mat-body-1'
	}
})
export class AppInitializeComponent implements OnInit, OnDestroy {

	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private fb: FormBuilder,
		private router: Router,
		private userService: UserService,
		private userAPIService: UserAPIService
	) {}

	private ngUnsubscribe: Subject<void> = new Subject();

	public errorMessage: string;

	public initForm: FormGroup;

	public resetForm(): void {
		this.initForm = this.fb.group({
			name: ['', Validators.compose([Validators.required, Validators.pattern(/[a-zA-Z\w]{3,}/)])],
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.pattern(/[a-z]+/), Validators.pattern(/[A-Z]+/), Validators.pattern(/\d+/)])]
		});
		this.userService.ResetUser();
	}

	public submitForm(): void {
		console.log('SUBMIT', this.initForm);
		if (this.initForm.valid) {
			this.emitter.emitSpinnerStartEvent();
			this.errorMessage = null;
			const formData = this.initForm.value;
			this.userAPIService.configUser(formData).first().subscribe(
				(data: any) => {
					this.userService.SaveUser({ email: this.initForm.controls.email.value });
					// make subsequent login request for user after successful initialization request
					const authFormData = this.initForm.value;
					delete authFormData.name;
					this.userAPIService.login(authFormData).first().subscribe(
						(authData: any) => {
							this.userService.SaveUser({ email: this.initForm.controls.email.value, token: authData.token });
							this.emitter.emitSpinnerStopEvent();
							this.router.navigate(['summary']);
						},
						(authError: string) => {
							this.errorMessage = authError;
							this.emitter.emitSpinnerStopEvent();
							this.router.navigate(['login']); // redirect to login in case of failure
						}
					);
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

	public userStatus: any;

	private checkUserStatus(): Promise<any> {
		const def = new CustomDeferredService<any>();
		this.userAPIService.getUserStatus().first().subscribe(
			(data: any) => {
				this.userStatus = data;
				def.resolve(data);
			},
			(error: string) => {
				def.reject(error);
			}
		);
		return def.promise;
	}

	public ngOnInit(): void {
		console.log('ngOnInit: AppInitializeComponent initialized');
		this.emitter.emitSpinnerStartEvent();
		this.resetForm();
		this.checkUserStatus()
			.then((data: any) => {
				this.emitter.emitSpinnerStopEvent();
				if (data.initialized) {
					this.router.navigate(['login']);
				}
			})
			.catch((error: any) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			});
	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppInitializeComponent destroyed');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
	}
}
