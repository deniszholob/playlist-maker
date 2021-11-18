import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';

@Component({
  selector: 'plm-step',
  templateUrl: './step.component.html',
  // styleUrls: ['./step.component.scss'],
})
export class StepComponent {
  @Input()
  public number = 0;

  @Input()
  public title = '';

  @Input()
  public currentStep = 0;

  @Output()
  public openStep: EventEmitter<number> = new EventEmitter();

  public onOpenStep(n: number) {
    this.openStep.emit(n);
  }
}

// =============================== Module =================================== //

@NgModule({
  imports: [CommonModule],
  declarations: [StepComponent],
  exports: [StepComponent],
})
export class StepModule {}
