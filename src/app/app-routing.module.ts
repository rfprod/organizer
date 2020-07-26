import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppDataComponent } from './components/data/data.component';
import { AppInitializeComponent } from './components/initialize/initialize.component';
import { AppLoginComponent } from './components/login/login.component';
import { AppSummaryComponent } from './components/summary/summary.component';
import { AppAnonimousGuard } from './services/anonimous-guard.service';
import { AppAuthGuardGeneral } from './services/auth-guard-general.service';

export const APP_ROUTES: Routes = [
  { path: 'login', component: AppLoginComponent, canActivate: [AppAnonimousGuard] },
  { path: 'initialize', component: AppInitializeComponent, canActivate: [AppAnonimousGuard] },
  { path: 'summary', component: AppSummaryComponent, canActivate: [AppAuthGuardGeneral] },
  { path: 'data', component: AppDataComponent, canActivate: [AppAuthGuardGeneral] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

/**
 * Application routing module.
 */
@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
