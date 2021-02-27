import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppWorkspaceComponent } from './workspace.component';

describe('AppWorkspaceComponent', () => {
  let component: AppWorkspaceComponent;
  let fixture: ComponentFixture<AppWorkspaceComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
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
