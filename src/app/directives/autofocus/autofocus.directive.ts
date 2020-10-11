import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

/**
 * Autofocus directive.
 */
@Directive({
  selector: '[appAutofocus]',
})
export class AppAutofocusDirective implements OnInit, OnChanges {
  private autofocusState = false;

  private nativeElement?: HTMLElement;

  constructor(private readonly el: ElementRef) {}

  @Input() public set autofocus(state: boolean) {
    this.autofocusState = state;
  }

  public ngOnInit(): void {
    this.nativeElement = this.el.nativeElement;
    if (typeof this.nativeElement !== 'undefined' && this.autofocusState) {
      this.nativeElement.focus();
    }
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (typeof this.nativeElement !== 'undefined' && this.autofocusState) {
      this.nativeElement.focus();
    }
  }
}
