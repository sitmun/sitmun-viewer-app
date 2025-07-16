TC.control = TC.control || {};

if (!TC.control.BasemapSelector) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/BasemapSelector');
}

// =============================================================================
// Constructor
// =============================================================================

TC.control.BasemapSelectorSilme = function () {
  const _ctl = this;
  TC.control.BasemapSelector.apply(_ctl, arguments);
}

TC.inherit(TC.control.BasemapSelectorSilme, TC.control.BasemapSelector);

// =============================================================================
// Definición de métodos para esta clase
// =============================================================================

(function () {
  const ctlProto = TC.control.BasemapSelectorSilme.prototype;

  // Atributos
  ctlProto.CLASS = 'tc-ctl-bms';

  // ===========================================================================
  // Función de renderizado
  // ===========================================================================

  ctlProto.render = async function (callback) {
    const _this = this;
    const result = await TC.control.BasemapSelector.prototype.render.call(_this, callback, _this.options);

    _this.getRenderedHtml(_this.CLASS + '-dialog', null, function (html) {
      _this._dialogDiv.innerHTML = html;

      if (_this.options.dialogMore) {
        const dialog = _this._dialogDiv.querySelector('.' + _this.CLASS + '-more-dialog');

        dialog.addEventListener('change', TC.EventTarget.listenerBySelector('input[type=radio]', function (e) {
          changeInputRadioBaseMap.call(_this, e, function (close) {
            if (close) {
              TC.Util.closeModal();
            }
          });

          e.stopPropagation();
        }));
      }
    });

    return result;
  };


  ctlProto.loadTemplates = async function () {
    const _this = this;
    const result = await TC.control.BasemapSelector.prototype.loadTemplates.call(_this);
    _this.template[_this.CLASS] = "assets/js/patch/templates/BasemapSelectorSilme.hbs";
  };

  // ===========================================================================
  // Función de registro del componente
  // ===========================================================================

  ctlProto.register = async function (map) {
    const _this = this;
    const result = await TC.control.BasemapSelector.prototype.register.call(_this, map);

    if (_this.options.dialogMore) {
      map.on(TC.Consts.event.VIEWCHANGE, function () {
        _this._getMoreBaseLayers();
      });
    }

    map.on(TC.Consts.event.BASELAYERCHANGE + ' ' + TC.Consts.event.PROJECTIONCHANGE + ' ' + TC.Consts.event.VIEWCHANGE, function (e) {
      _this.update(_this.div, e.layer);
    });

    _this.div.addEventListener('change', TC.EventTarget.listenerBySelector('input[type=radio]', function (e) {

      // Start Silme
      if (document.querySelector('#tools-panel').classList.contains('right-collapsed')) {
        document.querySelector('#silme-panel').classList.remove('left-opacity');
        document.querySelector('.tc-ctl-nav-home').classList.remove('left-opacity');
        document.querySelector('.tc-ctl-nav-home').classList.remove('tc-hidden');
        document.querySelector('.tc-ctl-sv-btn').classList.remove('left-opacity');
        document.querySelector('.tc-ctl-sv-btn').classList.remove('tc-hidden');
      }
      // End Silme

      if (e.target.value === "moreLayers") {
        _this.showMoreLayersDialog();
      } else {
        changeInputRadioBaseMap.call(_this, e);
      }

      e.stopPropagation();
    }));

    return result;
  };

  // ===========================================================================
  // Funciones públicas sobreescritas
  // ===========================================================================

  const getClosestParent = function (elm, selector) {
    while (elm && !elm.matches(selector)) {
      elm = elm.parentElement;
    }
    return elm;
  };

  const changeInputRadioBaseMap = function (e, callback) {
    const self = this;
    var flagToCallback = true;

    var radio = e.target;

    var layer = self.getLayer(getClosestParent(radio, 'li').dataset.layerId);

    if (self.options.dialogMore && getClosestParent(radio, '.' + self.CLASS + '-more-dialog')) {
      const radios = self.div.querySelectorAll('input[type=radio]');
      for (var i = 0, len = radios.length; i < len; i++) {
        const bmsLayer = self.getLayer(getClosestParent(radios[i], 'li').dataset.layerId);
        if (bmsLayer) {
          switch (true) {
            case bmsLayer.id === layer.id:
              layer = bmsLayer;
              break;
          }
        }
      }
    }

    if (layer != self.map.getBaseLayer()) {
      if (layer.mustReproject) {

        if (self.map.on3DView) {
          if (!layer.getFallbackLayer()) {
            self._currentSelection.checked = true;
            e.stopPropagation();
            return;
          } else if (layer.getFallbackLayer()) {
            const fallbackLayer = layer.getFallbackLayer();
            if (fallbackLayer) {
              fallbackLayer._capabilitiesPromise.then(function () {
                if (fallbackLayer.isCompatible(self.map.getCRS())) {
                  self.map.setBaseLayer(layer);
                }
              });
            }

            flagToCallback = true;
          }
        } else {
          // provisonal
          if (self._currentSelection) {
            self._currentSelection.checked = true;
          }

          // Buscamos alternativa
          const dialogOptions = {
            layer: layer
          };
          const fallbackLayer = layer.getFallbackLayer();
          if (fallbackLayer) {
            fallbackLayer._capabilitiesPromise.then(function () {
              if (fallbackLayer.isCompatible(self.map.getCRS())) {
                dialogOptions.fallbackLayer = fallbackLayer;
              }
              self.showProjectionChangeDialog(dialogOptions);
            });
          }
          else {

            // Start Silme
            // - Canvi de capa de fons automàtic si només hi ha un SRS disponible

            self.map.loadProjections({
              crsList: self.map.getCompatibleCRS({
                layers: self.map.workLayers.concat(dialogOptions.layer),
                includeFallbacks: true
              }),
              orderBy: 'name'
            }).then(function (projList) {
              if (projList.length == 1) {
                layer = dialogOptions.layer;
                if (layer) {
                  if (projList[0].code) {
                    TC.loadProjDef({
                      crs: projList[0].code,
                      callback: function () {
                        self.map.setProjection({
                          crs: projList[0].code,
                          baseLayer: layer
                        });
                      }
                    });
                  }
                  else {
                    const fallbackLayer = self.getFallbackLayer(btn.dataset.fallbackLayerId);
                    if (fallbackLayer) {
                      self.map.setBaseLayer(fallbackLayer);
                    }
                  }
                }
              }
              else {
                self.showProjectionChangeDialog(dialogOptions);
              }
            });
            // End Silme
          }
          flagToCallback = false;
        }

      }
      else {

        if (layer.type === TC.Consts.layerType.WMS || layer.type === TC.Consts.layerType.WMTS && layer.getProjection() !== self.map.crs) {
          layer.setProjection({ crs: self.map.crs });
        }

        self.map.setBaseLayer(layer);
      }
    }

    if (this._currentSelection) {
      this._currentSelection.checked = true;
    }

    if (callback) {
      callback(flagToCallback);
    }
  };
})();
