var ret = false;
var info = null;
var selfClass = null;

TC.control = TC.control || {};

if (!TC.control.LayerCatalog) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/LayerCatalog');
}

(function() {
  const cacheCapabilities = {};

  const realTree = new Object();
  var SEARCH_MIN_LENGTH = 3;

  TC.control.LayerCatalogSilmeFolders = function() {
    var _ctl = this;

    TC.control.LayerCatalog.apply(_ctl, arguments);

    _ctl._selectors = {
      LAYER_ROOT: 'div.' + _ctl.CLASS + '-tree > ul.' + _ctl.CLASS + '-branch > li.' + _ctl.CLASS + '-node > ul.' + _ctl.CLASS + '-branch > li.' + _ctl.CLASS + '-node'
    };
  };

  TC.inherit(TC.control.LayerCatalogSilmeFolders, TC.control.LayerCatalog);

  TC.control.LayerCatalogSilmeFolders.prototype.register = function(map) {
    var _ctl = this;

    _ctl.template[_ctl.CLASS] = "assets/js/patch/templates/LayerCatalogSilme.hbs";
    _ctl.template[_ctl.CLASS + "-node"] = "assets/js/patch/templates/LayerCatalogNodeSilmeFolders.hbs";
    _ctl.template[_ctl.CLASS + "-branch"] = "assets/js/patch/templates/LayerCatalogBranchSilmeFolders.hbs";
    _ctl.template[_ctl.CLASS + '-info'] = "assets/js/patch/templates/LayerCatalogInfoSilme.hbs";
    _ctl.template[_ctl.CLASS + '-results'] = "assets/js/patch/templates/LayerCatalogResultsSilme.hbs";
    _ctl.template[_ctl.CLASS + '-proj'] = "assets/js/patch/templates/LayerCatalogProjSilme.hbs";

    const result = TC.control.LayerCatalog.prototype.register.call(_ctl, map);

    map
      .on(TC.Consts.event.LAYERADD + ' ' + TC.Consts.event.UPDATEPARAMS, function(e) {
        // MV 20221006 - Cercam dins els layers del capabilities
        CercaLayerDinsCapabilities(e);

        const layer = e.layer;
        if (!layer.isBase && layer.type === TC.Consts.layerType.WMS) {

          _ctl.loaded().then(function() { // Esperamos a que cargue primero las capas de la configuración

            if (_ctl.getLayerRootNodes(layer)) {
              updateControl.call(_ctl, layer);
            } else {
              // la capa no está renderizada, pero podría estar en proceso, comprobamos que no está en la lista de capas del control
              var layerAlreadyAdded = false;
              for (var i = 0, len = _ctl.layers.length; i < len; i++) {
                var lyr = _ctl.layers[i];
                if (lyr.type === layer.type && lyr.options.url === layer.options.url) {
                  layerAlreadyAdded = true;
                  break;
                }
              }

              // 12/03/2019 GLS la capa forma parte de los servicios configurados pero el nodo aún no se ha cargado, la guardamos
              if (layerAlreadyAdded) {
                if (!_ctl.layersToSetChecked) {
                  _ctl.layersToSetChecked = [];
                }

                _ctl.layersToSetChecked.push(layer);
              } else {
                _ctl.addLayer(new TC.layer.Raster({
                  url: layer.options.url,
                  type: layer.type,
                  layerNames: [],
                  title: layer.title || layer.wrap.getServiceTitle(),
                  hideTitle: true,
                  hideTree: false
                })).then(function() {
                  updateControl.call(_ctl, layer);
                });
              }
            }
          });
        }
      })
      .on(TC.Consts.event.EXTERNALSERVICEADDED, function(e) {
        if (e && e.layer) {
          _ctl.addLayer(e.layer);
          _ctl.div.classList.remove(TC.Consts.classes.COLLAPSED);
        }
      })
      .on(TC.Consts.event.LAYERREMOVE, function(e) {
        const layer = e.layer;
        _ctl.getLayerNodes(layer).forEach(function(node) {
          // TODO - DOCUMENTAR 20240430
          try {
            uncheckParentFoldersIfChildless(node);
          } catch (err) {
            // parent not found
          }
        });
      });

    getInstance = function() {
      return _ctl;
    }

    silmeLayerCatalog = this; //Silme

    return result;
  };

  /*TC.control.LayerCatalogSilme.prototype.getRenderedHtml = function (templateId, data, callback) {
      var _ctl = this;
      const result = TC.control.LayerCatalog.prototype.getRenderedHtml.call(_ctl, templateId, data, callback);
  };*/

  const uncheckParentFoldersIfChildless = function(node) {
    // trobar carpeta superior
    var parent = node.parentElement;

    // cuando llegamos al 'tc-ctl-lcat-tree' ya es la raíz del arlbol del control LayerCatalog
    while (!parent.classList.contains('tc-ctl-lcat-tree')) {
      if (parent.classList.contains('sitmun-folder'))
      {
        // comprovar si la carpeta té alguna capa carregada i desmarcarla si no n'hi ha cap
        var nodesChecked = parent.querySelectorAll('li.tc-ctl-lcat-leaf.tc-checked');
        if (nodesChecked.length == 0) parent.classList.remove(SITNA.Consts.classes.CHECKED);
      }
      parent = parent.parentElement;
    }
  }

  const addLogicToTreeGroup = function(node) {
    const self = this;

    node.querySelectorAll('li > button.' + self.CLASS + '-collapse-btn').forEach(function(btn) {
      btn.addEventListener('click', onCollapseButtonClick);
    });

    node.querySelectorAll('li > span').forEach(function(span) {
      span.addEventListener('click', onCollapseButtonClick);
    });

    node.querySelectorAll('span').forEach(function(span) {
      span.addEventListener('click', function(e) {
        onSpanClick(e, self);
      });
    });
  };

  const onCollapseButtonClick = function(e) {
    if (e.target.tagName.toLocaleLowerCase() != "span" || !e.target.parentElement.querySelector('li')?.dataset.layerUid) {
      e.target.blur();
      e.stopPropagation();
      const li = e.target.parentElement;
      if (li.tagName === 'LI' && !li.classList.contains(self.CLASS + '-leaf') && li.querySelector('ul')) {
        li.classList.toggle(TC.Consts.classes.COLLAPSED);
        const ul = li.querySelector('ul');
        ul.classList.toggle(TC.Consts.classes.COLLAPSED);
      }
    }
  };

  const onSpanClick = function(e, ctl) {
    if (e.target.classList.contains(SITNA.Consts.classes.SELECTABLE)) {
      const li = e.target.parentNode;
      if (!li.classList.contains(TC.Consts.classes.LOADING) && !li.classList.contains(TC.Consts.classes.CHECKED)) {
        e.preventDefault;

        if (li.tagName === 'UL' && !li.classList.contains(self.CLASS + '-leaf')) {
          li.classList.toggle(TC.Consts.classes.COLLAPSED);
          const ul = li.querySelector('ul');
          ul.classList.toggle(TC.Consts.classes.COLLAPSED);
        }

        var layerName = li.dataset.layerName;
        layerName = (layerName !== undefined) ? layerName.toString() : '';
        var layer;
        for (var i = 0, len = ctl._roots.length; i < len; i++) {
          const root = ctl._roots[i];
          //if (root.contains(li) && li.parentElement.parentElement == ctl._roots[i]) {
          if (root.contains(li)) {
            layer = ctl.getLayer(root.id);
            if (layer) break;
          }
        }

        if (layer && layerName) {
          layer.uid = li.dataset.layerUid;
          var redrawTime = 1;

          if (/iPad/i.test(navigator.userAgent))
            redrawTime = 10;
          else if (TC.Util.detectFirefox())
            redrawTime = 250;

          /* intentam anar per layer.dataset.layerName
          if (!layer.title) {
              layer.title = layer.getTree().title;
          }
          */

          li.classList.add(TC.Consts.classes.LOADING);
          li.querySelector('span').dataset.tooltip = '';

          const reDraw = function(element) {
            return new Promise(function(resolve, reject) {
              setTimeout(function() {
                element.offsetHeight = element.offsetHeight;
                element.offsetWidth = element.offsetWidth;

                resolve();
              }, redrawTime);
            });
          };

          reDraw(li).then(function() {
            addLayerToMap.call(ctl, layer, layerName);
          });
          e.stopPropagation();
        }

      }
    } else {
      //if (e.target.parentElement.querySelector('li').dataset.layerUid) {
      if (e.target.parentElement.classList.contains("sitmun-folder")) {
        e.target.parentElement.classList.add(SITNA.Consts.classes.CHECKED);
        e.target.parentElement.classList.remove(SITNA.Consts.classes.COLLAPSED);
        e.target.parentElement.querySelector("ul").classList.remove(SITNA.Consts.classes.COLLAPSED);

        var clickEvent = new MouseEvent("click", {
          "view": window,
          "bubbles": true,
          "cancelable": false
        });

        //e.target.parentElement.querySelectorAll("ul")[0].querySelector('span.tc-selectable').dispatchEvent(clickEvent);
        e.target.parentElement.querySelectorAll("ul").forEach(value => {
          //value.querySelectorAll('li.sitmun-folder:not(.tc-loading) span').forEach(node => {
          value.querySelectorAll('li.sitmun-folder > span, li:not(.tc-loading) > span.tc-selectable').forEach(node => {
            if (node.style.display !== 'none') //To avoid clicking on 'serviceNodes', not necessary
              node.dispatchEvent(clickEvent);
          });
          //value.querySelector('span.tc-selectable')?.dispatchEvent(clickEvent);
        })
      }
    }
  };

  const getLayer = function(id) {
    const self = this;
    for (var i = 0, len = self.layers.length; i < len; i++) {
      const layer = self.layers[i];
      if (layer.id === id) {
        var configLayer = self.options.layers.filter(l => l.id === id);

        if (configLayer.length > 0) {
          layer.hideTitle = layer.options.hideTitle = configLayer[0].hideTitle;
        } else {
          layer.hideTitle = layer.options.hideTitle = false;
        }

        return layer;
      }
    }
    return null;
  };

  const createSearchAutocomplete = function() {
    const self = this;

    self.textInput = self.div.querySelector("." + self.CLASS + "-input");
    self.list = self.div.querySelector("." + self.CLASS + "-search ul");
    // Clear results list when x button is pressed in the search input
    self.textInput.addEventListener('mouseup', function(_e) {
      var oldValue = self.textInput.value;

      if (oldValue === '') {
        return;
      }

      // When this event is fired after clicking on the clear button
      // the value is not cleared yet. We have to wait for it.
      setTimeout(function() {
        var newValue = self.textInput.value;

        if (newValue === '') {
          self.list.innerHTML = '';
        }
      }, 1);
    });

    var layerCheckedList = [];
    //Definir el autocomplete del buscador de capas por texto
    TC._search = TC._search || {};
    TC._search.retryTimeout = null;

    TC.UI.autocomplete.call(self.textInput, {
      link: '#',
      target: self.list,
      minLength: 0,
      source: function(text, callback) {
        //lista de capas marcadas
        layerCheckedList = [];
        self._roots.forEach(function(root) {
          root.querySelectorAll("li." + TC.Consts.classes.CHECKED).forEach(function(item) {
            layerCheckedList.push(item.dataset.layerName);
          });
        });

        //con texto vacío, limpiar  y ocultar la lista de resultados
        text = text.trim();
        if (text.length < SEARCH_MIN_LENGTH) {
          self.list.innerHTML = '';
        } else if (text.length >= SEARCH_MIN_LENGTH) {
          if (TC._search.retryTimeout)
            clearTimeout(TC._search.retryTimeout);
          TC._search.retryTimeout = setTimeout(function() {
            var results = [];
            for (var i = 0, ii = self.sourceLayers.length; i < ii; i++) {
              const sourceLayer = self.sourceLayers[i];
              var _founds = sourceLayer.searchSubLayers(text);
              if (_founds.length) {
                results.push({
                  service: {
                    id: sourceLayer.id,
                    title: sourceLayer.title || sourceLayer.id
                  },
                  founds: _founds
                });
              }
            }
            callback({
              servicesFound: results,
              servicesLooked: self.sourceLayers.length
            });
          }, TC._search.interval);
        }
      },
      callback: function(e) {
        self.textInput.value = e.target.text || e.target.innerText;
        TC._search.lastPattern = self.textInput.value;
        self.goToResult(unescape(e.target.hash).substring(1));
        TC.UI.autocomplete.call(self.textInput, 'clear');
      },
      buildHTML: function(data) {
        var container = this.target;
        //si hay resultados, mostramos la lista
        if (data.results && data.results.servicesFound.length > 0) {
          var workLayers = self.map.getLayerTree().workLayers;
          for (var k = 0; k < data.results.servicesFound.length; k++) {
            var founds = data.results.servicesFound[k].founds;
            for (var j = 0; j < founds.length; j++) {
              delete founds[j].alreadyAdded;
              for (var i = 0; i < workLayers.length; i++) {
                //if (workLayers[i].title == data.results[j].Title ) {
                if (layerCheckedList.indexOf(founds[j].Name) >= 0) {
                  founds[j].alreadyAdded = true;
                  break;
                }
              }
              //Si la capa no tiene Name, no se puede añadir al TOC
              if (!founds[j].Name) {
                founds.splice(j, 1);
                j--;
              }
            }
            if (!data.results.servicesFound[k].founds.length) {
              data.results.servicesFound.splice(k, 1);
              continue;
            }
            //si estaba collapsado mantenemos el estado
            if (self.div.querySelectorAll(".tc-ctl-lcat-search-group")[k]) {
              data.results.servicesFound[k].service.isCollapsed = self.div.querySelectorAll(".tc-ctl-lcat-search-group")[k].classList.contains(TC.Consts.classes.COLLAPSED);
            }
          }
        }
        var ret = '';
        self.getRenderedHtml(self.CLASS + '-results', data.results).then(function(out) {
          container.innerHTML = ret = out;
          // Marcamos el botón "i" correspondiente si el panel de info está abierto
          const visibleInfoPane = self.div.querySelector(`.${self.CLASS}-info`);
          if (visibleInfoPane) {
            const serviceId = visibleInfoPane.dataset.serviceId;
            const layerName = visibleInfoPane.dataset.layerName;
            let selector = `li[data-layer-name="${layerName}"] input[type="checkbox"].${self.CLASS}-search-btn-info`;
            if (self.sourceLayers.length > 1) {
              selector = `li[data-service-id="${serviceId}"] ${selector}`;
            }
            const infoCheckbox = container.querySelector(selector);
            if (infoCheckbox) {
              infoCheckbox.checked = true;
            }
          }
        });
        return ret;
      }
    });


    if (!self.searchInit) {
      //botón de la lupa para alternar entre búsqueda y árbol
      self.div.querySelector('h2 button').addEventListener(TC.Consts.event.CLICK, function(e) {
        e.target.blur();

        const searchPane = self.div.querySelector('.' + self.CLASS + '-search');
        const treePane = self.div.querySelector('.' + self.CLASS + '-tree');
        const infoPane = self.div.querySelector('.' + self.CLASS + '-info');

        const searchPaneMustShow = searchPane.classList.contains(TC.Consts.classes.HIDDEN);
        searchPane.classList.toggle(TC.Consts.classes.HIDDEN, !searchPaneMustShow);
        treePane.classList.toggle(TC.Consts.classes.HIDDEN, searchPaneMustShow);
        e.target.classList.toggle(self.CLASS + '-btn-tree', searchPaneMustShow);
        e.target.classList.toggle(self.CLASS + '-btn-search', !searchPaneMustShow);
        if (searchPaneMustShow) {
          self.hideLayerInfo()
          self.textInput.focus();
          e.target.setAttribute('title', self.getLocaleString('viewAvailableLayersTree'));
        } else {
          self.hideSearchLayerInfo()
          e.target.setAttribute('title', self.getLocaleString('searchLayersByText'));

          //Si hay resaltados en el árbol, mostramos el panel de info
          const selectedCount = self.div.querySelectorAll('.tc-ctl-lcat-tree li input[type=checkbox]:checked').length;
          if (selectedCount > 0) {
            infoPane.classList.remove(TC.Consts.classes.HIDDEN);
          }
        }
      }, {
        passive: true
      });


      //evento de expandir nodo de info
      //self._$div.off("click", ".tc-ctl-lcat-search button");
      self.div.addEventListener("change", TC.EventTarget.listenerBySelector("." + self.CLASS + "-search input[type=checkbox]." + self.CLASS + "-search-btn-info", function(evt) {
        evt.stopPropagation();
        const target = evt.target;
        if (target.checked) {
          const li = target.parentElement;
          var parent = li;
          do {
            parent = parent.parentElement;
          }
          while (parent && parent.tagName !== 'LI');
          //self.showLayerInfo(self.layers.length > 1 ? self.layers.filter(l => l.id === parent.dataset.serviceId)[0] : self.layers[0], li.dataset.layerName);
          showSearchLayerInfo.call(self, self.layers.length > 1 ? self.layers.filter(l => l.id === parent.dataset.serviceId)[0] : self.layers[0], li.dataset.layerName);

        } else {
          self.hideLayerInfo();
        }
      }));

      self.div.addEventListener("click", TC.EventTarget.listenerBySelector("." + self.CLASS + "-search input[type=checkbox]." + self.CLASS + "-search-btn-info", function(evt) {
        evt.stopPropagation();
      }));

      //click en un resultado - añadir capa
      const searchListElementSelector = '.' + self.CLASS + '-search li';
      self.div.addEventListener('click', TC.EventTarget.listenerBySelector(searchListElementSelector, function(evt) {
        evt.stopPropagation();
        var li = evt.target;
        while (li && !li.matches(searchListElementSelector)) {
          li = li.parentElement;
        }
        if (li.classList.contains(self.CLASS + '-no-results')) {
          return; //si clicko en el li de "no hay resultados" rompo el ciclo de ejecución
        }
        if (li.classList.contains(self.CLASS + '-search-group')) {
          li.classList.toggle(TC.Consts.classes.COLLAPSED);
          return;
        }
        var layerName = li.dataset.layerName;
        if (!layerName) {
          return;
        }
        layerName = layerName.toString();

        if (layerName.trim().length === 0) {
          return;
        }

        //si la capa ya ha sido anteriormente, no la añadimos y mostramos un mensaje
        if (li.classList.contains(TC.Consts.classes.CHECKED)) {
          return;
        } else {
          var liParent = li;
          do {
            liParent = liParent.parentElement;
          }
          while (liParent && !liParent.matches('li.' + self.CLASS + '-search-group'));

          const ctlLayer = !liParent ? self.layers[0] : self.layers.filter(l => l.id === liParent.dataset.serviceId)[0];
          const url = ctlLayer.options.url;
          const title = ctlLayer.title;

          const layer = new TC.layer.Raster({
            id: self.getUID(),
            url: url,
            title: title,
            hideTitle: ctlLayer.hideTitle || ctlLayer.options.hideTitle,
            hideTree: false,
            layerNames: [layerName]
          });
          if (layer.isCompatible(self.map.crs)) {
            self.map.addLayer(layer, function(layer) {
              li.dataset.layerId = layer.id;
              layer.wrap.$events.on(TC.Consts.event.TILELOADERROR, function(event) {
                var layer = this.parent;
                if (event.error.code === 401 || event.error.code === 403)
                  layer.map.toast(event.error.text, {
                    type: TC.Consts.msgType.ERROR
                  });
                layer.map.removeLayer(layer);
              });
            });
            //marcamos el resultado como añadido
            li.classList.add(TC.Consts.classes.CHECKED);
            li.querySelector('h5').dataset.tooltip = self.getLocaleString('layerAlreadyAdded');
          } else {
            showProjectionChangeDialog(self, layer);
          }
        }
      }));

      self.searchInit = true;
    }
  };

  const getLayerTree = function(layer) {
    var result = layer.getTree();
    var makeNodeVisible = function makeNodeVisible(node) {
      var result = false;
      var childrenVisible = false;
      for (var i = 0; i < node.children.length; i++) {
        if (makeNodeVisible(node.children[i])) {
          childrenVisible = true;
        }
      }
      if (node.hasOwnProperty('isVisible')) {
        node.isVisible = (!layer.names || !layer.names.length) || childrenVisible || node.isVisible;
      }
      return node.isVisible;
    };
    var checkIfFolder = function checkIfFolder(node) {
      //if (node.folder)
       result.serviceNode = true;
    }
    makeNodeVisible(result);
    checkIfFolder(result);
    return result;
  };

  const getInfo = function(name, layer) {
    var self = layer;
    var result = {};
    var capabilities = self.parent.capabilities;
    var url = self.parent.url;
    if (capabilities && capabilities.Capability) {
      var layerNodes = self.getAllLayerNodes();
      for (var i = 0; i < layerNodes.length; i++) {
        var l = layerNodes[i];
        if (self.parent.compareNames(self.getName(l), name)) {
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

          var _process = function(value) {
            var legend = this.getLegend(value);

            if (legend.src)
              result.legend.push({
                src: legend.src,
                title: value.Title
              });
          };

          var _traverse = function(o, func) {
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
                format: md.Format,
                type: md.type,
                url: md.OnlineResource
              });
            }
          }
          //Silme
          result.dataUrl = [];
          if (l.DataURL) {
            result.dataUrl.push({
              format: l.DataURL.Format,
              type: l.DataURL.OnlineResource.type,
              url: l.DataURL.OnlineResource.href
            });
          }

          if (Array.isArray(capabilities.Service)) {
            currentNode = capabilities.Service[0];
          } else {
            currentNode = capabilities.Service;
          }

          result.parentAbstract = [];
          if (currentNode.Abstract) {
            result.parentAbstract = currentNode.Abstract;
          }

          result.contactPerson = [];
          if (currentNode.ContactInformation.ContactPersonPrimary.ContactPerson) {
            result.contactPerson = currentNode.ContactInformation.ContactPersonPrimary.ContactPerson;
          }

          result.contactOrganization = [];
          if (currentNode.ContactInformation.ContactPersonPrimary.ContactOrganization) {
            result.contactOrganization = currentNode.ContactInformation.ContactPersonPrimary.ContactOrganization;
          }

          result.contactMail = [];
          if (currentNode.ContactInformation.ContactElectronicMailAddress) {
            result.contactMail = currentNode.ContactInformation.ContactElectronicMailAddress;
          }

          result.contactTelephone = [];
          if (currentNode.ContactInformation.ContactVoiceTelephone) {
            result.contactTelephone = currentNode.ContactInformation.ContactVoiceTelephone;
          }

          result.fees = [];
          if (currentNode.Fees) {
            result.fees = currentNode.Fees;
          }

          result.accessConstraints = [];
          if (currentNode.AccessConstraints) {
            result.accessConstraints = currentNode.AccessConstraints;
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

  const showLayerInfo = function(layer, name, uid, li) {
    const self = this;
    var result = null;

    var info = self.div.querySelector('.' + self.CLASS + '-info');
    // Make the DIV element draggable:
    dragElement(info); //Silme
    //Silme - Amb això el DIV de info sempre surtira enmig
    info.style['left'] = null;
    info.style['top'] = null;

    const toggleInfo = function(layerName, infoObj) {
      var result = false;
      //if (lName !== undefined && lName.toString() === layerName) {
      //    info.dataset.layerName = '';
      //    $info.removeClass(TC.Consts.classes.HIDDEN);
      //}
      //else {
      if (infoObj) {
        result = true;
        info.dataset.layerName = layerName;
        info.classList.remove(TC.Consts.classes.HIDDEN);
        self.getRenderedHtml(self.CLASS + '-info', infoObj)
          .then(function(out) {
            info.innerHTML = out;
            info.querySelector('.' + self.CLASS + '-info-close').addEventListener(TC.Consts.event.CLICK, function() {
              self.hideLayerInfo();
            }, {
              passive: true
            })
          })
          .catch(function(err) {
            TC.error(err);
          });
      }
      //}
      return result;
    };

    self.div.querySelectorAll('.' + self.CLASS + '-btn-info, .' + self.CLASS + '-search-btn-info').forEach(function(btn) {
      btn.classList.remove(TC.Consts.classes.CHECKED);
    });

    const formatDescriptions = {};
    for (var i = 0, ii = self._roots.length; i < ii; i++) {
      const root = self._roots[i];
      if (root.dataset.layerId.toString() === layer.id.toString()) { //SILME MV 20220211
        const as = root.querySelectorAll('.' + self.CLASS + '-btn-info');
        for (var j = 0, jj = as.length; j < jj; j++) {
          const a = as[j];
          var n = a.parentElement.dataset.layerName;
          if (n === name) {
            //Silme const info = layer.wrap.getInfo(name);
            //Silme
            for (var i = 0; i < self.layers.length; i++) {
              layerFound = cercaLayers(self.layers[i], uid);
              if (layerFound != null) {
                layerParent = self.layers[i];
                break;
              }
            }
            if (layerParent != null)
              infoSilme = getInfo(name, layerParent.wrap);
            //End Silme
            if (infoSilme.metadata) {
              infoSilme.metadata.forEach(function(md) {
                md.formatDescription = formatDescriptions[md.format] =
                  formatDescriptions[md.format] ||
                  self.getLocaleString(TC.Util.getSimpleMimeType(md.format)) ||
                  self.getLocaleString('viewMetadata');
              });
            }
            const infoBtn = li.querySelector('.' + self.CLASS + '-btn-info');
            infoBtn.classList.toggle(TC.Consts.classes.CHECKED, toggleInfo(n, infoSilme));
            result = infoSilme;
            break;
          }
        }
        break;
      }
    }

    return result;
  };

  const showSearchLayerInfo = function(layer, name, uid, li) {
    const self = this;
    var result = null;

    var info = self.div.querySelector('.' + self.CLASS + '-info');

    const toggleInfo = function(layerName, infoObj) {
      var result = false;
      //if (lName !== undefined && lName.toString() === layerName) {
      //    info.dataset.layerName = '';
      //    $info.removeClass(TC.Consts.classes.HIDDEN);
      //}
      //else {
      if (infoObj) {
        result = true;
        info.dataset.serviceId = layer.id;
        info.dataset.layerName = layerName;
        info.classList.remove(TC.Consts.classes.HIDDEN);
        self.getRenderedHtml(self.CLASS + '-info', infoObj)
          .then(function(out) {
            info.innerHTML = out;
            info.querySelector('.' + self.CLASS + '-info-close').addEventListener(TC.Consts.event.CLICK, function() {
              self.hideSearchLayerInfo();
            }, {
              passive: true
            });
          })
          .catch(function(err) {
            TC.error(err);
          });
      }
      //}
      return result;
    };

    self.div.querySelectorAll('.' + self.CLASS + '-btn-info, .' + self.CLASS + '-search-btn-info').forEach(function(btn) {
      btn.checked = false;
    });

    const getInfoByTitle = function(layer, title) {
      if (layer.Title === title) {
        return {
          title: title,
          abstract: layer.Abstract,
          metadata: !layer.MetadataURL ? null : layer.MetadataURL.reduce(function(vi, va) {
            vi.push({
              format: va.Format,
              formatDescription: TC.Util.getLocaleString(self.map.options.locale, TC.Util.getSimpleMimeType(va.Format)) ||
                TC.Util.getLocaleString(self.map.options.locale, 'viewMetadata'),
              type: va.type,
              url: va.OnlineResource
            });
            return vi;
          }, [])
        };
      }
      if (layer.Layer) {
        for (var i = 0; i < layer.Layer.length; i++) {
          const res = getInfoByTitle(layer.Layer[i], title);
          if (res) {
            return res;
          }
        }
      }
    };

    for (var i = 0, ii = self._roots.length; i < ii; i++) {
      const root = self._roots[i];
      if (root.dataset.layerId === layer.id) {
        const infoToggles = root.querySelectorAll('.' + self.CLASS + '-btn-info');
        for (var j = 0, jj = infoToggles.length; j < jj; j++) {
          const infoToggle = infoToggles[j];
          var n = infoToggle.parentElement.dataset.layerName;
          if (name && n === name) {
            const info = getInfo.call(self, name, layer.wrap);
            const infoBtn = self.div.querySelector('li[data-layer-name="' + n + '"] > input[type="checkbox"].' + self.CLASS + '-btn-info');
            infoBtn.checked = toggleInfo(n, info);
            const infoSearchBtn = self.div.querySelector('li[data-layer-name="' + n + '"] > input[type="checkbox"].' + self.CLASS + '-search-btn-info');
            if (infoSearchBtn) {
              infoSearchBtn.checked = infoBtn.checked;
            }
            result = info;
            break;
          }
          const t = infoToggle.parentElement.querySelector('span').innerText;
          if (!name && title && t === title) {
            //buscar en el capapabilities por nombre de capa;
            const info = getInfoByTitle(layer.capabilities.Capability.Layer, title);
            //const infoBtn = self.div.querySelector('li [data-layer-name="' + n + '"] > button.' + self.CLASS + '-btn-info');
            infoToggle.checked = toggleInfo(t, info);
            result = info;
            break;
          }
        }
        break;
      }
    }

    return result;
  };

  const addLayerToMap = function(layer, layerName) {
    const self = this;
    const layerOptions = TC.Util.extend({}, layer.options);
    layerOptions.id = self.getUID();
    layerOptions.layerNames = [layerName];
    layerOptions.title = layer.title;
    layerOptions.uid = layer.uid;
    const newLayer = new TC.layer.Raster(layerOptions);
    if (newLayer.isCompatible(self.map.crs)) {
      self.map.addLayer(layerOptions).then(function(layer) {
        layer.wrap.$events.on(TC.Consts.event.TILELOADERROR, function(event) {
          var layer = this.parent;
          if (event.error.code === 401 || event.error.code === 403)
            layer.map.toast(event.error.text, {
              type: TC.Consts.msgType.ERROR
            });
          layer.map.removeLayer(layer);
        });
      });
    } else {
      showProjectionChangeDialog(self, newLayer);
    }
  };

  const _refreshResultList = function() {
    const self = this;

    if ("createEvent" in document) {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("keyup", false, true);
      if (self.textInput) {
        self.textInput.dispatchEvent(evt);
      }
    } else {
      if (self.textInput) {
        self.textInput.fireEvent("keyup");
      }
    }
  };

  const updateControl = function(layer) {
    const self = this;

    self.getLayerNodes(layer).forEach(function(node) {
      node.classList.remove(TC.Consts.classes.LOADING);
      node.classList.add(TC.Consts.classes.CHECKED);
      node.querySelector('span').dataset.tooltip = self.getLocaleString('layerAlreadyAdded');
    });
    _refreshResultList.call(self);
  };

  const addLogicToNode = function(node, layer, control) {
    //const self = this;
    const self = control;

    /*Açò ho feim a addLogicToTreeGroup
    node.querySelectorAll('li > button.' + self.CLASS + '-collapse-btn').forEach(function (btn) {
        btn.addEventListener('click', onCollapseButtonClick);
    });

    node.querySelectorAll('span').forEach(function (span) {
        span.addEventListener('click', function (e) {
            onSpanClick(e, self);
        });
    });
    */

    self._roots = self.div.querySelectorAll(self._selectors.LAYER_ROOT);
    if (self._roots.length > 0) {
      var roots = [];
      for (var i = 0; i < self._roots.length; i++) {
        if (self._roots[i].dataset.layerUid != '') roots.push(self._roots[i]);
        else {
          var array = Array.from(self._roots[i].querySelectorAll('ul.tc-ctl-lcat-branch > li.tc-ctl-lcat-node')).filter(item => item.id != '');
          for (var j = 0; j < array.length; j++) {
            roots.push(array[j]);
          }
        }
      }

      self._roots = roots;
    }

    //node.dataset.layerId = layer.id;

    //Silme - important per identificar els roots
    for (var i = 0; i < self._roots.length; i++) {
      self._roots[i].dataset.layerId = self._roots[i].id;
    }

    var formatDescriptions = {};
    node.querySelectorAll('.' + self.CLASS + '-btn-info').forEach(function(a) {
      const span = a.parentElement.querySelector('span');
      const name = a.parentElement.dataset.layerName;
      var uid = a.parentElement.dataset.layerUid; //Silme MV
      var info;
      if (name) {
        span.classList.add(TC.Consts.classes.SELECTABLE);
        //var info = layer.wrap.getInfo(name);
        //var info = getInfo(name, layer.wrap);
        //Silme
        for (var i = 0; i < self.layers.length; i++) {
          layerFound = cercaLayers(self.layers[i], uid);
          if (layerFound != null) {
            layerParent = self.layers[i];
            break;
          }
        }
        if (layerParent != null)
          info = getInfo(name, layerParent.wrap);
        //End silme
        if (!info.hasOwnProperty('abstract') && !info.hasOwnProperty('legend') && !info.hasOwnProperty('metadata')) {
          a.parentElement.removeChild(a);
        } else {
          a.addEventListener(TC.Consts.event.CLICK, function(e) {
            const a = e.target;
            var li = a;
            do {
              li = li.parentElement;
            }
            while (li && li.tagName !== 'LI');

            e.stopPropagation();
            const elm = this;
            var uid = elm.parentElement.dataset.layerUid; //Silme
            if (elm.classList.toggle(TC.Consts.classes.CHECKED)) {
              showLayerInfo.call(self, layer, name, uid, li);
            } else {
              self.hideLayerInfo();
            }
          });
        }
        if (layer && layer.compatibleLayers && layer.compatibleLayers.indexOf(name) < 0) {
          span.classList.add(TC.Consts.classes.INCOMPATIBLE);
          span.setAttribute('title', self.getLocaleString('reprojectionNeeded'));
          //console.log("capa " + name + " incompatible");
        }
        if (self.map) {
          for (var j = 0, len = self.map.workLayers.length; j < len; j++) {
            var wl = self.map.workLayers[j];
            if (wl.type === TC.Consts.layerType.WMS && wl.url === layer.url && wl.names.length === 1 && wl.names[0] === name) {
              span.parentElement.classList.add(TC.Consts.classes.CHECKED);
              span.dataset.tooltip = self.getLocaleString('layerAlreadyAdded');
            }
          }
        }
      } else {
        span.dataset.tooltip = '';
        a.parentElement.removeChild(a);
      }
    });
  };

  TC.control.LayerCatalogSilmeFolders.prototype.renderBranch = function(layer, callback, promiseRenderResolve) {
    const self = this;

    self.sourceLayers.unshift(layer);
    layer.getCapabilitiesPromise()
      .then(function(result) {

        //self.sourceLayers.push(layer);

        self.getRenderedHtml(self.CLASS + '-branch', getLayerTree(this), function(html) {
          var template = document.createElement('template');
          template.innerHTML = html;

          var newChild = template.content ? template.content.firstChild : template.firstChild;
          var oldChild = self.div.querySelector('.' + self.CLASS + '-branch').querySelector('li.' + self.CLASS + '-loading-node[data-layer-id="' + this.id + '"]');

          if (oldChild) {
            self.div.querySelector('.' + self.CLASS + '-branch').replaceChild(newChild, oldChild);
          } else {
            self.div.querySelector('.' + self.CLASS + '-branch').appendChild(newChild);
          }

          addLogicToNode.call(self, newChild, this, self);

          if (self.div.querySelector('.' + self.CLASS + '-branch').childElementCount === 1) {
            promiseRenderResolve();
          }

          if (TC.Util.isFunction(callback)) {
            // pasamos el callback el item
            callback(self.sourceLayers[self.sourceLayers.map(function(l) {
              return l.id
            }).indexOf(this.id)]);
          }

        }.bind(this));

      }.bind(layer))
      .catch(function(error) {
        /*
        var index = self.layers.map(function (l) { return l.id }).indexOf(this.id);
        self.layers.splice(index, 1);

        var errorMessage = self.getLocaleString("lyrCtlg.errorLoadingNode", { serviceName: this.title });
        var liError = self.div.querySelector('.' + self.CLASS + '-branch').querySelector('li.' + self.CLASS + '-loading-node[data-layer-id="' + this.id + '"]');
        liError.classList.add('error');
        liError.setAttribute('title', errorMessage);

        self.map.toast(errorMessage, { type: TC.Consts.msgType.ERROR });
        */
      }.bind(layer));
  };

  TC.control.LayerCatalogSilmeFolders.prototype.render = function(callback) {
    const self = this;

    return self._set1stRenderPromise(new Promise(function(resolve, reject) {
      const promises = self.layers.map(function(layer) {
        return layer.wrap.getLayer();
      })
      Promise.all(promises).then(function() { //SILME 20210419
        //Tot ok, no fem res
      }, function(reject) {
        //si entram aquí és perque un servei (o més d'un) han fallat.

        //lo que fem és treure les capes que no tenen capabilities associat, o sigui,
        //que la promesa no s'ha complert

        //la resa de codi es igual que si no hagués fallat cap promise
        //hauriem de veure si es pot eliminar codi redundant o fer una funció que s'executi després, hagi fallat o no (HERE)
        for (var i = 0; i < self.layers.length; i++) {
          if (self.layers[i].capabilities == undefined) {
            // self.map.toast(self.getLocaleString('errorCarregarCapa') + self.layers[i].title, {
            //   type: TC.Consts.msgType.ERROR
            // });
            console.log("Cannot load layer: " + self.layers[i].title);
            self.layers.splice(i, 1);
            i--;
          }

        }
      }).then(function() {
        //Si totes les capes estan OK passem aquí directament, sino eliminem les que no estàn bé de l'arbre de capes i després passem aquí
        var layerTrees = self.layers.map(function(layer) {
          var result = layer.getTree();
          layer.tree = result; //mv
          var makeNodeVisible = function makeNodeVisible(node) {
            var result = false;
            var childrenVisible = false;
            for (var i = 0; i < node.children.length; i++) {
              if (makeNodeVisible(node.children[i])) {
                childrenVisible = true;
              }
            }
            if (node.hasOwnProperty('isVisible')) {
              node.isVisible = (!layer.names || !layer.names.length) || childrenVisible || node.isVisible;
            }
            return node.isVisible;
          };
          makeNodeVisible(result);
          return result;
        });

        layerTrees.forEach(function(item) {
          var layer = self.layers.find(function(layer) {
            return item.title === layer.title
          });
        });

        realTree.children = new Array();

        //TC.control.LayerCatalog.prototype.render.call(self, function () {
        renderParent.call(self, function() {

          const getLayerTree = function(layer) {
            if (layer.tree == null) {
              for (var i = 0; i < layer.children.length; i++) {
                if (layer.children[i].tree == null) {
                  layer.children[i] = getLayerTree(layer.children[i])
                } else {
                  var resultChild = layer.children[i].getTree();
                  resultChild.id = layer.children[i].id;
                  var makeNodeVisible = function makeNodeVisible(node) {
                    var result = false;
                    var childrenVisible = false;
                    for (var k = 0; k < node.children.length; k++) {
                      if (makeNodeVisible(node.children[k])) {
                        childrenVisible = true;
                      }
                      //node.children[i].parentGroupNode = layer.parentGroupNode;//Silme
                    }
                    if (node.hasOwnProperty('isVisible')) {
                      node.isVisible = (!layer.children[i].names || !layer.children[i].names.length) || childrenVisible || node.isVisible;
                    }
                    return node.isVisible;
                  };
                  makeNodeVisible(resultChild)
                  layer.children[i] = resultChild;
                }
              }
              return layer;
            } else {
              var result = layer.getTree();
              var makeNodeVisible = function makeNodeVisible(node) {
                var result = false;
                var childrenVisible = false;
                for (var i = 0; i < node.children.length; i++) {
                  if (makeNodeVisible(node.children[i])) {
                    childrenVisible = true;
                  }
                  //node.children[i].parentGroupNode = layer.parentGroupNode;//Silme
                }
                if (node.hasOwnProperty('isVisible')) {
                  node.isVisible = (!layer.names || !layer.names.length) || childrenVisible || node.isVisible;
                }
                return node.isVisible;
              };
              makeNodeVisible(result);
            }
            //result.parentGroupNode = layer.parentGroupNode;
            return result;
          };

          // TODO DELETE si sa funció modificada dia 20231017 funciona
          //           //const getLayerTree = function (layer) {
          //           //    if (layer.tree == null) {
          //        for (var i = 0; i < layer.children.length; i++) {
          //            var resultChild = layer.children[i].getTree();
          //            resultChild.id = layer.children[i].id;
          //            var makeNodeVisible = function makeNodeVisible(node) {
          //                var result = false;
          //                var childrenVisible = false;
          //                for (var k = 0; k < node.children.length; k++) {
          //                    if (makeNodeVisible(node.children[k])) {
          //                        childrenVisible = true;
          //                    }
          //                    //node.children[i].parentGroupNode = layer.parentGroupNode;//Silme
          //                }
          //                if (node.hasOwnProperty('isVisible')) {
          //                    node.isVisible = (!layer.children[i].names || !layer.children[i].names.length) || childrenVisible || node.isVisible;
          //                }
          //                return node.isVisible;
          //            };
          //            makeNodeVisible(resultChild)
          //            layer.children[i] = resultChild;
          //        }
          //        return layer;
          //    } else {
          //        var result = layer.getTree();
          //        var makeNodeVisible = function makeNodeVisible(node) {
          //            var result = false;
          //            var childrenVisible = false;
          //            for (var i = 0; i < node.children.length; i++) {
          //                if (makeNodeVisible(node.children[i])) {
          //                    childrenVisible = true;
          //                }
          //                //node.children[i].parentGroupNode = layer.parentGroupNode;//Silme
          //            }
          //            if (node.hasOwnProperty('isVisible')) {
          //                node.isVisible = (!layer.names || !layer.names.length) || childrenVisible || node.isVisible;
          //            }
          //            return node.isVisible;
          //        };
          //        makeNodeVisible(result);
          //    }
          //    //result.parentGroupNode = layer.parentGroupNode;
          //    return result;
          //};

          //Passa per aquí cada vegada que renderitza un control, i volem que carregui el nostre arbre quan tots hagin acabat de carregar
          //if ($('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-loading-node').length == 0 && $('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-node-silme').length != 0) {

          if (!self.div.querySelector('.tc-ctl-lcat-tree').querySelector('.tc-ctl-lcat-loading-node') && !!self.div.querySelector('.tc-ctl-lcat-tree').querySelector('.tc-ctl-lcat-node')) {
            //if ($('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-loading-node').length == 0 && $('.tc-ctl-lcat-tree').find('.tc-ctl-lcat-node').length != 0) {
            var catalog = SITNA.Cfg.controls.LayerCatalogSilmeFolders;
            // TODO - REFACTORITZAR ⬇️
            // - Mirar d'agrupar funcions
            // - Posar breaks allà on es puguin posar
            // Per a cada capa...
            for (var i = 0; i < treeLayers.length; i++) {
              AfageixTotsElsParesQueNoShaginAfegit(treeLayers[i].parentGroupNode, treeLayers[i]);
            }

            self.div.querySelector('.tc-ctl-lcat-tree').querySelector('.tc-ctl-lcat-branch').innerHTML = "";

            for (var i = 0; i < realTree.children.length; i++) {
              //Hem d'agafar lo mateix que al LayerCatalog self.getLayerTree(self.layers[0])
              selfClass.getRenderedHtml(self.CLASS + '-node', getLayerTree(realTree.children[i]), function(html) {
                var template = document.createElement('template');
                template.innerHTML = html;

                var newChild = template.content ? template.content.firstChild : template.firstChild;

                if (self.div.querySelector('#' + newChild.id) == null) //no existeix
                {
                  self.div.querySelector('.' + self.CLASS + '-branch').appendChild(newChild);
                }

                //for (var i = 0; i < newChild.children[2].children.length; i++) {
                //    //var layer = self.getLayer(newChild.children[2].children[i].id);
                //    var layer = self.getLayer(newChild.children[2].children[i].id);
                //    addLogicToNode.call(self, newChild.children[2].children[i], layer);
                //}

                addLogicToAllLayersOfNode(newChild.children[2].children, self);

                addLogicToTreeGroup.call(self, newChild);
              });
            }

            //self.div.querySelector('.tc-ctl-lcat-branch').children[0].classList.remove(TC.Consts.classes.COLLAPSED);//Desplegam el primer node
            //self.div.querySelector('.tc-ctl-lcat-branch').querySelector('.tc-ctl-lcat-branch').classList.remove(TC.Consts.classes.COLLAPSED);

            callback(self.sourceLayers[self.sourceLayers.map(function(l) {
              return l.id
            }).indexOf(this.id)]);
          }

          resolve();
        });

        const AfageixTotsElsParesQueNoShaginAfegit = function(capaActualPare, capaActual) {
          var catalog = silmeLayerCatalog.options;

          // Miram dins cada node...
          for (var k = 0; k < catalog.layerTreeGroups.length; k++) {
            var nodeActual = catalog.layerTreeGroups[k];
            var nodePare = nodeActual.parentNode;

            if (nodeActual.id == capaActualPare) {
              // Si el nodeActual depen d'un nodePare
              if (nodePare != "" &&
                nodePare != null &&
                nodeActual.id != nodePare) {

                // Si el nodePare no és dins el realTree
                if (!cercaIdDinsArray(realTree.children, nodePare)) {

                  //// Busquem el nodePare dins l'array de nodes
                  nodePareAAfegir = AfageixTotsElsParesQueNoShaginAfegit(nodeActual.parentNode);

                  if (nodePareAAfegir) {
                    realTree.children.push(nodePareAAfegir);
                    realTree.children.filter(e => e.id === nodePareAAfegir.id)[0].children = new Array();
                    realTree.children.filter(e => e.id === nodePareAAfegir.id)[0].children.push(nodeActual);
                  } else {
                    var realNodeActual = cercaIdDinsArray(realTree.children, nodePare);
                    if (!realNodeActual.children) realNodeActual.children = [];
                    realNodeActual.children.push(nodeActual);
                  }
                } else {
                  // Si el nodePare ja és dins el realTree
                  // Si el nodeActual ja és dins el realTree, no fem res
                  // Si el nodeActual NO ES dins el realTree, afegim el nodeActual al nodePare
                  if (!cercaIdDinsArray(realTree.children, nodeActual.id)) {
                    var realNodeActual = cercaIdDinsArray(realTree.children, nodePare);
                    realNodeActual.children.push(nodeActual);
                  }
                }

                // Si el nodeActual ja és dins el nodePare, afegim el contingut de la capaActual dins el nodeActual
                if (capaActual) {
                  if (!cercaIdDinsArray(realTree.children, nodeActual.id) &&
                    nodeActual.id != nodePare) {
                    capaActual.children = capaActual.getTree().children;
                    // Per cercar el nodeActual hem de cercar dins els nodesFills de tots els nodes
                    var realNodeActual = cercaIdDinsArray(realTree.children, nodeActual.id);
                    realNodeActual.children = [];
                    realNodeActual.children.push(capaActual);
                  } else {
                    // Quan el nodeActual ja és dins el nodePare, afegim el contingut de la capaActual dins el nodeActual
                    capaActual.children = capaActual.getTree().children;
                    var realNodeActual = cercaIdDinsArray(realTree.children, nodeActual.id);
                    if (!realNodeActual.children) realNodeActual.children = [];
                    realNodeActual.children.push(capaActual);
                  }
                }
              } else {
                // Si el nodeActual NO depen d'un nodePare
                if (capaActual) {
                  if (!cercaIdDinsArray(realTree.children, nodeActual.id)) {
                    realTree.children.push(nodeActual);
                    capaActual.children = capaActual.getTree().children;
                    realTree.children.filter(e => e.id === nodeActual.id)[0].children = [];
                    realTree.children.filter(e => e.id === nodeActual.id)[0].children.push(capaActual);
                  } else {
                    capaActual.children = capaActual.getTree().children;
                    realTree.children.filter(e => e.id === nodeActual.id)[0].children.push(capaActual);
                  }
                } else {
                  return nodeActual;
                }
              }
            }
          }
        }

        // Event botó projectes
        self.div.addEventListener('click', TC.EventTarget.listenerBySelector('#canvi-projecte-silme', function(e) {
          const projPane = self.div.querySelector('#projects');

          if (window.innerWidth < 760) {
            document.querySelector('#tools-panel').classList.toggle('right-collapsed');
            document.querySelector('#silme-panel').classList.remove('left-opacity');
            document.querySelector('.tc-ctl-nav-home').classList.remove(TC.Consts.classes.HIDDEN);
            document.querySelector('.tc-ctl-sv-btn').classList.remove(TC.Consts.classes.HIDDEN);
            if (document.querySelector('.tc-ctl-sb'))
              document.querySelector('.tc-ctl-sb').style.visibility = 'visible';
            if (document.querySelector('.tc-ctl-scl'))
              document.querySelector('.tc-ctl-scl').style.visibility = 'visible';
          }

          projPane.classList.toggle(TC.Consts.classes.HIDDEN);
          projPane.querySelector('.' + self.CLASS + '-proj-close').addEventListener(TC.Consts.event.CLICK, function() {
            self.div.querySelector('#projects').classList.add(TC.Consts.classes.HIDDEN);
            projPane.querySelectorAll('.' + self.CLASS + '-proj-selected').forEach(item => {
              item.classList.remove(self.CLASS + '-proj-selected');
            });
          });

          projPane.querySelector('.' + self.CLASS + '-proj-accept').addEventListener('click', function() {
            self.div.querySelector('#projects').classList.add(TC.Consts.classes.HIDDEN);
            const selectedProject = projPane.querySelector('.' + self.CLASS + '-proj-selected');
            if (selectedProject) {
              const id = parseInt(selectedProject.querySelector('.' + self.CLASS + '-proj-catalog-id').value);
              if (id !== window.layerCatalogsSilmeForModal.currentCatalog) {
                window.layerCatalogsSilmeForModal.currentCatalog = id;
                window.abstractMapObject.updateCatalog();
              }
            }
          });

          projPane.querySelector('.' + self.CLASS + '-proj-cancel').addEventListener('click', function() {
            self.div.querySelector('#projects').classList.add(TC.Consts.classes.HIDDEN);
            projPane.querySelectorAll('.' + self.CLASS + '-proj-selected').forEach(item => {
              item.classList.remove(self.CLASS + '-proj-selected');
            });
          });

          // Extreure tots els elements de catàlegs dins de tc-ctl-lcat-proj-child i afegir un listener a cadascun
          var catalogsList = projPane.querySelectorAll('.' + self.CLASS + '-proj-catalog');
          catalogsList.forEach(catalogElement => {
            const id = parseInt(catalogElement.querySelector('.' + self.CLASS + '-proj-catalog-id').value);
            if (id === window.layerCatalogsSilmeForModal.currentCatalog)
              catalogElement.classList.add(self.CLASS + '-proj-selected');

            // Afegir listener als catàlegs
            catalogElement.addEventListener('click', function() {
              projPane.querySelector('.' + self.CLASS + '-proj-selected').classList.remove(self.CLASS + '-proj-selected');
              catalogElement.classList.add(self.CLASS + '-proj-selected');
            });
          });
        }));

        // Renderitzar l'html de la modal amb la llista de catàlegs
        selfClass = self;
        self.getRenderedHtml(self.CLASS + '-proj', ({
          "catalogs": window.layerCatalogsSilmeForModal.catalogs
        })).then(function(out) {
          var template = document.createElement('template');
          template.innerHTML = out;
          if (self.div.querySelector('.tc-ctl-lcat-proj') != null)
            self.div.querySelector('.tc-ctl-lcat-proj').innerHTML = template.innerHTML;
        }).catch(function(err) {
          TC.error(err);
        });

        // 2 Capes de fons
        // if (true) { // SILME - posam fals perque no volem dos mapes de fons
        //   if (treeLayers.length > 0) {
        //     if (typeof secondBaseLayer != 'undefined') {
        //       if (secondBaseLayer == false) {
        //         addSecondBaseLayer();
        //         setSpan1();
        //         setSpan2();
        //         selectB1();
        //         document.querySelector('#rangeTransparency').addEventListener('input', function() {
        //           silmeMap.map.getLayers().array_[1].setOpacity(this.value / 100);
        //           silmeMap.map.render();
        //         });
        //       }
        //     }
        //   }
        // }
      }, function() {

      }).then(function() {

        if (treeLayers.length > 0)
          layerCatalogCarregat();

      });


      treeLayers = self.layers;
    }));
  };

  const renderParent = function(callback) {
    const self = this;
    self.sourceLayers = [];

    return self._set1stRenderPromise(new Promise(function(resolve, _reject) {
      if (self.layers.length === 0) {
        self.renderData({
          layerTrees: [],
          enableSearch: false,
          enableChangeTopic: false
        }, function() {

          if (TC.Util.isFunction(callback)) {
            callback();
          }

          resolve();
        });
      } else {
        const shouldEnableChangeTopic = window.layerCatalogsSilmeForModal.catalogs.length > 1;
        self.renderData({
          layers: self.layers,
          enableSearch: true,
          enableChangeTopic: shouldEnableChangeTopic
        }, function() {

          createSearchAutocomplete.call(self);

          // Hay que encadenar las promesas de renderBranch para que se resuelvan una a una, siguiendo
          // el orden en el que llegan las capas del árbol
          self.layers.reduce((promise, layer) => promise.then(() => self.renderBranch(layer, callback, resolve)), Promise.resolve());
        });
      }
    }));
  };

  TC.control.LayerCatalogSilmeFolders.prototype.addLayer = function(layer) {
    const self = this;
    return new Promise(function(resolve, reject) {
      var fromLayerCatalog = [];

      if (self.options.layers && self.options.layers.length) {
        fromLayerCatalog = self.options.layers.filter(function(l) {
          var getMap = TC.Util.reqGetMapOnCapabilities(l.url);
          return getMap && getMap.replace(TC.Util.regex.PROTOCOL) == layer.url.replace(TC.Util.regex.PROTOCOL);
        });
      }

      if (fromLayerCatalog.length == 0)
        fromLayerCatalog = self.layers.filter(function(l) {
          return l.url.replace(TC.Util.regex.PROTOCOL) == layer.url.replace(TC.Util.regex.PROTOCOL);
        });

      if (fromLayerCatalog.length == 0) {
        self.layers.push(layer);
        layer.getCapabilitiesPromise().then(function() {
          layer.compatibleLayers = layer.wrap.getCompatibleLayers(self.map.crs);
          layer.title = layer.title || layer.wrap.getServiceTitle();

          if (!(SITNA.Cfg.controls.LayerCatalogSilmeFolders.layerTreeGroups.filter(e => e.id === "node99")[0].children)) {
            SITNA.Cfg.controls.LayerCatalogSilmeFolders.layerTreeGroups.filter(e => e.id === "node99")[0].children = new Array();
            layer.children = layer.getTree().children
            SITNA.Cfg.controls.LayerCatalogSilmeFolders.layerTreeGroups.filter(e => e.id === "node99")[0].children.push(layer)
          } else {
            layer.children = layer.getTree().children
            SITNA.Cfg.controls.LayerCatalogSilmeFolders.layerTreeGroups.filter(e => e.id === "node99")[0].children.push(layer);
          }



          //self.renderBranch(layer, function () {
          //    resolve(); //ver linea 55 y por ahí
          //});
          TC.control.LayerCatalog.prototype.getRenderedHtml.call(self, 'tc-ctl-lcat-node', SITNA.Cfg.controls.LayerCatalogSilmeFolders.layerTreeGroups.filter(e => e.id === "node99")[0], function(html) {
            var template = document.createElement('template');
            template.innerHTML = html;

            var newChild = template.content ? template.content.firstChild : template.firstChild;

            if (self.div.querySelector('#' + newChild.id) != null) //Silme
            {
              self.div.querySelector('#' + newChild.id).remove() //Silme - eliminem l'arbre anterior
            }

            //silme if (self.div.querySelector('#' + newChild.id) == null)//no existeix
            //{
            self.div.querySelector('.' + self.CLASS + '-branch').appendChild(newChild);
            //}

            //for (var i = 0; i < newChild.children[2].children.length; i++) {
            //    //var layer = self.getLayer(newChild.children[2].children[i].id);
            //    var layer = self.getLayer(newChild.children[2].children[i].id);
            //    addLogicToNode.call(self, newChild.children[2].children[i], layer);
            //}

            addLogicToAllLayersOfNode(newChild.children[2].children, self);

            addLogicToTreeGroup.call(self, newChild);
          });
        });
      } else {
        resolve();
      }
    }).then(function() {
      //mv 20210527 açò ho hem afegit per que carregui la capa corresponent després d'afegir un nou servei
      //a l'arbre de capes des del control localitzar (trams i fites de camí de cavalls, però podrien ser altres)
      if (pendingLayer) {
        silmeAddLayer(pendingLayer)
        pendingLayer = null;
      }
    });
  };

  TC.control.LayerCatalogSilmeFolders.prototype.loaded = function() {
    return this._readyPromise;
  };

  TC.control.LayerCatalogSilmeFolders.prototype.hideLayerInfo = function() {
    var self = this;
    self.div.querySelectorAll('.' + self.CLASS + '-btn-info, .' + self.CLASS + '-search-btn-info').forEach(function(btn) {
      btn.classList.remove(TC.Consts.classes.CHECKED);
    });
    const infoPanel = self.div.querySelector('.' + self.CLASS + '-info');
    delete infoPanel.dataset.serviceId;
    delete infoPanel.dataset.layerName;
    infoPanel.classList.add(TC.Consts.classes.HIDDEN);
  };

  TC.control.LayerCatalogSilmeFolders.prototype.hideSearchLayerInfo = function() {
    var self = this;
    self.div.querySelectorAll('.' + self.CLASS + '-btn-info, .' + self.CLASS + '-search-btn-info').forEach(function(btn) {
      btn.checked = false;
    });
    const infoPanel = self.div.querySelector('.' + self.CLASS + '-info');
    delete infoPanel.dataset.serviceId;
    delete infoPanel.dataset.layerName;
    infoPanel.classList.add(TC.Consts.classes.HIDDEN);
  };

  TC.control.LayerCatalogSilmeFolders.prototype.getLayerNodes = function(layer) {
    const self = this;
    const result = [];
    const rootNode = self.getLayerRootNodes(layer);
    if (rootNode) {
      for (var i = 0; i < layer.names.length; i++) {
        for (var j = 0; j < rootNode.length; j++) {
        const liLayer = rootNode[j].querySelector('li[data-layer-name="' + layer.names[i] + '"]');
        if (!liLayer) {
          continue;
        }
        result.push(liLayer);
        liLayer.querySelectorAll('li').forEach(function(li) {
          result.push(li);
        });
        }
      }
    }
    return result;
  };

  // TC.control.LayerCatalogSilmeFolders.prototype.getLayerNodes = function(layer) {
  //   const self = this;
  //   const result = [];
  //   const rootNode = self.getLayerRootNodes(layer);
  //   if (rootNode) {
  //     for (var i = 0; i < layer.names.length; i++) {
  //       const liLayer = rootNode.querySelector('li[data-layer-name="' + layer.names[i] + '"]');
  //       if (!liLayer) {
  //         continue;
  //       }
  //       result.push(liLayer);
  //       liLayer.querySelectorAll('li').forEach(function(li) {
  //         result.push(li);
  //       });
  //     }
  //   }
  //   return result;
  // };

  TC.control.LayerCatalogSilmeFolders.prototype.getLayerRootNodes = function(layer) {
    const self = this;
    var result = [];
    if (!layer.isBase) {
      var url = layer.options.url;
      if (self._roots) {
        self._roots.forEach(function (li) {
          const lyr = self.getLayer(li.dataset.layerId);
          if (lyr && lyr.type === layer.type && lyr.options.url.toLowerCase() === url.toLowerCase()) {
            if (layer.names.every((name) => li.querySelector(`li[data-layer-name="${name}"]`))) result.push(li);
          }
        });
      }
    }
    return result.length > 0 ? result : null;
  };

  // TC.control.LayerCatalogSilmeFolders.prototype.getLayerRootNode = function(layer) {
  //   const self = this;
  //   var result = null;
  //   if (!layer.isBase) {
  //     var url = layer.options.url;
  //     if (self._roots) {
  //       self._roots.forEach(function (li) {
  //         const lyr = self.getLayer(li.dataset.layerId);
  //         if (lyr && lyr.type === layer.type && lyr.options.url.toLowerCase() === url.toLowerCase()) {
  //           if (layer.names.every((name) => li.querySelector(`li[data-layer-name="${name}"]`))) result = li;
  //         }
  //       });
  //     }
  //   }
  //   return result;
  // };

  function CercaLayerDinsCapabilities(e) {
    // quan arrencam visor el capabilites està buit
    if (e.layer.capabilities != null && e.layer.type == TC.Consts.layerType.WMS) {
      var mainTree = e.layer.capabilities.Capability.Layer;
      var nomCerca = e.layer.names[0];
      cercaDinsAquestNode(mainTree, nomCerca);
    }

  }

  function cercaDinsAquestNode(node, nomCerca) {
    if (node.Name != null) {
      if (node.Name == nomCerca) {
        agafaKeywords(node);
        return true;
      }
    }

    if (node.Layer != null) {
      for (var i = 0; i < node.Layer.length; i++) {
        var trobat = cercaDinsAquestNode(node.Layer[i], nomCerca);
        if (trobat) return true;
      }
    }

    return false;
  }

  function agafaKeywords(node) {
    // Toastr
    var keywordList = node.KeywordList;
    if (typeof keywordList !== 'undefined' && Array.isArray(keywordList.Keyword)) {
      for (var i = 0; i < keywordList.Keyword.length; i++) {
        if (keywordList.Keyword[i] != null && keywordList.Keyword[i].includes("* ")) {
          //alert("Desactualitzat");
          toastr.info(keywordList.Keyword[i].substr(keywordList.Keyword[i].indexOf("* ") + 2), "Atenció");
        }
      }
    } else {
      if (keywordList && keywordList.Keyword && keywordList.Keyword.includes("IDENOTA* ")) {
        // alert("Desactualitzat"); // *  --> mostra missatge a continuació
        toastr.info(keywordList.Keyword.substr(keywordList.Keyword.indexOf("* ") + 2), "Atenció");
      }
    }
  }

  function cercaIdDinsArray(array, id) {
    for (var a = 0; a < array.length; a++) {
      // Si l'array té fills mirem si el node que buscam està dins els fills
      if (array[a].id == id)
        return array[a];
      else if (array[a].children && array[a].children.length > 0) {
        var result = cercaIdDinsArray(array[a].children, id);
        if (result) return result;
      }
    }
    return null;
  }

  function addLogicToAllLayersOfNode(node, control) {
    for (var i = 0; i < node.length; i++) {
      if (node[i].id.includes('node')) {
        addLogicToAllLayersOfNode(node[i].children[2].children, control);
      } else {
        var layer = control.getLayer(node[i].id);
        addLogicToNode.call(self, node[i], layer, control);
      }
    }
  }
})();
