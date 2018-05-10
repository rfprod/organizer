import { APP_ROUTES } from '../../public/app/app.routes';

import { AuthGuardGeneral } from '../../public/app/services/auth-guard-general.service';
import { AnonimousGuard } from '../../public/app/services/anonimous-guard.service';

import { DashboardIntroComponent } from '../../public/app/components/dashboard-intro.component';
import { DashboardLoginComponent } from '../../public/app/components/dashboard-login.component';
import { DashboardDetailsComponent } from '../../public/app/components/dashboard-details.component';

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
			{path: 'intro', component: DashboardIntroComponent},
			{path: 'login', component: DashboardLoginComponent, canActivate: [AnonimousGuard]},
			{path: 'data', component: DashboardDetailsComponent, canActivate: [AuthGuardGeneral]},
			{path: '', redirectTo: 'intro', pathMatch: 'full'},
			{path: '**', redirectTo: 'intro'}
		]);
	});
});
