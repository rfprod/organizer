import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppMaterialModule } from 'src/app/modules/material/material.module';

import { AppWorkspaceComponent } from './workspace.component';

describe('AppWorkspaceComponent', () => {
  let component: AppWorkspaceComponent;
  let fixture: ComponentFixture<AppWorkspaceComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [AppMaterialModule],
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

  beforeEach(() => {
    fixture = TestBed.createComponent(AppWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
