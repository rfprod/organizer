import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IAppUserPassword {
  name: string;
  password: string;
  timestamp: number;
}

export interface IAppUser {
  email: string;
  token: string;
  status?: {
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
    this.restoreUser();
  }

  /**
   * User model.
   */
  private model: IAppUser = {
    email: '',
    token: '',
    status: {
      initialized: false,
      encryption: false,
      passwords: [],
      encrypted: false,
    },
  };

  private readonly user = new BehaviorSubject<IAppUser>(this.model);

  public readonly user$ = this.user.asObservable();

  public readonly isLoggedIn$ = this.user.asObservable().pipe(map(user => Boolean(user.token)));

  /**
   * Initializes user model with default values.
   */
  private initializeModel(): void {
    this.model = {
      email: '',
      token: '',
      status: {
        initialized: false,
        encryption: false,
        passwords: [],
        encrypted: false,
      },
    };
    this.user.next(this.model);
  }

  /**
   * Updates user model.
   * @param newValues new model values object
   */
  public saveUser(newValues: Partial<IAppUser>): void {
    for (const [key, value] of Object.entries(this.model)) {
      if (key !== 'status') {
        this.model[key] = key in newValues ? newValues[key] : value;
      } else if (typeof this.model.status !== 'undefined') {
        for (const [statusKey, statusValue] of Object.entries(this.model.status)) {
          this.model.status[statusKey] =
            statusKey in newValues ? newValues[statusKey] : statusValue;
        }
      }
    }
    this.user.next(this.model);
    localStorage.setItem('userService', JSON.stringify(this.model));
  }

  /**
   * Restores user model.
   */
  public restoreUser(): void {
    const userServiceModel = localStorage.getItem('userService');
    if (userServiceModel !== null) {
      this.model = JSON.parse(userServiceModel);
      this.user.next(this.model);
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
