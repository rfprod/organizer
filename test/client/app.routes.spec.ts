import { APP_ROUTES } from '../../public/app/app.routes';

import { AuthGuardGeneral } from '../../public/app/services/auth-guard-general.service';
import { AnonimousGuard } from '../../public/app/services/anonimous-guard.service';

import { AppSummaryComponent } from '../../public/app/components/app-summary.component';
import { AppLoginComponent } from '../../public/app/components/app-login.component';
import { AppDataComponent } from '../../public/app/components/app-data.component';

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
			{path: 'login', component: AppLoginComponent, canActivate: [AnonimousGuard]},
			{path: 'summary', component: AppSummaryComponent, canActivate: [AuthGuardGeneral]},
			{path: 'data', component: AppDataComponent, canActivate: [AuthGuardGeneral]},
			{path: '', redirectTo: 'login', pathMatch: 'full'},
			{path: '**', redirectTo: 'login'}
		]);
	});
});
