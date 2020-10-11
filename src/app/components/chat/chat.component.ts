import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AppTranslateService } from '../../modules/translate/translate.service';
import { AppWebsocketService } from '../../services/websocket.service';
import { NAVIGATOR, TNavigator } from '../../utils/injection-tokens';

@UntilDestroy()
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppChatComponent implements OnInit {
  public readonly language$ = this.translate.language$;

  private readonly mediaDevices = new BehaviorSubject<MediaDeviceInfo[]>([]);

  public readonly mediaDevices$ = this.mediaDevices.asObservable();

  private readonly messages = new BehaviorSubject<Record<string, unknown>[]>([]);

  public readonly messages$ = this.messages.asObservable();

  /**
   * Websocket connection.
   */
  private readonly ws = this.websocket.sockets.chat$.pipe(
    tap(
      message => {
        this.messages.next([...this.messages.value, message]);
      },
      error => {
        console.error('socket$, error', error);
      },
      () => console.warn('socket$, completed'),
    ),
  );

  constructor(
    private readonly websocket: AppWebsocketService,
    private readonly translate: AppTranslateService,
    private readonly fb: FormBuilder,
    @Inject(NAVIGATOR) private readonly nav: TNavigator,
  ) {}

  @ViewChild('video') public video?: ElementRef<HTMLVideoElement>;

  public readonly form = this.fb.group({
    sender: ['user', Validators.compose([Validators.required])],
    text: ['', Validators.compose([Validators.required])],
  });

  public sendMessage(): void {
    if (this.form.valid) {
      this.websocket.sockets.chat$.next(this.form.value);
    }
  }

  public ngOnInit(): void {
    void this.ws.pipe(untilDestroyed(this)).subscribe();

    if (typeof this.nav !== 'undefined') {
      if (Boolean(this.nav.mediaDevices) && Boolean(navigator.mediaDevices.enumerateDevices)) {
        navigator.mediaDevices.enumerateDevices().then(
          devices => {
            devices.forEach(item => {
              this.mediaDevices.next([...this.mediaDevices.value, item]);
            });
          },
          error => {
            console.warn('error', error);
          },
        );
      }

      if (typeof this.nav.getUserMedia !== 'undefined') {
        this.nav.getUserMedia(
          {
            video: {
              width: {
                min: 320,
              },
              height: {
                min: 240,
              },
            },
            audio: true,
          },
          stream => {
            if (typeof this.video !== 'undefined') {
              this.video.nativeElement.srcObject = stream;
            }
          },
          error => {
            console.error('getUserMedia error:', error);
          },
        );
      }
    }
  }
}
