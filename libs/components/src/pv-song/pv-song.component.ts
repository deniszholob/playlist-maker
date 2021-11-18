import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { PlaylistSong } from '@plm/util';

@Component({
  selector: 'plm-pv-song',
  templateUrl: './pv-song.component.html',
  // styleUrls: ['./pv-song.component.scss'],
})
export class PvSongComponent {
  @Input()
  public song: PlaylistSong;

  @Output()
  public fixSongPath = new EventEmitter<PlaylistSong>();

  public onFixSongPath(song: PlaylistSong) {
    this.fixSongPath.emit(song);
  }
}

// =============================== Module =================================== //

@NgModule({
  imports: [CommonModule],
  declarations: [PvSongComponent],
  exports: [PvSongComponent],
})
export class PvSongModule {}
