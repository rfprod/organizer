import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-workspaces-list',
  templateUrl: './workspaces-list.component.html',
  styleUrls: ['./workspaces-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppWorkspacesListComponent {
  private readonly widgets = new BehaviorSubject<{ title: string; message: string; url: string }[]>(
    [
      {
        title: 'title',
        message: 'message',
        url: 'https://duckduckgo.com',
      },
    ],
  );

  public readonly widgets$ = this.widgets.asObservable();
}
