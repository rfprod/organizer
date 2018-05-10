import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import { EventEmitterService } from '../services/event-emitter.service';
import { ServerStaticDataService } from '../services/server-static-data.service';
import { PublicDataService } from '../services/public-data.service';
import { WebsocketService } from '../services/websocket.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/first';

declare let d3: any;

@Component({
	selector: 'app-summary',
	templateUrl: '/public/app/views/app-summary.html',
	host: {
		class: 'mat-body-1'
	}
})
export class AppSummaryComponent implements OnInit, OnDestroy {
	constructor(
		private el: ElementRef,
		private emitter: EventEmitterService,
		private websocket: WebsocketService,
		private serverStaticDataService: ServerStaticDataService,
		private publicDataService: PublicDataService
	) {
		console.log('this.el.nativeElement:', this.el.nativeElement);
	}
	private ngUnsubscribe: Subject<void> = new Subject();
	public title: string = 'Password Manager';
	public description: string = 'Encrypted passwords storage';
	public chartOptions: object = {
		chart: {
			type: 'pieChart',
			height: 450,
			donut: true,
			x: (d) => d.key,
			y: (d) => d.y,
			showLabels: true,
			labelSunbeamLayout: false,
			pie: {
				startAngle: (d) => d.startAngle / 2 - Math.PI / 2,
				endAngle: (d) => d.endAngle / 2 - Math.PI / 2,
			},
			duration: 1000,
			title: 'user sessions',
			legend: {
				margin: {
					top: 5,
					right: 140,
					bottom: 5,
					left: 0,
				},
			},
		},
	};
	public appUsageData: any[] = [
		{
			key: 'Default',
			y: 1,
		},
		{
			key: 'Default',
			y: 1,
		},
		{
			key: 'Default',
			y: 1,
		},
		{
			key: 'Default',
			y: 1,
		},
		{
			key: 'Default',
			y: 1,
		}
	];
	public serverData: any = {
		static: [],
		dynamic: [],
	};
	private wsEndpoint: string = '/api/app-diag/dynamic';
	private ws: WebSocket = new WebSocket(this.websocket.generateUrl(this.wsEndpoint));
	public errorMessage: string;
	private getServerStaticData(callback): void {
		this.serverStaticDataService.getData().first().subscribe(
			(data: any): void => this.serverData.static = data,
			(error: any): void => this.errorMessage = error as any,
			() => {
				console.log('getServerStaticData done, data:', this.serverData.static);
				callback(this.serverData.static);
			}
		);
	}
	private getPublicData(callback): void {
		this.publicDataService.getData().first().subscribe(
			(data: any): void => {
				this.nvd3.clearElement();
				this.appUsageData = data;
			},
			(error: any): void => this.errorMessage = error as any,
			(): void => {
				console.log('getPublicData done, data:', this.appUsageData);
				callback(this.appUsageData);
			}
		);
	}

	public showModal: boolean = false;
	public toggleModal(): void {
		if (this.showModal) {
			this.ws.send(JSON.stringify({action: 'pause'}));
		} else { this.ws.send(JSON.stringify({action: 'get'})); }
		this.showModal = (!this.showModal) ? true : false;
	}

	@ViewChild ('chart') private nvd3: any;

	public ngOnInit(): void {
		console.log('ngOnInit: AppSummaryComponent initialized');
		this.emitter.emitSpinnerStartEvent();
		this.emitter.emitEvent({appInfo: 'show'});

		this.ws.onopen = (evt: any): void => {
			console.log('websocket opened:', evt);
			/*
			*	ws connection is established, but data is requested
			*	only when this.showModal switches to true, i.e.
			*	app diagnostics modal is visible to a user
			*/
			// this.ws.send(JSON.stringify({action: 'get'}));
		};
		this.ws.onmessage = (message: any): void => {
			console.log('websocket incoming message:', message);
			this.serverData.dynamic = [];
			const data: any = JSON.parse(message.data);
			for (const d in data) {
				if (data[d]) { this.serverData.dynamic.push(data[d]); }
			}
			console.log('this.serverData.dynamic:', this.serverData.dynamic);
		};
		this.ws.onerror = (evt: any): void => {
			console.log('websocket error:', evt);
			this.ws.close();
		};
		this.ws.onclose = (evt: any): void => {
			console.log('websocket closed:', evt);
		};

		this.emitter.getEmitter().takeUntil(this.ngUnsubscribe).subscribe((message: any) => {
			console.log('/intro consuming event:', message);
			if (message.websocket === 'close') {
				console.log('closing webcosket');
				this.ws.close();
			}
		});

		this.getPublicData((/*publicData*/) => {
			this.getServerStaticData((/*serverStaticData*/) => {
				this.emitter.emitSpinnerStopEvent();
			});
		});

	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppSummaryComponent destroyed');
		this.ngUnsubscribe.next();
		this.ngUnsubscribe.complete();
		this.ws.close();
	}
}
