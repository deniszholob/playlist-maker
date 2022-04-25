import { Component, OnInit } from '@angular/core';
import { AppStoreService, Page, PlaylistStoreService } from '@plm/util';

import packageJson from 'package.json';

@Component({
  selector: 'plm-maker-root',
  templateUrl: './app.component.html',
  // styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public appVersion: string = packageJson.version;
  public Page = Page;
  public app = this.appStoreService.getSnapshot();
  public settingsOpen = false;
  public loading = false;

  constructor(
    private appStoreService: AppStoreService,
    private playlistStoreService: PlaylistStoreService
  ) {}

  ngOnInit(): void {
    this.appStoreService.getStore().subscribe((appStore) => {
      this.app = appStore;
      this.loading = appStore.loading;
    });
  }

  public goHome() {
    if (this.app.unsavedChanges) {
      const userAction = confirm(
        `You have unsaved changes!\nClicking "Ok" will discard them!\nAre you sure you want to navigate away?`
      );
      if (!userAction) return;
    }
    this.appStoreService.setPage(Page.landing);
    this.playlistStoreService.reset();
  }

  public toggleSettings() {
    // console.log(`toggleSettings`);
    this.settingsOpen = !this.settingsOpen;
  }
}
