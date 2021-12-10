import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { PlayerComponent } from './player.component';

@NgModule({
  imports: [CommonModule, NgxSliderModule],
  declarations: [PlayerComponent],
  exports: [PlayerComponent],
})
export class PlayerModule {}
