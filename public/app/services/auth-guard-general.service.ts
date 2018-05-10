import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthGuardGeneral implements CanActivate {

	constructor(
		private userService: UserService,
		private router: Router
	) {}

	public canActivate(): boolean {
		const token: string = this.userService.isLoggedIn();
		console.log('ROUTER GUARD, can activate, token', token);
		if (!token) {
			window.alert('to access data you need to log in first, use any valid credentials');
			this.router.navigate(['login']);
		}
		return (token) ? true : false;
	}
}
