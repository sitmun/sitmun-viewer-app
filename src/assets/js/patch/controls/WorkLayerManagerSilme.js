TC.control = TC.control || {};

class WorkLayerManagerSilme extends TC.control.WorkLayerManager {
  CLASS = 'tc-ctl-wlm';

  // ===========================================================================
  // Constructor
  // ===========================================================================

  constructor() {
    super(...arguments)
    const _this = this;
    _this.div.classList.remove(super.CLASS);
    _this.div.classList.add(_this.CLASS);
    _this.layers = [];

    _this.addItemTool({

      renderFn: function (container, layerId) {
        let button = container.querySelector('button.' + _this.CLASS + '-btn-dl');
        if (!button) {
          const layer = _this.map.getLayer(layerId);
          if (TC.layer.Vector && layer instanceof TC.layer.Vector) {
            const text = _this.getLocaleString('downloadFeatures');
            button = document.createElement('button');
            button.innerHTML = text;
            button.setAttribute('title', text);
            button.classList.add(_this.CLASS + '-btn-dl');
            button.dataset.layerId = layerId;
            container.appendChild(button);
          }
        }

        return button;
      },

      actionFn: function () {
        const button = this;
        let li = button;
        do {
          li = li.parentElement;
        }
        while (li && li.tagName !== 'LI');

        const layer = _this.map.getLayer(button.dataset.layerId);
        _this.getDownloadDialog().then(function (control) {
          const title = layer.title || '';
          const options = {
            title: `${title} - ${_this.getLocaleString('downloadFeatures')}`,
            fileName: /\.[a-z0-9]+$/i.test(title) ? title.substr(0, title.lastIndexOf('.')) : title,
            elevation: _this.map.elevation && _this.map.elevation.options
          };
          control.open(layer.features, options);
        });

      }
    });
  }

  // ===========================================================================
  // Métodos de renderizado
  // ===========================================================================

  async render(callback, options) {
    const _this = this;
    return await super.render.call(_this, callback, options);
  }


  async loadTemplates() {
    const _this = this;
    await super.loadTemplates.call(_this);

    _this.template[_this.CLASS + '-elm'] = 'assets/js/patch/templates/WorkLayerManagerSilme.hbs';
    _this.template[_this.CLASS + '-info'] = "assets/js/patch/templates/LayerCatalogInfoSilme.hbs";
  }

  // ===========================================================================
  // Método de registro del componente
  // ===========================================================================

  async register(map) {
    const _this = this;
    const result = await super.register.call(this, map);

    // ...

    return result;
  }

  // ===========================================================================
  // Event listeners para la interfaz
  // ===========================================================================

