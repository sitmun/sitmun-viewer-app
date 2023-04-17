import { Component, OnInit } from '@angular/core';
import { ScriptService } from '@api/services/script.service';

declare const SITNA: any;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  constructor(private scriptService: ScriptService) {
    // // the body of the DOM is located
    // let body = document.body;
    // let script = document.createElement('script');
    //
    // // the script for map creation is loaded dynamically
    // script.src = 'assets/create-map.js';
    // script.type = 'text/javascript';
    // body.appendChild(script);
  }

  ngOnInit(): void {
    this.scriptService
      .load('sitna')
      .then(() => {
        const map = new SITNA.Map('mapa');
      })
      .catch((error) => console.log(error));
  }
}
