import { Routes } from '@angular/router';
import { AuthGuardGeneral } from './services/auth-guard-general.service';
import { AnonimousGuard } from './services/anonimous-guard.service';
import { AppSummaryComponent } from './components/app-summary.component';
import { AppLoginComponent } from './components/app-login.component';
import { AppDataComponent } from './components/app-data.component';

export const APP_ROUTES: Routes = [
	{path: 'login', component: AppLoginComponent, canActivate: [AnonimousGuard]},
	{path: 'summary', component: AppSummaryComponent, canActivate: [AuthGuardGeneral]},
	{path: 'data', component: AppDataComponent, canActivate: [AuthGuardGeneral]},
	{path: '', redirectTo: 'login', pathMatch: 'full'},
	{path: '**', redirectTo: 'login'}
];
