/* eslint-disable @typescript-eslint/no-explicit-any */

import { PathLike } from 'fs';
import { MyFile } from './ElectronFile.model';

/** Exposed Electron API to Angular in the preload Electron contextBridge */
export interface ElectronWindow {
  electron: ElectronWindowApi;
}

/** Electron IPC */
export interface ElectronWindowApiRendererEvents {
  readFile: (path: string) => Promise<Buffer>;
  writeFile: (file: MyFile) => Promise<void>;
  getNewPlaylistPath: () => Promise<string | null>;
  getSongPath: (oldPath: string) => Promise<string | null>;
  doesFilePathExist: (oldPath: PathLike) => Promise<boolean>;
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
