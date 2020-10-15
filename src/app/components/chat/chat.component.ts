import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, from } from 'rxjs';
import { first, tap } from 'rxjs/operators';

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

  private readonly chatWs = this.websocket.sockets.chat$.pipe(
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

  protected webRtcConfig: {
    servers: {
      iceServers: [
        {
          urls: string[];
        },
      ];
      iceCandidatePoolSize: number;
    };
    peerConnection: RTCPeerConnection | null;
    roomId: string;
  } = {
    servers: {
      iceServers: [
        {
          urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
      ],
      iceCandidatePoolSize: 10,
    },
    peerConnection: null,
    roomId: 'T1vgzF95VyHhCewCbWG6',
  };

  private readonly localVideoStream = new BehaviorSubject<MediaStream>(new MediaStream());

  public readonly localVideoStream$ = this.localVideoStream.asObservable();

  private readonly remoteVideoStream = new BehaviorSubject<MediaStream>(new MediaStream());

  public readonly remoteVideoStream$ = this.remoteVideoStream.asObservable();

  constructor(
    private readonly websocket: AppWebsocketService,
    private readonly translate: AppTranslateService,
    private readonly fb: FormBuilder,
    private readonly firestore: AngularFirestore,
    @Inject(NAVIGATOR) private readonly nav: TNavigator,
  ) {}

  public readonly form = this.fb.group({
    sender: ['user', Validators.compose([Validators.required])],
    text: ['', Validators.compose([Validators.required])],
  });

  public sendMessage(): void {
    if (this.form.valid) {
      this.websocket.sockets.chat$.next(this.form.value);
    }
  }

  public registerPeerConnectionListeners() {
    const peerConnection = this.webRtcConfig.peerConnection;
    if (peerConnection !== null) {
      peerConnection.addEventListener('icegatheringstatechange', () => {
        console.warn(`ICE gathering state changed: ${peerConnection.iceGatheringState}`);
      });

      peerConnection.addEventListener('connectionstatechange', () => {
        console.warn(`Connection state change: ${peerConnection.connectionState}`);
      });

      peerConnection.addEventListener('signalingstatechange', () => {
        console.warn(`Signaling state change: ${peerConnection.signalingState}`);
      });

      peerConnection.addEventListener('iceconnectionstatechange ', () => {
        console.warn(`ICE connection state change: ${peerConnection.iceConnectionState}`);
      });
    }
  }

  public joinRoom(roomId = this.webRtcConfig.roomId) {
    const roomRef = this.firestore.collection('rooms').doc(roomId);
    void from(roomRef.get())
      .pipe(
        first(),
        tap(roomSnapshot => {
          console.warn('Got room:', roomSnapshot);

          if (roomSnapshot.exists) {
            this.webRtcConfig.peerConnection = new RTCPeerConnection(this.webRtcConfig.servers);

            this.registerPeerConnectionListeners();

            const peerConnection = this.webRtcConfig.peerConnection;
            const localStream = this.localVideoStream.value;
            const remoteStream = this.remoteVideoStream.value;

            localStream.getTracks().forEach(track => {
              peerConnection.addTrack(track, localStream);
            });

            // Code for collecting ICE candidates below

            // Code for collecting ICE candidates above

            peerConnection.addEventListener('track', event => {
              console.warn('Got remote track:', event.streams[0]);
              event.streams[0].getTracks().forEach(track => {
                console.warn('Add a track to the remoteStream:', track);
                remoteStream.addTrack(track);
              });
            });

            // Code for creating SDP answer below

            // Code for creating SDP answer above

            // Listening for remote ICE candidates below

            // Listening for remote ICE candidates above
          }
        }),
      )
      .subscribe();
  }

  public ngOnInit(): void {
    void this.chatWs.pipe(untilDestroyed(this)).subscribe();

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
            video: { width: { min: 320 }, height: { min: 240 } },
            audio: true,
          },
          stream => {
            this.localVideoStream.next(stream);
            this.joinRoom();
          },
          error => {
            console.error('getUserMedia error:', error);
            this.joinRoom();
          },
        );
      }
    }
  }
}
