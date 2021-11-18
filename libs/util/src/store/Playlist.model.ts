export interface Playlist {
  /** Path of the playlist file itself */
  path: string | null;
  /** Data related to the songs in the playlist */
  songData: FullSongData[] | null;
  /** True if song paths where validated */
  validated: boolean;
  totalSongs: number;
  validSongs: number;
  /** Read in data from FileReader or whatever */
  data?: string | null;
}

export interface FullSongData extends PlaylistSong, Song {}

/** Parse Data from Playlist File */
export interface PlaylistSong {
  /** Used to check and correct path */
  validPath: boolean;
  /** Absolute or relative (to the playlist) song path */
  path: string;
  /** EXTINF Song length */
  seconds: number;
  /** EXTINF Display name (usually "artist - song name") */
  display: string;
}

/** Parse Data from audio file */
export interface Song {
  title?: string;
  artist?: string;
  album?: string;
  track?: number;
  totalTracks?: number;
  image?: SongImage;
  currentTime?: number;
}

export interface SongImage {
  url: string;
  name?: string;
  description?: string;
}

export enum SongsValid {
  all = 'all',
  some = 'some',
  none = 'none',
}

// TODO: Make a Playlist class instead?