  addUIEventListeners() {
    const _this = this;

    const inputRangeListener = function (e) {
      const range = e.target;
      let li = range;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');

      const layer = _this.map.getLayer(li.dataset.layerId);
      layer.setOpacity(range.value / 100);
    };

    _this.div.addEventListener('click', TC.EventTarget.listenerBySelector('input[type=checkbox]', function(e) {
      const checkbox = e.target;
      let li = checkbox;
      do {
        li = li.parentElement;
      }
      while (li && !li.matches('li.' + _this.CLASS + '-elm'));

      const layer = _this.map.getLayer(li.dataset.layerId);
      layer.setVisibility(checkbox.checked);
      e.stopPropagation();
    }));

    _this.div.addEventListener('change', TC.EventTarget.listenerBySelector('input[type=range]', inputRangeListener));
    _this.div.addEventListener('input', TC.EventTarget.listenerBySelector('input[type=range]', inputRangeListener));

    // --- Start Silme
    // Se ha borrado el listener: ('change', TC.EventTarget.listenerBySelector('.${_this.CLASS}-cb-info')
    // --- End Silme

    _this.div.addEventListener('click', TC.EventTarget.listenerBySelector('.' + _this.CLASS + '-del' + ':not(.disabled)', function (e) {
      let li = e.target;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');
      const layer = _this.map.getLayer(li.dataset.layerId);
      _this.map.removeLayer(layer);
    }));

    _this.div.addEventListener('click', TC.EventTarget.listenerBySelector('.' + _this.CLASS + '-del-all', function (e) {
      TC.confirm(_this.getLocaleString('layersRemove.confirm'), function () {
        _this.getLayerUIElements()
          .map(function (li) {
            return _this.map.getLayer(li.dataset.layerId);
          })
          .forEach(function (layer) {
            _this.map.removeLayer(layer);
          });
      });

      // --- Start Silme
      // e.stopPropagation();
      // --- End Silme
    }));

    // --- Start Silme
    // Se ha borrado el listener: ('click', TC.EventTarget.listenerBySelector('.${_this.CLASS}-btn-more')
    // --- End Silme

    // --- Start Silme
    // Listeners personalizados

    _this.div.addEventListener('click', TC.EventTarget.listenerBySelector('.tc-ctl-lcat-info-close', function (e) {
      let li = e.target;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');

      const info = li.querySelector('.tc-ctl-lcat-info');
      info.classList.toggle(TC.Consts.classes.HIDDEN);

      if (li.querySelector('input[type="checkbox"]').checked) {
        const dragHandle = li.querySelector('.' + _this.CLASS + '-dd');
        dragHandle.classList.toggle(TC.Consts.classes.HIDDEN, !info.classList.contains(TC.Consts.classes.HIDDEN));
      }

      let checkbox = li.querySelector('.tc-ctl-wlm-cb-info').shadowRoot.querySelector('input');
      checkbox.checked = !checkbox.checked;
    }));

    _this.div.addEventListener('click', TC.EventTarget.listenerBySelector('.' + _this.CLASS + '-btn-query', function (e) {
      if (e.target.classList.contains('tc-unavailable') || e.target.classList.contains('tc-loading')) {
        return;
      }

      let li = e.target;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');

      const layer = _this.map.getLayer(li.dataset.layerId);
      _this.queryControl.renderModalDialog(layer);
    }));

    _this.div.addEventListener('click', TC.EventTarget.listenerBySelector('.' + _this.CLASS + '-cb-info', function (e) {
      // Obtenido del listener anteriormente borrado ('change', TC.EventTarget.listenerBySelector('.${_this.CLASS}-cb-info')

      let li = e.target;
      do {
        li = li.parentElement;
      }
      while (li && li.tagName !== 'LI');

      // --- Start Silme
      // const info = li.querySelector('.' + self.CLASS + '-info');
      const info = li.querySelector('.tc-ctl-lcat-info');
      // --- End Silme

      const layer = _this.map.getLayer(li.dataset.layerId);
      info.querySelectorAll('.' + _this.CLASS + '-legend img').forEach(function (img) {
        _this.styleLegendImage(img, layer);
      });

      info.classList.toggle(TC.Consts.classes.HIDDEN);

      if (li.querySelector('input[type="checkbox"]').checked) {
        const dragHandle = li.querySelector('.' + _this.CLASS + '-dd');
        dragHandle.classList.toggle(TC.Consts.classes.HIDDEN, !info.classList.contains(TC.Consts.classes.HIDDEN));
      }

      info.classList.toggle(TC.Consts.classes.CHECKED);
    }));

    // --- End Silme
  }

  // ===========================================================================
  // Métodos públicos sobreescritos
  // ===========================================================================

  async onExternalServiceAdded(_e) {
    const _this = this;
    return await super.onExternalServiceAdded.call(_this, _e);
  }


  updateLayerVisibility(layer) {
    const _this = this;
    const li = _this.#findLayerElement(layer);
    if (li) {
      li.querySelector('input[type="checkbox"]').checked = layer.getVisibility();
    }
  }


