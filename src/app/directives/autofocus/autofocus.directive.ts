import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

/**
 * Autofocus directive.
 */
@Directive({
  selector: '[appAutofocus]',
})
export class AppAutofocusDirective implements OnInit, OnChanges {
  public autofocusState = false;

  public nativeElement?: HTMLElement;

  constructor(public readonly el: ElementRef) {}

  @Input() public set autofocus(state: boolean) {
    this.autofocusState = state ? true : false;
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
