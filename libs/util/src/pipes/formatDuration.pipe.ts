import { Pipe, PipeTransform } from '@angular/core';

import {
  utc,
  //duration
} from 'moment';

/*
 * Example:
 *   {{ 2 | formatDuration }}
 */
@Pipe({
  name: 'formatDuration',
})
export class FormatDurationPipe implements PipeTransform {
  transform(duration: number | undefined): string {
    // console.log(`FormatDurationPipe`, duration)
    return duration ? this.formatTime(duration) : '0';
  }

  /** @see https://momentjs.com/docs/#/use-it/ */
  private formatTime(time: number, format = 'HH:mm:ss') {
    // console.log(`formatTime`, time, format)
    const momentTime = time * 1000;
    // const formattedTime = duration(momentTime).humanize();
    const formattedTime = utc(momentTime).format(format);
    // console.log(`formattedTime`,formattedTime)
    return formattedTime;
  }
}
