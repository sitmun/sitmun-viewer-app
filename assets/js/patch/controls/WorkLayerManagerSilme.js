//import TC from '../../lib/api-sitna-master-silme/TC.js';
//import Consts from '../../lib/api-sitna-master-silme/TC/Consts.js';
// import WorkLayerManager from '../../lib/api-sitna-master-silme/TC/control/WorkLayerManager.js';
//import itemToolContainer from '../../lib/api-sitna-master-silme/TC/control/itemToolContainer.js';

// SILME const { default: WorkLayerManager } = require("../../lib/api-sitna-master-silme/TC/control/WorkLayerManager");
// const { default: WorkLayerManager } = require("../../sitna/sitna");

TC.control = TC.control || {};

class WorkLayerManagerSilme extends TC.control.WorkLayerManager {
  CLASS = 'tc-ctl-wlm';
  CLICKEVENT = 'click';

  constructor() {
    super(...arguments)
    const self = this;
    self.div.classList.remove(super.CLASS);
    self.div.classList.add(self.CLASS);

    self.template[self.CLASS + '-elm'] = 'assets/js/patch/templates/WorkLayerManagerElementSilme.hbs';
    self.template['tc-ctl-lcat' + '-info'] = "assets/js/patch/templates/LayerCatalogInfoSilme.hbs";

    self.layers = [];


    // self.addLayerTool({
    /*
    self.addItemTool({
        renderFn: function (container, layerId) {
            const className = self.CLASS + '-btn-info';

            let button = container.querySelector('button.' + className);
            if (!button) {
                const layer = self.map.getLayer(layerId);
                if (layer.isRaster()) {
                    const info = layer.getInfo();
                    if (info.hasOwnProperty('abstract') || info.hasOwnProperty('legend') || info.hasOwnProperty('metadata')) {
                        const text = self.getLocaleString('infoFromThisLayer');
                        button = document.createElement('button');
                        button.innerHTML = text;
                        button.setAttribute('title', text);
                        button.classList.add(className);
                        button.dataset.layerId = layerId;
                        container.appendChild(button);
                    }
                }
            }
            return button;
        },
        actionFn: function () {
            const button = this;
            var li = button;
            do {
                li = li.parentElement;
            }
            while (li && li.tagName !== 'LI');
            const info = li.querySelector('.tc-ctl-lcat-info');//SILME
            //const info = li.querySelector('.' + self.CLASS + '-info');
            const layer = self.map.getLayer(button.dataset.layerId);
            // Cargamos la imagen de la leyenda
            info.querySelectorAll('.' + self.CLASS + '-legend img').forEach(function (img) {
                self.styleLegendImage(img, layer);
            });
            // Make the DIV element draggable:
            dragElement(info);//Silme
            info.classList.toggle(TC.Consts.classes.HIDDEN);

            if (li.querySelector('input[type="checkbox"]').checked) {
                const dragHandle = li.querySelector('.' + self.CLASS + '-dd');
                dragHandle.classList.toggle(TC.Consts.classes.HIDDEN, !info.classList.contains(TC.Consts.classes.HIDDEN));
            }

            button.classList.toggle(TC.Consts.classes.CHECKED);
        }
    });
    */

    // self.addLayerTool({
    self.addItemTool({
      renderFn: function (container, layerId) {
        const className = self.CLASS + '-btn-dl';

        let button = container.querySelector('button.' + className);
        if (!button) {
          const layer = self.map.getLayer(layerId);
          if (TC.layer.Vector && layer instanceof TC.layer.Vector) {
            const text = self.getLocaleString('downloadFeatures');
            button = document.createElement('button');
            button.innerHTML = text;
            button.setAttribute('title', text);
            button.classList.add(className);
            button.dataset.layerId = layerId;
            container.appendChild(button);
          }
        }
        return button;
      },
      actionFn: function () {
        const button = this;
        var li = button;
        do {
          li = li.parentElement;
        }
        while (li && li.tagName !== 'LI');
        const layer = self.map.getLayer(button.dataset.layerId);
        self.getDownloadDialog().then(function (control) {
          const title = layer.title || '';
          const options = {
            title: `${title} - ${self.getLocaleString('downloadFeatures')}`,
            fileName: /\.[a-z0-9]+$/i.test(title) ? title.substr(0, title.lastIndexOf('.')) : title,
            elevation: self.map.elevation && self.map.elevation.options
          };
          control.open(layer.features, options);
        });
      }
    });

    //const result = TC.control.WorkLayerManager.prototype.register.call(self, map);

    //return result;
  }

