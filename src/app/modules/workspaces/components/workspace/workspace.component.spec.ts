import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsModule } from '@ngxs/store';
import { DummyComponent } from 'src/app/mocks/components/dummy.component';
import { AppMaterialModule } from 'src/app/modules/material/material.module';

import { AppWorkspaceComponent } from './workspace.component';

describe('AppWorkspaceComponent', () => {
  let component: AppWorkspaceComponent;
  let fixture: ComponentFixture<AppWorkspaceComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [
          BrowserTestingModule,
          RouterTestingModule.withRoutes([
            {
              path: 'workspaces/item',
              component: DummyComponent,
            },
          ]),
          NgxsModule.forRoot([]),
          NgxsRouterPluginModule.forRoot(),
          AppMaterialModule.forRoot(),
        ],
        declarations: [AppWorkspaceComponent],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(AppWorkspaceComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
