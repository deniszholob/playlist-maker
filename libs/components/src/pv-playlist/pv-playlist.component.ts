import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { Playlist, PlaylistSong } from '@plm/util';
import { PvSongModule } from '../pv-song/pv-song.component';

@Component({
  selector: 'plm-pv-playlist',
  templateUrl: './pv-playlist.component.html',
  // styleUrls: ['./pv-playlist.component.scss'],
})
export class PvPlaylistComponent {
  @Input()
  public pl: Playlist;

  @Input()
  public showInvalidOnly: boolean;

  @Output()
  public fixSongPath = new EventEmitter<PlaylistSong>();

  public collapsed = false;

  public onFixSongPath(song: PlaylistSong) {
    this.fixSongPath.emit(song);
  }

  public showObject(validity: boolean) {
    // Always show if setting is off
    if (!this.showInvalidOnly) return true;
    // Setting on, so show based on opposite validity (invalid are shown, valid are hidden)
    return !validity;
  }
}

// =============================== Module =================================== //

@NgModule({
  imports: [CommonModule, PvSongModule],
  declarations: [PvPlaylistComponent],
  exports: [PvPlaylistComponent],
})
export class PvPlaylistModule {}
