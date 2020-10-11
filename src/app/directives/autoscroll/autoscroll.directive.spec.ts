import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { timer } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { DummyComponent } from './../../mocks/components/dummy.component';
import { AppAutoscrollDirective } from './autoscroll.directive';

describe('AppAutoscrollDirective', () => {
  let fixture: ComponentFixture<DummyComponent>;
  let debugElement: DebugElement;
  let directive: AppAutoscrollDirective;

  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      declarations: [DummyComponent, AppAutoscrollDirective],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(DummyComponent);
        debugElement = fixture.debugElement.query(By.directive(AppAutoscrollDirective));
        directive = debugElement.injector.get(AppAutoscrollDirective);
        fixture.detectChanges();
      });
  }));

  it('should compile successfully', () => {
    expect(directive).toBeDefined();
  });

  it('autoscroll should work correctly', async(() => {
    const testingElement: HTMLElement = debugElement.nativeElement;
    const inputHeight = testingElement.querySelector('input')?.clientHeight ?? 0;
    const testingElementHeight = testingElement.clientHeight;
    const interval = 500;
    const elementsCount = 10;
    void timer(0, interval)
      .pipe(
        tap(() => {
          const newDiv = document.createElement('div');
          newDiv.innerText = 'new div';
          const newDivHeight = newDiv.clientHeight;
          testingElement.appendChild(newDiv);
          let scrollValue =
            testingElement.scrollHeight - testingElementHeight - newDivHeight - inputHeight - 1;
          scrollValue = scrollValue < 0 ? 0 : scrollValue;
          expect(testingElement.scrollTop).toEqual(scrollValue);
        }),
        take(elementsCount),
      )
      .subscribe();
  }));
});