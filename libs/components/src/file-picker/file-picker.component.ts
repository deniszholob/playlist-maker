import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'plm-file-picker',
  templateUrl: './file-picker.component.html',
  // styleUrls: ['./file-picker.component.scss'],
})
export class FilePickerComponent {
  @Input()
  public disabled = false;
  @Input()
  public multi = false;
  @Input()
  public filesTypesAccepted = '';
  @Input()
  public class = '';
  @Output()
  public fileChange: EventEmitter<File[]> = new EventEmitter<File[]>();

  /** @see https://stackoverflow.com/questions/58351711/angular-open-file-dialog-upon-button-click */
  public onFilesSelected(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      const fileList: FileList = event.target.files;
      const files: File[] = Array.from(fileList);
      this.fileChange.emit(files);
      return;
    }
    throw new Error(
      `Invalid ${typeof event} event, should be HTMLInputElement`
    );
  }
}
