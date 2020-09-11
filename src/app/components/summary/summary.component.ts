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
import { concatMap, tap } from 'rxjs/operators';

import { AppPublicDataService } from '../../services/public-data.service';
import { AppServerStaticDataService } from '../../services/server-static-data.service';
import { AppUserApiService } from '../../services/user-api.service';
import { AppUserService, IAppUser } from '../../services/user.service';
import { AppWebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSummaryComponent implements OnInit, OnDestroy {
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
   * Application usage data.
   */
  public appUsageData: { key: string; y: number }[] = [
    { key: 'Default', y: 1 },
    { key: 'Default', y: 1 },
    { key: 'Default', y: 1 },
    { key: 'Default', y: 1 },
    { key: 'Default', y: 1 },
  ];

  /**
   * Server diagnostic data.
   */
  public serverData: { static: Record<string, unknown>[]; dynamic: Record<string, unknown>[] } = {
    static: [],
    dynamic: [],
  };

  /**
   * User status.
   */
  public userStatus = {} as IAppUser['status'];

  /**
   * Indicates if modal should be displayed or not.
   */
  public showModal = false;

  /**
   * Websocket connection.
   */
  private ws: WebSocket = new WebSocket(this.websocket.generateUrl('dynamicServerData'));

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
        this.serverData.static = data;
      }),
    );
  }

  /**
   * Gets public data.
   */
  private getPublicData() {
    return this.publicDataService.getData().pipe(
      tap(data => {
        this.appUsageData = data;
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
        this.userStatus = data;
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
    if (this.showModal) {
      this.ws.send(JSON.stringify({ action: 'pause' }));
    } else {
      this.ws.send(JSON.stringify({ action: 'get' }));
    }
    this.showModal = !this.showModal ? true : false;
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
      this.serverData.dynamic = [];
      const data: Record<string, unknown>[] = JSON.parse(message.data);
      for (const item of data) {
        this.serverData.dynamic.push(item);
      }
      console.warn('this.serverData.dynamic:', this.serverData.dynamic);
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
