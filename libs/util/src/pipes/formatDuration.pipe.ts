import { Pipe, PipeTransform } from '@angular/core';

import { formatTime } from '../data/util';

/*
 * Example:
 *   {{ 2 | formatDuration }}
*/
@Pipe({
  name: 'formatDuration',
})
export class FormatDurationPipe implements PipeTransform {
  transform(duration: number): string {
    // console.log(`FormatDurationPipe`, duration)
    return formatTime(duration);
  }
}
