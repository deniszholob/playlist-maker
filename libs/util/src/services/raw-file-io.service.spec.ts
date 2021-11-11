/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RawFileIoService } from './raw-file-io.service';

describe('Service: RawFileIo', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RawFileIoService]
    });
  });

  it('should ...', inject([RawFileIoService], (service: RawFileIoService) => {
    expect(service).toBeTruthy();
  }));
});
