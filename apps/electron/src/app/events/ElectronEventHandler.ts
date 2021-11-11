import {
  ElectronWindowApiRendererEvents,
  FILE_ENCODING_M3U8,
  FILE_ENCODING_M3U_ASCII,
  FILE_FILTERS_MUSIC,
  FILE_FILTERS_PLAYLIST,
  MyFile,
} from '@plm/util';
import { dialog } from 'electron';
import { PathLike } from 'fs';
import { readFile, stat, writeFile } from 'fs/promises';
import { parse } from 'path';

import { environment } from '../../environments/environment';

/**
 * !Note: Make sure the Interface is up to date before adding more public methods! */
export class ElectronEventHandler implements ElectronWindowApiRendererEvents {
  public async readFile(path: string): Promise<Buffer> {
    if (!environment.production) {
      // console.log(`openFile() - `, path);
    }
    // const encode:BufferEncoding;
    const data = await readFile(path);
    return data;
  }

  public async writeFile(file: MyFile): Promise<void> {
    if (!environment.production) {
      // console.log(`writeFile() - `, file);
    }
    const encoding: BufferEncoding = file.path.toString().endsWith('.m3u8')
      ? FILE_ENCODING_M3U8
      : FILE_ENCODING_M3U_ASCII;
    const data = await writeFile(file.path, file.data, encoding);
    return data;
  }

  public doesFilePathExist(path: PathLike): Promise<boolean> {
    return stat(path)
      .then((stats) => stats.isFile())
      .catch((err) => false);
  }

  public async getNewPlaylistPath(): Promise<string | null> {
    if (!environment.production) {
      // console.log(`getSaveFilePath() - Show save dialog`);
    }
    const data = await dialog.showSaveDialog({
      title: 'New PLaylist',
      buttonLabel: 'Create Playlist',
      defaultPath: 'New Playlist',
      filters: FILE_FILTERS_PLAYLIST,
    });
    // Using / instead of \ is not recognized... -_-
    // return data && data.filePath ? slash(data.filePath) : null;
    return data && data.filePath ? data.filePath : null;
  }

  public async getSongPath(oldPath: string) {
    if (!environment.production) {
      // console.log(`getSongPath() - Show save dialog`);
    }
    // const data = await dialog.showSaveDialog({
    const data = await dialog.showOpenDialog({
      title: `Find missing song "${oldPath}"`,
      buttonLabel: 'Select Song',
      defaultPath: oldPath,
      filters: FILE_FILTERS_MUSIC,
    });
    if (data && data.filePaths && data.filePaths[0]) {
      const newPath = data.filePaths[0];
      const newPathParsed = parse(newPath);
      const oldPathParsed = parse(oldPath);
      if (newPathParsed.base !== oldPathParsed.base) {
        dialog.showErrorBox(
          `Song file doesn't match!`,
          `Selected song is different from precious song.\nOLD Song: ${oldPathParsed.base}\nNEW Song: ${newPathParsed.base}`
        );
        return null;
        // return (await this.showConfirmationDialog(
        //   oldPathParsed.base,
        //   newPathParsed.base
        // )) !== 0
        //   ? slash(newPath)
        //   : null;
      }
      // Using / instead of \ is not recognized... -_-
      // return slash(newPath);
      return newPath;
    }
    return null;
    // return data && data.filePath ? slash(data.filePath) : null;
    // return data && data.filePaths && data.filePaths[0]
    //   ? slash(data.filePaths[0])
    //   : null;
  }

  /**@returns 0 if canceled, 1 if accepted */
  private async showConfirmationDialog(
    oldBaseName: string,
    newBaseName: string
  ) {
    return (
      await dialog.showMessageBox({
        title: 'Confirm Song Rename',
        message: `Did you accidentally choose a different song or was the song renamed?\nOLD Song: ${oldBaseName}\nNEW Song: ${newBaseName}`,
        type: 'warning',
        buttons: ['Oops, Cancel', 'Yes, Rename it!'],
        defaultId: 0,
        cancelId: 0,
      })
    ).response;
  }
}
