import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, from, of } from 'rxjs';
import { filter, first, map, mapTo, switchMap, tap } from 'rxjs/operators';

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

  public readonly webRtcConfig: {
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

  public readonly form = this.fb.group({
    sender: [`user-${this.webRtcConfig.senderId}`, Validators.compose([Validators.required])],
    text: ['', Validators.compose([Validators.required])],
  });

  public readonly roomRef$ = from(
    this.firestore.collection('rooms').doc(this.webRtcConfig.roomId).get(),
  ).pipe(
    filter(roomSnapshot => roomSnapshot.exists),
    first(),
  );

  private readonly peerConnection = new RTCPeerConnection(this.webRtcConfig.servers);

  private readonly localVideoStream = new BehaviorSubject<MediaStream>(new MediaStream());

  public readonly localVideoStream$ = this.localVideoStream.asObservable();

  private readonly remoteVideoStream = new BehaviorSubject<MediaStream>(new MediaStream());

  public readonly remoteVideoStream$ = this.remoteVideoStream.asObservable();

  private readonly videoRoomPeers = new BehaviorSubject<IRtcPeer[]>([]);

  public readonly videoRoomPeers$ = this.videoRoomPeers.asObservable();

  public readonly offers$ = this.videoRoomPeers$.pipe(
    map(peers =>
      peers.filter(item => item.type === 'offer' && item.sender !== this.webRtcConfig.senderId),
    ),
  );

  public readonly videoRoomPeersValueChanges = this.firestore
    .collection<TFirestoreRooms>('rooms')
    .doc<IFirestoreRoom>(this.webRtcConfig.roomId)
    .valueChanges()
    .pipe(
      filter(room => typeof room !== 'undefined'),
      map(room => {
        console.warn('videoRoomPeersValueChanges', room);
        const peers = room?.peers
          .filter(peer => Boolean(peer.sdp))
          .map(peer => {
            const sdp =
              peer.sdp !== null ? (JSON.parse(peer.sdp) as RTCSessionDescription | null) : null;
            const processed: IRtcPeer = { ...peer, sdp };
            return processed;
          }) as IRtcPeer[];
        this.videoRoomPeers.next(peers);
        return peers;
      }),
    );

  constructor(
    private readonly websocket: AppWebsocketService,
    private readonly translate: AppTranslateService,
    private readonly fb: FormBuilder,
    private readonly firestore: AngularFirestore,
    @Inject(NAVIGATOR) private readonly nav: TNavigator,
  ) {}

  public createOffer() {
    void this.roomRef$
      .pipe(
        filter(roomSnapshot => roomSnapshot.exists),
        first(),
        switchMap(roomSnapshot => {
          console.warn('Got room:', roomSnapshot);

          return this.sendVideoRoomOffer(roomSnapshot);
        }),
      )
      .subscribe();
  }

  public acceptOffer(peer: IRtcPeer) {
    void from(
      this.peerConnection.setRemoteDescription(new RTCSessionDescription(peer.sdp ?? void 0)),
    )
      .pipe(
        switchMap(() => from(this.peerConnection.createAnswer())),
        switchMap(answer => {
          console.warn('answer', answer);
          return from(this.peerConnection.setLocalDescription(answer)).pipe(mapTo(answer));
        }),
        switchMap(answer => this.sendVideoRoomAnswer(answer)),
      )
      .subscribe();
  }

  public sendChatMessage(): void {
    if (this.form.valid) {
      this.websocket.sockets.chat$.next(this.form.value);
    }
  }

  // eslint-disable-next-line max-lines-per-function
  public sendVideoRoomOffer(
    room: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>,
  ) {
    console.warn('sendVideoRoomOffer: room:', room);
    return this.videoRoomPeers$.pipe(
      first(),
      map(peers => {
        const existingPeers = [...(peers.length > 1 + 1 + 1 ? [] : peers)].map(peer => {
          const sdp = peer.sdp !== null ? JSON.stringify(peer.sdp) : null;
          const processed: IRtcPeerDto = { ...peer, sdp };
          return processed;
        });
        console.warn('sendVideoRoomOffer: existingPeers', existingPeers);
        const offerExists =
          typeof existingPeers.find(
            item => item.type === 'offer' && item.sender === this.webRtcConfig.senderId,
          ) !== 'undefined';
        console.warn('sendVideoRoomOffer: offerExists', offerExists);
        return { peers, existingPeers, offerExists };
      }),
      switchMap(({ peers, existingPeers, offerExists }) => {
        return from(
          this.peerConnection.createOffer().then(
            offer => this.peerConnection.setLocalDescription(offer),
            error => {
              console.error('Peer connection: Error creating offer', error);
            },
          ),
        ).pipe(mapTo({ peers, existingPeers, offerExists }));
      }),
      switchMap(({ peers, existingPeers, offerExists }) => {
        console.warn('sendVideoRoomOffer: peers', peers);
        return offerExists
          ? of(null)
          : from(
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
                  result => result,
                  error => {
                    console.error('sendVideoRoomOffer: error', error);
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
        console.warn('sendVideoRoomAnswer: peers', peers);
        const existingPeers = [...(peers.length > 1 + 1 + 1 ? [] : peers)]
          .filter(peer => !(peer.type === 'answer' && peer.sender === this.webRtcConfig.senderId))
          .map(peer => {
            const sdp = peer.sdp !== null ? JSON.stringify(peer.sdp) : null;
            const processed: IRtcPeerDto = { ...peer, sdp };
            return processed;
          });
        console.warn('sendVideoRoomAnswer: existingPeers', existingPeers);
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
                console.error('sendVideoRoomAnswer: error', error);
              },
            ),
        );
      }),
    );
  }

  public registerPeerConnectionListeners() {
    this.peerConnection.addEventListener('icegatheringstatechange', event => {
      console.warn(`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`, event);
    });

    this.peerConnection.addEventListener('connectionstatechange', event => {
      console.warn(`Connection state change: ${this.peerConnection.connectionState}`, event);
    });

    this.peerConnection.addEventListener('signalingstatechange', event => {
      console.warn(`Signaling state change: ${this.peerConnection.signalingState}`, event);
    });

    this.peerConnection.addEventListener('iceconnectionstatechange ', event => {
      console.warn(`ICE connection state change: ${this.peerConnection.iceConnectionState}`, event);
    });

    this.peerConnection.addEventListener('icecandidate', event => {
      console.warn(`ICE Candidate: ${this.peerConnection.iceConnectionState}`, event);
    });

    this.peerConnection.addEventListener('track', event => {
      console.warn(`Track, ${this.peerConnection.iceConnectionState}:`, event.streams[0]);
      const remoteStream = this.remoteVideoStream.value;
      event.streams[0].getTracks().forEach(track => {
        console.warn('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
      this.remoteVideoStream.next(remoteStream);
    });
  }

  public setupLocalStream(stream: MediaStream) {
    this.localVideoStream.next(stream);
    this.localVideoStream.value.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, this.localVideoStream.value);
    });
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
            this.setupLocalStream(stream);
            this.registerPeerConnectionListeners();
          },
          error => {
            console.error('getUserMedia error:', error);
          },
        );
      }
    }
  }
}
