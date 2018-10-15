import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import { EventEmitterService } from '../services/event-emitter.service';
import { CustomDeferredService } from '../services/custom-deferred.service';
import { ServerStaticDataService } from '../services/server-static-data.service';
import { PublicDataService } from '../services/public-data.service';
import { WebsocketService } from '../services/websocket.service';

import { UserService } from '../services/user.service';
import { UserAPIService } from '../services/user-api.service';

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
		private publicDataService: PublicDataService,
		private userService: UserService,
		private userAPIService: UserAPIService
	) {
		// console.log('this.el.nativeElement:', this.el.nativeElement);
	}

	/**
	 * Component subscriptions.
	 */
	private subscriptions: any[] = [];

	/**
	 * D3 chart view child reference.
	 */
	@ViewChild('canvas') private canvas: any;

	/**
	 * Application usage data.
	 */
	public appUsageData: any[] = [
		{ key: 'Default', y: 1 },
		{ key: 'Default', y: 1 },
		{ key: 'Default', y: 1 },
		{ key: 'Default', y: 1 },
		{ key: 'Default', y: 1 }
	];

	/**
	 * Draws chart.
	 * TODO update chart data
	 */
	public drawChart(): void {
		const context = this.canvas.nativeElement.getContext('2d');
		const width = this.canvas.nativeElement.width;
		const height = this.canvas.nativeElement.height;
		const radius = Math.min(width, height) / 2;

		const arc = d3.arc()
			.outerRadius(radius - 10)
			.innerRadius(0)
			.context(context);

		const labelArc = d3.arc()
			.outerRadius(radius - 40)
			.innerRadius(radius - 40)
			.context(context);

		const pie = d3.pie()
			.sort(null)
			.value((d) => d.y);

		context.translate(width / 2, height / 2);

		const arcs = pie(this.appUsageData);

		const colors = ['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'];

		arcs.forEach((d, i) => {
			context.beginPath();
			arc(d);
			context.fillStyle = colors[i < colors.length ? i : Math.ceil(i % colors.length)];
			context.fill();
		});

		context.beginPath();
		arcs.forEach(arc);
		context.strokeStyle = '#fff';
		context.stroke();

		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillStyle = '#000';
		arcs.forEach((d) => {
			const c = labelArc.centroid(d);
			context.fillText(d.data.key, c[0], c[1]);
		});
	}

	/**
	 * Server diagnostic data.
	 */
	public serverData: any = {
		static: [],
		dynamic: []
	};

	/**
	 * Websocket connection.
	 */
	private ws: WebSocket = new WebSocket(this.websocket.generateUrl('dynamicServerData'));

	/**
	 * UI error message.
	 */
	public errorMessage: string;

	/**
	 * Gets server static data.
	 */
	private getServerStaticData(): Promise<any> {
		const def = new CustomDeferredService<any>();
		this.serverStaticDataService.getData().subscribe(
			(data: any): void => {
				this.serverData.static = data;
				def.resolve(this.serverData.static);
			},
			(error: any): void => def.reject(error)
		);
		return def.promise;
	}
	/**
	 * Gets public data.
	 */
	private getPublicData(): Promise<any> {
		const def = new CustomDeferredService<any>();
		this.publicDataService.getData().subscribe(
			(data: any): void => {
				this.appUsageData = data;
				this.drawChart();
				def.resolve(this.appUsageData);
			},
			(error: any): void => def.reject(error)
		);
		return def.promise;
	}

	/**
	 * User status.
	 */
	public userStatus: any = {};

	/**
	 * Gets user status.
	 */
	private getUserStatus(): Promise<any> {
		const def = new CustomDeferredService<any>();
		this.userAPIService.getUserStatus().subscribe(
			(data: any) => {
				this.userStatus = data;
				const userModelUpdate: any = {
					status: data
				};
				this.userService.saveUser(userModelUpdate);
				def.resolve(data);
			},
			(error: string) => {
				def.reject(error);
			}
		);
		return def.promise;
	}

	/**
	 * Generates private/public RSA keys for a user.
	 */
	public generateKeypair(): void {
		this.emitter.emitSpinnerStartEvent();
		this.userAPIService.generateKeypair().subscribe(
			(data: any) => {
				this.getUserStatus().then(() => {
					this.emitter.emitSpinnerStopEvent();
				});
			},
			(error: string) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			}
		);
	}

	/**
	 * Indicates if modal should be displayed or not.
	 */
	public showModal: boolean = false;
	/**
	 * Toggles modal visibility.
	 */
	public toggleModal(): void {
		if (this.showModal) {
			this.ws.send(JSON.stringify({action: 'pause'}));
		} else { this.ws.send(JSON.stringify({action: 'get'})); }
		this.showModal = (!this.showModal) ? true : false;
	}

	public ngOnInit(): void {
		console.log('ngOnInit: AppSummaryComponent initialized');
		this.emitter.emitSpinnerStartEvent();

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

		const sub = this.emitter.getEmitter().subscribe((event: any) => {
			console.log('AppSummaryComponent consuming event:', event);
			if (event.websocket === 'close') {
				console.log('closing webcosket');
				this.ws.close();
			}
		});
		this.subscriptions.push(sub);

		this.getPublicData()
			.then(() => this.getServerStaticData())
			.then(() => this.getUserStatus())
			.then(() => {
				this.emitter.emitSpinnerStopEvent();
			})
			.catch((error: string) => {
				this.errorMessage = error;
				this.emitter.emitSpinnerStopEvent();
			});

	}
	public ngOnDestroy(): void {
		console.log('ngOnDestroy: AppSummaryComponent destroyed');
		this.ws.close();
		if (this.subscriptions.length) {
			for (const sub of this.subscriptions) {
				sub.unsubscribe();
			}
		}
	}
}
