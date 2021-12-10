import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const audioEvents = [
  'ended',
  'error',
  'play',
  'playing',
  'pause',
  'timeupdate',
  'canplay',
  'loadedmetadata',
  'loadstart',
];

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  constructor() {
    // TODO
  }

  private stop$ = new Subject();
  private audioObj: HTMLAudioElement = new Audio();

  private streamObservable(url: string) {
    return new Observable((observer) => {
      // Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      const handler = (event: Event) => {
        observer.next(event);
      };

      this.addEvents(handler);
      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        // remove event listeners
        this.removeEvents(handler);
      };
    });
  }
  private addEvents(handler: (event: Event) => void) {
    audioEvents.forEach((event) => {
      this.audioObj.addEventListener(event, handler);
    });
  }

  private removeEvents(handler: (event: Event) => void) {
    audioEvents.forEach((event) => {
      this.audioObj.removeEventListener(event, handler);
    });
  }

  playStream(url: string) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }
  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.stop$.next();
  }

  seekTo(seconds: number) {
    this.audioObj.currentTime = seconds;
  }
}
