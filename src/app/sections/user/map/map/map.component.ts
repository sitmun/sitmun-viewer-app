import { Component } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent {
  constructor() {
    // the body of the DOM is located
    let body = document.body;
    let script = document.createElement('script');

    // the script for map creation is loaded dynamically
    script.src = 'assets/create-map.js';
    script.type = 'text/javascript';
    body.appendChild(script);
  }
}
