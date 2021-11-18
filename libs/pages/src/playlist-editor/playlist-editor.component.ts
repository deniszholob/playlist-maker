import { CommonModule } from '@angular/common';
import { Component, NgModule, OnDestroy, OnInit } from '@angular/core';
import { ComponentsModule } from '@plm/components';
import {
  AppStoreService,
  Page,
  PlaylistSong,
  PlaylistStoreService,
} from '@plm/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'plm-playlist-editor',
  templateUrl: './playlist-editor.component.html',
  // styleUrls: ['./playlist-editor.component.scss'],
})
export class PlaylistEditorComponent implements OnInit, OnDestroy {
  public songs: PlaylistSong[] = [];

  // Clear subscriptions when component is destroyed to prevent leaks
  private clearSubscriptions = new Subject();

  constructor(
    private playlistStoreService: PlaylistStoreService,
    private appStoreService: AppStoreService
  ) {}

  ngOnInit() {
    this.playlistStoreService
      .getStoreSongs()
      .pipe(takeUntil(this.clearSubscriptions))
      .subscribe((songs) => {
        this.songs = songs ? songs : [];
      });
  }

  ngOnDestroy(): void {
    this.clearSubscriptions.next();
    this.clearSubscriptions.complete();
  }

  public onClosePlaylist() {
    this.playlistStoreService.reset();
    this.appStoreService.setPage(Page.landing);
  }
}

// =============================== Module =================================== //

@NgModule({
  imports: [CommonModule, ComponentsModule],
  declarations: [PlaylistEditorComponent],
  exports: [PlaylistEditorComponent],
})
export class PlaylistEditorModule {}
