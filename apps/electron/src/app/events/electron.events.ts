/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { EVENT_CHANNELS } from '@plm/util';
import { app, ipcMain } from 'electron';

import { environment } from '../../environments/environment';
import { ElectronEventHandler } from './ElectronEventHandler';

export default class ElectronEvents {
  static bootstrapElectronEvents(): Electron.IpcMain {
    return ipcMain;
  }
}

const handler = new ElectronEventHandler();

ipcMain.handle(EVENT_CHANNELS.e_open_file, (event, arg) =>
  handler.readFile(arg)
);
ipcMain.handle(EVENT_CHANNELS.e_write_file, (event, arg) =>
  handler.writeFile(arg)
);
ipcMain.handle(EVENT_CHANNELS.e_get_new_playlist_path, () =>
  handler.getNewPlaylistPath()
);
ipcMain.handle(EVENT_CHANNELS.e_get_song_path, (event, arg) =>
  handler.getSongPath(arg)
);
ipcMain.handle(EVENT_CHANNELS.e_check_file_path, (event, arg) =>
  handler.doesFilePathExist(arg)
);

// Retrieve app version
ipcMain.handle('get-app-version', (event): string => {
  if (!environment.production) {
    console.log(`Fetching application version... [v${environment.version}]`);
  }
  return environment.version;
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
  app.exit(code);
});
