import { Injectable } from '@angular/core';
interface Scripts {
  name: string;
  src: string;
}
export const ScriptStore: Scripts[] = [
  { name: 'sitna', src: '../../../assets/js/sitna/sitna.js' },
  {
    name: 'sitmunLayerCatalog',
    src: '../../../assets/js/patch/LayerCatalogSilme.js'
  },
  { name: 'sitmunModal', src: '../../../assets/js/patch/SilmeModal.js' },
  { name: 'sitmunSupport', src: '../../../assets/js/patch/SilmeUtils.js' },
  { name: 'sitmunTree', src: '../../../assets/js/patch/SilmeTree.js' },
  {
    name: 'sitmunProxification',
    src: '../../../assets/js/patch/SitmunProxification.js'
  }
];

declare var document: any;

@Injectable({
  providedIn: 'root'
})
export class ScriptService {
  private scripts: any = {};

  constructor() {
    ScriptStore.forEach((script: any) => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });
  }

  load(...scripts: string[]) {
    var promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadAll() {
    var promises: any[] = [];
    [
      'sitna',
      'sitmunLayerCatalog',
      'sitmunModal',
      'sitmunSupport',
      'sitmunTree',
      'sitmunProxification'
    ].forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise((resolve) => {
      //resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        //load script
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {
          //IE
          script.onreadystatechange = () => {
            if (
              script.readyState === 'loaded' ||
              script.readyState === 'complete'
            ) {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {
          //Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = () =>
          resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }
}
