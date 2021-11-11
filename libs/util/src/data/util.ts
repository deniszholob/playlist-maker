// https://momentjs.com/docs/#/use-it/
import { utc, duration } from 'moment';

/**
 * Convert Windows backslash paths to slash paths: `foo\\bar` -> `foo/bar`
 *
 * Forward-slash paths can be used in Windows as long as
 * * they're not extended-length paths and
 * * don't contain any non-ascii characters.
 * @see http://superuser.com/a/176395/6877
 * @see https://github.com/sindresorhus/slash
 */
export function slash(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  // eslint-disable-next-line no-control-regex
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path);

  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }

  return path.replace(/\\/g, '/');
}

export function formatTime(time: number, format = 'HH:mm:ss') {
  // console.log(`formatTime`, time, format)
  const momentTime = time * 1000;
  // const formattedTime = duration(momentTime).humanize();
  const formattedTime = utc(momentTime).format(format);
  // console.log(`formattedTime`,formattedTime)
  return formattedTime
}
