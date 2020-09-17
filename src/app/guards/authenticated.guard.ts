import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { AppUserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AppAuthenticatedGuard implements CanActivate {
  constructor(private readonly userService: AppUserService, private readonly router: Router) {}

  public canActivate(): boolean | UrlTree {
    const user = this.userService.getUser();

    if (!user.token && user.status.initialized) {
      // eslint-disable-next-line no-alert
      window.alert('to access data you need to log in first');
      return this.router.createUrlTree(['login']);
    }
    return user.token ? true : false;
  }
}
