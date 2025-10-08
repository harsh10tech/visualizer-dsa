import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PathFinderComponent } from './path-finder/path-finder.component';
import { InstructionPanelComponent } from './path-finder/instruction-panel/instruction-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    PathFinderComponent,
    InstructionPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
