import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { WebcamModule } from 'ngx-webcam';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { UploadComponent } from './upload/upload.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home.component';
import { EditComponent } from './edit/edit.component';

import { NgxSpinnerModule } from 'ngx-spinner';

import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { RekapComponent } from './rekap/rekap.component';


@NgModule({
  declarations: [
    AppComponent,
    UploadComponent,
    HomeComponent,
    EditComponent,
    RekapComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    WebcamModule,
    AppRoutingModule,
    HttpClientModule,
    NgxSpinnerModule,
    SweetAlert2Module.forRoot()
  ],
  providers: [],
  bootstrap: [HomeComponent]
})
export class AppModule { }
