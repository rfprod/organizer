/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { DummyComponent } from '../../mocks/components/dummy.component';
import { AppAutofocusDirective } from './autofocus.directive';

describe('AppAutofocusDirective', () => {
  let fixture: ComponentFixture<DummyComponent>;
  let debugElement: DebugElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let directive: AppAutofocusDirective | any;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      declarations: [DummyComponent, AppAutofocusDirective],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(DummyComponent);
        debugElement = fixture.debugElement.query(By.directive(AppAutofocusDirective));
        directive = debugElement.injector.get(AppAutofocusDirective);
      });
  }));

  it('dummy component should compile successfully', () => {
    expect(directive).toBeDefined();
  });

  it('should have variables and methods defined', () => {
    expect(directive.el.nativeElement.autofocus).toBeTruthy();
    expect(directive.autofocusState).toEqual(expect.any(Boolean));
    expect(directive.ngOnInit).toEqual(expect.any(Function));
    expect(directive.ngOnChanges).toEqual(expect.any(Function));
  });

  it('ngOnInit should call directive renderer invokeElementMethod if autofocus condition is met', () => {
    spyOn(directive.el.nativeElement, 'focus');

    directive.autofocusState = false;
    directive.ngOnInit();
    expect(directive.el.nativeElement.focus).not.toHaveBeenCalled();

    directive.autofocusState = void 0;
    directive.ngOnInit();
    expect(directive.el.nativeElement.focus).not.toHaveBeenCalled();

    directive.autofocusState = true;
    directive.ngOnInit();
    expect(directive.el.nativeElement.focus).toHaveBeenCalled();
  });

  it('autofocus method should set autofocusState property', () => {
    directive.autofocus = true;
    expect(directive.autofocusState).toBeTruthy();
    directive.autofocus = false;
    expect(directive.autofocusState).toBeFalsy();
  });
});
