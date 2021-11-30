import { Separator } from '../store/AppStore.model';
import { MyFile } from './electron-bridge';

const INTERNAL_PATH_SEP = '/';

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
export function slash(path: string, sep: Separator = '/', ignoreAscii = true) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  // eslint-disable-next-line no-control-regex
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path);

  if (isExtendedLengthPath || (hasNonAscii && !ignoreAscii)) {
    return path;
  }

  return path.replace(/\\/g, sep);
}

export function htmlDownload(file: MyFile) {
  // const encoding: BufferEncoding = getPlaylistEncoding(fileName);

  // Creating an invisible element
  // <a href="path of file" download="file name">
  const element = document.createElement('a');
  element.setAttribute(
    'href',
    `data:text/plain;charset=${file.encoding}, ` + encodeURIComponent(file.data)
  );
  element.setAttribute('download', file.path);
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

export function pathToArray(path: string) {
  return path.split(INTERNAL_PATH_SEP);
}

export function pathArrayToString(pathArray: string[]): string {
  return pathArray.join(INTERNAL_PATH_SEP);
}

export function getFileBaseNameFromPath(path: string) {
  const pathArray = pathToArray(path);
  const fileName = pathArray[pathArray.length - 1];
  // const name = fileName.split('.');
  // return name[0];
  return fileName;
}

export function changeExtension(path: string, ext: string): string {
  // console.log(`changeExtension`, path, ext);
  const pathArray = pathToArray(path);
  const fileBaseName = pathArray[pathArray.length - 1];
  const fileName = fileBaseName.split('.');
  pathArray[pathArray.length - 1] = fileName[0] + ext;
  // console.log(`pathArray`, pathArray);
  return pathArrayToString(pathArray);
}
