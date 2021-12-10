import { Options } from '@angular-slider/ngx-slider';
import {
  AfterContentChecked,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FullSongData } from '@plm/util';

@Component({
  selector: 'plm-player',
  templateUrl: './player.component.html',
  // styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit, AfterContentChecked {
  public value = 123;
  public options: Options = {
    floor: 0,
    ceil: 0,
  };
  public isPlaying = false;

  public _song: FullSongData;
  @Input()
  set song(song: FullSongData) {
    this._song = song;
    console.log(`song`, song);
    this.options.ceil = song?.seconds ? song.seconds : 0;
    console.log(this.options);
    // this.value = 0;
  }
  get song() {
    return this._song;
  }

  @Output()
  public nextSong = new EventEmitter<FullSongData>();

  @Output()
  public previousSong = new EventEmitter<FullSongData>();

  // ============== WIP
  // currentProgress$ = new BehaviorSubject(0);
  // currentTime$ = new Subject();

  // @ViewChild('player', {static: true}) player: ElementRef;

  // ==============

  constructor() {
    //
  }
  ngAfterContentChecked(): void {
    console.log();
    // this.options.ceil = this.song?.seconds;
  }

  ngOnInit() {
    //
    console.log();
  }

  public onPlay() {
    // TODO:
    this.isPlaying = true;
  }

  public onPause() {
    // TODO:
    this.isPlaying = false;
  }

  public onStop() {
    // TODO:
    this.isPlaying = false;
  }

  public onPrevious() {
    this.previousSong.next();
  }

  public onNext() {
    this.nextSong.next();
  }
}
