import { NgModule } from '@angular/core';
import { FilePickerModule } from './file-picker';

import { HeaderModule } from './header';
import { PlaylistModule } from './playlist';

@NgModule({
  exports: [
    HeaderModule,
    PlaylistModule,
    FilePickerModule,
  ],
})
export class ComponentsModule {}
