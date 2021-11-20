import { Injectable } from '@angular/core';
import * as mm from 'music-metadata-browser';
import { forkJoin, from, fromEvent, Observable, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { slash } from '../data/util';
import {
  FullSongData,
  Playlist,
  PlaylistSong,
  PlaylistStoreService,
  SongImage,
} from '../store';
import { RawFileIOService } from './raw-file-io.service';

const PATH_SEP = '/';
interface SR {
  search: string;
  replace: string;
}

export interface PlaylistDirLoaded {
  dir: string;
  files: Playlist[];
}

@Injectable({
  providedIn: 'root',
})
export class IoService {
  constructor(
    private rawFileIOService: RawFileIOService,
    private playlistStoreService: PlaylistStoreService
  ) {}

  public openPlaylists(): Observable<PlaylistDirLoaded | null> {
    return this.rawFileIOService.openPlaylistFolder().pipe(
      switchMap((p) =>
        p && p.files.length > 0
          ? this.readPlaylistsData(p.files).pipe(
              map((z) => ({
                dir: p.dir,
                files: z,
              }))
            )
          : of(null)
      )
    );
  }

  private readPlaylistsData(files: string[]) {
    return forkJoin(files.map((p) => this.readPlaylistData(p)));
  }

  public createNewPlaylist() {
    return this.rawFileIOService.getNewPlaylistFilePath().pipe(
      // Ignore null, means user closed window
      filter((p) => p != null),
      map((path) => {
        this.playlistStoreService.setNew({ path });
        return this.playlistStoreService.getSnapshot();
      }),
      take(1)
    );
  }

  /**
   * @param location for electron files
   * @param file for web files
   */
  public readPlaylistData(location: string | null, file?: File) {
    // console.log(`readPlaylistData() - `, file);
    // Using / instead of \ is not recognized... -_-
    // if (!(location || (file && file.path))) throw new Error('Must have either location or file with path');

    const path = location
      ? slash(location)
      : file && file.path
      ? slash(file.path)
      : file && file.name
      ? file.name
      : (function () {
          throw new Error('Must have either location or file with path');
        })();

    // const path = location ? location : file.path ? file.path : file.name;
    return this.rawFileIOService
      .readFile({ location: path, file, isMediaFile: false })
      .pipe(
        map((data) => {
          const songData = this.parsePlaylistSongs(data, path);
          const playlist: Playlist = {
            path,
            totalSongs: this.playlistStoreService.getTotalSongs(songData),
            validSongs: 0,
            songData,
          };
          return playlist;
        }),
        switchMap((playlist) =>
          this.validatePlaylistSongPaths(playlist).pipe(map(() => playlist))
        ),
        map((playlist) => {
          // console.log(`Validation Complete`, playlist);
          if (!playlist.songData) throw Error('Playlist Song Data was null');
          playlist.songData = playlist.songData.map(
            (song: PlaylistSong): FullSongData => {
              const displaySplit = song.display.split(' - ');
              return {
                validPath: song.validPath,
                path: song.path,
                seconds: song.seconds,
                display: song.display,
                title: displaySplit.length > 1 ? displaySplit[1] : song.display,
                artist: displaySplit.length > 1 ? displaySplit[0] : undefined,
              };
            }
          );
          playlist.validSongs = this.playlistStoreService.getValidSongCount(
            playlist.songData
          );
          return playlist;
        }),
        take(1)
      );
  }

  public validatePlaylistSongPaths(playlist: Playlist) {
    // console.log(`validatePlaylistSongPaths() - `, playlist);
    if (!playlist.songData) throw Error('Playlist Song Data was null');
    return forkJoin(
      playlist.songData.map((song: FullSongData) => {
        // console.log('Validating ', song);
        if (!playlist.path) throw Error('Playlist path was null');
        const absSongPath = this.rawFileIOService.convertPath(
          song.path,
          playlist.path,
          false
        );
        return this.validateSongPath(absSongPath).pipe(
          map((isValid: boolean): null => {
            song.validPath = isValid;
            return null;
          })
        );
      })
    );
  }

  /** Validates absolute path only as relative paths will be wrp to the app location */
  private validateSongPath(path: string): Observable<boolean> {
    return this.rawFileIOService.validateFilePath(path);
  }

  public parsePlaylistSongs(data: string, path?: string): PlaylistSong[] {
    // console.log(`parsePlaylistSongs() - `, data);
    let songs: PlaylistSong[] = [];
    data = data.replace(/\r\n/g, '\n');
    const musicData: string[] = data.split('\n#EXTINF:');

    if (musicData[0] === '#EXTM3U') {
      musicData.shift();
      songs = musicData.map((music: string): PlaylistSong => {
        const songData: string[] = music.split('\n');
        const metaData: string[] = songData[0].split(',');
        let songPath: string = songData[1].replace('file:///', '');
        songPath = decodeURIComponent(songPath);
        return {
          // path: songPath,
          path: slash(songPath),
          seconds: Number(metaData[0]),
          display: String(metaData[1]),
          validPath: false,
        };
      });
      return songs;
    }
    throw new Error(`Invalid file ${path}, looking for "#EXTM3U" header`);
  }

  public readAudioFilesData(files: File[]): Observable<void> {
    // console.log(`readData() - `, files);
    return forkJoin(files.map((f) => this.readAudioFileData(f))).pipe(
      map((songs) => {
        // console.log(`readAudioFilesData | map`);
        const currentPlaylist = this.playlistStoreService.getSnapshot();
        if (!currentPlaylist.songData)
          throw Error('Playlist Song Data was null');
        const currentSongs = [...currentPlaylist.songData];
        currentSongs.push(...songs);
        this.playlistStoreService.setSongs(currentSongs);
      }),
      take(1)
    );
  }

  private readAudioFileData(file: File): Observable<FullSongData> {
    // console.log(`readData() - `, file);
    return from(mm.parseBlob(file)).pipe(
      map((data) => {
        // Using / instead of \ is not recognized... -_-
        const location = file.path ? slash(file.path) : file.name;
        // const location = file.path ? file.path : file.name;
        const title = data.common.title || file.name;
        const artist = data.common.artist;
        const display = artist ? `${artist} - ${title}` : title;
        // console.log(`Song data`, data);
        const song: FullSongData = {
          path: location,
          title,
          seconds: data.format.duration || 0,
          artist,
          display,
          album: data.common.album,
          track: data.common.track?.no || undefined,
          totalTracks: data.common.track?.of || undefined,
          image: this.imageFromData(data.common.picture) || undefined,
          validPath: true,
        };
        // console.log(song);
        return song;
      })
    );
  }

  private imageFromData(
    pictureArray: mm.IPicture[] | undefined
  ): SongImage | null {
    // console.log(`imageFromData() - `, pictureArray);
    if (!(pictureArray && pictureArray.length > 0)) return null;
    const picture: mm.IPicture = pictureArray[0];
    if (!(picture && picture.data && picture.format)) return null;
    const songImage: SongImage = {
      url: `data:${picture.format};base64,${picture.data.toString('base64')}`,
      name: picture?.name,
      description: picture?.description,
    };
    return songImage;
  }

  public fixPathsInPlaylistsBasedOn(oldPath: string, playlists: Playlist[]) {
    return this.getSR(oldPath).pipe(
      filter((sr): sr is SR => sr != null),
      switchMap((sr: SR) => this.fixSongsInPlaylists(sr, playlists)),
      take(1)
    );
  }

  public fixPathsInPlaylistBasedOn(oldPath: string, playlist: Playlist) {
    return this.getSR(oldPath).pipe(
      filter((sr): sr is SR => sr != null),
      switchMap((sr) => this.fixSongsInPlaylist(sr, playlist)),
      take(1)
    );
  }

  private fixSongsInPlaylists(sr: SR, playlists: Playlist[]) {
    return forkJoin(playlists.map((p) => this.fixSongsInPlaylist(sr, p)));
  }

  private fixSongsInPlaylist(sr: SR, playlist: Playlist) {
    if (!playlist.songData) throw Error('Playlist Song Data was null');
    const songValidationObservables = playlist.songData.map(
      (song: FullSongData) => {
        const fixedSong = this.fixSong(sr, song);
        return fixedSong;
      }
    );
    return forkJoin(songValidationObservables).pipe(
      map((songs) => {
        // console.log(`playlist before`, playlist);
        playlist.songData = songs;
        playlist.validSongs =
          this.playlistStoreService.getValidSongCount(songs);
        // console.log(`playlist after`, playlist);
        return playlist;
      })
    );
  }

  private fixSong(sr: SR, song: FullSongData) {
    // console.log(`song before`, song, sr);
    if (!song.validPath && song.path.match(sr.search)) {
      const newPath = song.path.replace(sr.search, sr.replace);
      return this.validateSongPath(newPath).pipe(
        map((isValid) => {
          // console.log(`Checking ${newPath}`, isValid);
          if (isValid) {
            song.path = newPath;
            song.validPath = true;
          }
          // console.log(`song after`, song);
          return song;
        })
      );
    }
    // console.log(`song after`, song);
    return of(song);
  }

  /** @param oldPath "C:/Users/Bob/Music/Album/Song.mp3" */
  private getSR(oldPath: string): Observable<SR | null> {
    return this.rawFileIOService.getMissingSongFilePath(oldPath).pipe(
      map((path) => {
        if (!path) return null; // User cancelled the save dialog

        const oldArr = oldPath.split(PATH_SEP); // file:///C:/Users/Galina/Music/Various/SongName.mp3
        const newArr = path.split(PATH_SEP); // file:///D:/galina-songs-backup/BOBBBB/SongName.mp3
        const sr = this.getPathDiff(oldArr, newArr, PATH_SEP);
        // console.log(`SEARCH/REPLACE`, sr);
        return sr;
      })
    );
  }

  /**
   *
   * @param oldArr ["C:", "Users", "Bob", "Music", "Album", "Song.mp3"]
   * @param newArr ["D:", "MUSIC", "Album", "Song.mp3"]
   * @param sep "/"
   * @returns Search/Replace: {search: "C:/Users/Bob/Music", replace: "D:/MUSIC"}
   */
  private getPathDiff(oldArr: string[], newArr: string[], sep: string): SR {
    // Strip away the common parts from the end until an inconsistency is found
    // Use that to find/replace
    while (oldArr.length > 0 && newArr.length > 0) {
      const oldPathLast = oldArr[oldArr.length - 1]; // Song.mp3, Album
      const newPathLast = newArr[newArr.length - 1]; // Song.mp3, Album

      if (oldPathLast !== newPathLast) break;

      oldArr.pop();
      newArr.pop();
    }

    const rebuildUniqueOldPath = oldArr.join(sep); // C:/Users/Bob/Music
    const rebuildUniqueNewPath = newArr.join(sep); // D:/MUSIC

    return {
      search: rebuildUniqueOldPath,
      replace: rebuildUniqueNewPath,
    };
  }

  /** @see: https://en.wikipedia.org/wiki/M3U */
  public exportPlaylist(playlist: Playlist, toRelative = true) {
    if (!playlist.songData) throw Error('Playlist Song Data was null');
    const songData = playlist.songData;

    songData.map((song) => {
      // console.log(`Path before`, song.path);
      if (!playlist.path) throw Error('Playlist path was null');
      song.path = this.rawFileIOService.convertPath(
        song.path,
        playlist.path,
        toRelative
      );
      // console.log(`Path after`, song.path);
    });

    const playlistFileHeader = '#EXTM3U';
    const fileContents = playlist.songData
      .map((s) => {
        const entryHeader = `#EXTINF:${s.seconds},${s.display}`;
        // Need "file:///" for absolute paths for some reason... At least in VLC
        return toRelative
          ? `${entryHeader}\n${s.path}`
          : `${entryHeader}\nfile:///${s.path}`;
      })
      .reduce((prev, curr) => {
        return prev + '\n' + curr;
      }, playlistFileHeader);

    if (!playlist.path) throw Error('Playlist path was null');
    return this.rawFileIOService
      .writeFile(playlist.path, fileContents)
      .pipe(take(1));
  }

  // https://ourcodeworld.com/articles/read/1036/how-to-retrieve-the-duration-of-a-mp3-wav-audio-file-in-the-browser-with-javascript
  // TODO: Use function
  private loadAudioData(data: string) {
    const audio = new Audio(data);
    audio.addEventListener('loadedmetadata', (e) => {
      // Obtain the duration in seconds of the audio file (with milliseconds as well, a float value)
      const duration = audio.duration;

      // example 12.3234 seconds
      console.log('The duration of the song is of: ' + duration + ' seconds');
      console.log(`AUDIOS Event`, e);
    });

    return fromEvent(audio, 'loadedmetadata').pipe(
      map((e) => {
        const targetAudio = e.target as HTMLAudioElement;
        console.log();
        return { duration: targetAudio.duration };
      })
    );
  }
}
