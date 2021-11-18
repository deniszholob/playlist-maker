import { NgModule } from '@angular/core';

import { HomeModule } from './home/home.component';
import { PlaylistEditorModule } from './playlist-editor/playlist-editor.component';
import { PlaylistValidatorModule } from './playlist-validator/playlist-validator.component';

@NgModule({
  exports: [HomeModule, PlaylistEditorModule, PlaylistValidatorModule],
})
export class PagesModule {}
