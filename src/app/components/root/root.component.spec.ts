import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppRootComponent } from './root.component';

describe('AppRootComponent', () => {
  let fixture: ComponentFixture<AppRootComponent>;
  let component: AppRootComponent;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppRootComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppRootComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
