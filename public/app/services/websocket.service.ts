import { Injectable, Inject } from '@angular/core';

@Injectable()
export class WebsocketService {
	constructor(@Inject('Window') public window: Window) {}

	private host: string = this.window.location.host;
	private wsProtocol: string = (this.window.location.protocol === 'http:') ? 'ws://' : 'wss://';
	private wsPort: string = (this.window.location.protocol === 'http:') ? '8000' : '8443';

	public generateUrl(endpoint: string): string {
		/*
		*	generates suitable websocket url for currelty running app
		*
		*	8000 and 8443 are ports used by OpenShift for ws and wss connections respectively
		*/
		return (this.host.indexOf('localhost') !== -1 || this.host.indexOf('rhcloud') === -1) ? this.wsProtocol + this.host + endpoint : this.wsProtocol + this.host + ':' + this.wsPort + endpoint;
	}
}
