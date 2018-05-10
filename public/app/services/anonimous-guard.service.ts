import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable()
export class AnonimousGuard implements CanActivate {

	constructor(
		private userService: UserService,
		private router: Router
	) {}

	public canActivate(): boolean {
		const token: string = this.userService.isLoggedIn();
		if (token) {
			console.log('>> ROUTER GUARD, AnonimousGuard: token present');
			this.router.navigate(['profile']);
		}
		return (!token) ? true : false;
	}
}
