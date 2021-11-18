import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ComponentsModule } from '@plm/components';
import { PagesModule } from '@plm/pages';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';

@NgModule({
  imports: [BrowserModule, AppRoutingModule, PagesModule, ComponentsModule],
  declarations: [AppComponent],
  // providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
