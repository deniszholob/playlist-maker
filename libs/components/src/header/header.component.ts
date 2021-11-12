import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AppStore,
  AppStoreService,
  FILE_ACCEPT_MUSIC,
  IoService,
  Playlist,
  PlaylistStoreService,
} from '@plm/util';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'plm-header',
  templateUrl: './header.component.html',
  // styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public renderRelativeSelection = true;
  public appSettings$: Observable<AppStore> = this.appStoreService.getStore();
  public relativePaths: boolean;
  public filesAccepted = FILE_ACCEPT_MUSIC;
  public playlistPath = '';
  public haveSongs = false;
  public areSongsValid = false;
  public areSongsLoading = false;

  // Clear subscriptions when component is destroyed to prevent leaks
  private clearSubscriptions = new Subject();

  @Output()
  public closePlaylist = new EventEmitter();

  constructor(
    private ioService: IoService,
    private playlistStoreService: PlaylistStoreService,
    private appStoreService: AppStoreService
  ) {}

  ngOnInit() {
    this.appSettings$
      .pipe(takeUntil(this.clearSubscriptions))
      .subscribe((settings: AppStore) => {
        this.relativePaths = settings.relativePaths;
      });

    this.playlistStoreService
      .getStore()
      .pipe(takeUntil(this.clearSubscriptions))
      .subscribe((store: Playlist) => {
        this.playlistPath = store.path;
        this.haveSongs = store.songData && store.songData.length > 0;
        this.areSongsValid = this.haveSongs
          ? store.songData
              .map((song) => song.validPath)
              .reduce((prev, curr) => prev && curr)
          : false;
      });
  }

  ngOnDestroy(): void {
    this.clearSubscriptions.next();
    this.clearSubscriptions.complete();
  }

  public onClosePlaylist() {
    // console.log('closePlaylist');
    this.closePlaylist.next();
  }

  public updatePaths(relativePaths: boolean) {
    this.appStoreService.setState({
      ...this.appStoreService.getState(),
      relativePaths,
    });
  }

  /** @see https://stackoverflow.com/questions/58351711/angular-open-file-dialog-upon-button-click */
  public openFiles(event: Event): void {
    // console.log(`openFiles`, event);

    if (event.target instanceof HTMLInputElement) {
      const fileList: FileList = event.target.files;
      const files: File[] = Array.from(fileList);

      this.areSongsLoading = true;
      this.ioService.readAudioFilesData(files).subscribe(
        () => (this.areSongsLoading = false),
        () => (this.areSongsLoading = false)
      );
      return;
    }

    throw new Error(
      `Invalid ${typeof event} event, should be HTMLInputElement`
    );
  }

  public save() {
    this.ioService.exportPlaylist(this.relativePaths).subscribe(
      (res) => {
        alert(res);
      },
      (err) => {
        alert('Error Saving Playlist');
        console.error(err);
      }
    );
  }
}
