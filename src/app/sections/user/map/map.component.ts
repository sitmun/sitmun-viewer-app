import { Component, OnInit } from '@angular/core';
import { ScriptService } from '@api/services/script.service';

declare const SITNA: any;
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  constructor(private scriptService: ScriptService) {}

  ngOnInit(): void {
    this.scriptService
      .load('sitna')
      .then(() => {
        SITNA.Cfg.crs = 'EPSG:25831';
        SITNA.Cfg.initialExtent = [
          243214.346608211, 4606384.0094297, 574809.60903833, 4650833.9854267
        ];
        // SITNA.Cfg.maxExtent = [];
        SITNA.Cfg.controls.attribution = true;
        SITNA.Cfg.baseLayers = [];
        SITNA.Cfg.baseLayers.push({
          id: 'PNOA',
          url: 'https://www.ign.es/wms-inspire/pnoa-ma',
          layerNames: 'OI.OrthoimageCoverage',
          isBase: true,
          overviewMapLayer: {
            id: 'pnoa_ov',
            type: SITNA.Consts.layerType.WMS,
            url: 'https://www.ign.es/wms-inspire/pnoa-ma',
            layerNames: 'OI.OrthoimageCoverage'
          }
        });
        SITNA.Cfg.workLayers = [];
        SITNA.Cfg.workLayers.push({
          id: 'MUN',
          url: 'https://sitmun.diba.cat/arcgis/services/PUBLIC/DTE50/MapServer/WmsServer',
          layerNames: 'DTE50_MUN'
        });
        SITNA.Cfg.workLayers.push({
          id: 'PROV',
          url: 'https://sitmun.diba.cat/arcgis/services/PUBLIC/DTE50/MapServer/WmsServer',
          layerNames: 'DTE50_PROV'
        });
        SITNA.Cfg.layout = {
          config: '/assets/js/sitna/TC/layout/responsive/config.json',
          markup: '/assets/js/sitna/TC/layout/responsive/markup.html',
          style: '/assets/sitna.css',
          script: '/assets/js/sitna/TC/layout/responsive/script.js',
          i18n: '/assets/js/sitna/TC/layout/responsive/resources'
        };

        new SITNA.Map('mapa');
      })
      .catch((error) => console.log(error));
  }
}
