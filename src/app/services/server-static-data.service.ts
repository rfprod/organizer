import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, take, timeout } from 'rxjs/operators';

import { TIMEOUT } from '../utils/constants';
import { WINDOW } from '../utils/injection-tokens';
import { AppHttpHandlersService } from './http-handlers.service';

@Injectable({
  providedIn: 'root',
})
export class AppServerStaticDataService {
  constructor(
    private readonly http: HttpClient,
    @Inject(WINDOW) private readonly window: Window,
    private readonly httpHandlers: AppHttpHandlersService,
  ) {}

  /**
   * Service endpoints.
   */
  private readonly endpoints = {
    static: this.window.location.origin + '/api/app-diag/static',
  };

  /**
   * Gets serverstatic diagnostic data.
   */
  public getData() {
    return this.http
      .get<Record<string, unknown>[]>(this.endpoints.static)
      .pipe(timeout(TIMEOUT.LONG), take(1), catchError(this.httpHandlers.handleError));
  }
}
