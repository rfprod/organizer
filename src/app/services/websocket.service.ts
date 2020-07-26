import { Inject, Injectable } from '@angular/core';

import { WINDOW } from '../utils/injection-tokens';

@Injectable({
  providedIn: 'root',
})
export class AppWebsocketService {
  constructor(@Inject(WINDOW) public window: Window) {}

  /**
   * Host used for websocket url formation.
   */
  private readonly host: string = this.window.location.host;

  /**
   * Protocol used for websocket url formation.
   */
  private readonly protocol = this.window.location.protocol === 'http:' ? 'ws://' : 'wss://';

  /**
   * Websocker endpoints.
   */
  private readonly endpoints = {
    dynamicServerData: '/api/app-diag/dynamic',
  };

  /**
   * Generates websocket url.
   * @param endpoint endpoint key
   */
  public generateUrl(endpoint: string): string {
    return Boolean(this.endpoints[endpoint])
      ? `${this.protocol}${this.host}${this.endpoints[endpoint]}`
      : `Endpoint ${endpoint} does not exist`;
  }
}
