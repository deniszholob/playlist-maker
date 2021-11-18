import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import { ComponentsModule } from '@plm/components';
import {
  AppStoreService,
  FullSongData,
  IoService,
  Playlist,
  PlaylistSong,
} from '@plm/util';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'plm-playlist-validator',
  templateUrl: './playlist-validator.component.html',
  // styleUrls: ['./playlist-validator.component.scss'],
})
export class PlaylistValidatorComponent implements OnInit {
  public playlistsLoading = false;
  public playlists: Playlist[] = [];
  public invalidPlaylistSong: PlaylistSong | null;
  public invalidPlaylist: Playlist | null;
  public showInvalidOnly = true;
  public showOneAtATime = true;
  public currentStep = 0;
  public openedDir = '';
  public totalSongs = 0;
  public totalInvalidSongs = 0;
  public totalValidSongs = 0;
  public totalPlaylists = 0;
  public totalInvalidPlaylists = 0;
  public totalValidPlaylists = 0;

  constructor(
    private ioService: IoService,
    private appStoreService: AppStoreService
  ) {}

  ngOnInit() {
    this.openStep(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public openPlaylist(event?: Event) {
    this.playlistsLoading = true;
    this.ioService.openPlaylists().subscribe((pDir) => {
      // console.log(`openPlaylists`);
      this.playlistsLoading = false;
      if (pDir) {
        this.playlists = pDir.files;
        this.openedDir = pDir.dir;
        this.appStoreService.setFile(pDir.dir);
        // console.log(`playlists.length`, playlists.length);
        this.findNextInvalidPlaylistSong();
        if (this.invalidPlaylistSong) {
          this.openStep(2);
        }
      } else {
        // console.log('no playlists in folder');
        alert('no playlists in folder');
      }
    });
  }

  public fixSongPath(song: FullSongData) {
    // console.log(`fixSongPath`, song);

    this.ioService
      .fixPathsInPlaylistsBasedOn(song.path, this.playlists)
      .subscribe((fixedPlaylists) => {
        this.playlists = fixedPlaylists;
        this.appStoreService.setUnsavedChanges();
        this.findNextInvalidPlaylistSong();
        if (!this.invalidPlaylistSong) {
          this.openStep(3);
        }
        // console.log(`invalidPlaylist`, this.invalidPlaylist);
        // console.log(`invalidPlaylistSong`, this.invalidPlaylistSong);
      });
  }

  public showObject(validity: boolean) {
    // Always show if setting is off
    if (!this.showInvalidOnly) return true;
    // Setting on, so show based on opposite validity (invalid are shown, valid are hidden)
    return !validity;
  }

  public updateStats() {
    const invalidPlaylists = this.playlists.filter(
      (p) => p.validSongs < p.totalSongs
    );

    this.totalPlaylists = this.playlists.length;
    this.totalInvalidPlaylists = invalidPlaylists.length;
    this.totalValidPlaylists = this.totalPlaylists - this.totalInvalidPlaylists;

    this.totalSongs = this.playlists
      .map((p) => (p.songData ? p.songData.length : 0))
      .reduce((prev, curr) => prev + curr, 0);

    this.totalInvalidSongs = invalidPlaylists
      .map((p) =>
        p.songData ? p.songData.filter((s) => !s.validPath).length : 0
      )
      .reduce((prev, curr) => prev + curr, 0);

    this.totalValidSongs = this.totalSongs - this.totalInvalidSongs;
  }

  public findNextInvalidPlaylistSong() {
    // console.log(`findNextInvalidPlaylistSong`);
    this.updateStats();
    const invalidPlaylists = this.playlists.filter(
      (p) => p.validSongs < p.totalSongs
    );

    if (invalidPlaylists.length <= 0) {
      this.invalidPlaylist = null;
      this.invalidPlaylistSong = null;
      return;
    }
    this.invalidPlaylist = invalidPlaylists[0];
    const invalidSongs = this.invalidPlaylist.songData
      ? this.invalidPlaylist.songData.filter((s) => !s.validPath)
      : [];
    // console.log(`invalidSongs`, invalidSongs, invalidSongs.length);
    this.invalidPlaylistSong = invalidSongs.length > 0 ? invalidSongs[0] : null;
  }

  public openStep(n: number) {
    // console.log(`openStep`, n);
    const step2Valid = this.playlists && this.playlists.length > 0;
    const step3Valid = step2Valid && !this.invalidPlaylistSong;

    if (n === 1 || (n === 2 && step2Valid) || (n === 3 && step3Valid)) {
      this.currentStep = n;
    }
    if (n === 1) {
      this.appStoreService.setFile(null);
      this.playlists = [];
      this.openedDir = '';
    }
  }

  public saveAll() {
    // console.log(`Save All Playlists`);
    forkJoin(
      this.playlists.map((p) => {
        return this.ioService.exportPlaylist(
          p,
          this.appStoreService.getSnapshot().settings.relativePaths
        );
      })
    ).subscribe(
      (res) => {
        alert(res.toString().replace(/,/g, '\n'));
      },
      (err) => {
        alert('Error Saving Playlists');
        console.error(err);
      }
    );
  }
}

// =============================== Module =================================== //

@NgModule({
  imports: [CommonModule, ComponentsModule],
  declarations: [PlaylistValidatorComponent],
  exports: [PlaylistValidatorComponent],
})
export class PlaylistValidatorModule {}
