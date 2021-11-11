import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormatDurationPipe } from '@plm/util';

import { PlaylistComponent } from './playlist.component';

@NgModule({
  imports: [CommonModule, CdkTableModule, DragDropModule],
  declarations: [PlaylistComponent, FormatDurationPipe],
  exports: [PlaylistComponent],
})
export class PlaylistModule {}
