// https://howtomake.software/blog/draggable-table-with-angular-cdk

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import {
  AppStoreService,
  IoService,
  PlaylistSong,
  PlaylistStoreService,
} from '@plm/util';

@Component({
  selector: 'plm-playlist',
  templateUrl: './playlist.component.html',
  // styleUrls: ['./playlist.component.scss'],
})
export class PlaylistComponent {
  public tableColumns = ['Action', 'Title', 'Duration', 'Album', 'Track'];
  public songs$ = this.playlistStoreService.getStoreSongs();

  constructor(
    private playlistStoreService: PlaylistStoreService,
    private appStoreService: AppStoreService,
    private ioService: IoService
  ) {}

  public fixSongPath(song: PlaylistSong) {
    // console.log(`fixSongPath`, song);
    this.ioService.fixPathsBasedOn(song.path).subscribe();
  }

  public onDeleteSong(i: number) {
    // console.log(`onDeleteSong`, i);
    const playlistState = this.playlistStoreService.getState();
    const currentSongs = [...playlistState.songData];
    currentSongs.splice(i, 1);
    this.playlistStoreService.setState({
      ...playlistState,
      songData: currentSongs,
    });
  }

  public onSelectSong(song: PlaylistSong) {
    // console.log(`onSelectSong`, song);
    const appstate = this.appStoreService.getState();
    this.appStoreService.setState({ ...appstate, selectedSong: song });
  }

  // Drag and drop
  public drop(event: CdkDragDrop<string[]>) {
    // console.log(`drop`, event);
    const playlistState = this.playlistStoreService.getState();
    // Rearrange the data in the array
    const currentSongs = [...playlistState.songData];
    moveItemInArray(currentSongs, event.previousIndex, event.currentIndex);
    // Publish a new version of the data into the datasource
    this.playlistStoreService.setState({
      ...playlistState,
      songData: currentSongs,
    });
  }
}
