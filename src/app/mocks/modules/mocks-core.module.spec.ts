import { async, TestBed } from '@angular/core/testing';

import { MocksCoreModule } from './mocks-core.module';

describe('MocksCoreModule', () => {
  beforeEach(async(() => {
    void TestBed.configureTestingModule({
      imports: [MocksCoreModule],
    }).compileComponents();
  }));

  it('should be defined', () => {
    expect(MocksCoreModule).toBeDefined();
  });
});
