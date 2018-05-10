import { Routes } from '@angular/router';
import { AuthGuardGeneral } from './services/auth-guard-general.service';
import { AnonimousGuard } from './services/anonimous-guard.service';
import { DashboardIntroComponent } from './components/dashboard-intro.component';
import { DashboardLoginComponent } from './components/dashboard-login.component';
import { DashboardDataComponent } from './components/dashboard-data.component';

export const APP_ROUTES: Routes = [
	{path: 'login', component: DashboardLoginComponent, canActivate: [AnonimousGuard]},
	{path: 'intro', component: DashboardIntroComponent, canActivate: [AuthGuardGeneral]},
	{path: 'data', component: DashboardDataComponent, canActivate: [AuthGuardGeneral]},
	{path: '', redirectTo: 'login', pathMatch: 'full'},
	{path: '**', redirectTo: 'login'}
];
