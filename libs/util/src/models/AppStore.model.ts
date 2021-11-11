import { PlaylistSong } from "./Playlist.model";

export interface AppStore {
  selectedSong: PlaylistSong;
  relativePaths: boolean;
  compactView: boolean;
}
