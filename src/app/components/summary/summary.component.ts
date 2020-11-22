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
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { arc, pie, PieArcDatum } from 'd3-shape';
import { BehaviorSubject } from 'rxjs';
import { concatMap, map, tap } from 'rxjs/operators';
import { getRandomColor } from 'src/app/utils/ui.utils';

import { AppTranslateService } from '../../modules/translate/translate.service';
import { AppPublicDataService } from '../../services/public-data.service';
import { AppServerStaticDataService } from '../../services/server-static-data.service';
import { AppUserService } from '../../services/user.service';
import { AppUserApiService } from '../../services/user-api.service';
import { AppWebsocketService } from '../../services/websocket.service';

interface IChartDataNode {
  key: string;
  y: number;
}

@UntilDestroy()
@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSummaryComponent implements OnInit, OnDestroy {
  public userStatus$ = this.userService.user$.pipe(map(user => user.status));

  private readonly showModal = new BehaviorSubject<boolean>(false);

  public readonly showModal$ = this.showModal.asObservable();

  /**
   * Application usage data.
   */
  private readonly appUsageData = new BehaviorSubject<IChartDataNode[]>([
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
  private readonly ws = this.websocket.sockets.dynamicServerData$.pipe(
    tap(
      message => {
        const dynamic = [];
        const data: Record<string, unknown>[] = message as { name: string; value: number }[];
        for (const item of data) {
          dynamic.push(item);
        }
        this.serverData.next({ dynamic, static: [...this.serverData.value.static] });
      },
      error => {
        console.warn('socket$, error', error);
      },
      () => console.warn('socket$, completed'),
    ),
  );

  public readonly language$ = this.translate.language$;

  constructor(
    private readonly websocket: AppWebsocketService,
    private readonly serverStaticDataService: AppServerStaticDataService,
    private readonly publicDataService: AppPublicDataService,
    private readonly userService: AppUserService,
    private readonly userApiService: AppUserApiService,
    private readonly translate: AppTranslateService,
  ) {}

  @HostBinding('class.mat-body-1') protected matBody1 = true;

  /**
   * D3 chart view child reference.
   */
  @ViewChild('canvas') private readonly canvas!: ElementRef<HTMLCanvasElement>;

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

      const createArc = arc<PieArcDatum<IChartDataNode>>()
        .outerRadius(radius - 10)
        .innerRadius(50)
        .context(context);

      const createLabel = arc<PieArcDatum<IChartDataNode>>()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40)
        .context(context);

      const createPieChart = pie<IChartDataNode>().value(datum => datum.y);

      context.translate(width / divisor, height / divisor);

      const arcs = createPieChart(
        this.appUsageData.value.concat([{ key: 'aaa', y: new Date().getTime() % 160000000 }]),
      );

      arcs.forEach((datum, i) => {
        context.fillStyle = getRandomColor();
        context.beginPath();
        createArc(datum);
        context.closePath();
        context.fill();
      });

      arcs.forEach(datum => {
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#000';
        const c = createLabel.centroid(datum);
        context.fillText(datum.data.key, c[0], c[1]);
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
    return this.userApiService.getUserStatus().pipe(
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
  public generateKeypair(encryptionEnabled = true): void {
    if (!encryptionEnabled) {
      void this.userApiService
        .generateKeypair()
        .pipe(concatMap(() => this.getUserStatus()))
        .subscribe();
    }
  }

  public ngOnInit(): void {
    void this.ws.pipe(untilDestroyed(this)).subscribe();
    void this.getPublicData()
      .pipe(
        concatMap(() => this.getServerStaticData()),
        concatMap(() => this.getUserStatus()),
        tap(() => {
          this.websocket.sockets.dynamicServerData$.next({ action: 'get' });
        }),
      )
      .subscribe();
  }

  public ngOnDestroy() {
    this.websocket.sockets.dynamicServerData$.next({ action: 'pause' });
  }
}
