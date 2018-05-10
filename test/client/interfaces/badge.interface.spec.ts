import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { DummyComponent } from '../../../test/client/mocks/components/dummy.component.mock';

import { IBadge } from '../../../public/app/interfaces/badge.interface';

describe('IBadge', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ DummyComponent ],
			imports: [ BrowserDynamicTestingModule, NoopAnimationsModule ],
			providers: [],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(DummyComponent);
			this.component = this.fixture.componentInstance;
			this.instanceOfIBadge = (obj: any): obj is IBadge => 'title' in obj && 'link' in obj && 'img' in obj;
			expect(this.component).toBeDefined();
			done();
		});
	});

	it('should have specific properties', () => {
		const a: IBadge = {
			title: '',
			link: '',
			img: ''
		};
		this.component.sample = a;
		expect(this.instanceOfIBadge(this.component.sample)).toBeTruthy();
	});

});
