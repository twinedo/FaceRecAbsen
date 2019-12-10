import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { AppComponent } from './app.component';
import { EditComponent } from './edit/edit.component';
import { RekapComponent } from './rekap/rekap.component';


const routes: Routes = [
  {path: '', component: AppComponent},
  {path: 'upload', component: UploadComponent},
  {path: 'edit', component: EditComponent},
  {path: 'rekap', component: RekapComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
