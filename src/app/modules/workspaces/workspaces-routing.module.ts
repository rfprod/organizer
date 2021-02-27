import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppAuthenticatedGuard } from 'src/app/guards/authenticated.guard';

import { AppWorkspaceComponent } from './components/workspace/workspace.component';
import { AppWorkspacesListComponent } from './components/workspaces-list/workspaces-list.component';

export const WORKSPACES_ROUTES: Routes = [
  {
    path: 'item/:id',
    canActivate: [AppAuthenticatedGuard],
    component: AppWorkspaceComponent,
  },
  {
    path: '',
    canActivate: [AppAuthenticatedGuard],
    component: AppWorkspacesListComponent,
  },
  { path: '**', pathMatch: 'full', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(WORKSPACES_ROUTES)],
  exports: [RouterModule],
})
export class AppWorkspacesRoutingModule {}
