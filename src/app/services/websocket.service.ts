import { Inject, Injectable, OnDestroy } from '@angular/core';
import { WebSocketSubject } from 'rxjs/webSocket';

import { WINDOW } from '../utils/injection-tokens';

@Injectable({
  providedIn: 'root',
})
export class AppWebsocketService implements OnDestroy {
  /**
   * Host used for websocket url formation.
   */
  private readonly host = 'localhost:8080';

  /**
   * Protocol used for websocket url formation.
   */
  private readonly protocol = this.window.location.protocol === 'http:' ? 'ws://' : 'wss://';

  /**
   * Websocker endpoints.
   */
  private readonly endpoints = {
    dynamicServerData: '/api/app-diag/dynamic',
    chat: '/api/chat',
    stream: '/api/stream',
  };

  /**
   * All socket connections.
   */
  public readonly sockets = {
    dynamicServerData$: new WebSocketSubject<
      { name: string; value: number }[] | Record<string, string>
    >(this.generateUrl(this.endpoints.dynamicServerData)),
    chat$: new WebSocketSubject<
      Record<string, unknown> | Record<string, string> | { sender: string; text: string }
    >(this.generateUrl(this.endpoints.chat)),
  };

  constructor(@Inject(WINDOW) public window: Window) {}

  /**
   * Generates websocket url.
   * @param endpoint endpoint key
   */
  public generateUrl(endpoint: string): string {
    return `${this.protocol}${this.host}${endpoint}`;
  }

  /**
   * Closes all websocket connections.
   */
  public ngOnDestroy() {
    const socketKeys = Object.keys(this.sockets);
    for (const key of socketKeys) {
      const socket: WebSocketSubject<Record<string, string>> = this.sockets[key];
      socket.complete();
    }
  }
}
