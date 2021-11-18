import { slash } from '@plm/util';
import { homedir } from 'os';
import { isAbsolute, parse, relative, resolve } from 'path';

/**@return filepath in home folder */
export function homeFile(path: string): string {
  const home = homedir();
  return slash(resolve(home ? home : '', path));
}

export function convertPath(
  path: string,
  basedOnRelativePath: string,
  toRelative: boolean
): string {
  const isAbsolutePath = isAbsolute(path);
  const relativeDir = parse(basedOnRelativePath).dir;

  const resolvedPath = isAbsolutePath
    ? resolve(path) // Abs => Abs
    : resolve(relativeDir, path); // Rel => Abs

  return toRelative ? relative(relativeDir, resolvedPath) : resolvedPath;

  // return toRelative
  //   ? isAbsolutePath
  //     ? relative(relativeDir, resolve(path)) // Abs => Rel
  //     : relative(relativeDir, resolve(relativeDir, path)) // Rel => Rel
  //   : isAbsolutePath
  //   ? resolve(path) // Abs => Abs
  //   : resolve(relativeDir, path); // Rel => Abs
}
