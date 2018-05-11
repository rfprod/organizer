import { Injectable, Inject } from '@angular/core';

@Injectable()
export class WebsocketService {

	constructor(
		@Inject('Window') public window: Window
	) {}

	private host: string = this.window.location.host;

	private wsProtocol: string = (this.window.location.protocol === 'http:') ? 'ws://' : 'wss://';

	private wsPort: string = (this.window.location.protocol === 'http:') ? '8000' : '8443';

	public generateUrl(endpoint: string): string {
		return this.wsProtocol + this.host + endpoint;
	}
}
