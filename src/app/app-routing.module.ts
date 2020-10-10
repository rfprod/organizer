import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppAuthComponent } from './components/auth/auth.component';
import { AppChatComponent } from './components/chat/chat.component';
import { AppDataComponent } from './components/data/data.component';
import { AppSummaryComponent } from './components/summary/summary.component';
import { AppAnonimousGuard } from './guards/anonimous.guard';
import { AppAuthenticatedGuard } from './guards/authenticated.guard';

export const APP_ROUTES: Routes = [
  { path: 'auth', component: AppAuthComponent, canActivate: [AppAnonimousGuard] },
  { path: 'chat', component: AppChatComponent, canActivate: [AppAuthenticatedGuard] },
  { path: 'data', component: AppDataComponent, canActivate: [AppAuthenticatedGuard] },
  { path: 'summary', component: AppSummaryComponent, canActivate: [AppAuthenticatedGuard] },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' },
];

@NgModule({
  imports: [RouterModule.forRoot(APP_ROUTES)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
