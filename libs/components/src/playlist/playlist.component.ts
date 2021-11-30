// https://howtomake.software/blog/draggable-table-with-angular-cdk

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AppStoreService,
  IoService,
  PlaylistSong,
  PlaylistStoreService,
} from '@plm/util';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'plm-playlist',
  templateUrl: './playlist.component.html',
  // styleUrls: ['./playlist.component.scss'],
})
export class PlaylistComponent implements OnInit, OnDestroy {
  public tableColumns = ['Action', 'Title', 'Duration', 'Album', 'Track'];
  public playlist = this.playlistStoreService.getSnapshot();
  public songs$ = this.playlistStoreService
    .getStoreSongs()
    .pipe(map((s) => (s ? s : [])));

  // Clear subscriptions when component is destroyed to prevent leaks
  private clearSubscriptions = new Subject();

  constructor(
    private playlistStoreService: PlaylistStoreService,
    private appStoreService: AppStoreService,
    private ioService: IoService
  ) {}

  ngOnInit(): void {
    this.playlistStoreService
      .getStore()
      .pipe(takeUntil(this.clearSubscriptions))
      .subscribe((pl) => {
        this.playlist = pl;
      });
  }

  ngOnDestroy(): void {
    this.clearSubscriptions.next();
    this.clearSubscriptions.complete();
  }

  public fixSongPath(song: PlaylistSong) {
    // console.log(`fixSongPath`, song);
    const playlist = this.playlistStoreService.getSnapshot();
    this.ioService
      .fixPathsInPlaylistBasedOn(song.path, playlist)
      .subscribe((playlist) => {
        this.playlistStoreService.setSongs(playlist.songData ?? []);
        this.appStoreService.setUnsavedChanges();
      });
  }

  public onDeleteSong(i: number) {
    // console.log(`onDeleteSong`, i);
    const playlistState = this.playlistStoreService.getSnapshot();
    const currentSongs = playlistState.songData
      ? [...playlistState.songData]
      : [];
    currentSongs.splice(i, 1);
    this.playlistStoreService.setSongs(currentSongs);
    this.appStoreService.setUnsavedChanges();
  }

  public onSelectSong(selectedSong: PlaylistSong) {
    // console.log(`onSelectSong`, song);
    this.appStoreService.setSong(selectedSong);
  }

  // Drag and drop
  public drop(event: CdkDragDrop<string[]>) {
    // console.log(`drop`, event);
    const playlistState = this.playlistStoreService.getSnapshot();
    // Rearrange the data in the array
    const currentSongs = playlistState.songData
      ? [...playlistState.songData]
      : [];
    moveItemInArray(currentSongs, event.previousIndex, event.currentIndex);
    // Publish a new version of the data into the datasource
    this.playlistStoreService.setSongs(currentSongs);
    this.appStoreService.setUnsavedChanges();
  }
}
