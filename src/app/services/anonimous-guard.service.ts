import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AppUserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AppAnonimousGuard implements CanActivate {
  constructor(private readonly userService: AppUserService, private readonly router: Router) {}

  public canActivate() {
    const token: string = this.userService.isLoggedIn();
    if (token) {
      void this.router.navigate(['summary']);
    }
    return !token ? true : false;
  }
}
