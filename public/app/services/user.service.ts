import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class UserService {
	private model: any = {
		email: null,
		token: null
	};
	private modelKeys: any[];
	constructor() {
		this.model.email = null;
		this.model.token = null;
		this.modelKeys = Object.keys(this.model);
		if (typeof localStorage.getItem('userService') === 'undefined' && localStorage.userService) {
			localStorage.setItem('userService', JSON.stringify(this.model));
		} else {
			this.RestoreUser();
		}
		console.log(' >> USER SERVICE CONSTRUCTOR, model', this.model);
	}

	public getUser(): any {
		return this.model;
	}

	public isLoggedIn(): string {
		return this.model.token;
	}

	public SaveUser(newValues): void {
		console.log('SaveUser', newValues);
		if (newValues.hasOwnProperty('email')) {
			this.model.email = newValues.email;
		}
		if (newValues.hasOwnProperty('token')) {
			this.model.token = newValues.token;
		}
		localStorage.setItem('userService', JSON.stringify(this.model));
	}

	public RestoreUser(): void {
		console.log('Restore User, localStorage.userService:', localStorage.getItem('userService'));
		if (typeof localStorage.getItem('userService') !== 'undefined' && localStorage.userService) {
			this.model = JSON.parse(localStorage.getItem('userService'));
		}
	}

	public ResetUser(): void {
		for (const key of this.modelKeys) {
			this.model[key] = null;
		}
		localStorage.setItem('userService', JSON.stringify(this.model));
	}
}
