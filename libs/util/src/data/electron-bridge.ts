// import { PathLike } from 'fs';

/** Exposed Electron API to Angular in the preload Electron contextBridge */
export interface ElectronWindow {
  electron: ElectronWindowApi;
}

/** Events for Electron IPC */
export enum EVENT_CHANNELS {
  e_open_file_dialog = 'electron-open-file-dialog',
  e_open_folder_dialog = 'electron-open-folder-dialog',
  e_get_new_playlist_path = 'electron-get-new-playlist-path',
  e_get_song_path = 'electron-get-song-path',
  e_open_file = 'electron-open-file',
  e_write_file = 'electron-write-file',
  e_check_file_path = 'electron-check-file-path',
  e_open_playlist_folder = 'electron-open-playlist-folder',

  ng_selected_save_file = 'angular-selected-save-file',
  ng_selected_files = 'angular-selected-files',
  ng_selected_directory = 'angular-selected-directory',
  ng_write_file_result = 'angular-write-file-result',

  fileOpenedApp = 'fileOpenedApp',
}

/** Electron IPC */
export interface ElectronWindowApiRendererEvents {
  readFile: (path: string) => Promise<Buffer>;
  writeFile: (file: MyFile) => Promise<void>;
  openPlaylistFolder: (defaultPath?: string) => Promise<PlaylistDir | null>;
  getNewPlaylistPath: () => Promise<string | null>;
  getMissingSongPath: (oldPath: string) => Promise<string | null>;
  doesFilePathExist: (oldPath: string) => Promise<boolean>;
}

/** Exposed Electron API to Angular in the preload Electron contextBridge */
export interface ElectronWindowApi extends ElectronWindowApiRendererEvents {
  platform: string;
  homeFile: (path: string) => string;
  convertPath: (
    path: string,
    basedOnRelativePath: string,
    toRelative: boolean
  ) => string;
}

export interface MyFile {
  path: string;
  data: string;
  encoding: BufferEncoding;
}

export interface PlaylistDir {
  dir: string;
  files: string[];
}
