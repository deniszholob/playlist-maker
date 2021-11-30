import { PlaylistSong } from './Playlist.model';

export interface AppStore {
  openedFile: string | null;
  selectedSong: PlaylistSong | null;
  settings: Settings;
  page: Page;
  loading: boolean;
  isElectron: boolean;
  unsavedChanges: boolean;
}

export enum Page {
  landing = 'landing',
  pEdit = 'pEdit',
  pValidate = 'pValidate',
}

export interface Settings {
  viewSize: SizeOptions;
  fontSize: SizeOptions;
  darkMode: boolean;
  relativePaths: boolean;
  separator: Separator;
  encoding: EncodingOptions;
}

/** "/" or "\" */
export type Separator = '/' | '\\';

export enum SizeOptions {
  sm = 'sm',
  md = 'md',
  lg = 'lg',
}

export const SizeOptionsLabels: Record<SizeOptions, string> = {
  [SizeOptions.sm]: 'Small',
  [SizeOptions.md]: 'Medium',
  [SizeOptions.lg]: 'Large',
};

export enum EncodingOptions {
  original = 'original',
  utf8 = 'utf8',
  ascii = 'ascii',
  // 'WINDOWS-1252' = 'WINDOWS-1252',
}

export const EncodingOptionsLabels: Record<EncodingOptions, string> = {
  [EncodingOptions.original]: 'Original',
  [EncodingOptions.utf8]: 'UTF8 (.m3u8)',
  [EncodingOptions.ascii]: 'ASCII (.m3u)',
};
