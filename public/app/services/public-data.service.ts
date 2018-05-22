import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { CustomHttpHandlersService } from './custom-http-handlers.service';

import { Observable } from 'rxjs';
import { timeout, take, map, catchError } from 'rxjs/operators';

@Injectable()
export class PublicDataService {

	constructor(
		private http: HttpClient,
		@Inject('Window') private window: Window,
		private httpHandlers: CustomHttpHandlersService
	) {
		console.log('PublicDataService init');
	}

	/**
	 * Service endpoints.
	 */
	private endpoints: any = {
		usage: this.window.location.origin + '/api/app-diag/usage'
	};

	/**
	 * Gets application usage data.
	 */
	public getData(): Observable<any[]> {
		return this.http.get(this.endpoints.usage).pipe(
			timeout(10000),
			take(1),
			map(this.httpHandlers.extractArray),
			catchError(this.httpHandlers.handleError)
		);
	}
}
