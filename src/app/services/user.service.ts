import { Injectable } from '@angular/core';

export interface IAppUserPassword {
  name: string;
  password: string;
  timestamp: number;
}

export interface IAppUser {
  email: string;
  token: string;
  status: {
    initialized: boolean;
    encryption: boolean;
    passwords: IAppUserPassword[];
    encrypted: boolean;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AppUserService {
  constructor() {
    this.initializeModel();
    this.restoreUser();
  }

  /**
   * User model.
   */
  private model: IAppUser;

  /**
   * Initializes user model with default values.
   */
  private initializeModel(): void {
    this.model = {
      email: null,
      token: null,
      status: {
        initialized: false,
        encryption: false,
        passwords: [],
        encrypted: false,
      },
    };
  }

  /**
   * Gets user model.
   */
  public getUser() {
    return this.model;
  }

  /**
   * Gets user token.
   */
  public isLoggedIn() {
    return this.model.token;
  }

  /**
   * Updates user model.
   * @param newValues new model values object
   */
  public saveUser(newValues: Partial<IAppUser>): void {
    for (const [key, value] of Object.entries(this.model)) {
      if (key !== 'status') {
        this.model[key] = key in newValues ? newValues[key] : value;
      } else {
        for (const [statusKey, statusValue] of Object.entries(this.model.status)) {
          this.model.status[statusKey] =
            statusKey in newValues ? newValues[statusKey] : statusValue;
        }
      }
    }
    localStorage.setItem('userService', JSON.stringify(this.model));
  }

  /**
   * Restores user model.
   */
  public restoreUser(): void {
    if (localStorage.getItem('userService')) {
      this.model = JSON.parse(localStorage.getItem('userService'));
    }
  }

  /**
   * Resets user.
   */
  public resetUser(): void {
    this.initializeModel();
    localStorage.setItem('userService', JSON.stringify(this.model));
  }
}
