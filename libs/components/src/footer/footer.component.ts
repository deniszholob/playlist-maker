import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

const GITHUB = `https://github.com/deniszholob?tab=repositories`;

@Component({
  selector: 'plm-footer',
  templateUrl: './footer.component.html',
  // styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  public GITHUB = GITHUB;
}

@NgModule({
  imports: [CommonModule],
  declarations: [FooterComponent],
  exports: [FooterComponent],
})
export class FooterModule {}
