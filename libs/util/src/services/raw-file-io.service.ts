import { Injectable } from '@angular/core';
import { from, fromEvent, Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  changeExtension,
  ElectronWindow,
  ElectronWindowApi,
  ERRORS,
  FILE_ENCODING_M3U8,
  FILE_ENCODING_M3U_WINDOWS,
  getExtensionFromEncoding,
  getPlaylistEncoding,
  htmlDownload,
  MyFile,
} from '../data';
import { PlaylistDir } from '../data/electron-bridge';
import { EncodingOptions } from '../store';

/** Do not use directly in components, user StateService instead */
@Injectable({ providedIn: 'root' })
export class RawFileIOService {
  public readonly settingsPath: string = 'settings';
  private electron: ElectronWindowApi | null = null;

  public get isElectron(): boolean {
    return !!this.electron;
  }

  constructor() {
    this.electron = (window as unknown as ElectronWindow).electron;
  }

  // ======================================================================== //
  // ============================= Filepaths ================================ //

  // ------------------------------------------------------------------------ //
  /**
   * * Electron - file dialog opens for user to select file
   * * Web - web prompts user for filename
   * @returns file path of a playlist
   */
  public getNewPlaylistFilePath(): Observable<string | null> {
    // console.log(`getDataFilePath()`);
    return this.electron
      ? from(this.electron.getNewPlaylistPath())
      : this.getNewPlaylistPathWeb();
  }

  private getNewPlaylistPathElectron(): Observable<string | null> {
    if (!this.electron) return throwError('Electron is not available!');
    return from(this.electron.getNewPlaylistPath()).pipe(
      map((p) => {
        // FIXME: Where/When to throw error?
        // if (!p) throw new Error(`"${p}" ${ERRORS.INVALID_PATH}`);
        return p;
      })
    );
  }

  private getNewPlaylistPathWeb(): Observable<string | null> {
    const name = prompt('Enter playlist name', 'New Playlist');
    return of(name ? `${name}.m3u8` : null);
  }

  // ------------------------------------------------------------------------ //
  /** @returns new file path of a file */
  public getMissingSongFilePath(oldPath: string): Observable<string | null> {
    return this.electron
      ? from(this.electron.getMissingSongPath(oldPath))
      : of(prompt('Enter new song path'), oldPath);
  }

  // ------------------------------------------------------------------------ //
  public convertPath(
    path: string,
    basedOnRelativePath: string,
    toRelative: boolean
  ): string {
    // console.log(`convertPath()`, path, basedOnRelativePath);
    return this.electron
      ? this.electron.convertPath(path, basedOnRelativePath, toRelative)
      : path;
  }

  // ------------------------------------------------------------------------ //
  public validateFilePath(path: string): Observable<boolean> {
    return this.electron
      ? from(this.electron.doesFilePathExist(path))
      : of(true);
  }

  // ------------------------------------------------------------------------ //
  public openPlaylistFolder(
    defaultPath?: string
  ): Observable<PlaylistDir | null> {
    return this.electron
      ? from(this.electron.openPlaylistFolder(defaultPath))
      : of(null);
  }

  // ======================================================================== //
  // ============================= Reads ==================================== //

  /** Gets file data from:
   * * FileReader - Html open file dialog
   * * Electron - file load
   * @param location system path OR local storage key in web mode
   * @param file file from file dialog
   */
  public readFile(
    args: {
      location: string;
      file?: File;
      isMediaFile?: boolean;
    } = { location: '', isMediaFile: false }
  ): Observable<string> {
    // console.log(`readFile() - `, args);
    return args.file
      ? this.readFileWeb(args.file, args.isMediaFile)
      : this.electron && location
      ? this.readFileElectron(args.location, args.isMediaFile)
      : of('');
  }

  private readFileElectron(
    path: string,
    isMediaFile = false
  ): Observable<string> {
    // console.log(`  readFileElectron() - `, path);
    if (!this.electron) return throwError('Electron is not available!');
    return from(this.electron.readFile(path)).pipe(
      // TODO: types
      switchMap((buffer) => {
        if (!buffer) {
          throw new Error(`${ERRORS.ANGULAR_NO_DATA} for "${path}"`);
        }
        const blob = new File([buffer], path);
        return this.readFileWeb(blob, isMediaFile);
      })
    );
  }

  /** @see https://developer.mozilla.org/en-US/docs/Web/API/FileReader/onload */
  private readFileWeb(f: File, isMediaFile = false): Observable<string> {
    // console.log(`  readFileWeb() - `, f, isMediaFile);
    const reader = new FileReader();
    if (isMediaFile === true) {
      // console.log(`  readFileWeb | readAsDataURL`);
      reader.readAsDataURL(f);
    } else {
      // console.log(`  readFileWeb | readAsText`);
      if (f.name.includes('.m3u8')) {
        reader.readAsText(f, FILE_ENCODING_M3U8);
      } else {
        reader.readAsText(f, FILE_ENCODING_M3U_WINDOWS);
      }
    }

    reader.onerror = () => {
      throw new Error(`Error occurred reading file: ${f.name}`);
    };

    return fromEvent<ProgressEvent<FileReader>>(reader, 'load').pipe(
      map((ev) => {
        if (!ev.target) {
          throw new Error(`${ERRORS.ANGULAR_NO_DATA} for "${f.name}"`);
        }
        const data = ev.target.result as string;
        // console.log(`DATA`, data);
        return data;
      })
    );
  }

  // ======================================================================== //
  // ============================= Writes =================================== //

  /** Writes file to
   * * Electron - os file system
   * @param location system path OR local storage key in web mode
   * @param fileContents data to save
   */
  public writeFile(
    location: string,
    fileContents: string,
    encodingSetting: EncodingOptions
  ): Observable<string> {
    // console.log(`writeFile() - `, location, fileContents, encodingSetting);
    const encoding: BufferEncoding =
      encodingSetting === EncodingOptions.original
        ? getPlaylistEncoding(location.toString())
        : encodingSetting;

    const path =
      encodingSetting === EncodingOptions.original
        ? location
        : changeExtension(location, getExtensionFromEncoding(encodingSetting));

    const file: MyFile = {
      path,
      data: fileContents,
      encoding,
    };
    return (
      this.electron ? this.writeFileElectron(file) : this.writeFileWeb(file)
    ).pipe(
      map(() => `${this.electron ? 'Saved to' : 'Downloaded'} ${file.path}`)
    );
  }

  private writeFileElectron(file: MyFile): Observable<void> {
    // console.log(`  writeFileElectron() - `, file);
    if (!this.electron) return throwError('Electron is not available!');
    return from(this.electron.writeFile(file));
  }

  private writeFileWeb(file: MyFile): Observable<void> {
    // console.log(`  writeFileWeb() - `, file);
    // const fileName = file.path.toString();
    return of(htmlDownload(file));
  }
}
