import { Component } from '@angular/core';
import { ScriptService } from '@api/services/script.service';
import { AbstractMapComponent } from '@sections/common/pages/abstract-map/abstract-map.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent extends AbstractMapComponent {
  constructor(router: Router, scriptService: ScriptService) {
    super(router, scriptService);
  }

  // ngOnInit(): void {
  //   this.scriptService
  //     .load('sitna')
  //     .then(() => {
  //       SITNA.Cfg.crs = 'EPSG:25831';
  //
  //       SITNA.Cfg.baseLayers = [];
  //       // SITNA.Cfg.baseLayers.push({
  //       //   id: 'PNOA',
  //       //   url: 'http://www.ign.es/wms-inspire/pnoa-ma',
  //       //   layerNames: 'OI.OrthoimageCoverage',
  //       //   isBase: true
  //       // });
  //       // SITNA.Cfg.defaultBaseLayer = 'PNOA';
  //
  //       SITNA.Cfg.workLayers.push({
  //         id: 'MUN',
  //         url: 'https://sitmun.diba.cat/arcgis/services/PUBLIC/DTE50/MapServer/WmsServer',
  //         layerNames: 'DTE50_MUN'
  //       });
  //
  //       SITNA.Cfg.initialExtent = [
  //         243214.346608211, 4606384.0094297, 574809.60903833, 4650833.9854267
  //       ];
  //       // SITNA.Cfg.maxExtent = [];
  //       SITNA.Cfg.layout = {
  //         config: '/assets/js/sitna/TC/layout/responsive/config.json',
  //         markup: '/assets/js/sitna/TC/layout/responsive/markup.html',
  //         style: '/assets/sitna.css',
  //         script: '/assets/js/sitna/TC/layout/responsive/script.js',
  //         i18n: '/assets/js/sitna/TC/layout/responsive/resources'
  //       };
  //
  //       new SITNA.Map('mapa');
  //     })
  //     .catch((error) => console.log(error));
  // }
}
