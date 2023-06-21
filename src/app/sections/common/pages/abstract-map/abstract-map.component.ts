import {
  Directive,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OpenModalService } from '@ui/modal/service/open-modal.service';
import { AppCfg } from '@api/model/app-cfg';
import { SitnaHelper } from '@ui/util/sitna-helpers';
import { CommonService } from '@api/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Location } from '@angular/common';

declare const SITNA: any;

@Directive()
export abstract class AbstractMapComponent implements OnInit, OnDestroy {
  private componentDestroyed = new Subject<void>();
  private isInEmbedded: boolean;
  applicationId!: number;
  territoryId!: number;
  locale: string | undefined;

  protected constructor(
    private translate: TranslateService,
    private location: Location,
    protected route: ActivatedRoute,
    protected router: Router,
    protected commonService: CommonService,
    protected modal: OpenModalService,
    private renderer: Renderer2,
    private el: ElementRef,
    private document: Document
  ) {
    const path = this.location.path();
    this.isInEmbedded = path.includes('embedded');

    const currentLang = this.translate.currentLang;
    this.locale = this.parseLang(currentLang);
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.applicationId = Number(params['applicationId']);
      this.territoryId = Number(params['territoryId']);
      if (this.isInEmbedded) {
        this.locale = this.parseLang(params['lang']);
        console.log(this.locale);
      }
      this.clearMap();
      this.commonService
        .fetchMapConfiguration(this.applicationId, this.territoryId)
        .subscribe((appCfg) => {
          this.loadMap(appCfg);
        });
    });

    if (!this.isInEmbedded) {
      this.translate.onLangChange
        .pipe(takeUntil(this.componentDestroyed))
        .subscribe((event) => {
          this.router.navigateByUrl('/').then(() => {
            this.navigateToMap();
          });
        });
    }
  }

  ngOnDestroy() {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
    this.clearMap();
  }

  abstract navigateToMap(): any;

  removeSitnaDivs() {
    const divs = this.document.querySelectorAll('.tc-modal');
    divs.forEach((div) => {
      const father = div.parentElement;
      div.remove();
      if (father && father.innerHTML.trim() === '') {
        this.renderer.removeChild(this.document.body, father);
      }
    });
  }

  removeEmptyDivs() {
    const divElements = this.document.body.querySelectorAll('div');
    divElements.forEach((div: HTMLElement) => {
      if (
        !div.classList.length &&
        !div.getAttribute('id') &&
        div.innerHTML.trim() === ''
      ) {
        this.renderer.removeChild(document.body, div);
      }
    });
  }

  loadMap(appCfg: AppCfg) {
    SITNA.Cfg.controls.layerCatalogSilme = {
      div: 'catalog',
      enableSearch: true,
      layerTreeGroups: [{ id: 'node99', title: 'Altres serveis' }],
      layers: [
        {
          id: 'ordenacio',
          title: "Instruments d'ordenació territorial",
          hideTitle: false,
          type: 'WMS',
          layerNames: ['ordenacio:OR007PTI_solrustic'],
          url: 'https://ide.cime.es/geoserver/ordenacio/wms/',
          hideTree: false,
          format: '',
          parentGroupNode: 'node99'
        },
        {
          id: 'AGE_DPMT Costes',
          title: 'DPMT Costas',
          hideTitle: false,
          type: 'WMS',
          url: 'http://wms.mapama.es/sig/Costas/DPMT/wms.aspx',
          hideTree: false,
          format: '',
          parentGroupNode: 'node99'
        },
        {
          id: 'EEA_Natura2000',
          title: 'Xarxa Natura 2000',
          hideTitle: false,
          type: 'WMS',
          url: 'https://bio.discomap.eea.europa.eu/arcgis/services/ProtectedSites/Natura2000Sites/MapServer/WMSServer',
          hideTree: false,
          format: '',
          parentGroupNode: 'node99'
        },
        {
          id: 'GOIB_EspaisRellAmbiental_IB',
          title: 'Espais de rellevancia ambiental',
          hideTitle: false,
          type: 'WMS',
          url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Espais_Rellevancia_Ambiental/MapServer/WMSServer',
          hideTree: false,
          format: '',
          parentGroupNode: 'node99'
        },
        {
          id: 'GOIB_OrdTerr_IB',
          title: 'Figures Llei Espais Naturals',
          hideTitle: false,
          type: 'WMS',
          url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_OrdTerr_IB/MapServer/WMSServer/',
          hideTree: false,
          format: '',
          parentGroupNode: 'node99'
        },
        {
          id: 'GOIB_RegEspaisNaturals_IB',
          title: 'Regulació dels Espais Naturals',
          hideTitle: false,
          type: 'WMS',
          url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_RegEspaisNaturals_IB/MapServer/WMSServer/',
          hideTree: false,
          format: '',
          parentGroupNode: 'node99'
        },
        {
          id: 'GOIB_Fotovo_Eol_IB',
          title: 'Aptitud fotovoltaica i eòlica',
          hideTitle: false,
          type: 'WMS',
          url: 'https://ideib.caib.es/geoserveis/services/public/GOIB_Fotovo_Eol_IB/MapServer/WMSServer/',
          hideTree: false,
          format: '',
          parentGroupNode: 'node99'
        }
      ]
    };
    //SITNA.Cfg.controls = SitnaHelper.toControls(appCfg);
    const map = new SITNA.Map('mapa', {
      locale: this.locale,
      crs: SitnaHelper.toCrs(appCfg),
      initialExtent: SitnaHelper.toInitialExtent(appCfg),
      layout: SitnaHelper.toLayout(appCfg),
      baseLayers: SitnaHelper.toBaseLayers(appCfg),
      //workLayers: SitnaHelper.toWorkLayers(appCfg),
      controls: SitnaHelper.toControls(appCfg),
      views: SitnaHelper.toViews(appCfg)
    });
    map.loaded(function () {
      SitnaHelper.toWelcome(appCfg);
      SitnaHelper.toHelp(appCfg);
      SitnaHelper.toInterface();
    });
  }

  clearMap() {
    // Map container
    const mapFather = this.el.nativeElement.querySelector('.map-container');
    const map = this.el.nativeElement.querySelector('#mapa');
    const overview = this.el.nativeElement.querySelector(
      '.tc-ctl-sv-view.tc-hidden'
    );
    if (map) {
      this.renderer.removeChild(mapFather, map);
    }
    if (overview) {
      this.renderer.removeChild(mapFather, overview);
    }

    const div = this.renderer.createElement('div');
    this.renderer.setAttribute(div, 'id', 'mapa');
    this.renderer.appendChild(mapFather, div);

    // Body
    this.removeSitnaDivs();
    this.removeEmptyDivs();
  }

  parseLang(lang: string): string {
    switch (lang) {
      case 'es':
        return lang.concat('-ES');
      case 'en':
        return lang.concat('-US');
      case 'ca':
        return lang.concat('-CA');
      default:
        return 'es-ES';
    }
  }
}
