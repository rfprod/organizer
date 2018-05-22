import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CustomHttpHandlersService } from './custom-http-handlers.service';

import { Observable } from 'rxjs';
import { timeout, take, map, catchError } from 'rxjs/operators';

@Injectable()
export class UserAPIService {

	constructor(
		private http: HttpClient,
		@Inject('Window') private window: Window,
		private httpHandlers: CustomHttpHandlersService
	) {
		console.log('UsersListService init');
	}

	/**
	 * Service endpoints.
	 */
	private endpoints: any = {
		user: this.window.location.origin + '/api/user' as string,
		login: this.window.location.origin + '/api/user/login' as string,
		config: this.window.location.origin + '/api/user/config' as string,
		status: this.window.location.origin + '/api/user/status' as string,
		addPassword: this.window.location.origin + '/api/user/password/add' as string,
		deletePassword: this.window.location.origin + '/api/user/password/delete' as string,
		generateKeypair: this.window.location.origin + '/api/user/rsa/generate' as string,
		encryptPasswords: this.window.location.origin + '/api/user/rsa/encrypt' as string,
		decryptPasswords: this.window.location.origin + '/api/user/rsa/decrypt' as string
	};

	/**
	 * Gets user.
	 */
	public getUser(): Observable<any> {
		return this.http.get(this.endpoints.user).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractObject),
			catchError(this.httpHandlers.handleError)
		);
	}

	/**
	 * Gets user status.
	 */
	public getUserStatus(): Observable<any> {
		return this.http.get(this.endpoints.status).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractObject),
			catchError(this.httpHandlers.handleError)
		);
	}

	/**
	 * Loggs user in.
	 */
	public login(formData: object): Observable<any> {
		return this.http.post(this.endpoints.login, formData).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractObject),
			catchError(this.httpHandlers.handleError)
		);
	}

	/**
	 * Configures user.
	 */
	public configUser(formData: object): Observable<any> {
		return this.http.post(this.endpoints.config, formData).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractObject),
			catchError(this.httpHandlers.handleError)
		);
	}

	/**
	 * Adds user password.
	 */
	public addPassword(formData: object): Observable<any> {
		return this.http.post(this.endpoints.addPassword, formData).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractObject),
			catchError(this.httpHandlers.handleError)
		);
	}

	/**
	 * Deletes user password.
	 */
	public deletePassword(formData: object): Observable<any> {
		return this.http.post(this.endpoints.deletePassword, formData).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractObject),
			catchError(this.httpHandlers.handleError)
		);
	}

	/**
	 * Generates RSA keypair for a user.
	 */
	public generateKeypair(): Observable<any> {
		return this.http.get(this.endpoints.generateKeypair).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractObject),
			catchError(this.httpHandlers.handleError)
		);
	}

	/**
	 * Encrypts user passwords with user public RSA key.
	 */
	public encryptPasswords(): Observable<any> {
		return this.http.get(this.endpoints.encryptPasswords).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractObject),
			catchError(this.httpHandlers.handleError)
		);
	}

	/**
	 * Decrypts user passwords with user private RSA key.
	 */
	public decryptPasswords(): Observable<any> {
		return this.http.get(this.endpoints.decryptPasswords).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractObject),
			catchError(this.httpHandlers.handleError)
		);
	}

}
