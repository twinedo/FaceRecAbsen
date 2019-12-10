import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-rekap',
  templateUrl: './rekap.component.html',
  styleUrls: ['./rekap.component.css']
})
export class RekapComponent implements OnInit {
  title = 'Sistem Informasi Presensi Pegawai';

  public rekapan = [];

  constructor(private service: ServiceService) { }

  ngOnInit() {

    this.service.getAbsen().subscribe((rekapAbsen) => {
      console.log(rekapAbsen);
      const rekap = rekapAbsen[2].data;
      console.log(rekap);

      // tslint:disable-next-line: prefer-for-of
      for (let k = 0; k < rekap.length; k++) {
        rekap[k].date = new Date(parseFloat(rekap[k].date));
      }
      this.rekapan = rekap;
      console.log(this.rekapan);
    });
  }
}
