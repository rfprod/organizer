import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AppUserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AppAuthGuardGeneral implements CanActivate {
  constructor(private readonly userService: AppUserService, private readonly router: Router) {}

  public canActivate(): boolean {
    const token: string = this.userService.isLoggedIn();
    if (!token) {
      // eslint-disable-next-line no-alert
      window.alert('to access data you need to log in first, use any valid credentials');
      void this.router.navigate(['login']);
    }
    return token ? true : false;
  }
}
