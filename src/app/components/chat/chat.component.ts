import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, from } from 'rxjs';
import { filter, first, map, switchMap, tap } from 'rxjs/operators';

import { AppTranslateService } from '../../modules/translate/translate.service';
import { AppWebsocketService } from '../../services/websocket.service';
import { NAVIGATOR, TNavigator } from '../../utils/injection-tokens';

function getSenderId() {
  const multiplier = 1000000000;
  return Math.floor(Math.random() * multiplier);
}

interface IRtcPeerDto {
  sender: number;
  type: 'offer' | 'answer';
  sdp: string | null;
}

interface IRtcPeer {
  sender: number;
  type: 'offer' | 'answer';
  sdp: RTCSessionDescription | null;
}

interface IFirestoreRoom<T = IRtcPeerDto> {
  name: string;
  peers: T[];
}

type TFirestoreRooms = IFirestoreRoom[];

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
      iceServers: [{ urls: string[] }];
      iceCandidatePoolSize: number;
    };
    roomId: string;
    senderId: number;
  } = {
    servers: {
      iceServers: [
        {
          urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
        },
      ],
      iceCandidatePoolSize: 10,
    },
    roomId: 'T1vgzF95VyHhCewCbWG6',
    senderId: getSenderId(),
  };

  private readonly peerConnection = new RTCPeerConnection(this.webRtcConfig.servers);

  private readonly localVideoStream = new BehaviorSubject<MediaStream>(new MediaStream());

  public readonly localVideoStream$ = this.localVideoStream.asObservable();

  private readonly remoteVideoStream = new BehaviorSubject<MediaStream>(new MediaStream());

  public readonly remoteVideoStream$ = this.remoteVideoStream.asObservable();

  private readonly videoRoomPeers$ = new BehaviorSubject<IRtcPeer[]>([]);

  public readonly videoRoomPeersValueChanges = this.firestore
    .collection<TFirestoreRooms>('rooms')
    .doc<IFirestoreRoom>(this.webRtcConfig.roomId)
    .valueChanges()
    .pipe(
      filter(room => typeof room !== 'undefined'),
      map(room => {
        console.warn('room', room);
        const peers = room?.peers
          .filter(peer => Boolean(peer.sdp))
          .map(peer => {
            const sdp =
              peer.sdp !== null ? (JSON.parse(peer.sdp) as RTCSessionDescription | null) : null;
            const processed: IRtcPeer = { ...peer, sdp };
            return processed;
          }) as IRtcPeer[];
        this.videoRoomPeers$.next(peers);
        return peers;
      }),
    );

  private readonly offerStream$ = this.videoRoomPeers$.pipe(
    filter(peers => peers.length === 1 && peers[0].sdp?.type === 'offer'),
    first(),
    tap(peers => {
      console.warn('offerStream, peer', peers[0]);
      this.peerConnection
        .setRemoteDescription(new RTCSessionDescription(peers[0].sdp ?? void 0))
        .then(() => this.peerConnection.createAnswer())
        .then(
          answer => {
            console.warn('answer', answer);
            return this.peerConnection.setLocalDescription(answer).then(() => {
              void this.sendVideoRoomAnswer(answer).subscribe();
            });
          },
          error => {
            console.error('error getting remote stream', error);
          },
        );
    }),
  );

  private readonly answerStream$ = this.videoRoomPeers$.pipe(
    filter(peers => peers.length === 1 + 1 && peers[1].sdp?.type === 'answer'),
    first(),
    tap(peers => {
      console.warn('answerStream, peer', peers[1]);
      if (peers[1].sdp?.type === 'answer') {
        this.peerConnection
          .setRemoteDescription(new RTCSessionDescription(peers[1].sdp ?? void 0))
          .then(
            () => void 0,
            error => {
              console.error('error getting remote stream', error);
            },
          );
      }
    }),
  );

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

  public sendChatMessage(): void {
    if (this.form.valid) {
      this.websocket.sockets.chat$.next(this.form.value);
    }
  }

  public sendVideoRoomOffer() {
    return this.videoRoomPeers$.pipe(
      first(),
      switchMap(peers => {
        console.warn('peers', peers);
        const existingPeers = [...(peers.length > 1 + 1 ? [] : peers)]
          .filter(peer => !(peer.type === 'offer' && peer.sender === this.webRtcConfig.senderId))
          .map(peer => {
            const sdp = peer.sdp !== null ? JSON.stringify(peer.sdp) : null;
            const processed: IRtcPeerDto = { ...peer, sdp };
            return processed;
          });
        console.warn('existingPeers', existingPeers);
        return from(
          this.firestore
            .collection<TFirestoreRooms>('rooms')
            .doc<IFirestoreRoom>(this.webRtcConfig.roomId)
            .update({
              peers: [
                ...existingPeers,
                {
                  sender: this.webRtcConfig.senderId,
                  type: 'offer',
                  sdp:
                    this.peerConnection.localDescription !== null
                      ? JSON.stringify(this.peerConnection.localDescription)
                      : null,
                },
              ],
            })
            .then(
              () => void 0,
              error => {
                console.error('sendVideoStreamMessage, error', error);
              },
            ),
        );
      }),
    );
  }

  public sendVideoRoomAnswer(answer: RTCSessionDescriptionInit) {
    return this.videoRoomPeers$.pipe(
      first(),
      switchMap(peers => {
        console.warn('peers', peers);
        const existingPeers = [...(peers.length > 1 + 1 ? [] : peers)]
          .filter(peer => !(peer.type === 'answer' && peer.sender === this.webRtcConfig.senderId))
          .map(peer => {
            const sdp = peer.sdp !== null ? JSON.stringify(peer.sdp) : null;
            const processed: IRtcPeerDto = { ...peer, sdp };
            return processed;
          });
        console.warn('existingPeers', existingPeers);
        return from(
          this.firestore
            .collection<TFirestoreRooms>('rooms')
            .doc<IFirestoreRoom>(this.webRtcConfig.roomId)
            .update({
              peers: [
                ...existingPeers,
                {
                  sender: this.webRtcConfig.senderId,
                  type: 'answer',
                  sdp: JSON.stringify(answer),
                },
              ],
            })
            .then(
              () => void 0,
              error => {
                console.error('sendVideoStreamMessage, error', error);
              },
            ),
        );
      }),
    );
  }

  public registerPeerConnectionListeners() {
    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      console.warn(`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
    });

    this.peerConnection.addEventListener('connectionstatechange', () => {
      console.warn(`Connection state change: ${this.peerConnection.connectionState}`);
    });

    this.peerConnection.addEventListener('signalingstatechange', () => {
      console.warn(`Signaling state change: ${this.peerConnection.signalingState}`);
    });

    this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
      console.warn(`ICE connection state change: ${this.peerConnection.iceConnectionState}`);
    });

    this.peerConnection.addEventListener('icecandidate', event => {
      console.warn(`onicecandidate: ${this.peerConnection.iceGatheringState}`, 'event', event);
    });

    this.peerConnection.addEventListener('track', event => {
      console.warn(`track: ${this.peerConnection.iceGatheringState}`, 'event', event);
    });

    this.peerConnection.addEventListener('ondatachannel', event => {
      console.warn(`ondatachannel: ${this.peerConnection.iceGatheringState}`, 'event', event);
    });
  }

  public joinRoom(roomId = this.webRtcConfig.roomId) {
    const roomRef = this.firestore.collection('rooms').doc(roomId);
    void from(roomRef.get())
      .pipe(
        filter(roomSnapshot => roomSnapshot.exists),
        first(),
        switchMap(roomSnapshot => {
          console.warn('Got room:', roomSnapshot);

          return from(
            this.peerConnection.createOffer().then(
              offer => this.peerConnection.setLocalDescription(offer),
              error => {
                console.error('Peer connection: Error creating offer', error);
              },
            ),
          );
        }),
        switchMap(offer => this.sendVideoRoomOffer()),
        map(() => {
          this.registerPeerConnectionListeners();

          const localStream = this.localVideoStream.value;
          const remoteStream = this.remoteVideoStream.value;

          localStream.getTracks().forEach(track => {
            this.peerConnection.addTrack(track, localStream);
          });

          // Code for collecting ICE candidates below

          // Code for collecting ICE candidates above

          this.peerConnection.addEventListener('track', event => {
            console.warn('Got remote track:', event.streams[0]);
            event.streams[0].getTracks().forEach(track => {
              console.warn('Add a track to the remoteStream:', track);
              remoteStream.addTrack(track);
            });
            this.remoteVideoStream.next(remoteStream);
          });

          // Code for creating SDP answer below

          // Code for creating SDP answer above

          // Listening for remote ICE candidates below

          // Listening for remote ICE candidates above
        }),
        switchMap(() => this.offerStream$),
        switchMap(() => this.answerStream$),
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
