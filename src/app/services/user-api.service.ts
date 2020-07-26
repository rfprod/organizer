import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

import { WINDOW } from '../utils/injection-tokens';
import { AppHttpHandlersService } from './http-handlers.service';
import { IAppUser, IAppUserPassword } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AppUserApiService {
  constructor(
    private readonly http: HttpClient,
    @Inject(WINDOW) private readonly window: Window,
    private readonly httpHandlers: AppHttpHandlersService,
  ) {}

  /**
   * Service endpoints.
   */
  private readonly endpoints = {
    user: this.window.location.origin + '/api/user',
    login: this.window.location.origin + '/api/user/login',
    config: this.window.location.origin + '/api/user/config',
    status: this.window.location.origin + '/api/user/status',
    addPassword: this.window.location.origin + '/api/user/password/add',
    deletePassword: this.window.location.origin + '/api/user/password/delete',
    generateKeypair: this.window.location.origin + '/api/user/rsa/generate',
    encryptPasswords: this.window.location.origin + '/api/user/rsa/encrypt',
    decryptPasswords: this.window.location.origin + '/api/user/rsa/decrypt',
    exportPasswords: this.window.location.origin + '/api/user/passwords/export',
    listExportedPasswordFiles: this.window.location.origin + '/api/user/passwords/list/exported',
  };

  /**
   * Gets user.
   */
  public getUser() {
    return this.http
      .get<IAppUser>(this.endpoints.user)
      .pipe(catchError((e, c) => this.httpHandlers.handleError<IAppUser>(e, c)));
  }

  /**
   * Gets user status.
   */
  public getUserStatus() {
    return this.http
      .get<IAppUser['status']>(this.endpoints.status)
      .pipe(catchError(this.httpHandlers.handleError));
  }

  /**
   * Loggs user in.
   */
  public login(formData: Partial<IAppUser>) {
    return this.http
      .post<{ token: string }>(this.endpoints.login, formData)
      .pipe(catchError(this.httpHandlers.handleError));
  }

  /**
   * Configures user.
   */
  public configUser(formData: Record<string, unknown>) {
    return this.http
      .post(this.endpoints.config, formData)
      .pipe(catchError(this.httpHandlers.handleError));
  }

  /**
   * Adds user password.
   */
  public addPassword(formData: Partial<IAppUserPassword>) {
    return this.http
      .post(this.endpoints.addPassword, formData)
      .pipe(catchError(this.httpHandlers.handleError));
  }

  /**
   * Deletes user password.
   */
  public deletePassword(formData: IAppUserPassword) {
    return this.http
      .post(this.endpoints.deletePassword, formData)
      .pipe(catchError(this.httpHandlers.handleError));
  }

  /**
   * Generates RSA keypair for a user.
   */
  public generateKeypair() {
    return this.http
      .get(this.endpoints.generateKeypair)
      .pipe(catchError(this.httpHandlers.handleError));
  }

  /**
   * Encrypts user passwords with user public RSA key.
   */
  public encryptPasswords() {
    return this.http
      .get(this.endpoints.encryptPasswords)
      .pipe(catchError(this.httpHandlers.handleError));
  }

  /**
   * Decrypts user passwords with user private RSA key.
   */
  public decryptPasswords() {
    return this.http
      .get(this.endpoints.decryptPasswords)
      .pipe(catchError(this.httpHandlers.handleError));
  }

  /**
   * Exports user passwords.
   */
  public exportPasswords() {
    return this.http
      .get(this.endpoints.exportPasswords)
      .pipe(catchError(this.httpHandlers.handleError));
  }

  /**
   * Lists exported passwords.
   */
  public listExportedPasswordFiles() {
    return this.http
      .get(this.endpoints.listExportedPasswordFiles)
      .pipe(catchError(this.httpHandlers.handleError));
  }
}
