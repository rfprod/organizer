import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { AppUserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AppAnonimousGuard implements CanActivate {
  constructor(private readonly userService: AppUserService, private readonly router: Router) {}

  public canActivate(): Observable<boolean | UrlTree> {
    return this.userService.user$.pipe(
      first(),
      map(user => {
        if (user.token) {
          return this.router.createUrlTree(['summary']);
        }

        return !user.token ? true : false;
      }),
    );
  }
}
