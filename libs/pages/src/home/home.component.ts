import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ComponentsModule } from '@plm/components';
import {
  AppStoreService,
  FILE_ACCEPT_PLAYLIST,
  IoService,
  Page,
  PlaylistStoreService,
} from '@plm/util';

@Component({
  selector: 'plm-home',
  templateUrl: './home.component.html',
  // styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public appTitle = 'Playlist Maker';
  public playlistOpen = false;
  public FILE_ACCEPT_PLAYLIST = FILE_ACCEPT_PLAYLIST;
  public appStore$ = this.appStoreService.getStore();

  constructor(
    private ioService: IoService,
    private appStoreService: AppStoreService,
    private playlistStoreService: PlaylistStoreService
  ) {}

  ngOnInit() {
    console.log();
  }

  public fixPlaylists() {
    this.appStoreService.setPage(Page.pValidate);
  }

  public newPlaylist() {
    this.appStoreService.setLoading();
    this.ioService.createNewPlaylist().subscribe((playlist) => {
      this.appStoreService.setPage(Page.pEdit);
      this.appStoreService.setFile(playlist.path);
    });
  }

  public openPlaylist(openedFiles: File[]) {
    const playlistFile = openedFiles[0];
    this.ioService
      .readPlaylistData(null, playlistFile)
      .subscribe((playlist) => {
        this.playlistStoreService.setNew(playlist);
        this.appStoreService.setPage(Page.pEdit);
        this.appStoreService.setFile(playlist.path);
      });
  }
}

// =============================== Module =================================== //

@NgModule({
  imports: [CommonModule, ComponentsModule],
  declarations: [HomeComponent],
  exports: [HomeComponent],
})
export class HomeModule {}
