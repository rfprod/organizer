import { APP_ROUTES } from '../../public/app/app.routes';

import { AuthGuardGeneral } from '../../public/app/services/auth-guard-general.service';
import { AnonimousGuard } from '../../public/app/services/anonimous-guard.service';

import { DashboardIntroComponent } from '../../public/app/components/dashboard-intro.component';
import { DashboardLoginComponent } from '../../public/app/components/dashboard-login.component';
import { DashboardDataComponent } from '../../public/app/components/dashboard-data.component';

describe('APP_ROUTES', () => {

	beforeEach(() => {
		this.routes = APP_ROUTES;
	});

	it('should be defined and be an array', () => {
		expect(this.routes).toBeDefined();
		expect(this.routes).toEqual(jasmine.any(Array));
	});

	it('should have proper routes defined', () => {
		expect(this.routes).toEqual([
			{path: 'login', component: DashboardLoginComponent, canActivate: [AnonimousGuard]},
			{path: 'intro', component: DashboardIntroComponent, canActivate: [AuthGuardGeneral]},
			{path: 'data', component: DashboardDataComponent, canActivate: [AuthGuardGeneral]},
			{path: '', redirectTo: 'login', pathMatch: 'full'},
			{path: '**', redirectTo: 'login'}
		]);
	});
});
