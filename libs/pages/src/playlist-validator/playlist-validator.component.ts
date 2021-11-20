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
import { take } from 'rxjs/operators';

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
    this.appStoreService.setLoading();
    this.ioService
      .openPlaylists()
      .pipe(take(1))
      .subscribe(
        (pDir) => {
          // console.log(`openPlaylists`);
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
        },
        (err) => {
          console.error(err);
          alert(err);
        },
        () => this.appStoreService.setLoading(false)
      );
  }

  public fixSongPath(song: FullSongData) {
    // console.log(`fixSongPath`, song);
    this.appStoreService.setLoading();
    this.ioService
      .fixPathsInPlaylistsBasedOn(song.path, this.playlists)
      .pipe(take(1))
      .subscribe(
        (fixedPlaylists) => {
          this.playlists = fixedPlaylists;
          this.appStoreService.setUnsavedChanges();
          this.findNextInvalidPlaylistSong();
          if (!this.invalidPlaylistSong) {
            this.openStep(3);
          }
          // console.log(`invalidPlaylist`, this.invalidPlaylist);
          // console.log(`invalidPlaylistSong`, this.invalidPlaylistSong);
        },
        (err) => {
          console.error(err);
          alert(err);
        },
        () => this.appStoreService.setLoading(false)
      );
  }

  public showObject(validity: boolean) {
    // Always show if setting is off
    if (!this.showInvalidOnly) return true;
    // Setting on, so show based on opposite validity (invalid are shown, valid are hidden)
    return !validity;
  }

  private updateStats() {
    const prevValidSongCount = this.totalValidSongs;
    const prevValidPlaylistCount = this.totalValidPlaylists;

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

    const diffValidSongs = this.totalValidSongs - prevValidSongCount;
    const diffValidPlaylists =
      this.totalValidPlaylists - prevValidPlaylistCount;
    if (prevValidSongCount !== 0 && diffValidSongs > 0) {
      alert(
        `Corrected ${diffValidSongs} songs and ${diffValidPlaylists} playlists.`
      );
    }
  }

  private findNextInvalidPlaylistSong() {
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
    const step3Valid = step2Valid && this.totalValidSongs > 0;
    // const step3Valid = step2Valid && !this.invalidPlaylistSong;
    // console.log(step3Valid, this.totalValidSongs)
    if (n === 1 || (n === 2 && step2Valid) || (n === 3 && step3Valid)) {
      this.currentStep = n;
    }

    // TODO: Forces user to select new playlist, should it?
    if (n === 1) {
      this.appStoreService.setFile(null);
      this.playlists = [];
      this.openedDir = '';
      this.updateStats();
    }
  }

  public saveAll() {
    // console.log(`Save All Playlists`);
    this.savePlaylists(this.playlists);
  }

  public saveValidPlaylists() {
    // console.log(`Save Valid Playlists`);
    const validPlaylists = this.playlists.filter(
      (p) => p.totalSongs === p.validSongs
    );
    // console.log(validPlaylists.map((p) => p.path));
    this.savePlaylists(validPlaylists);
  }

  private savePlaylists(playlists: Playlist[]) {
    this.appStoreService.setLoading(false);
    forkJoin(
      playlists.map((p) => {
        return this.ioService.exportPlaylist(
          p,
          this.appStoreService.getSnapshot().settings.relativePaths
        );
      })
    )
      .pipe(take(1))
      .subscribe(
        (res) => {
          alert(res.toString().replace(/,/g, '\n'));
        },
        (err) => {
          console.error(err);
          alert('Error Saving Playlists');
        },
        () => this.appStoreService.setLoading(false)
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
