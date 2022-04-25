import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';

const GITHUB = `https://github.com/deniszholob?tab=repositories`;

@Component({
  selector: 'plm-footer',
  templateUrl: './footer.component.html',
  // styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  @Input()
  public version = '';

  public GITHUB = GITHUB;
}

@NgModule({
  imports: [CommonModule],
  declarations: [FooterComponent],
  exports: [FooterComponent],
})
export class FooterModule {}
