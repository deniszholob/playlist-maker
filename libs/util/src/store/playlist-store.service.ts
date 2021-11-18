import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FullSongData, Playlist, PlaylistSong } from './Playlist.model';
import { Store } from './Store';

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
    console.debug('PlaylistStoreService Init', this.getSnapshot());
  }

  // ============================== Selectors================================ //

  public getStoreSongs(): Observable<PlaylistSong[] | null> {
    return this.getStore().pipe(map((p) => p.songData));
  }

  // ============================== Actions ================================= //
  public setNew(playlist: Partial<Playlist>) {
    this.setState({
      path: null,
      songData: [],
      validated: false,
      totalSongs: 0,
      validSongs: 0,
      data: null,
      ...playlist,
    });
    // console.log(`new`, this.getSnapshot());
  }

  public reset() {
    this.setNew({});
    // console.log(`reset`, this.getSnapshot());
  }

  public setSongs(songData: FullSongData[], validated: boolean | null = null) {
    const state = this.getSnapshot();
    this.setState({
      ...state,
      songData: [...songData],
      totalSongs: this.getTotalSongs(songData),
      validSongs: this.getValidSongCount(songData),
      validated: validated !== null ? validated : state.validated,
    });
    // console.log(`setSongs`, this.getSnapshot());
  }

  // ============================== Util ==================================== //
  /** @deprecated // TODO: Move into a new Playlist Class? */
  public getTotalSongs(songs: PlaylistSong[]) {
    return songs.length;
  }
  /** @deprecated // TODO: Move into a new Playlist Class? */
  public getValidSongCount(songs: PlaylistSong[]): number {
    return songs.filter((s) => s.validPath).length;
  }
}
