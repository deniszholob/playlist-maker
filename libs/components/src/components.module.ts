import { NgModule } from '@angular/core';
import { FilePickerModule } from './file-picker';
import { FooterModule } from './footer';
import { HeaderModule } from './header';
import { PlaylistModule } from './playlist';
import { PvPlaylistModule } from './pv-playlist/pv-playlist.component';
import { PvSongModule } from './pv-song/pv-song.component';
import { SettingsModule } from './settings';
import { StepModule } from './step/step.component';

@NgModule({
  exports: [
    FilePickerModule,
    FooterModule,
    HeaderModule,
    PlaylistModule,
    SettingsModule,
    StepModule,
    PvSongModule,
    PvPlaylistModule,
    SettingsModule,
  ],
})
export class ComponentsModule {}
