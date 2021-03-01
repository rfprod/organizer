import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppMaterialModule } from 'src/app/modules/material/material.module';

import { AppWorkspaceWidgetComponent } from './workspace-widget.component';

describe('AppWorkspaceWidgetComponent', () => {
  let component: AppWorkspaceWidgetComponent;
  let fixture: ComponentFixture<AppWorkspaceWidgetComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        imports: [AppMaterialModule],
        declarations: [AppWorkspaceWidgetComponent],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(AppWorkspaceWidgetComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AppWorkspaceWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
