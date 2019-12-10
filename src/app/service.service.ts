import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import conf from './config/config.json';
import { Observable } from 'rxjs';


interface NIP {
  nip: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  // url = 'https://10.10.20.108:3500/luwak/wajah';
  // urlSiap = 'https://siap.universitaspertamina.ac.id/api/facereg';
  // tokenSiap = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuaXAiOiIyMTYxMDUifQ.ODt-9Ro-N05f0Mxmu8Wq5xQWNCPizoQpuI2jm-ex2hU';
  // url = 'face-api.universitaspertamina.ac.id';
  // urlDoor = 'http://10.4.126.163/switch?action=1&id=2';
  // urlBaru = 'https://localhost:3500/luwak/wajah';
  // urlAbsen = 'https://localhost:3500/absen/';

  fileToUpload: File = null;
  nip: any;

  constructor(
    private httpClient: HttpClient
  ) {}

  public getData() {
    return this.httpClient.get(conf.url);
  }

  public postSiap(noPeg: any) {
    const data: FormData = new FormData();
    data.append('nip', noPeg);
    return this.httpClient.post(conf.urlAbsen, data);

  }

  public uploadData(newUser: any) {
    const data: FormData = new FormData();
    data.append('nama', newUser.nama);
    data.append('deskriptor', newUser.deskriptor);
    data.append('id', newUser.id);
    data.append('berkas', newUser.berkas, newUser.namaBerkas);
    console.log(newUser);
    return this.httpClient.post(conf.url, data);
  }

  public getAbsen() {
    return this.httpClient.get(conf.urlRekap);
  }

  public uploadAbsen(absenUser: any) {
    const dataAbsen: FormData = new FormData();
    dataAbsen.append('nama', absenUser.nama);
    dataAbsen.append('id', absenUser.id);
    dataAbsen.append('berkas', absenUser.berkas, absenUser.namaBerkas);
    dataAbsen.append('distance', absenUser.distance);
    return this.httpClient.post(conf.urlRekap, dataAbsen);
  }

  public editData(addPhoto: any) {
    const data: FormData = new FormData();
    data.append('id', addPhoto.id);
    data.append('berkas', addPhoto.berkas, addPhoto.namaBerkas);
    data.append('deskriptor', addPhoto.deskriptor);

    console.log(addPhoto);
    return this.httpClient.put(conf.url + '/' + addPhoto.id, data);
  }

}
