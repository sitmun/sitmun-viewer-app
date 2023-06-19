export interface AppCfg {
  application: AppApplication;
  backgrounds: AppBackground[];
  groups: AppGroup[];
  layers: AppLayer[];
  services: AppService[];
  tasks: AppTaks[];
  //trees: AppTree[];
}
export interface AppApplication {
  id: number;
  title: string;
  type: string;
  theme: string;
  srs: string;
  'situation-map'?: string;
  initialExtent: [number, number, number, number];
}

export interface AppBackground {
  id: string;
  title: string;
}
export interface AppGroup {
  id?: string;
  title?: string;
  layers?: string[];
}

export interface AppLayer {
  id: string;
  title: string;
  layers: string[];
  service: string;
}

export interface AppService {
  id: string;
  url: string;
  type: string;
  parameters: AppParameters;
}

export interface AppParameters {
  matrixSet?: string;
  format?: string;
}

export interface AppControls {
  basemapSelector?: boolean;
  TOC?: boolean;
  workLayerManager?: boolean;
  coordinates?: boolean;
  search?: boolean;
  measure?: boolean;
  overviewMap?: boolean;
  legend?: boolean;
  popup?: boolean;
  attribution?: boolean;
  controlContainer?: boolean;
  navBar?: boolean;
  navBarHome?: boolean;
  streetView?: boolean;
  scaleBar?: boolean;
  scale?: boolean;
  scaleSelector?: boolean;
  fullScreen?: boolean;
  download?: boolean;
  printMap?: boolean;
  share?: boolean;
  geolocation?: boolean;
  dataLoader?: boolean;
  drawMeasureModify?: boolean;
  loadingIndicator?: boolean;
  offlineMapMaker?: boolean;
  featureInfo?: boolean;
  click?: boolean;
}

export interface AppTaks {
  id: string;
  parameters: any;
  'ui-control': string;
}

// export interface AppTree {
//   id: string;
//   title: string;
//   image: string;
//   rootNode: string;
//   nodes: AppNode[];
// }
//
// export interface AppNode {
//   title: string;
// }
