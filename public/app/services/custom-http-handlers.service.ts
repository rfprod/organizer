import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';

@Injectable()
export class CustomHttpHandlersService {

	/**
	 * Extracts object from http response.
	 */
	public extractObject(res: Response): object {
		return (res) ? res.json() : {};
	}

	/**
	 * Extracts array from http response.
	 */
	public extractArray(res: Response): object {
		return (res) ? res.json() : [];
	}

	/**
	 * Handles error on http request.
	 */
	public handleError(error: any) {
		const errMsg = (error.message) ? error.message :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		console.log(errMsg);
		return Observable.throw(errMsg);
	}

}
