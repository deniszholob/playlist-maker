export interface Playlist {
  /** Path of the playlist file itself */
  path: string;
  /** Data related to the songs in the playlist */
  songData: FullSongData[];
  /** True if song paths where validated */
  validated: boolean;
  /** Read in data from FileReader or whatever */
  data?: string;
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
  image?: SongImage | null;
  currentTime?: number;
}

export interface SongImage {
  url: string;
  name?: string;
  description?: string;
}
