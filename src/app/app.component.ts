import { Component , OnInit} from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { WebcamImage } from 'ngx-webcam';
import { ServiceService } from './service.service';
import { tap, catchError } from 'rxjs/operators';

declare const faceapi;

import Swal from 'sweetalert2/dist/sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css',
  './bootstrap/dist/css/bootstrap.css']
})
export class AppComponent implements OnInit {
  title = 'Sistem Informasi Presensi Pegawai';

  // latest snapshot
  public showWebcam = true;
  public webcamImage: WebcamImage = null;
  public videoOptions: MediaTrackConstraints = {
    width: 400,
    height: 400,
    frameRate: {
      ideal: 30,
      min: 1
    }
  };
  private trigger: Subject<void> = new Subject<void>();

  public reader = new FileReader();
  public gambar = new Image();

  public label = [];

  public dataPegawai = [];

  public faceMatcher: any;
  public deskSplitUser: any;

  public date: Date;
  public hasilFetch: any;

  // file absen yg diupload
  public imageToUpload: File = null;
  public fileToUpload: File = null;

  public waktuKlik: any;
  public batasTelat: any;
  public batasPulang: any;
  public statusAbsen: any;

constructor(
  private service: ServiceService,
  private spinner: NgxSpinnerService
) {
  setInterval(() => {
    this.date = new Date();
  }, 1000);
}


  async ngOnInit() {
  await faceapi.nets.ssdMobilenetv1.loadFromUri('../../assets/weights');
  await faceapi.nets.faceLandmark68Net.loadFromUri('../../assets/weights');
  await faceapi.nets.faceRecognitionNet.loadFromUri('../../assets/weights');
  this.statusAbsen = ' ';
  this.service.getData().subscribe((d) => {
    console.log(d);
    const dataUser = d[2].data;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < dataUser.length; i++) {
      const desk = dataUser[i].deskriptor[0];
      const deskSplit = desk.split(',');
      this.deskSplitUser = new Float32Array(Object.values(JSON.parse(JSON.stringify(deskSplit))));

      this.label.push(new faceapi.LabeledFaceDescriptors
        (
          'https://' + dataUser[i].urlGambar[0] + '$' + dataUser[i].nama + '$' + dataUser[i].id + '$',
          [this.deskSplitUser]
        )
      );
    }

    console.log(this.label);
    this.faceMatcher = new faceapi.FaceMatcher(this.label);
    this.faceMatcher._distanceThreshold = 0.45;

    console.log('Threshold = ' + this.faceMatcher._distanceThreshold + ' (Tingkat kesamaan harus 55%');
  });


}

public ambilGambar(): void {
  this.trigger.next();
  this.spinner.show();

}

public get triggerObservable(): Observable<void> {
  return this.trigger.asObservable();
}

