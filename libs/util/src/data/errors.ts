export enum ERRORS {
  ELECTRON_NO_FILE = 'no such file or directory',
  ANGULAR_NO_DATA = 'Failed file read',
  INVALID_PATH = 'is an invalid path',
  INVALID_CONTENTS = 'Unexpected end of JSON input',
}

export function errorHas(err: unknown, e: ERRORS): boolean {
  return String(err).includes(e);
}
