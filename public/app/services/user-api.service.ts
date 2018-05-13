import { Injectable, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';

import { CustomHttpHandlersService } from './custom-http-handlers.service';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class UserAPIService {

	constructor(
		private http: Http,
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
		status: this.window.location.origin + '/api/user/status' as string
	};

	/**
	 * Gets user.
	 */
	public getUser(): Observable<any> {
		return this.http.get(this.endpoints.user)
			.map(this.httpHandlers.extractObject)
			.catch(this.httpHandlers.handleError);
	}

	/**
	 * Gets user status.
	 */
	public getUserStatus(): Observable<any> {
		return this.http.get(this.endpoints.status)
			.map(this.httpHandlers.extractObject)
			.catch(this.httpHandlers.handleError);
	}

	/**
	 * Loggs user in.
	 */
	public login(formData: object): Observable<any> {
		return this.http.post(this.endpoints.login, formData)
			.map(this.httpHandlers.extractObject)
			.catch(this.httpHandlers.handleError);
	}

	/**
	 * Configures user.
	 */
	public configUser(formData: object): Observable<any> {
		return this.http.post(this.endpoints.config, formData)
			.map(this.httpHandlers.extractObject)
			.catch(this.httpHandlers.handleError);
	}

}
