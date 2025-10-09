TC.control = TC.control || {};

if (!TC.control.DrawMeasureModify) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/DrawMeasureModify');
}

// =============================================================================
// Constructor
// =============================================================================

TC.control.DrawMeasureModifySilme = function (options) {
  const _ctl = this;
  TC.control.DrawMeasureModify.apply(_ctl, arguments);
};

TC.inherit(TC.control.DrawMeasureModifySilme, TC.control.DrawMeasureModify);

// =============================================================================
// Definición de métodos para esta clase
// =============================================================================

(function () {
  const ctlProto = TC.control.DrawMeasureModifySilme.prototype;

  TC.Consts.event.RESULTSPANELCLOSE = TC.Consts.event.RESULTSPANELCLOSE || 'resultspanelclose.tc';
  TC.Consts.event.FEATURESSELECT = TC.Consts.event.FEATURESSELECT || "featuresselect.tc";

  // Atributos
  ctlProto.CLASS = 'tc-ctl-dmm';

  // ===========================================================================
  // Función de renderizado
  // ===========================================================================

  ctlProto.render = async function (callback) {
    const _this = this;
    const result = await TC.control.DrawMeasureModify.prototype.render.call(_this, callback);
    return result;
  };


  ctlProto.loadTemplates = async function () {
    const _this = this;
    _this.template = {};

    _this.template[_this.CLASS] = "assets/js/patch/templates/DrawMeasureModifySilme.hbs";
  };

  // ===========================================================================
  // Función de registro del componente
  // ===========================================================================

  ctlProto.register = async function (map) {
    const _this = this;
    const result = await TC.control.DrawMeasureModify.prototype.register.call(_this, map);

    // Event Listeners para el dibujado de líneas
    _this.lineDrawControl
      .on(TC.Consts.event.DRAWSTART, function () {
        _this.modify.setLabelableState(true);
        _this.modify.displayLabelText();
      })
      .on(TC.Consts.event.DRAWEND, function () {
        _this.modify.displayLabelText();
      })
      .on(TC.Consts.event.DRAWCANCEL, function () {
        _this.modify.setLabelableState(_this.layer.features.length > 0);
        _this.modify.displayLabelText();
        _this._expandButtonsAndSearchbar();
      });

    // Event Listeners para el dibujado de polígonos
    _this.polygonDrawControl
      .on(TC.Consts.event.DRAWSTART, function () {
        _this.modify.setLabelableState(true);
        _this.modify.displayLabelText();
      })
      .on(TC.Consts.event.DRAWEND, function (_e) {
        _this.modify.displayLabelText();
      })
      .on(TC.Consts.event.DRAWCANCEL  + ' ' + TC.Consts.event.DRAWUNDO, function () {
        _this.modify.setLabelableState(_this.layer.features.length > 0);
        _this.modify.displayLabelText();
        _this._expandButtonsAndSearchbar();
      });

    // Event Listeners para el dibujado de puntos
    _this.pointDrawControl
      .on(TC.Consts.event.DRAWCANCEL, function () {
        _this._expandButtonsAndSearchbar();
      });

    return result;
  };

  // ===========================================================================
  // Funciones públicas sobreescritas
  // ===========================================================================

  ctlProto.setMode = async function (mode) {
    const _this = this;
    if (mode === TC.Consts.geom.POINT) {
      if (!_this.pointDrawControl) {
        await _this.getPointDrawControl();
      }

      _this.pointDrawControl.activate();

      // --- Start Silme
      _this.div.querySelector('.tc-ctl-meas-pt').classList.add('silme-control-flotant');
      _this._collapseButtonsAndSearchbar();

    } else if (mode === TC.Consts.geom.POLYLINE) {
      _this.div.querySelector('.tc-ctl-meas-len').classList.add('silme-control-flotant');
      _this._collapseButtonsAndSearchbar();

    } else if (mode === TC.Consts.geom.POLYGON) {
      _this.div.querySelector('.tc-ctl-meas-area').classList.add('silme-control-flotant');
      _this._collapseButtonsAndSearchbar();
      // --- End Silme
    }

    return TC.control.Measure.prototype.setMode.call(_this, mode);
  };


  ctlProto.getFeatureMeasureData = function (feature) {
    const _this = this;
    const result = {
      units: 'm'
    };

    const measureOptions = {};
    measureOptions.crs = SITNA.Cfg.utmCrs; // Silme
    if (_this.map.wrap.isGeo()) {
      measureOptions.crs = SITNA.Cfg.utmCrs;
    }

    switch (true) {
      case TC.feature.Polygon && feature instanceof TC.feature.Polygon:
        result.area = feature.getArea(measureOptions);
        result.perimeter = feature.getLength(measureOptions);
        break;

      case TC.feature.Polyline && feature instanceof TC.feature.Polyline:
        result.length = feature.getLength(measureOptions);
        _this.getElevationControl().then(ctl => {
          if (_this.elevationProfileActive) {
            ctl.displayElevationProfile(feature);
          }
        });
        break;

      case TC.feature.Point && feature instanceof TC.feature.Point:
        result.coords = feature.geometry;
        break;

      default:
        break;
    }

    return result;
  };

  // ===========================================================================
  // Funciones auxiliares privadas
  // ===========================================================================

  ctlProto._collapseButtonsAndSearchbar = function () { // Silme
    const _this = this;
    document.querySelector('.tc-ctl-cctr-right').style.left = '';
    document.querySelector('.tc-ctl-cctr-left').style.left = '';
    if (document.querySelector('.silme-control-flotant') != null) {
      document.querySelectorAll('.silme-control-flotant').forEach(item => {
        item.style.left = '';
      });
    }

    _this.map.div.querySelector('#silme-panel').classList.remove('left-collapsed-silme');
    _this.map.div.querySelector('#silme-panel').classList.add('left-collapsed');
    _this.map.div.querySelector('#silme-panel').classList.add('silme-control-visible');
    // _this.map.div.querySelector('.tc-ctl-nav-home').classList.remove('tc-ctl-nav-home-exp');
    // _this.map.div.querySelector('.tc-ctl-nav-home').classList.add('tc-ctl-nav-home-coll');
    _this.map.div.querySelector('.tc-ctl-sv').classList.remove('tc-ctl-sv-exp');
    _this.map.div.querySelector('.tc-ctl-sv').classList.add('tc-ctl-sv-coll');
    _this.map.div.querySelector('.tc-ctl-search').classList.remove('search-left-collapsed');
    _this.map.div.querySelector('.tc-ctl-sv').style.left = _this.map.div.querySelector('#nav').style.left;
    // _this.map.div.querySelector('.tc-ctl-nav-home').style.left = _this.map.div.querySelector('#nav').style.left;
    if (window.innerWidth < 760) {
      _this.map.div.querySelector('#silme-tab').style.visibility = 'collapse';
      _this.map.div.querySelector('.tc-ctl-sv').style.visibility = 'collapse';
      // _this.map.div.querySelector('.tc-ctl-nav-home').style.visibility = 'collapse';
    }
  };


  ctlProto._expandButtonsAndSearchbar = function () { // Silme
    const _this = this;
    document.querySelector('.tc-ctl-cctr-right').style.left = '376px';
    document.querySelector('.tc-ctl-cctr-left').style.left = '329px';
    if (document.querySelector('.silme-control-flotant') != null) {
      document.querySelectorAll('.silme-control-flotant').forEach(item => {
        if (window.innerWidth < 760)
          item.style.left = '100vw';
        else
          item.style.left = '328px';
      });
    }

    _this.map.div.querySelector('#silme-panel').classList.remove('left-collapsed');
    _this.map.div.querySelector('#silme-panel').classList.remove('silme-control-visible');
    _this.map.div.querySelector('#silme-panel').classList.add('left-collapsed-silme');
    // _this.map.div.querySelector('.tc-ctl-nav-home').classList.remove('tc-ctl-nav-home-coll');
    // _this.map.div.querySelector('.tc-ctl-nav-home').classList.add('tc-ctl-nav-home-exp');
    _this.map.div.querySelector('.tc-ctl-sv').classList.remove('tc-ctl-sv-coll');
    _this.map.div.querySelector('.tc-ctl-sv').classList.add('tc-ctl-sv-exp');
    _this.map.div.querySelector('.tc-ctl-search').classList.add('search-left-collapsed');
    _this.map.div.querySelector('.tc-ctl-sv').style.left = _this.map.div.querySelector('#nav').style.left;
    // _this.map.div.querySelector('.tc-ctl-nav-home').style.left = _this.map.div.querySelector('#nav').style.left;
    if (window.innerWidth < 760) {
      _this.map.div.querySelector('#silme-tab').style.visibility = 'unset';
      _this.map.div.querySelector('.tc-ctl-sv').style.visibility = 'unset';
      // _this.map.div.querySelector('.tc-ctl-nav-home').style.visibility = 'unset';
    }
  };

})();
