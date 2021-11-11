import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilePickerComponent } from './file-picker.component';

@NgModule({
  imports: [CommonModule],
  declarations: [FilePickerComponent],
  exports: [FilePickerComponent],
})
export class FilePickerModule {}
