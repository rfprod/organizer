import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppDataComponent } from './components/data/data.component';
import { AppLoginComponent } from './components/login/login.component';
import { AppSummaryComponent } from './components/summary/summary.component';
import { AppAnonimousGuard } from './guards/anonimous.guard';
import { AppAuthenticatedGuard } from './guards/authenticated.guard';

export const APP_ROUTES: Routes = [
  { path: 'login', component: AppLoginComponent, canActivate: [AppAnonimousGuard] },
  { path: 'summary', component: AppSummaryComponent, canActivate: [AppAuthenticatedGuard] },
  { path: 'data', component: AppDataComponent, canActivate: [AppAuthenticatedGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
