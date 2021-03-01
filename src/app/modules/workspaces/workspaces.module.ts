import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppMaterialModule } from '../material/material.module';
import { AppWorkspaceComponent } from './components/workspace/workspace.component';
import { AppWorkspaceWidgetComponent } from './components/workspace-widget/workspace-widget.component';
import { AppWorkspacesListComponent } from './components/workspaces-list/workspaces-list.component';
import { AppWorkspacesRoutingModule } from './workspaces-routing.module';

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppWorkspacesRoutingModule,
  ],
  declarations: [AppWorkspacesListComponent, AppWorkspaceWidgetComponent, AppWorkspaceComponent],
})
export class AppWorkspacesModule {}
