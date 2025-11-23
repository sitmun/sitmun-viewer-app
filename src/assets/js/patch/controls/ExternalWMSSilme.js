TC.control = TC.control || {};

if (!TC.control.ExternalWMS) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/ExternalWMS');
}

// =============================================================================
// Constructor
// =============================================================================

TC.control.ExternalWMSSilme = function (options) {
  const _ctl = this;
  TC.Control.apply(_ctl, arguments);

  _ctl.count = 0;
  _ctl.allowReprojection = _ctl.options.hasOwnProperty('allowReprojection') ? _ctl.options.allowReprojection : true;
  _ctl._addedUrls = [];
};

TC.inherit(TC.control.ExternalWMSSilme, TC.Control);

// =============================================================================
// Definición de métodos para esta clase
// =============================================================================

(function () {
    const ctlProto = TC.control.ExternalWMSSilme.prototype;

    // Atributos
    ctlProto.CLASS = 'tc-ctl-xwms';

  // ===========================================================================
  // Función de renderizado
  // ===========================================================================

  ctlProto.render = async function (callback) {
    const _this = this;
    return _this._set1stRenderPromise(_this.renderData(_this.options, function () {
      _this.pending_markServicesAsSelected = _this.pending_markServicesAsSelected || [];

      _this.pending_markServicesAsSelected.forEach(function (elemUrl) {
        const selectedOptions = [];
        _this.div.querySelectorAll('select option').forEach(function (option) {
          if (TC.Util.addProtocol(option.value) === TC.Util.addProtocol(elemUrl)) {
            selectedOptions.push(option);
          }
        });

        _this.markServicesAsSelected(selectedOptions);
        _this._addedUrls.push(elemUrl);
      });

      _this.pending_markServicesAsSelected = [];

      if (typeof callback === 'function') {
        callback();
      }
    }));
  };


  ctlProto.loadTemplates = function () {
    const _this = this;
    _this.template = {};

    _this.template[_this.CLASS] = "assets/js/sitna/TC/templates/tc-ctl-xwms.hbs";
  }

  // ===========================================================================
  // Función de registro del componente
  // ===========================================================================

  ctlProto.register = async function (map) {
    const _this = this;
    const result = await TC.Control.prototype.register.call(_this, map);

    console.log("XWMS Silme registrado");

    // Event Listeners para detectar cambios en el selector.
    _this.div.addEventListener('change', TC.EventTarget.listenerBySelector('select', function (evt) {
      if (evt.target.value !== '') {
        let url = evt.target.value;
        if (url.indexOf('//') === 0) {
          url = location.protocol + url;
        }

        _this.div.querySelector('input').value = url;
        evt.target.value = '';
      }
    }));

    // Esperamos a que se resuelva la promesa de renderizado y añadimos unos listeners para el input.
    await _this.renderPromise();
    _this.div.querySelector('input').addEventListener('keyup', (e) => {
      if (e.key && e.key.toLowerCase() === "enter" && _this.div.querySelector('input').value.trim().length > 0) {
        addWMS();
      }
    });

    // Listener para cuando se hace click en el botón de agregar una capa.
    _this.div.addEventListener('click', TC.EventTarget.listenerBySelector('button[name="agregar"]', addWMS));

    // Listener para cuando se añade una nueva capa al mapa.
    map.on(TC.Consts.event.LAYERADD, function (e) {
      const layer = e.layer;
      if (layer && !layer.isBase) {
        const url = layer.url;

        if (url) {
          _this.pending_markServicesAsSelected = _this.pending_markServicesAsSelected || [];
          if (_this.div.querySelectorAll('select option').length === 0 && url && _this.pending_markServicesAsSelected.indexOf(url) === -1) {
            _this.pending_markServicesAsSelected.push(url);
          }

          const selectedOptions = [];
          _this.div.querySelectorAll('select option').forEach(function (option) {
            if (option.value.replace(/https?:\/\/|\/\//, '') === url.replace(/https?:\/\/|\/\//, '')) {
              selectedOptions.push(option);
            }
          });

          _this.markServicesAsSelected(selectedOptions);
          _this._addedUrls.push(url);
        }
      }
    });

    return result;
  }

  // ===========================================================================
  // Métodos públicos
  // ===========================================================================

  ctlProto.markServicesAsSelected = function (options) {
    const _this = this;
    if (options.length > 0) {
      const selectedOption = options[0];
      selectedOption.disabled = true;
      selectedOption.classList.add(_this.CLASS + '-option-selected');
    }
  };

  // ===========================================================================
  // Funciones utilitarias
  // ===========================================================================

  const removeParamsFromUrl = function(url, unwantedParams) {
    const _this = this;
    for (let param in unwantedParams) {
      url = TC.Util.removeURLParameter(url, param);
    }
    if (url.match(/\?$/)) {
      url = url.substr(0, url.length - 1);
    }
    return url;
  };


  const addWMS = function () {
    const _this = this;
    let url = _this.div.querySelector('input').value.trim();

    console.log(url);

    if (!url) {
      TC.alert(_this.getLocaleString('typeAnAddress'));

    } else if (!/^((https?|ftp):)?(\/\/)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url)) {
      TC.alert(_this.getLocaleString('typeAValidAddress'));

    } else {
      if (_this._addedUrls.some(function (addedUrl) {
        return addedUrl.replace(/https?:\/\/|\/\//, '') === url.replace(/https?:\/\/|\/\//, '')
      })) {
        TC.alert(_this.getLocaleString('serviceAlreadyAdded'));

      } else {
        const loadingCtrl = _this.map.getControlsByClass("TC.control.LoadingIndicator")[0];
        loadingCtrl.show();
        const params = TC.Util.getQueryStringParams(url);

        if (!/https?:\/\/|\/\//i.test(url)) {
          url = "//" + url;
        }

        // Extraemos solo los parámetros adicionales
        const unwantedParams = ["version", "service", "request"];
        const urlWithoutParams = removeParamsFromUrl(url, Object.keys(params));

        for (let item in params) {
          if (unwantedParams.indexOf(item.toLowerCase()) >= 0) {
            delete params[item];
          }
        }

        const addButton = _this.div.querySelector('button');
        addButton.disabled = true;

        const obj = {
          id: 'xwms' + (++_this.count),
          type: 'WMS',
          url: urlWithoutParams,
          hideTree: false,
          queryParams: params
          // --- Start Silme
          // S'ha afegit aquest paràmetre perque sinó posava la capa a capes carregades
          // stealth: true
          // --- End Silme
        };

        // URI: recorremos las opciones buscando el servicio que se va a agregar a ver si tiene parametro layerNames
        for (let suggestion in _this.options.suggestions) {
          const _current = suggestion.items.filter(function (item, i) {
            return item.url === url;
          });

          if (_current.length > 0 && _current[0].layerNames) {
            obj["layerNames"] = _current[0].layerNames;
            break;
          }
        }

        const layer = new TC.layer.Raster(obj);
        layer.parentGroupNode = "node99"; // Silme - Agregar al nodo de 'otros servicios'
        layer.getCapabilitiesPromise().then(function (cap) {
            if (typeof (cap.Capability) === 'undefined') {
              TC.alert(_this.getLocaleString('noLayersFoundInService'));
              loadingCtrl.hide();
              addButton.disabled = false;

            } else {
              var root = cap.Capability.Layer;
              if (root.CRS && root.CRS.indexOf(_this.map.crs) == -1 && !_this.allowReprojection) {
                // No soportado, avisar y fallar
                TC.alert(_this.getLocaleString('serviceSrsNotCompatible'));
                loadingCtrl.hide();
                addButton.disabled = false;
                return;
              }

              _this.map.trigger(TC.Consts.event.EXTERNALSERVICEADDED, { layer: layer });
              _this.div.querySelector('input').value = '';

              const selectedOptions = [];
              _this.div.querySelectorAll('select option').forEach(function (option) {
                if (option.value.replace(/https?:\/\/|\/\//, '') === url.replace(/https?:\/\/|\/\//, '')) {
                  selectedOptions.push(option);
                }
              });

              _this.markServicesAsSelected(selectedOptions);
              _this._addedUrls.push(url);
              loadingCtrl.hide();
              addButton.disabled = false;
            }
          },

          function (error) {
            TC.alert(_this.getLocaleString('serviceCouldNotBeLoaded') + ":\n" + error);
            loadingCtrl.hide();
            addButton.disabled = false;
          });
      }
    }
  };

})();