  render(callback, options) {
    return super.render.call(this, callback, options);
  }

  async register(map) {
    const self = this;

    self.template[self.CLASS + '-elm'] = 'assets/js/patch/templates/WorkLayerManagerSilme.hbs';
    self.template[self.CLASS + '-info'] = "assets/js/patch/templates/LayerCatalogInfoSilme.hbs";

    await super.register.call(this, map);

    return self;
  }

  onExternalServiceAdded(_e) {
    // Este control no tiene que aceptar servicios externos directamente
  }

  addUIEventListeners() {
    //Copiam la mateixa funció que a WorkLayerManager perque volem modificar un event i no és possible eliminar un event anònim
    //Apart, afegim un nou event
    const self = this;

    self.div.addEventListener(self.CLICKEVENT, TC.EventTarget.listenerBySelector('input[type=checkbox]', function (e) {
      // al estar en ipad el evento pasa a ser touchstart en la constante: TC.Consts.event.CLICK, los checkbox no funcionan bien con este evento
      const checkbox = e.target;
      var li = checkbox;
      do {
        li = li.parentElement;
      }
      while (li && !li.matches('li.' + self.CLASS + '-elm'));

      const layer = self.map.getLayer(li.dataset.layerId);
      layer.setVisibility(checkbox.checked);
      e.stopPropagation();
    }));

    const inputRangeListener = function (e) {
      const range = e.target;
      var li = range;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');

      const layer = self.map.getLayer(li.dataset.layerId);
      layer.setOpacity(range.value / 100);
    };
    self.div.addEventListener('change', TC.EventTarget.listenerBySelector('input[type=range]', inputRangeListener));
    self.div.addEventListener('input', TC.EventTarget.listenerBySelector('input[type=range]', inputRangeListener));

    self.div.addEventListener(self.CLICKEVENT, TC.EventTarget.listenerBySelector('.' + self.CLASS + '-del' + ':not(.disabled)', function (e) {
      var li = e.target;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');
      const layer = self.map.getLayer(li.dataset.layerId);
      self.map.removeLayer(layer);
    }));

    self.div.addEventListener(self.CLICKEVENT, TC.EventTarget.listenerBySelector('.' + self.CLASS + '-del-all', function (e) {
      TC.confirm(self.getLocaleString('layersRemove.confirm'), function () {
        self.getLayerUIElements()
          .map(function (li) {
            return self.map.getLayer(li.dataset.layerId);
          })
          .forEach(function (layer) {
            self.map.removeLayer(layer);
          });
      });
    }));

    //Silme
    self.div.addEventListener(self.CLICKEVENT, TC.EventTarget.listenerBySelector('.tc-ctl-lcat-info-close', function (e) {
      const a = e.target;
      var li = a;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');

      const info = li.querySelector('.tc-ctl-lcat-info');
      info.classList.toggle(TC.Consts.classes.HIDDEN);
      //li.querySelector('.tc-ctl-lcat-info').classList.toggle(TC.Consts.classes.CHECKED);
      //li.querySelector('.tc-ctl-wlm-cb-info').classList.toggle(TC.Consts.classes.CHECKED);
      if (li.querySelector('input[type="checkbox"]').checked) {
        const dragHandle = li.querySelector('.' + self.CLASS + '-dd');
        dragHandle.classList.toggle(TC.Consts.classes.HIDDEN, !info.classList.contains(TC.Consts.classes.HIDDEN));
      }
      var checkbox = li.querySelector('.tc-ctl-wlm-cb-info').shadowRoot.querySelector('input');
      checkbox.checked = !checkbox.checked;
    }));

    self.div.addEventListener(self.CLICKEVENT, TC.EventTarget.listenerBySelector('.' + self.CLASS + '-btn-query', function (e) {
      if (e.target.classList.contains('tc-unavailable') || e.target.classList.contains('tc-loading')) {
        return;
      }
      const a = e.target;
      var li = a;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');
      const layer = self.map.getLayer(li.dataset.layerId);
      self.queryControl.renderModalDialog(layer);
    }));

    //self.div.addEventListener(self.CLICKEVENT, TC.EventTarget.listenerBySelector(`.${self.CLASS}-btn-info`, function (e) {
    self.div.addEventListener(self.CLICKEVENT, TC.EventTarget.listenerBySelector(`.${self.CLASS}-cb-info`, function (e) {
      const checkbox = e.target;
      var li = checkbox;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');
      const info = li.querySelector('.tc-ctl-lcat-info');//SILME
      //const info = li.querySelector('.' + self.CLASS + '-info');
      const layer = self.map.getLayer(li.dataset.layerId);
      // Cargamos la imagen de la leyenda
      info.querySelectorAll('.' + self.CLASS + '-legend img').forEach(function (img) {
        self.styleLegendImage(img, layer);
      });
      // Make the DIV element draggable:
      //dragElement(info);//Silme
      info.classList.toggle(TC.Consts.classes.HIDDEN);

      if (li.querySelector('input[type="checkbox"]').checked) {
        const dragHandle = li.querySelector('.' + self.CLASS + '-dd');
        dragHandle.classList.toggle(TC.Consts.classes.HIDDEN, !info.classList.contains(TC.Consts.classes.HIDDEN));
      }

      info.classList.toggle(TC.Consts.classes.CHECKED);
    }));
  }

