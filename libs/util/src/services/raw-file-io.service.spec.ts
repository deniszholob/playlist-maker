/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { RawFileIOService } from './raw-file-io.service';

describe('RawFileIOService', () => {
  let service: RawFileIOService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RawFileIOService],
    });
    service = TestBed.inject(RawFileIOService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
