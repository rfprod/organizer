/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { arc, DefaultArcObject, pie } from 'd3-shape';
import { BehaviorSubject } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';

import { AppPublicDataService } from '../../services/public-data.service';
import { AppServerStaticDataService } from '../../services/server-static-data.service';
import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService } from '../../services/user.service';
import { AppWebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
})
export class AppSummaryComponent implements OnInit, OnDestroy {
  public userStatus$ = this.userService.user$.pipe(map(user => user.status));

  private readonly showModal = new BehaviorSubject<boolean>(false);

  public readonly showModal$ = this.showModal.asObservable();

  /**
   * Application usage data.
   */
  private readonly appUsageData = new BehaviorSubject<{ key: string; y: number }[]>([
    { key: 'Default', y: 1 },
    { key: 'Default', y: 1 },
    { key: 'Default', y: 1 },
    { key: 'Default', y: 1 },
    { key: 'Default', y: 1 },
  ]);

  public readonly appUsageData$ = this.appUsageData.asObservable();

  /**
   * Server diagnostic data.
   */
  private readonly serverData = new BehaviorSubject<{
    static: Record<string, unknown>[];
    dynamic: Record<string, unknown>[];
  }>({
    static: [],
    dynamic: [],
  });

  public readonly serverData$ = this.serverData.asObservable();

  /**
   * Websocket connection.
   */
  private ws: WebSocket = new WebSocket(this.websocket.generateUrl('dynamicServerData'));

  constructor(
    private readonly websocket: AppWebsocketService,
    private readonly serverStaticDataService: AppServerStaticDataService,
    private readonly publicDataService: AppPublicDataService,
    private readonly userService: AppUserService,
    private readonly userAPIService: AppUserApiService,
  ) {}

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  /**
   * D3 chart view child reference.
   */
  @ViewChild('canvas') private readonly canvas: ElementRef<HTMLCanvasElement>;

  /**
   * Draws chart.
   * TODO update chart data
   */
  public drawChart(): void {
    const context = this.canvas.nativeElement.getContext('2d');
    if (context !== null) {
      const width = this.canvas.nativeElement.width;
      const height = this.canvas.nativeElement.height;
      const divisor = 2;
      const radius = Math.min(width, height) / divisor;

      const createArc = arc()
        .outerRadius(radius - 10)
        .innerRadius(0)
        .context(context);

      const createLabel = arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40)
        .context(context);

      const createPieChart = pie()
        .sort(null)
        .value(d => ((d as unknown) as { y: number }).y);

      context.translate(width / divisor, height / divisor);

      const arcs = createPieChart([0], this.appUsageData);

      const colors = ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'];

      arcs.forEach((d, i) => {
        context.beginPath();
        createArc((d as unknown) as DefaultArcObject);
        context.fillStyle = colors[i < colors.length ? i : Math.ceil(i % colors.length)];
        context.fill();
      });

      context.beginPath();
      arcs.forEach(d => createArc);
      context.strokeStyle = '#fff';
      context.stroke();

      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillStyle = '#000';
      arcs.forEach(d => {
        const c = createLabel.centroid((d as unknown) as DefaultArcObject);
        context.fillText(((d.data as unknown) as { key: string }).key, c[0], c[1]);
      });
    }
  }

  /**
   * Gets server static data.
   */
  private getServerStaticData() {
    return this.serverStaticDataService.getData().pipe(
      tap(data => {
        this.serverData.next({ static: [...data], dynamic: [...this.serverData.value.dynamic] });
      }),
    );
  }

  /**
   * Gets public data.
   */
  private getPublicData() {
    return this.publicDataService.getData().pipe(
      tap(data => {
        this.appUsageData.next(data);
        this.drawChart();
      }),
    );
  }

  /**
   * Gets user status.
   */
  private getUserStatus() {
    return this.userAPIService.getUserStatus().pipe(
      tap(data => {
        const userModelUpdate = {
          status: data,
        };
        this.userService.saveUser(userModelUpdate);
      }),
    );
  }

  /**
   * Generates private/public RSA keys for a user.
   */
  public generateKeypair(): void {
    void this.userAPIService
      .generateKeypair()
      .pipe(concatMap(() => this.getUserStatus()))
      .subscribe();
  }

  /**
   * Toggles modal visibility.
   */
  public toggleModal(): void {
    if (!this.showModal.value) {
      this.ws.send(JSON.stringify({ action: 'pause' }));
    } else {
      this.ws.send(JSON.stringify({ action: 'get' }));
    }
    this.showModal.next(!this.showModal.value);
  }

  public ngOnInit(): void {
    this.ws.onopen = (evt: Event): void => {
      console.warn('websocket opened:', evt);
      /*
       *	ws connection is established, but data is requested
       *	only when this.showModal switches to true, i.e.
       *	app diagnostics modal is visible to a user
       */
      // this.ws.send(JSON.stringify({action: 'get'}));
    };
    this.ws.onmessage = (message: { data: string }): void => {
      console.warn('websocket incoming message:', message);
      const dynamic = [];
      const data: Record<string, unknown>[] = JSON.parse(message.data);
      for (const item of data) {
        dynamic.push(item);
      }
      console.warn('dynamic:', dynamic);
      this.serverData.next({ dynamic, static: [...this.serverData.value.static] });
    };
    this.ws.onerror = (evt: Event): void => {
      console.warn('websocket error:', evt);
      this.ws.close();
    };
    this.ws.onclose = (evt: Event): void => {
      console.warn('websocket closed:', evt);
    };

    void this.getPublicData()
      .pipe(
        concatMap(() => this.getServerStaticData()),
        concatMap(() => this.getUserStatus()),
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.ws.close();
  }
}
