import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { Subject, Observable, throwError } from 'rxjs';
import { WebcamImage } from 'ngx-webcam';

declare const faceapi;

import Swal from 'sweetalert2/dist/sweetalert2';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  title = 'Sistem Informasi Presensi Pegawai';

  public reader = new FileReader();
  public gambar = new Image();
  public imageToUpload: File = null;
  public fileToUpload: File = null;
  public fileurl: any;

  public deskriptor: any;

  public faceMatcher: any;

  public showText = false;
  public showButton = false;
  public showWebcam = false;
  public webcamImage: WebcamImage = null;

  public videoOptions: MediaTrackConstraints = {
    width: {ideal: 320},
    height: {ideal: 400},
  };

  private trigger: Subject<void> = new Subject<void>();

  constructor(private service: ServiceService) {}

  ngOnInit() {
    faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/weights');
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/weights');
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/weights');

    const showTex = document.getElementById('showText');
    showTex.style.visibility = 'hidden';
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
    this.showText = !this.showText;
    this.showButton = !this.showButton;
  }

  public ambilGambar(): void {
    this.trigger.next();

    const showTex = document.getElementById('showText');
    showTex.style.visibility = 'visible';
  }

  public handleImage(webcamImage: WebcamImage): void {
    // tslint:disable-next-line: no-console
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
    /*
    const imageBase64 = webcamImage.imageAsBase64;
    const blob = new Blob([JSON.stringify(imageBase64)], {type: 'image/jpeg'});
    console.log(blob);
    this.imageToUpload = new File([blob], 'snapshot-' + blob.size + '.jpeg', {
      type: 'image/jpeg'
    });
    console.log(this.imageToUpload);*/

///////////////
     // data uri dari hasil tangkap kamera
    const dataURI = this.webcamImage.imageAsDataUrl;
     // convert base64 to raw binary data held in a string
    const byteString = atob(dataURI.split(',')[1]);
     // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
     // write the bytes of the string to an ArrayBuffer
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8arr = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8arr[i] = byteString.charCodeAt(i);
     }

    const dataView = new DataView(arrayBuffer);
    const blob = new Blob([dataView], { type: mimeString });

    this.imageToUpload = new File([blob], 'snapshot-' + blob.size + '.jpeg', {
       type: 'image/jpeg'
    });
    // console.log(this.imageToUpload);
///////////////////

    this.fileToUpload = this.imageToUpload;
    this.fileurl = webcamImage.imageAsDataUrl;
    console.log(this.fileToUpload);
    // console.log(this.fileurl);
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  async addUser(id: string, nama: string) {
    if (id === '' || nama === '' || this.fileToUpload == null) {
      Swal.fire({
        type: 'error',
        title: 'Data tidak boleh ada yang kosong!'
      });
    } else {
    const input = new Image();
    input.src = this.fileurl;
    const detection = await faceapi
                            .detectSingleFace(input)
                            .withFaceLandmarks()
                            .withFaceDescriptor();
    console.log(detection);

    if (detection) {
      const data = {id, nama,
      deskriptor: new Float32Array(Object.values(JSON.parse(JSON.stringify(detection.descriptor)))),
       berkas: this.fileToUpload,
       namaBerkas: this.fileToUpload.name
     };

      // tslint:disable-next-line: no-shadowed-variable
      this.service.uploadData(data).subscribe((data) => {
      console.log(data);
      Swal.fire({
        title: 'Data berhasil ditambah',
        type: 'success'
        }).then(async (refresh) => {
          await this.delay(2000);
          window.location.reload();
      });
      });
    }
    }
  }

  handleFileInput(file: FileList) {
    const berkas = file.item(0);
    console.log(berkas);
    this.reader.readAsDataURL(berkas);
    this.fileToUpload = berkas;

    this.reader.onload = async (image) => {
    this.fileurl = this.reader.result;
    // console.log(this.reader);

    };
  }

  public delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms));
  }

}
