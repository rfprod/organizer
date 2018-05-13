import { Injectable, Inject } from '@angular/core';
import { Http, Response } from '@angular/http';

import { CustomHttpHandlersService } from './custom-http-handlers.service';

import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ServerStaticDataService {

	constructor(
		private http: Http,
		@Inject('Window') private window: Window,
		private httpHandlers: CustomHttpHandlersService
	) {
		console.log('ServerStaticDataService init');
	}

	/**
	 * Service endpoints.
	 */
	private endpoints: any = {
		static: this.window.location.origin + '/api/app-diag/static'
	};

	/**
	 * Gets serverstatic diagnostic data.
	 */
	public getData(): Observable<any[]> {
		return this.http.get(this.endpoints.static)
			.map(this.httpHandlers.extractArray)
			.catch(this.httpHandlers.handleError);
	}
}
