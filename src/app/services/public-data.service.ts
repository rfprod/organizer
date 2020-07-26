import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError, take, timeout } from 'rxjs/operators';

import { TIMEOUT } from '../utils/constants';
import { WINDOW } from '../utils/injection-tokens';
import { AppHttpHandlersService } from './http-handlers.service';

@Injectable({
  providedIn: 'root',
})
export class AppPublicDataService {
  constructor(
    private readonly http: HttpClient,
    @Inject(WINDOW) private readonly window: Window,
    private readonly httpHandlers: AppHttpHandlersService,
  ) {}

  /**
   * Service endpoints.
   */
  private readonly endpoints = {
    usage: this.window.location.origin + '/api/app-diag/usage',
  };

  /**
   * Gets application usage data.
   */
  public getData() {
    return this.http
      .get<{ key: string; y: number }[]>(this.endpoints.usage)
      .pipe(timeout(TIMEOUT.LONG), take(1), catchError(this.httpHandlers.handleError));
  }
}
