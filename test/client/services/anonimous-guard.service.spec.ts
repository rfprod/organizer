import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AnonimousGuard } from '../../../public/app/services/anonimous-guard.service';

import { UserService } from '../../../public/app/services/user.service';

import { DummyComponent } from '../mocks/index';

describe('AnonimousGuard', () => {

	beforeEach((done) => {
		TestBed.configureTestingModule({
			declarations: [ DummyComponent ],
			imports: [ RouterTestingModule.withRoutes([
				{path: '', component: DummyComponent, canActivate: [AnonimousGuard]},
			]) ],
			providers: [ UserService, AnonimousGuard ]
		}).compileComponents().then(() => {
			this.fixture = TestBed.createComponent(DummyComponent);
			this.component = this.fixture.componentInstance;
			this.userService = TestBed.get(UserService);
			this.service = TestBed.get(AnonimousGuard);
			done();
		});
	});

	it('should be defined', () => {
		expect(this.service).toBeDefined();
	});

	it('should have variables and methods defined', () => {
		expect(this.service.canActivate).toBeDefined();
	});

	it('canActivate should resolve to true if token does not exist in UserService', () => {
		this.userService.saveUser({token: 'a.a'});
		expect(this.service.canActivate()).toBeFalsy();

		this.userService.saveUser({token: ''});
		expect(this.service.canActivate()).toBeTruthy();
	});

});