public async handleImage(webcamImage: WebcamImage): Promise<void> {
  console.log('received webcam image', webcamImage);
  this.webcamImage = webcamImage;

  const input = new Image();
  input.src = this.webcamImage.imageAsDataUrl;

  const detection = await faceapi
                          .detectSingleFace(input)
                          .withFaceLandmarks()
                          .withFaceDescriptor();
  console.log(detection);

  //// ubah image yang ditangkap menjadi File
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

  this.fileToUpload = this.imageToUpload;
  console.log(this.fileToUpload);

  // console.log(this.faceMatcher);



  if (detection) {
      this.spinner.hide();
      this.batasTelat = new Date().setHours(8, 1 , 0);
      this.batasPulang = new Date().setHours(12, 0 , 0);
      this.waktuKlik = this.date.getTime();

      const bestMatch = this.faceMatcher.findBestMatch(detection.descriptor);
      console.log(bestMatch.toString());

      console.log('deskriptor dari tangkapan kamera = ' + bestMatch._distance);

      this.dataPegawai = bestMatch.toString().split('$');
      console.log(this.dataPegawai);

      console.log(this.batasTelat);
      console.log(this.waktuKlik);
      if (this.waktuKlik > this.batasTelat && this.waktuKlik < this.batasPulang) {
        console.log('Anda terlambat');
        this.statusAbsen = 'Anda terlambat';
      } else if (this.waktuKlik < this.batasTelat) {
        console.log('Selamat Datang');
        this.statusAbsen = 'Selamat Datang';
      } else if (this.waktuKlik > this.batasPulang) {
        this.statusAbsen = 'Selamat Jalan';
      }
      /////// file yg di upload saat absen
      const data = {
         id : this.dataPegawai[2],
         nama: this.dataPegawai[1],
         distance: bestMatch._distance,
         berkas: this.fileToUpload,
        };
      ////////

      // fungsi uploadAbsen
      // tslint:disable-next-line: no-shadowed-variable
      this.service.uploadAbsen(data).subscribe((datas) => {
        console.log(data);
        console.log(datas);
        });
      ////

      // ABSEN SIAP
      // this.service.postSiap(data.id)
      //   .subscribe(nipPegawai => {
      //     console.log(nipPegawai);
      //   });

      const unknown = bestMatch.toString().split(' ');
      if (unknown.includes('unknown')) {
        const noDetect = 'Wajah tidak dikenali, silahkan coba lagi..';
        this.dataPegawai = ['Tidak dikenali', 'Tidak dikenali', 'Tidak dikenali'];
        console.log(noDetect);

        // tslint:disable-next-line: no-shadowed-variable
        const nooPic = new Image();
        this.dataPegawai[0] = 'assets/img/no-profile.jpeg';
        this.hasilFetch = this.dataPegawai[0];
        nooPic.src = this.hasilFetch;
        console.log(nooPic.src);

        /////// file yg di upload saat absen
        const dataUnknown = {
        id : this.dataPegawai[2],
        nama: this.dataPegawai[1],
        distance: bestMatch._distance,
        berkas: this.fileToUpload,
        // urlGambar: this.dataPegawai[0]
       };
        console.log(dataUnknown);
     ////////

     //// fungsi uploadAbsen
     // tslint:disable-next-line: no-shadowed-variable
        this.service.uploadAbsen(dataUnknown).subscribe((datas) => {
       console.log(data);
       console.log(datas);
       });
     ////

        if (this.waktuKlik > this.batasTelat && this.waktuKlik < this.batasPulang) {
      console.log(' ');
      this.statusAbsen = ' ';
    } else if (this.waktuKlik < this.batasTelat) {
      console.log(' ');
      this.statusAbsen = ' ';
    } else if (this.waktuKlik > this.batasPulang) {
      this.statusAbsen = ' ';
    }
      } else {
        const hasilBind = new Image();
        this.hasilFetch = this.dataPegawai[0];
        hasilBind.src = this.hasilFetch;
      }
  } else {
        this.spinner.hide();
        const noDetect = 'Wajah tidak dikenali, silahkan coba lagi..';
        this.dataPegawai = ['Tidak dikenali', 'Tidak dikenali', 'Tidak dikenali'];
        console.log(noDetect);

        // tslint:disable-next-line: no-shadowed-variable
        const nooPic = new Image();
        this.dataPegawai[0] = 'assets/img/no-profile.jpeg';
        this.hasilFetch = this.dataPegawai[0];
        nooPic.src = this.hasilFetch;
        // console.log(nooPic.src);
        /////// file yg di upload saat absen
        const dataNOPIC = {
        id : this.dataPegawai[2],
        nama: this.dataPegawai[1],
        distance: '0',
          berkas: this.fileToUpload
        };
        ////////

        //// fungsi uploadAbsen
        // tslint:disable-next-line: no-shadowed-variable
        this.service.uploadAbsen(dataNOPIC).subscribe((datas) => {
          console.log(dataNOPIC);
          console.log(datas);
        });
        }

      /////// Memanggil fungsi delay setelah absen agar kembali ke data default
  // console.log('sebelum');
  await this.delay(5000);
  const delayPic = new Image();

  this.dataPegawai[0] = 'assets/img/no-profile.jpeg';
  this.hasilFetch = this.dataPegawai[0];
  delayPic.src = this.hasilFetch;
  // console.log(delayPic.src);

  this.dataPegawai[1] = '...';
  this.dataPegawai[2] = '...';
  this.statusAbsen = ' ';
  // console.log(this.hadir);
  // console.log('sesudah');
      /////

}

  public delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms));
  }
}
