import { Injectable, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';

import { CustomHttpHandlersService } from './custom-http-handlers.service';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class UsersListService {
	constructor(
		private http: Http,
		@Inject('Window') private window: Window,
		private httpHandlers: CustomHttpHandlersService
	) {
		console.log('UsersListService init');
	}

	private appDataUrl: string = this.window.location.origin + '/api/users';

	public getUsersList(): Observable<any[]> { // tslint:disable-line
		return this.http.get(this.appDataUrl)
			.map(this.httpHandlers.extractArray)
			.catch(this.httpHandlers.handleError);
	}
}
