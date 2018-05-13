import { Injectable, Inject } from '@angular/core';

@Injectable()
export class WebsocketService {

	constructor(
		@Inject('Window') public window: Window
	) {}

	/**
	 * Host used for websocket url formation.
	 */
	private host: string = this.window.location.host;

	/**
	 * Protocol used for websocket url formation.
	 */
	private protocol: string = (this.window.location.protocol === 'http:') ? 'ws://' : 'wss://';

	/**
	 * Websocker endpoints.
	 */
	private endpoints: any = {
		dynamicServerData: '/api/app-diag/dynamic'
	};

	/**
	 * Generates websocket url.
	 * @param endpoint endpoint key
	 */
	public generateUrl(endpoint: string): string {
		return this.endpoints[endpoint] ? this.protocol + this.host + this.endpoints[endpoint] : `Endpoint ${endpoint} does not exist`;
	}
}
