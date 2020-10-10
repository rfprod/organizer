import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AppTranslateService } from '../../modules/translate/translate.service';
import { NAVIGATOR, TNavigator } from '../../utils/injection-tokens';

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

  constructor(
    private readonly translate: AppTranslateService,
    @Inject(NAVIGATOR) private readonly nav: TNavigator,
  ) {}

  @ViewChild('video') public video!: ElementRef<HTMLVideoElement>;

  public ngOnInit(): void {
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
      // init webRTC
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
            this.video.nativeElement.srcObject = stream;
          },
          error => {
            console.error('getUserMedia error:', error);
          },
        );
      }
    }
  }
}
