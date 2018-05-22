import { Injectable } from '@angular/core';

@Injectable()
export class UserService {

	constructor() {
		this.initializeModel();
		this.restoreUser();
		console.log(' >> USER SERVICE CONSTRUCTOR, model', this.model);
	}

	/**
	 * User model.
	 */
	private model: any;

	/**
	 * Initializes user model with default values.
	 */
	private initializeModel(): void {
		this.model = {
			email: null,
			token: null,
			status: {
				initialized: false,
				encryption: false,
				passwords: 0,
				encrypted: false
			}
		};
	}

	/**
	 * Gets user model.
	 */
	public getUser(): any {
		return this.model;
	}

	/**
	 * Gets user token.
	 */
	public isLoggedIn(): string {
		return this.model.token;
	}

	/**
	 * Updates user model.
	 * @param newValues new model values object
	 */
	public saveUser(newValues): void {
		console.log('SaveUser', newValues);
		for (const [key, value] of Object.entries(this.model)) {
			if (key !== 'status') {
				this.model[key] = (newValues.hasOwnProperty(key)) ? newValues[key] : value;
			} else {
				for (const [statusKey, statusValue] of Object.entries(this.model.status)) {
					this.model.status[statusKey] = (newValues.hasOwnProperty(statusKey)) ? newValues[statusKey] : statusValue;
				}
			}
		}
		localStorage.setItem('userService', JSON.stringify(this.model));
	}

	/**
	 * Restores user model.
	 */
	public restoreUser(): void {
		console.log('Restore User, localStorage.userService:', localStorage.getItem('userService'));
		if (typeof localStorage.getItem('userService') !== 'undefined' && localStorage.userService) {
			this.model = JSON.parse(localStorage.getItem('userService'));
		}
	}

	/**
	 * Resets user.
	 */
	public resetUser(): void {
		this.initializeModel();
		localStorage.setItem('userService', JSON.stringify(this.model));
	}
}
