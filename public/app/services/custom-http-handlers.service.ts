import { Injectable } from '@angular/core';

@Injectable()
export class CustomHttpHandlersService {

	public extractObject(res: object): any {
		return res || {};
	}

	public extractArray(res: any[]): any {
		return res || [];
	}

	public handleError(error: any): string {
		console.log('error', error);
		const errMsg = (error.message) ? error.message :
			error.status ? `${error.status} - ${error.statusText}` : 'Server error';
		console.log('errMsg', errMsg);
		return errMsg;
	}

}
