import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Dummy component.
 *
 * @description For usage in unit tests where applicable.
 */
@Component({
  selector: 'app-dummy-component',
  template: ' <div appAutoscroll class="scrollable"><input autofocus="true" appAutofocus /></div> ',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DummyComponent {}
