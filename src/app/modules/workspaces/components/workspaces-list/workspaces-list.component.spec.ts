import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AppWorkspacesListComponent } from './workspaces-list.component';

describe('AppWorkspacesListComponent', () => {
  let component: AppWorkspacesListComponent;
  let fixture: ComponentFixture<AppWorkspacesListComponent>;

  beforeEach(
    waitForAsync(() => {
      void TestBed.configureTestingModule({
        declarations: [AppWorkspacesListComponent],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(AppWorkspacesListComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    }),
  );

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
