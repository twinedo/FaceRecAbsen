import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { WebcamImage } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';

declare const faceapi;

import Swal from 'sweetalert2/dist/sweetalert2';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
  title = 'Sistem Informasi Presensi Pegawai';

  public data: any;

  public reader = new FileReader();
  public gambar = new Image();
  public imageToUpload: File = null;
  public fileToUpload: File = null;
  public fileurl: any;

  public showButton = false;
  public showText = false;
  public showWebcam = false;
  public webcamImage: WebcamImage = null;
  public videoOptions: MediaTrackConstraints = {
  width: {ideal: 400},
  height: {ideal: 400},
  };

  private trigger: Subject<void> = new Subject<void>();
  public deskriptor: any;

  optionSelected: any;

  constructor(private service: ServiceService) { }

  ngOnInit() {
    faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/weights');
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/weights');
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/weights');

    this.service.getData().subscribe((d) => {
      console.log(d);
      // tslint:disable-next-line: no-string-literal
      this.data = d[2].data;
      console.log(d['2']);
    });

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

    /*const imageBase64 = webcamImage.imageAsDataUrl;
    const blob = new Blob([imageBase64], {type: 'image/jpeg'});
    this.imageToUpload = new File([blob], 'snapshot-' + blob.size + '.jpeg', {
      type: 'image/jpeg'
    });*/

    /////////////// convert imageAsDataUrl ke file
     // data uri dari hasil tangkap kamera
    const dataURI = this.webcamImage.imageAsDataUrl;

     // convert base64 to raw binary data held in a string
    const byteString = atob(dataURI.split(',')[1]);

     // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

     // write the bytes of the string to an ArrayBuffer
    const arrayBuffer = new ArrayBuffer(byteString.length);
    // tslint:disable-next-line: variable-name
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

  async addPhoto() {
    if (this.onOptionsSelected == null || this.fileToUpload == null ) {
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
    const dataPhotoBaru = {
      id: this.optionSelected,
      deskriptor : new Float32Array(Object.values(JSON.parse(JSON.stringify(detection.descriptor)))),
      berkas: this.fileToUpload,
      namaberkas: this.fileToUpload.name
    };

    this.service.editData(dataPhotoBaru).subscribe((data) => {
        console.log(dataPhotoBaru);
        Swal.fire({
          title: 'Foto berhasil ditambah',
          type: 'success'
          }).then(async (refresh) => {
            await this.delay(2000);
            window.location.reload();
        });
      });
    // this.onOptionsSelected(this.optionSelected);
    }
    }
  }

  onOptionsSelected(event) {
    console.log('selected ID: ' + event);
  }

  handleFileInput(file: FileList) {
    const berkas = file.item(0);
    console.log(berkas);
    this.reader.readAsDataURL(berkas);
    this.fileToUpload = berkas;

    this.reader.onload = async (image) => {
    this.fileurl = this.reader.result;
    };
  }

  public delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms));
  }
}
