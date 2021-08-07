import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsDataPluginModule } from '@ngxs-labs/data';
import { NgxsModule } from '@ngxs/store';
import { environment } from 'src/environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FakerState } from './states/faker.state';
import { PropertyTreeComponent } from './property-tree/property-tree.component';
import { PropertySlideoverComponent } from './shared/property-slideover/property-slideover.component';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    PropertyTreeComponent,
    PropertySlideoverComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    NgxsModule.forRoot([FakerState], {
      developmentMode: !environment.production,
    }),
    NgxsDataPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot(),
    MonacoEditorModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
