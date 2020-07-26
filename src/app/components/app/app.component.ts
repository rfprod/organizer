import { trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

/**
 * Main application component.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [trigger('empty', [])],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  constructor(private readonly matIconRegistry: MatIconRegistry) {}

  public ngOnInit(): void {
    /**
     *	register fontawesome for usage in mat-icon by adding directives
     *	fontSet="fab" fontIcon="fa-icon"
     *	fontSet="fas" fontIcon="fa-icon"
     *
     *	note: free plan includes only fab (font-awesome-brands) and fas (font-awesome-solid) groups
     *
     *	icons reference: https://fontawesome.com/icons/
     */
    this.matIconRegistry.registerFontClassAlias('fontawesome-all');
  }
}
