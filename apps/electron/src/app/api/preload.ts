import { ElectronWindowApi, EVENT_CHANNELS, MyFile } from '@plm/util';
import { contextBridge, ipcRenderer } from 'electron';
import { PathLike } from 'fs';
import { convertPath, homeFile } from './util';

const exportApi: ElectronWindowApi = {
  readFile: (path: string) =>
    ipcRenderer.invoke(EVENT_CHANNELS.e_open_file, path),
  writeFile: (file: MyFile) =>
    ipcRenderer.invoke(EVENT_CHANNELS.e_write_file, file),
  getNewPlaylistPath: () =>
    ipcRenderer.invoke(EVENT_CHANNELS.e_get_new_playlist_path),
  getSongPath: (oldPath: string) =>
    ipcRenderer.invoke(EVENT_CHANNELS.e_get_song_path, oldPath),
  doesFilePathExist: (path: PathLike) =>
    ipcRenderer.invoke(EVENT_CHANNELS.e_check_file_path, path),
  convertPath: convertPath,
  platform: process.platform,
  homeFile: homeFile,
};

contextBridge.exposeInMainWorld('electron', exportApi);