  updateLayerVisibility(layer) {
    const self = this;
    const li = self.#findLayerElement(layer);
    if (li) {
      const visible = layer.getVisibility();
      li.querySelector('input[type="checkbox"]').checked = visible;
    }
  };

  updateLayerTree(layer) {
    var self = this;

    var getLegendImgByPost = function (layer) {
      return new Promise(function (resolve, reject) {
        if (layer && layer.options.method && layer.options.method === "POST") {
          layer.getLegendGraphicImage()
            .then(function (src) {
              resolve(src);
            })
            .catch(function (err) { TC.error(err); });
        } else {
          resolve();
        }
      });
    };

    if (!layer.isBase && !layer.options.stealth) {
      TC.control.MapContents.prototype.updateLayerTree.call(self, layer);

      var alreadyExists = false;
      for (var i = 0, len = self.layers.length; i < len; i++) {
        if (layer === self.layers[i]) {
          alreadyExists = true;
          break;
        }
      }

      if (!alreadyExists) {
        var template = self.CLASS + '-elm';
        //if (layer.names.length > 0 || layer.availableNames.length > 0)//SILME - TESTING
        self.layers.push(layer);

        /* SILME 20210415 TC.loadJSInOrder(
            !window.dust,
            TC.url.templating,
            function () {*/
        var domReadyPromise;
        var layerTitle = layer.title;//Silme || layer.wrap.getServiceTitle();
        var layerData = {
          title: layer.options.hideTitle ? '' : layerTitle,
          hide: layer.renderOptions && layer.renderOptions.hide ? true : false,
          opacity: layer.renderOptions && layer.renderOptions.opacity ? (layer.renderOptions.opacity * 100) : 100,
          customLegend: layer.customLegend,
          unremovable: layer.unremovable
        };
        var isRaster = layer.isRaster();
        if (isRaster) {
          layerData.hasExtent = !!layer.getExtent();
          layerTitle = layer.getPath()[layer.getPath().length - 1];//Silme conservam sa part de dalt i ho tenim separat per diferenciar entre serveis "normals" i fitxers carregats
          layerData.title = layerTitle;//Silme
          layerData.layerNames = layer.layerNames;
          layerData.uid = layer.uid;//Silme
          var path = layer.getPath();
          path.shift();
          layerData.path = path;
          var name = layer.names[0];
          // SILME var info = layer.wrap.getInfo(name, layer);
          var info = self.getInfo(name, layer);
          layerData.legend = info.legend;
          layerData['abstract'] = info['abstract'];
          //Silme
          if (layer.layerNames != undefined) {
            if (layer.layerNames[0].includes(":"))
              layerData.name = layer.layerNames[0].substr(layer.layerNames[0].indexOf(":") + 1);
            else
              layerData.name = layer.layerNames[0];
          }
          //End Silme
          //var hasInfo = (info.hasOwnProperty('abstract') || info.hasOwnProperty('legend') || info.hasOwnProperty('metadata'));
          layerData.hasInfo = (info.hasOwnProperty('abstract') || info.hasOwnProperty('legend') || info.hasOwnProperty('metadata'));
          var metadata;
          //silme if (layer.tree && layer.tree.children && layer.tree.children.length && layer.tree.children[0].children && layer.tree.children[0].children.length) {
          if (info.metadata == null) {//Silme
          }
          else {
            metadata = info.metadata;
            if (metadata) {
              for (var j = 0, len = metadata.length; j < len; j++) {
                var md = metadata[j];
                md.formatDescription = self.getLocaleString(TC.Util.getSimpleMimeType(md.format)) || self.getLocaleString('viewMetadata');
              }
            }
          }
          layerData.metadata = metadata;
          if (self.queries) {
            domReadyPromise = checkWFSAvailable(layer);
          }
        }

        //Silme

        if (info != null) {

          var dataUrl;
          if (info.dataUrl != null) {
            dataUrl = info.dataUrl;
            if (dataUrl.length != 0) {
              dataUrl[0].formatDescription = self.getLocaleString(TC.Util.getSimpleMimeType(dataUrl[0].format)) || self.getLocaleString('viewMetadata');
              layerData.dataUrl = dataUrl;
            }
          }

          if (info.parentAbstract != null) {
            layerData.parentAbstract = info.parentAbstract;
          }

          if (info.contactPerson != null) {
            layerData.contactPerson = info.contactPerson;
          }

          if (info.contactOrganization != null) {
            layerData.contactOrganization = info.contactOrganization;
          }

          if (info.contactMail != null) {
            layerData.contactMail = info.contactMail;
          }

          if (info.contactTelephone != null) {
            layerData.contactTelephone = info.contactTelephone;
          }

          if (info.fees != null) {
            layerData.fees = info.fees;
          }

          if (info.accessConstraints != null) {
            layerData.accessConstraints = info.accessConstraints;
          }

          if (layer.url != null) {
            layerData.url = layer.url;
          }
        }
        //END SILME

        getLegendImgByPost(layer).then(function (src) {
          if (src) {
            legend.src = src; // ya se ha validado en getLegendImgByPost
          }
          self.getRenderedHtml(self.CLASS + '-elm', layerData).then(function (out) {
            const parser = new DOMParser();
            const li = parser.parseFromString(out, 'text/html').body.firstChild;
            var layerNode;
            var isGroup = false;
            if (isRaster) {
              isGroup = layer.names.length > 1;
              if (!isGroup) {
                var layerNodes = layer.wrap.getAllLayerNodes();
                for (var i = 0; i < layerNodes.length; i++) {
                  var node = layerNodes[i];
                  if (layer.wrap.getName(node) === name) {
                    layerNode = node;
                    if (layer.wrap.getLayerNodes(node).length > 0) {
                      isGroup = true;
                    }
                    break;
                  }
                }
              }
            }

            const typeElm = li.querySelector('.' + self.CLASS + '-type');
            const className = isGroup ? self.CLASS + '-type-grp' : self.CLASS + '-type-sgl';
            typeElm.classList.add(className);

            //SILME MV aquest codi l'he agafat de la versió 2.1 de la API
            const zoomBtn = li.querySelector(`.${self.CLASS}-btn-zoom`);
            if (zoomBtn) {
              zoomBtn.addEventListener(TC.Consts.event.CLICK, function (e) {
                self.map.zoomToLayer(li.dataset.layerId, { animate: true });
              }, { passive: true });
            }
            //END SILME

            //if (!hasInfo) {
            //    if (li.querySelector('.' + self.CLASS + '-btn-info'))
            //        li.querySelector('.' + self.CLASS + '-btn-info').classList.add(TC.Consts.classes.HIDDEN);
            //}

            if (layerNode) {
              layer.wrap.normalizeLayerNode(layerNode);

              self.getRenderedHtml(className, layerNode).then(function (out) {
                var tip;

                typeElm.addEventListener('mouseover', function (e) {
                  const mapDiv = self.map.div;
                  const typeElmRect = typeElm.getBoundingClientRect();
                  tip = document.createElement('div');
                  tip.classList.add(self.CLASS + '-tip');
                  tip.innerHTML = out;
                  tip.style.top = (typeElmRect.top - mapDiv.offsetTop) + 'px';
                  tip.style.right = mapDiv.offsetWidth - (typeElmRect.left - mapDiv.offsetLeft) + 'px';
                  mapDiv.appendChild(tip);
                });
                typeElm.addEventListener('mouseout', function (e) {
                  tip.parentElement.removeChild(tip);
                });
              });
            }
            const ul = self.div.querySelector('ul');
            li.dataset.layerId = layer.id;

            const lis = self.getLayerUIElements();
            const layerList = self.map.workLayers
              .filter(function (l) {
                return !l.stealth;
              });
            const layerIdx = layerList.indexOf(layer);

            //self.layerTools.forEach(tool => self.addLayerToolUI(li, tool)); // MV silme 20230317
            self.getItemTools().forEach(tool => self.addItemToolUI(li, tool));

            var inserted = false;
            for (var i = 0, ii = lis.length; i < ii; i++) {
              const referenceLi = lis[i];
              const referenceLayerIdx = layerList.indexOf(self.map.getLayer(referenceLi.dataset.layerId));
              if (referenceLayerIdx < layerIdx) {
                referenceLi.insertAdjacentElement('beforebegin', li);
                inserted = true;
                break;
              }
            }
            if (!inserted) {
              ul.appendChild(li);
            }

            if (domReadyPromise) domReadyPromise(li);
            self.updateScale();

            if (isGroup) { //SILME MV
              li.style.background = '#e4e6d0'
              li.querySelector('.tc-ctl-wlm-tools').querySelectorAll('button').forEach(node => {
                node.style.background = '#e4e6d0';
              });
              li.querySelector('.container').style.background = '#e4e6d0';
            }
          });

          //Silme redimensionam controls
          ajustarPanell();
        });
        /* END SILME 15042021}
    );*/

        var elligibleLayersNum = self.#getElligibleLayersNumber();

        const numElm = self.div.querySelector('.' + self.CLASS + '-n');
        const emptyElm = self.div.querySelector('.' + self.CLASS + '-empty');
        const contentElm = self.div.querySelector('.' + self.CLASS + '-content');
        numElm.textContent = elligibleLayersNum;
        if (elligibleLayersNum > 0) {
          numElm.classList.add(TC.Consts.classes.VISIBLE);
          emptyElm.classList.add(TC.Consts.classes.HIDDEN);
          contentElm.classList.remove(TC.Consts.classes.HIDDEN);
          //const deleteAllElm = self.div.querySelector('.' + self.CLASS + '-del-all');//SILME - TESTING
          //deleteAllElm.classList.toggle(TC.Consts.classes.HIDDEN, !shouldBeDelAllVisible(self));//SILME - TESTING
        }
        else {
          numElm.classList.remove(TC.Consts.classes.VISIBLE);
          emptyElm.classList.remove(TC.Consts.classes.HIDDEN);
          contentElm.classList.add(TC.Consts.classes.HIDDEN);
        }

        const deleteAllElm = self.div.querySelector('.' + self.CLASS + '-del-all');
        deleteAllElm.classList.toggle(TC.Consts.classes.HIDDEN, !self.#shouldBeDelAllVisible());
      }
    }
  };

  #findLayerElement(layer) {
    this.getLayerUIElements().find(li => li.dataset.layerId === layer.id);
  };

