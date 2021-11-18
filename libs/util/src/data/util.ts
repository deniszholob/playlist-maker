import { Separator } from '../store/AppStore.model';
import { getPlaylistEncoding } from './file-types';

/**
 * Convert Windows backslash paths to slash paths: `foo\\bar` -> `foo/bar`
 *
 * Forward-slash paths can be used in Windows as long as
 * * they're not extended-length paths and
 * * don't contain any non-ascii characters.
 * !Warning: Using / instead of \ is not recognized in some applications -_-
 * @see http://superuser.com/a/176395/6877
 * @see https://github.com/sindresorhus/slash
 */
export function slash(path: string, sep: Separator = '/') {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  // eslint-disable-next-line no-control-regex
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path);

  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }

  return path.replace(/\\/g, sep);
}

export function htmlDownload(fileName: string, contents: string) {
  const encoding: BufferEncoding = getPlaylistEncoding(fileName);

  // Creating an invisible element
  // <a href="path of file" download="file name">
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=${encoding}, ` + encodeURIComponent(contents)
  );
  element.setAttribute('download', fileName);
  document.body.appendChild(element);

  // Execute a click
  element.click();

  // Cleanup
  document.body.removeChild(element);
}

export function getFilesSelected(event: Event): File[] {
  if (event.target instanceof HTMLInputElement) {
    const fileList: FileList | null = event.target.files;
    const files: File[] = fileList ? Array.from(fileList) : [];
    return files;
  }
  throw new Error(`Invalid ${typeof event} event, should be HTMLInputElement`);
}
