import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AppStore, Playlist, PlaylistSong } from '../models';

// AKA "Model" or "State" or "Store"
export class Store<T> {
  // Observable source
  private _data: BehaviorSubject<T>;
  private data$: Observable<T>;

  constructor(initialData: Partial<T>) {
    // Create Observable stream
    this._data = new BehaviorSubject<T>(initialData as T);
    this.data$ = this._data.asObservable();
  }

  /** select */
  public getStore(): Observable<T> {
    return this.data$;
  }

  /** selectSnapshot */
  public getState(): T {
    return this._data.getValue();
  }

  public setState(d: T) {
    this._data.next(d);
  }
}

@Injectable({
  providedIn: 'root',
})
export class PlaylistStoreService extends Store<Playlist> {
  constructor() {
    super({
      validated: false,
      data: null,
      path: null,
      songData: [],
    });
  }

  public reset() {
    this.setState({
      validated: false,
      data: null,
      path: null,
      songData: [],
    });
  }

  public getStoreSongs(): Observable<PlaylistSong[]> {
    return this.getStore().pipe(map((p) => p.songData));
  }
}

@Injectable({
  providedIn: 'root',
})
export class AppStoreService extends Store<AppStore> {
  constructor() {
    super({ selectedSong: null, relativePaths: true, compactView: true });
  }
}
