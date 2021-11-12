import { Injectable } from '@angular/core';
import { from, fromEvent, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ERRORS,
  FILE_ENCODING_M3U8,
  FILE_ENCODING_M3U_WINDOWS,
  htmlDownload,
} from '../data';
import { ElectronWindow, ElectronWindowApi, MyFile } from '../models';

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

  /** Returns filepath to use
   * * Electron - file dialog opens for user to select file
   * * Web - default key is returned
   */
  public getNewPlaylistFilePath(): Observable<string | null> {
    // console.log(`getDataFilePath()`);
    return this.electron
      ? from(this.electron.getNewPlaylistPath()).pipe(
          map((p) => {
            // FIXME: Where/When to throw error?
            // if (!p) throw new Error(`"${p}" ${ERRORS.INVALID_PATH}`);
            return p;
          })
        )
      : of(this.getNewPlaylistPathWeb());
  }

  public getNewPlaylistPathWeb(): string | null {
    const name = prompt('Enter playlist name', 'New Playlist');
    return name ? `${name}.m3u8` : null;
  }

  public getMissingSongFilePath(oldPath: string) {
    return this.electron
      ? from(this.electron.getMissingSongPath(oldPath))
      : of(prompt('Enter new song path'), oldPath);
  }

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

  public validateFilePath(path: string): Observable<boolean> {
    return this.electron
      ? from(this.electron.doesFilePathExist(path))
      : of(true);
  }

  // ======================================================================== //
  // ============================= Reads ==================================== //

  /** Gets file data from:
   * * FileReader - Html open file dialog (saves to local storage if not electron app)
   * * Electron - file load
   * @param location system path OR local storage key in web mode
   * @param file file from file dialog
   */
  public readFile(
    args: {
      location: string;
      file?: File;
      isMediaFile?: boolean;
    } = { location: null, isMediaFile: false }
  ): Observable<string> {
    // console.log(`readFile() - `, args);
    return args.file
      ? this.readFileWeb(args.file, args.isMediaFile)
      : this.electron
      ? this.readFileElectron(args.location)
      : of(null);
  }

  private readFileElectron(path: string): Observable<string> {
    // console.log(`  readFileElectron() - `, path);
    if (!this.electron) return throwError('Electron is not available!');
    return from(this.electron.readFile(path)).pipe(
      // TODO: types
      map<Buffer, string>((v) => {
        if (!v) {
          throw new Error(`${ERRORS.ANGULAR_NO_DATA} for "${path}"`);
        }
        return 'TODO: read buffer';
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

    reader.onerror = (e) => {
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
  public writeFile(location: string, fileContents: string): Observable<string> {
    // console.log(`writeFile() - `, location, fileContents);
    const myFile: MyFile = {
      path: location,
      data: fileContents,
    };
    return (
      this.electron ? this.writeFileElectron(myFile) : this.writeFileWeb(myFile)
    ).pipe(
      map(() => `${this.electron ? 'Saved to' : 'Downloaded'} ${myFile.path}`)
    );
  }

  private writeFileElectron(myFile: MyFile): Observable<void> {
    // console.log(`  writeFileElectron() - `, myFile);
    if (!this.electron) return throwError('Electron is not available!');
    return from(this.electron.writeFile(myFile));
  }

  private writeFileWeb(myFile: MyFile): Observable<void> {
    const fileName = myFile.path.toString();
    return of(htmlDownload(fileName, myFile.data));
  }
}
