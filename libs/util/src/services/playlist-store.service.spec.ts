/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import {
  AppStoreService,
  PlaylistStoreService,
} from './playlist-store.service';

describe('PlaylistStoreService', () => {
  let service: PlaylistStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlaylistStoreService],
    });
    service = TestBed.inject(PlaylistStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

describe('AppStoreService', () => {
  let service: AppStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppStoreService],
    });
    service = TestBed.inject(AppStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
