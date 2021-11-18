import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ElectronWindow } from '../data';

import { AppStore, Page, Settings, SizeOptions } from './AppStore.model';
import { PlaylistSong } from './Playlist.model';
import { Store } from './Store';

@Injectable({
  providedIn: 'root',
})
export class AppStoreService extends Store<AppStore> {
  constructor() {
    const isElectron = !!(window as unknown as ElectronWindow).electron;
    super({
      openedFile: null,
      selectedSong: null,
      page: Page.landing,
      loading: false,
      unsavedChanges: false,
      isElectron,
      settings: {
        viewSize: SizeOptions.md,
        fontSize: SizeOptions.md,
        darkMode: true,
        relativePaths: isElectron,
        separator: '\\',
      },
    });
    console.debug('AppStoreService Init', this.getSnapshot());
  }

  // ============================== Selectors================================ //
  public getSelectedSong(): Observable<PlaylistSong | null> {
    return this.getStore().pipe(map((store) => store.selectedSong));
  }

  public getPage(): Observable<Page> {
    return this.getStore().pipe(map((store) => store.page));
  }

  public getSettings(): Observable<Settings> {
    return this.getStore().pipe(map((store) => store.settings));
  }

  // ============================== Actions ================================= //

  public setFile(openedFile: string | null) {
    // console.log(`setLoading`, loading);
    this.setState({
      ...this.getSnapshot(),
      openedFile,
      unsavedChanges: false,
    });
  }

  public setUnsavedChanges() {
    this.setState({
      ...this.getSnapshot(),
      unsavedChanges: true,
    });
  }

  public setSong(selectedSong: PlaylistSong | null) {
    // console.log(`selectedSong`, selectedSong);
    this.setState({
      ...this.getSnapshot(),
      selectedSong,
    });
  }

  public setPage(page: Page) {
    const store = this.getSnapshot();
    // console.log(`setPage`, page);
    this.setState({
      ...store,
      page,
      loading: false,
      openedFile: Page.landing ? null : store.openedFile,
      unsavedChanges: page === Page.landing ? false : store.unsavedChanges,
    });
  }

  public setLoading() {
    // console.log(`setLoading`, loading);
    this.setState({
      ...this.getSnapshot(),
      loading: true,
    });
  }

  public setSettings(settings: Partial<Settings>) {
    const state = this.getSnapshot();
    this.setState({
      ...state,
      settings: {
        ...state.settings,
        ...settings,
      },
    });
  }

  public setElectron(isElectron: boolean) {
    // console.log(`setLoading`, loading);
    this.setState({
      ...this.getSnapshot(),
      isElectron,
    });
  }
}
