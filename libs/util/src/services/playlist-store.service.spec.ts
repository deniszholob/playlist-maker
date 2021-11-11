/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PlaylistStoreService } from './playlist-store.service';

describe('Service: PlaylistStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlaylistStoreService]
    });
  });

  it('should ...', inject([PlaylistStoreService], (service: PlaylistStoreService) => {
    expect(service).toBeTruthy();
  }));
});
