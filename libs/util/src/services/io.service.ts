import { Injectable } from '@angular/core';
import * as mm from 'music-metadata-browser';
import { forkJoin, from, fromEvent, Observable, of } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';

import { FullSongData, Playlist, PlaylistSong, SongImage } from '../models';
import { PlaylistStoreService } from './playlist-store.service';
import { RawFileIOService } from './raw-file-io.service';

const PATH_SEP = '/';

@Injectable({
  providedIn: 'root',
})
export class IoService {
  constructor(
    private rawFileIOService: RawFileIOService,
    private playlistStoreService: PlaylistStoreService
  ) {}

  public createNewPlaylist() {
    return this.rawFileIOService.getNewPlaylistFilePath().pipe(
      // Ignore null, means user closed window
      filter((p) => p != null),
      tap((path) => {
        const playlist: Playlist = {
          path,
          validated: false,
          songData: [],
        };
        this.playlistStoreService.setState(playlist);
      }),
      take(1)
    );
  }

  public readPlaylistData(file: File) {
    // console.log(`readPlaylistData() - `, file);
    // Using / instead of \ is not recognized... -_-
    // const path = file.path ? slash(file.path) : file.name;
    const path = file.path ? file.path : file.name;
    return this.rawFileIOService
      .readFile({ location: path, file, isMediaFile: false })
      .pipe(
        map((data) => {
          const playlist: Playlist = {
            path,
            validated: false,
            songData: this.parsePlaylistSongs(data),
          };
          return playlist;
        }),
        switchMap((playlist) =>
          this.validatePlaylistSongPaths(playlist).pipe(map(() => playlist))
        ),
        map((playlist) => {
          // console.log(`Validation Complete`, playlist);
          playlist.validated = true;
          playlist.songData = playlist.songData.map(
            (song: PlaylistSong): FullSongData => {
              const displaySplit = song.display.split(' - ');
              return {
                validPath: song.validPath,
                path: song.path,
                seconds: song.seconds,
                display: song.display,
                title: displaySplit.length > 1 ? displaySplit[1] : song.display,
                artist: displaySplit.length > 1 ? displaySplit[0] : null,
              };
            }
          );
          this.playlistStoreService.setState(playlist);
        }),
        take(1)
      );
  }

  public validatePlaylistSongPaths(playlist: Playlist) {
    // console.log(`validatePlaylistSongPaths() - `, playlist);
    return forkJoin(
      playlist.songData.map((song: FullSongData) => {
        // console.log('Validating ', song);
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

  public parsePlaylistSongs(data: string): PlaylistSong[] {
    // console.log(`parsePlaylistSongs() - `, data);
    let songs: PlaylistSong[] = [];
    data = data.replace(/\r\n/g, '\n');
    const musicData: string[] = data.split('\n#EXTINF:');

    if (musicData[0] === '#EXTM3U') {
      musicData.shift();
      songs = musicData.map((music: string): PlaylistSong => {
        const songData: string[] = music.split('\n');
        const metaData: string[] = songData[0].split(',');
        return {
          path: decodeURI(songData[1].replace('file:///', '')),
          seconds: Number(metaData[0]),
          display: String(metaData[1]),
          validPath: false,
        };
      });
      return songs;
    }
    throw new Error(`Invalid file, looking for "#EXTM3U" header`);
  }

  public readAudioFilesData(files: File[]): Observable<void> {
    // console.log(`readData() - `, files);
    return forkJoin(files.map((f) => this.readAudioFileData(f))).pipe(
      map((songs) => {
        // console.log(`readAudioFilesData | map`);
        const currentPlaylist = this.playlistStoreService.getState();
        const currentSongs = [...currentPlaylist.songData];
        currentSongs.push(...songs);
        this.playlistStoreService.setState({
          ...currentPlaylist,
          songData: currentSongs,
        });
      }),
      take(1)
    );
  }

  private readAudioFileData(file: File): Observable<FullSongData> {
    // console.log(`readData() - `, file);
    return from(mm.parseBlob(file)).pipe(
      map((data) => {
        // Using / instead of \ is not recognized... -_-
        // const location = file.path ? slash(file.path) : file.name;
        const location = file.path ? file.path : file.name;
        const title = data.common.title || file.name;
        const artist = data.common.artist;
        const display = artist ? `${artist} - ${title}` : title;
        // console.log(`Song data`, data);
        const song: FullSongData = {
          path: location,
          title,
          seconds: data.format.duration,
          artist,
          display,
          album: data.common.album,
          track: data.common.track?.no,
          totalTracks: data.common.track?.of,
          image: this.imageFromData(data.common.picture),
          validPath: true,
        };
        // console.log(song);
        return song;
      })
    );
  }

  private imageFromData(pictureArray: mm.IPicture[] | null): SongImage | null {
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

  /** @param oldPath "C:/Users/Bob/Music/Album/Song.mp3" */
  public fixPathsBasedOn(oldPath: string) {
    return this.rawFileIOService.getMissingSongFilePath(oldPath).pipe(
      map((path: string) => {
        if (!path) return null; // User cancelled the save dialog

        const oldArr = oldPath.split(PATH_SEP); // file:///C:/Users/Galina/Music/Various/SongName.mp3
        const newArr = path.split(PATH_SEP); // file:///D:/galina-songs-backup/BOBBBB/SongName.mp3
        const sr = this.getPathDiff(oldArr, newArr, PATH_SEP);
        // console.log(`SEARCH/REPLACE`, sr);

        const playlist = this.playlistStoreService.getState();
        const songValidationObservables: Observable<FullSongData>[] =
          playlist.songData.map((song: FullSongData) => {
            // console.log(`song before`, song);
            if (!song.validPath && song.path.match(sr.search)) {
              const newPath = song.path.replace(sr.search, sr.replace);
              return this.validateSongPath(newPath).pipe(
                map((isValid) => {
                  // console.log(`Checking ${newPath}`, isValid);
                  if (isValid) {
                    song.path = newPath;
                    song.validPath = true;
                  }
                  return song;
                })
              );
            }
            return of(song);
          });
        const songsValidationObservable = forkJoin(songValidationObservables);
        return { playlist, songsValidationObservable };
      }),
      // Avoid "Cannot destructure property 'playlist' of 'object null' as it is null." in the switchMap
      filter((v) => v !== null),
      switchMap(({ playlist, songsValidationObservable }) =>
        songsValidationObservable.pipe(
          map((songData) => ({ playlist, songData }))
        )
      ),
      map(({ playlist, songData }) => {
        // console.log(`Last Validation Step`, songData);
        this.playlistStoreService.setState({
          ...playlist,
          songData: [...songData],
        });
      }),
      take(1)
    );
  }

  /**
   *
   * @param oldArr ["C:", "Users", "Bob", "Music", "Album", "Song.mp3"]
   * @param newArr ["D:", "MUSIC", "Album", "Song.mp3"]
   * @param sep "/"
   * @returns Search/Replace: {search: "C:/Users/Bob/Music", replace: "D:/MUSIC"}
   */
  private getPathDiff(oldArr: string[], newArr: string[], sep: string) {
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
  public exportPlaylist(toRelative = true) {
    const playlist = this.playlistStoreService.getState();
    const songData = playlist.songData;

    songData.map((song) => {
      // console.log(`Path before`, song.path);
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
