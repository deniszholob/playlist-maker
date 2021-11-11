import { FileFilter } from 'electron';

/** @see https://askubuntu.com/questions/648823/how-to-read-ansi-encoded-files-in-the-right-way*/
export const FILE_ENCODING_M3U_WINDOWS = 'WINDOWS-1252';
export const FILE_ENCODING_M3U_ASCII = 'ascii';
export const FILE_ENCODING_M3U8 = 'utf8';

export const FILE_FILTERS_MUSIC: FileFilter[] = [
  {
    name: 'Music',
    extensions: ['mp3', 'wav', 'ogg'],
  },
];

export const FILE_FILTERS_PLAYLIST: FileFilter[] = [
  {
    name: 'Playlist',
    extensions: ['m3u', 'm3u8'],
  },
];

/** Accepted extensions string to use in HTML <input type="file" accept="{{FILE_ACCEPT}}">
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
 */
export const FILE_ACCEPT_MUSIC: string =
  getAcceptedExtensionsCsvString(FILE_FILTERS_MUSIC);

/** Accepted extensions string to use in HTML <input type="file" accept="{{FILE_ACCEPT}}">
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#unique_file_type_specifiers
 */
export const FILE_ACCEPT_PLAYLIST: string =
  getAcceptedExtensionsCsvString(FILE_FILTERS_PLAYLIST);

function getAcceptedExtensionsCsvString(filter: FileFilter[]): string {
  return filter
    .map((v) => {
      // Only use extensions field
      return (
        v.extensions
          // Prefix with .
          .map((s) => `.${s}`)
          // Combine extensions array with comma delimited values
          .reduce((prev, curr) => {
            return `${prev}, ${curr}`;
          })
      );
    })
    .reduce((prev, curr) => {
      // Combine root array with comma delimited values
      return `${prev}, ${curr}`;
    });
}
