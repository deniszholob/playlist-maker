import { MenuItemConstructorOptions } from 'electron';

/** @see https://www.electronjs.org/docs/latest/api/menu */
export class AppMenu {
  static getMenuTemplate(): MenuItemConstructorOptions[] {
    // const isMac = process.platform === 'darwin';
    const helpItem: MenuItemConstructorOptions = {
      role: 'help',
      submenu: [
        { role: 'about' },
        {
          label: 'Code',
          click: async () => {
            // TODO: figure out how to do this without the require
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { shell } = require('electron');
            await shell.openExternal(
              'https://github.com/deniszholob/playlist-maker'
            );
          },
        },
      ],
    };

    return [
      // { role: 'appMenu' },
      { role: 'fileMenu' },
      // { role: 'editMenu' },
      { role: 'viewMenu' },
      // { role: 'windowMenu' },
      helpItem,
    ];
  }
}