  updateLayerTree(layer) {
    const _this = this;

    const _getLegendImgByPost = function (layer) {
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
      TC.control.MapContents.prototype.updateLayerTree.call(_this, layer);

      let alreadyExists = false;
      for (let i = 0, len = _this.layers.length; i < len; i++) {
        if (layer === _this.layers[i]) {
          alreadyExists = true;
          break;
        }
      }

      if (!alreadyExists) {
        const template = _this.CLASS + '-elm';
        //if (layer.names.length > 0 || layer.availableNames.length > 0) // --- Silme - TESTING
        _this.layers.push(layer);

        let domReadyPromise;

        // --- Start Silme
        // let layerTitle = layer.title || layer.wrap.getServiceTitle();
        let layerTitle = layer.title;
        // --- End Silme

        let layerData = {
          title: layer.options.hideTitle ? '' : layerTitle,
          hide: !!(layer.renderOptions && layer.renderOptions.hide),
          opacity: layer.renderOptions && layer.renderOptions.opacity ? (layer.renderOptions.opacity * 100) : 100,
          customLegend: layer.customLegend,
          unremovable: layer.unremovable
        };

        const isRaster = layer.isRaster();
        if (isRaster) {
          layerData.hasExtent = !!layer.getExtent();
          layerTitle = layer.getPath()[layer.getPath().length - 1]; // --- Silme - conservam sa part de dalt i ho tenim separat per diferenciar entre serveis "normals" i fitxers carregats
          layerData.title = layerTitle; // --- Silme
          layerData.layerNames = layer.layerNames;
          layerData.uid = layer.uid; // --- Silme

          const path = layer.getPath();
          path.shift();
          layerData.path = path;

          const name = layer.names[0];

          // --- Start Silme
          // const info = layer.wrap.getInfo(name, layer);
          const info = _this.#getInfo(name, layer);
          // --- End Silme

          layerData.legend = info.legend;
          layerData['abstract'] = info['abstract'];

          // --- Start Silme
          if (layer.layerNames !== undefined) {
            if (layer.layerNames[0].includes(":"))
              layerData.name = layer.layerNames[0].substr(layer.layerNames[0].indexOf(":") + 1);
            else
              layerData.name = layer.layerNames[0];
          }
          // --- End Silme

          layerData.hasInfo = (info.hasOwnProperty('abstract') || info.hasOwnProperty('legend') || info.hasOwnProperty('metadata'));

          let metadata;

          // --- Start Silme
          // if (layer.tree && layer.tree.children && layer.tree.children.length && layer.tree.children[0].children && layer.tree.children[0].children.length) {
          if (info.metadata == null) {
            // --- End Silme
            // Do nothing

          } else {
            metadata = info.metadata;
            if (metadata) {
              for (let j = 0, len = metadata.length; j < len; j++) {
                const md = metadata[j];
                md.formatDescription = _this.getLocaleString(TC.Util.getSimpleMimeType(md.format)) || _this.getLocaleString('viewMetadata');
              }
            }
          }

          layerData.metadata = metadata;
          if (_this.queries) {
            domReadyPromise = checkWFSAvailable(layer);
          }
        }

        // --- Start Silme
        if (info != null) { // Esta variable está definida en el LayerCatalogSilmeFolders

          let dataUrl;
          if (info.dataUrl != null) {
            dataUrl = info.dataUrl;
            if (dataUrl.length !== 0) {
              dataUrl[0].formatDescription = _this.getLocaleString(TC.Util.getSimpleMimeType(dataUrl[0].format)) || _this.getLocaleString('viewMetadata');
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
        // --- End Silme

        _getLegendImgByPost(layer).then(function(src) {
          if (src) {
            legend.src = src; // Ya se ha validado en getLegendImgByPost
          }

          _this.getRenderedHtml(_this.CLASS + '-elm', layerData).then(function(out) {
            const parser = new DOMParser();
            const li = parser.parseFromString(out, 'text/html').body.firstChild;

            let layerNode;
            let isGroup = false;

            if (isRaster) {
              isGroup = layer.names.length > 1;

              if (!isGroup) {
                const layerNodes = layer.wrap.getAllLayerNodes();
                for (let i = 0; i < layerNodes.length; i++) {
                  const node = layerNodes[i];
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

            const typeElm = li.querySelector('.' + _this.CLASS + '-type');
            const className = isGroup
              ? _this.CLASS + '-type-grp'
              : _this.CLASS + '-type-sgl';
            typeElm.classList.add(className);

            // --- Start Silme
            const zoomBtn = li.querySelector(`.${_this.CLASS}-btn-zoom`);
            if (zoomBtn) {
              zoomBtn.addEventListener(
                TC.Consts.event.CLICK,
                function (e) {
                  _this.map.zoomToLayer(li.dataset.layerId, { animate: true });
                },
                { passive: true }
              );
            }
            // --- End Silme

            if (layerNode) {
              layer.wrap.normalizeLayerNode(layerNode);

              _this.getRenderedHtml(className, layerNode).then(function (out) {
                let tip;

                typeElm.addEventListener('mouseover', function (e) {
                  const mapDiv = _this.map.div;
                  const typeElmRect = typeElm.getBoundingClientRect();
                  tip = document.createElement('div');
                  tip.classList.add(_this.CLASS + '-tip');
                  tip.innerHTML = out;
                  tip.style.top = typeElmRect.top - mapDiv.offsetTop + 'px';
                  tip.style.right = mapDiv.offsetWidth - (typeElmRect.left - mapDiv.offsetLeft) + 'px';
                  mapDiv.appendChild(tip);
                });

                typeElm.addEventListener('mouseout', function (e) {
                  tip.parentElement.removeChild(tip);
                });
              });
            }

            const ul = _this.div.querySelector('ul');
            li.dataset.layerId = layer.id;

            const lis = _this.getLayerUIElements();
            const layerList = _this.map.workLayers.filter(function (l) {
              return !l.stealth;
            });

            const layerIdx = layerList.indexOf(layer);

            // --- Start Silme
            // _this.layerTools.forEach(tool => _this.addLayerToolUI(li, tool));
            _this
              .getItemTools()
              .forEach((tool) => _this.addItemToolUI(li, tool));
            // --- End Silme

            let inserted = false;
            for (let i = 0, ii = lis.length; i < ii; i++) {
              const referenceLi = lis[i];
              const referenceLayerIdx = layerList.indexOf(_this.map.getLayer(referenceLi.dataset.layerId));
              if (referenceLayerIdx < layerIdx) {
                referenceLi.insertAdjacentElement('beforebegin', li);
                inserted = true;
                break;
              }
            }

            if (!inserted) {
              ul.appendChild(li);
            }

            if (domReadyPromise) {
              domReadyPromise(li);
            }
            _this.updateScale();

            // --- Start Silme
            if (isGroup) {
              li.style.background = '#e4e6d0'
              li.querySelector('.tc-ctl-wlm-tools').querySelectorAll('button').forEach(node => {
                node.style.background = '#e4e6d0';
              });

              li.querySelector('.container').style.background = '#e4e6d0';
            }

            ajustarPanell();
            // --- End Silme
          });

          // --- Start Silme
          ajustarPanell();
          // --- End Silme
        });

        const elligibleLayersNum = _this.#getElligibleLayersNumber();

        const numElm = _this.div.querySelector('.' + _this.CLASS + '-n');
        const emptyElm = _this.div.querySelector('.' + _this.CLASS + '-empty');
        const contentElm = _this.div.querySelector('.' + _this.CLASS + '-content');
        numElm.textContent = elligibleLayersNum;

        if (elligibleLayersNum > 0) {
          numElm.classList.add(TC.Consts.classes.VISIBLE);
          emptyElm.classList.add(TC.Consts.classes.HIDDEN);
          contentElm.classList.remove(TC.Consts.classes.HIDDEN);
          // const deleteAllElm = self.div.querySelector('.' + self.CLASS + '-del-all'); // Silme - TESTING
          // deleteAllElm.classList.toggle(TC.Consts.classes.HIDDEN, !shouldBeDelAllVisible(self)); // Silme - TESTING

        } else {
          numElm.classList.remove(TC.Consts.classes.VISIBLE);
          emptyElm.classList.remove(TC.Consts.classes.HIDDEN);
          contentElm.classList.add(TC.Consts.classes.HIDDEN);
        }

        const deleteAllElm = _this.div.querySelector('.' + _this.CLASS + '-del-all');
        deleteAllElm.classList.toggle(TC.Consts.classes.HIDDEN, !_this.#shouldBeDelAllVisible());
      }
    }
  }

  // ===========================================================================
  // Métodos privados utilitarios
  // ===========================================================================

  #findLayerElement(layer) {
    const _this = this;
    return _this.getLayerUIElements().find(li => li.dataset.layerId === layer.id);
  }


  #shouldBeDelAllVisible() {
    const _this = this;
    return !_this.layers.some(layer => layer.unremovable);
  }


  #getElligibleLayersNumber() {
    const _this = this;
    return _this.layers.length;
  }


  #getInfo(name, layer) {
    const _this = layer;
    const result = {};
    const capabilities = _this.capabilities;
    const url = _this.url;

    if (capabilities && capabilities.Capability) {
      const layerNodes = _this.wrap.getAllLayerNodes();
      for (let l in layerNodes) {
        if (_this.compareNames(_this.wrap.getName(l), name)) {
          if (l.Title) {
            result.title = l.Title;
          }

          if (l.Abstract) {
            result['abstract'] = l.Abstract;
          }

          // --- Start Silme
          if (l.Name) {
            if (l.Name.includes(":")) {
              result['name'] = l.Name.substr(l.Name.indexOf(":") + 1);

            } else {
              result['name'] = l.Name;
            }
          }

          if (l.Layer) {
            result.isGroup = true;
          }
          // --- End Silme

          result.legend = [];

          const _process = function (value) {
            const legend = this.wrap.getLegend(value);

            if (legend.src)
              result.legend.push({
                src: legend.src, title: value.Title
              });
          };

          const _traverse = function (o, func) {
            if (o.Layer && o.Layer.length > 0) {
              for (let i in o.Layer) {
                _traverse(o.Layer[i], func);
              }
            } else {
              func.apply(_this, [o]);
            }
          };

          // Obtenemos todas las leyendas de la capa o grupo de capas
          _traverse(l, _process);

          if (l.MetadataURL && l.MetadataURL.length) {
            result.metadata = [];
            for (const md in l.MetadataURL) {
              result.metadata.push({
                format: md.Format, type: md.type, url: md.OnlineResource
              });
            }
          }

          // --- Start Silme
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
          // --- End Silme

          result.queryable = l.queryable;
          break;
        }
      }
    }

    return result;
  }
}

TC.control.WorkLayerManagerSilme = WorkLayerManagerSilme;
TC.mix(WorkLayerManagerSilme, TC.control.itemToolContainer);
