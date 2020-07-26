import { Pipe, PipeTransform } from '@angular/core';

import { AppTranslateService } from './translate.service';

@Pipe({
  name: 'translate',
  // eslint-disable-next-line @angular-eslint/no-pipe-impure
  pure: false, // this should be set to false for values to be updated on language change
})
export class AppTranslatePipe implements PipeTransform {
  constructor(private readonly translate: AppTranslateService) {}

  public transform(value: string) {
    return !value ? value : this.translate.instant(value);
  }
}
