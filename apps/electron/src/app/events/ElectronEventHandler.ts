import {
  ElectronWindowApiRendererEvents,
  FILE_ACCEPT_PLAYLIST,
  FILE_FILTERS_MUSIC,
  FILE_FILTERS_PLAYLIST,
  MyFile,
  PlaylistDir,
  slash,
} from '@plm/util';
import { dialog } from 'electron';
// import { PathLike } from 'fs';
import { readdir, readFile, stat, writeFile } from 'fs/promises';
import { parse, resolve } from 'path';
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
    const data = await writeFile(file.path, file.data, file.encoding);
    return data;
  }

  public doesFilePathExist(path: string): Promise<boolean> {
    return stat(path)
      .then((stats) => stats.isFile())
      .catch(() => false);
  }

  public async openPlaylistFolder(
    defaultPath?: string
  ): Promise<PlaylistDir | null> {
    const data = await dialog.showOpenDialog({
      title: 'Select Playlist Folder',
      buttonLabel: 'Select Folder',
      defaultPath,
      properties: ['openDirectory'],
    });
    if (data && data.filePaths && data.filePaths[0]) {
      const playlistPath = data.filePaths[0];
      const dirObjects = await readdir(playlistPath, { withFileTypes: true });
      const files = await dirObjects
        // Filter out folders
        .filter((obj) => obj.isFile())
        // Filter out unsupported file extensions
        .filter((obj) =>
          FILE_ACCEPT_PLAYLIST.split(',')
            .map((ext) => obj.name.endsWith(ext))
            .reduce((prev, curr) => prev || curr)
        )
        // Get file path
        .map((file) => slash(resolve(playlistPath, file.name)));
      return { dir: playlistPath, files };
    }
    return null;
  }

  public async getNewPlaylistPath(): Promise<string | null> {
    if (!environment.production) {
      // console.log(`getSaveFilePath() - Show save dialog`);
    }
    const data = await dialog.showSaveDialog({
      title: 'New Playlist',
      buttonLabel: 'Create Playlist',
      defaultPath: 'New Playlist',
      filters: FILE_FILTERS_PLAYLIST,
    });
    // Using / instead of \ is not recognized... -_-
    return data && data.filePath ? slash(data.filePath) : null;
    // return data && data.filePath ? data.filePath : null;
  }

  public async getMissingSongPath(oldPath: string) {
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
        // // Fail on unmatched song selection
        // dialog.showErrorBox(
        //   `Song file doesn't match!`,
        //   `Selected song is different from precious song.\nOLD Song: ${oldPathParsed.base}\nNEW Song: ${newPathParsed.base}`
        // );
        // return null;

        // Prompt on unmatched song selection (0 = cancel)
        const response = await this.showConfirmationDialog(
          oldPathParsed.base,
          newPathParsed.base
        );
        // console.log(response);
        return response !== 0 ? slash(newPath) : null;
      }
      // Using / instead of \ is not recognized... -_-
      return slash(newPath);
      // return newPath;
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
        title: 'Confirm Song',
        message: `Selected song name doesn't seem to match.\nDid you mean to replace this song with the new selection?\nOLD Song: ${oldBaseName}\nNEW Song: ${newBaseName}`,
        type: 'warning',
        buttons: ['Oops, Cancel', 'Yes, Replace it!'],
        defaultId: 0,
        cancelId: 0,
      })
    ).response;
  }
}
