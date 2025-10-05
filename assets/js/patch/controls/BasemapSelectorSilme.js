TC.control = TC.control || {};

if (!TC.control.BasemapSelector) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/BasemapSelector');
}

TC.control.BasemapSelectorSilme = function () {
  var _ctl = this;

  TC.control.BasemapSelector.apply(_ctl, arguments);
}

TC.inherit(TC.control.BasemapSelectorSilme, TC.control.BasemapSelector);


(function () {
  var ctlProto = TC.control.BasemapSelectorSilme.prototype;

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
            //=========================================================================
            //Silme: Canvi de capa de fons automàtic si només hi ha un SRS disponible
            //=========================================================================
            self.map.loadProjections({
              crsList: self.map.getCompatibleCRS({
                layers: self.map.workLayers.concat(dialogOptions.layer),
                includeFallbacks: true
              }),
              orderBy: 'name'
            }).then(function (projList) {
              //alert(projList.length);
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
            //===============================


            //self.showProjectionChangeDialog(dialogOptions);
          }

          //layer.getCompatibleCRS({ normalized: true });
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

  ctlProto.register = function (map) {
    const self = this;


    self.template[self.CLASS] = "assets/js/patch/templates/BasemapSelectorSilme.hbs";
    //self.template[self.CLASS] = "templates/BasemapSelectorSilme.hbs";

    const result = TC.control.MapContents.prototype.register.call(self, map);

    if (self.options.dialogMore) {
      map.on(TC.Consts.event.VIEWCHANGE, function () {
        self._getMoreBaseLayers();
      });
    }

    map.on(TC.Consts.event.BASELAYERCHANGE + ' ' + TC.Consts.event.PROJECTIONCHANGE + ' ' + TC.Consts.event.VIEWCHANGE, function (e) {
      self.update(self.div, e.layer);
    });


    self.div.addEventListener('change', TC.EventTarget.listenerBySelector('input[type=radio]', function (e) {

      //Silme
      if (document.querySelector('#tools-panel').classList.contains('right-collapsed')) {
        document.querySelector('#silme-panel').classList.remove('left-opacity');
        document.querySelector('.tc-ctl-nav-home').classList.remove('left-opacity');
        document.querySelector('.tc-ctl-nav-home').classList.remove('tc-hidden');
        document.querySelector('.tc-ctl-sv-btn').classList.remove('left-opacity');
        document.querySelector('.tc-ctl-sv-btn').classList.remove('tc-hidden');
      }

      //if ($("#tools-panel").hasClass("right-collapsed")) {
      //    $('#silme-panel').removeClass("left-opacity");
      //    $('.tc-ctl-nav-home').removeClass("left-opacity");
      //    $('.tc-ctl-nav-home').removeClass("tc-hidden");
      //    $('.tc-ctl-sv-btn').removeClass("left-opacity");
      //    $('.tc-ctl-sv-btn').removeClass("tc-hidden");
      //}
      //End Silme

      if (e.target.value === "moreLayers") {
        self.showMoreLayersDialog();
      } else {
        changeInputRadioBaseMap.call(self, e);
      }

      e.stopPropagation();
    }));

    return result;
  }

  ctlProto.render = function (callback) {
    const self = this;
    const result = TC.control.MapContents.prototype.render.call(self, callback, self.options);

    self.getRenderedHtml(self.CLASS + '-dialog', null, function (html) {
      self._dialogDiv.innerHTML = html;

      if (self.options.dialogMore) {
        const dialog = self._dialogDiv.querySelector('.' + self.CLASS + '-more-dialog');

        dialog.addEventListener('change', TC.EventTarget.listenerBySelector('input[type=radio]', function (e) {
          changeInputRadioBaseMap.call(self, e, function (close) {
            if (close) {
              TC.Util.closeModal();
            }
          });

          e.stopPropagation();
        }));
      }
    });

    //var parser = new ol.format.WMTSCapabilities();
    //var urlWMTS = "https://api.mapbox.com/styles/v1/mvinent/ckpo1dj8r10yn17qxju1ud1s2/wmts?access_token=pk.eyJ1IjoibXZpbmVudCIsImEiOiJja3BvMTl2cmowM3A0MndsbTlnams4ZzcwIn0.fhPEw76erq0T3Z_p8frQFw";
    //fetch(urlWMTS).then(function (response) {
    //    return response.text();
    //}).then(function (text) {
    //    var result = parser.read(text);
    //    var options = ol.source.WMTS.optionsFromCapabilities(result, {
    //        layer: 'ckpo1dj8r10yn17qxju1ud1s2',
    //        matrixSet: 'GoogleMapsCompatible'
    //    });

    //    layerMapBox_Navigation = new ol.layer.Tile({
    //        opacity: 1,
    //        type: 'base',
    //        title: 'Navigation',
    //        name: 'layerMapBox_Navigation',
    //        visible: true,
    //        source: new ol.source.WMTS(options)
    //    });
    //});

    return result;
  }

})();
