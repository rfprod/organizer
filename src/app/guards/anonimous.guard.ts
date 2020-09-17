import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { AppUserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AppAnonimousGuard implements CanActivate {
  constructor(private readonly userService: AppUserService, private readonly router: Router) {}

  public canActivate(): boolean | UrlTree {
    const user = this.userService.getUser();

    if (user.token) {
      return this.router.createUrlTree(['summary']);
    }

    return !user.token ? true : false;
  }
}
