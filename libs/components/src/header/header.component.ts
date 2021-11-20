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
  getFilesSelected,
  IoService,
  Playlist,
  PlaylistStoreService,
} from '@plm/util';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'plm-header',
  templateUrl: './header.component.html',
  // styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public renderRelativeSelection = true;
  public appSettings$: Observable<AppStore> = this.appStoreService.getStore();
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
    this.playlistStoreService
      .getStore()
      .pipe(takeUntil(this.clearSubscriptions))
      .subscribe((store: Playlist) => {
        this.playlistPath = store.path ?? '';
        this.haveSongs = store.totalSongs > 0;
        this.areSongsValid = store.validSongs === store.totalSongs;
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
    this.appStoreService.setSettings({ relativePaths });
  }

  /** @see https://stackoverflow.com/questions/58351711/angular-open-file-dialog-upon-button-click */
  public openFiles(event: Event): void {
    // console.log(`openFiles`, event);
    const files: File[] = getFilesSelected(event);
    this.areSongsLoading = true;
    this.appStoreService.setLoading();
    this.ioService
      .readAudioFilesData(files)
      .pipe(take(1))
      .subscribe(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        (err) => {
          console.error(err);
          alert(err);
        },
        () => {
          this.areSongsLoading = false;
          this.appStoreService.setLoading(false);
        }
      );
  }

  public save() {
    const playlist = this.playlistStoreService.getSnapshot();
    this.appStoreService.setLoading();
    this.ioService
      .exportPlaylist(
        playlist,
        this.appStoreService.getSnapshot().settings.relativePaths
      )
      .subscribe(
        (res) => {
          alert(res);
        },
        (err) => {
          console.error(err);
          alert('Error Saving Playlist');
        },
        () => {
          this.appStoreService.setLoading(false);
        }
      );
  }
}
