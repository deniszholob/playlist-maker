import { Component, OnInit } from '@angular/core';
import {
  FILE_ACCEPT_PLAYLIST,
  IoService,
  PlaylistStoreService,
} from '@plm/util';

@Component({
  selector: 'plm-maker-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public appTitle = 'Playlist Maker';
  public FILE_ACCEPT_PLAYLIST = FILE_ACCEPT_PLAYLIST;
  public playlistOpen = false;
  public songs$ = this.playlistStoreService.getStoreSongs();

  constructor(
    private playlistStoreService: PlaylistStoreService,
    private ioService: IoService
  ) {}

  ngOnInit(): void {
    this.playlistStoreService.getStore().subscribe((playlist) => {
      // console.log(`Playlist Store Update`, playlist);
      if (playlist && playlist.path) {
        this.playlistOpen = true;
      } else {
        this.playlistOpen = false;
      }
    });
  }

  public newPlaylist() {
    this.ioService.createNewPlaylist().subscribe();
  }

  public openPlaylist(openedFiles: File[]) {
    const playlistFile = openedFiles[0];
    this.ioService.readPlaylistData(playlistFile).subscribe();
  }

  public onClosePlaylist() {
    this.playlistStoreService.reset();
  }
}
