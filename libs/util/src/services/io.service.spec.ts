/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { IoService } from './io.service';

describe('IoService', () => {
  let service: IoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IoService],
    });
    service = TestBed.inject(IoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