  #shouldBeDelAllVisible() {
    return !this.layers.some(layer => layer.unremovable);
  };

  #getElligibleLayersNumber() {
    return this.layers.length;
  }

  getInfo(name, layer) {
    var self = layer;
    var result = {};
    var capabilities = self.capabilities;
    var url = self.url;
    if (capabilities && capabilities.Capability) {
      var layerNodes = self.wrap.getAllLayerNodes();
      for (var i = 0; i < layerNodes.length; i++) {
        var l = layerNodes[i];
        if (self.compareNames(self.wrap.getName(l), name)) {
          if (l.Title) {
            result.title = l.Title;
          }
          if (l.Abstract) {
            result['abstract'] = l.Abstract;
          }
          //Silme
          if (l.Name) {
            if (l.Name.includes(":"))
              result['name'] = l.Name.substr(l.Name.indexOf(":") + 1);
            else
              result['name'] = l.Name;
          }

          if (l.Layer) {
            result.isGroup = true;
          }
          //End Silme
          result.legend = [];

          var _process = function (value) {
            var legend = this.wrap.getLegend(value);

            if (legend.src)
              result.legend.push({
                src: legend.src, title: value.Title
              });
          };

          var _traverse = function (o, func) {
            if (o.Layer && o.Layer.length > 0) {
              for (var i in o.Layer) {
                //bajar un nivel en el árbol
                _traverse(o.Layer[i], func);
              }
            } else {
              func.apply(self, [o]);
            }
          };

          //Obtenemos todas las leyendas de la capa o grupo de capas
          _traverse(l, _process);

          if (l.MetadataURL && l.MetadataURL.length) {
            result.metadata = [];
            for (var j = 0; j < l.MetadataURL.length; j++) {
              var md = l.MetadataURL[j];
              result.metadata.push({
                format: md.Format, type: md.type, url: md.OnlineResource
              });
            }
          }
          //Silme
          result.dataUrl = [];
          if (l.DataURL) {
            result.dataUrl.push({ format: l.DataURL.Format, type: l.DataURL.OnlineResource.type, url: l.DataURL.OnlineResource.href });
          }

          result.parentAbstract = [];
          if (capabilities.Service.Abstract) {
            result.parentAbstract = capabilities.Service.Abstract;
          }

          result.contactPerson = [];
          if (capabilities.Service.ContactInformation.ContactPersonPrimary.ContactPerson) {
            result.contactPerson = capabilities.Service.ContactInformation.ContactPersonPrimary.ContactPerson;
          }

          result.contactOrganization = [];
          if (capabilities.Service.ContactInformation.ContactPersonPrimary.ContactOrganization) {
            result.contactOrganization = capabilities.Service.ContactInformation.ContactPersonPrimary.ContactOrganization;
          }

          result.contactMail = [];
          if (capabilities.Service.ContactInformation.ContactElectronicMailAddress) {
            result.contactMail = capabilities.Service.ContactInformation.ContactElectronicMailAddress;
          }

          result.contactTelephone = [];
          if (capabilities.Service.ContactInformation.ContactVoiceTelephone) {
            result.contactTelephone = capabilities.Service.ContactInformation.ContactVoiceTelephone;
          }

          result.fees = [];
          if (capabilities.Service.Fees) {
            result.fees = capabilities.Service.Fees;
          }

          result.accessConstraints = [];
          if (capabilities.Service.AccessConstraints) {
            result.accessConstraints = capabilities.Service.AccessConstraints;
          }

          result.url = [];
          if (url) {
            result.url = url;
          }



          //End silme
          result.queryable = l.queryable;
          break;
        }
      }
    }
    return result;
  };

}

//SILME.control.WorkLayerManager = WorkLayerManagerSilme;
TC.control.WorkLayerManagerSilme = WorkLayerManagerSilme;

TC.mix(WorkLayerManagerSilme, TC.control.itemToolContainer);
