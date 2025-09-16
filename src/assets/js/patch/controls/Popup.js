TC.control = TC.control || {};

// =============================================================================
// Constructor
// =============================================================================

TC.control.Popup = function () {
  const _ctl = this;
  TC.Control.apply(_ctl, arguments);

  _ctl.currentFeature = null;
  _ctl.wrap = new TC.wrap.control.Popup(_ctl);
};

TC.inherit(TC.control.Popup, TC.Control);

// =============================================================================
// Definición de métodos para esta clase
// =============================================================================

(function () {
  const ctlProto = TC.control.Popup.prototype;

  TC.Consts.event.POPUP = TC.Consts.event.POPUP || 'popup.tc';
  TC.Consts.event.POPUPHIDE = TC.Consts.event.POPUPHIDE || 'popuphide.tc';
  TC.Consts.classes.DRAG = TC.Consts.classes.DRAG || 'tc-drag';
  TC.Consts.classes.DRAGGED = TC.Consts.classes.DRAGGED || 'tc-dragged';
  TC.Consts.classes.DRAGGABLE = TC.Consts.classes.DRAGGABLE || 'tc-draggable';

  // Atributos
  ctlProto.CLASS = 'tc-ctl-popup';

  // ===========================================================================
  // Función de renderizado
  // ===========================================================================

  ctlProto.render = function (callback) {
    const _this = this;
    return _this._set1stRenderPromise(new Promise(function(resolve, reject) {
      TC.Control.prototype.renderData.call(_this, {
        closeButton: _this.options.closeButton || _this.options.closeButton === undefined,
        shareButton: _this.options.share
      })
        .then(function addPopup() {
          _this.popupDiv = _this.div.querySelector('.' + ctlProto.CLASS);
          _this.contentDiv = _this.popupDiv.querySelector('.' + ctlProto.CLASS + '-content');
          _this.menuDiv = _this.popupDiv.querySelector('.' + ctlProto.CLASS + '-menu');
          _this.addUIEventListeners();

          _this.map.wrap.addPopup(_this).then(function endRender() {
            if (TC.Util.isFunction(callback)) {
              callback();
            }
            resolve();
          });
        })
        .catch(err => reject(err instanceof Error ? err : Error(err)))
    }));
  };


  ctlProto.loadTemplates = function () {
    const _this = this;
    const template = {}

    template[_this.CLASS] = "assets/js/patch/templates/Popup.hbs";
    _this.template = template;
  };

  // ===========================================================================
  // Función de registro del componente
  // ===========================================================================

  ctlProto.register = async function (map) {
    const _this = this;
    await TC.Control.prototype.register.call(_this, map);
    await _this.renderPromise();

    // View change on map
    map.on(TC.Consts.event.VIEWCHANGE, function () {
      if (map.view === TC.Consts.view.PRINTING) {
        if (_this.isVisible()) {
          _this.hide();
        }
      }
    });

    // Layer visibility change on map
    map.on(TC.Consts.event.LAYERVISIBILITY, function (e) {
      if (_this.currentFeature && _this.currentFeature.layer === e.layer && !e.layer.getVisibility()) {
        if (_this.isVisible()) {
          _this.hide();
        }
      }
    });

    // Layer remove from map
    map.on(TC.Consts.event.LAYERREMOVE, function (e) {
      if (_this.currentFeature && _this.currentFeature.layer === e.layer) {
        if (_this.isVisible()) {
          _this.hide();
        }
      }
    });

    // Map update
    map.on(TC.Consts.event.UPDATE, function () {
      if (!_this.currentFeature || _this.currentFeature.getVisibilityState() === TC.Consts.visibility.NOT_VISIBLE) {
        if (_this.isVisible()) {
          _this.hide();
        }
      }
    });

    // Feature remove from map
    map.on(TC.Consts.event.FEATUREREMOVE, function (e) {
      if (_this.currentFeature === e.feature) {
        if (_this.isVisible()) {
          _this.hide();
        }
      }
    });

    return _this;
  };

  // ===========================================================================
  // Event listeners para la interfaz
  // ===========================================================================

  ctlProto.addUIEventListeners = function () {
    const _this = this;
    const closeBtn = _this.menuDiv.querySelector('.' + _this.CLASS + '-close');
    if (closeBtn) {
      closeBtn.addEventListener(TC.Consts.event.CLICK, function () {
        _this.hide();
      }, { passive: true });
    }

    const shareBtn = _this.menuDiv.querySelector('.' + _this.CLASS + '-share');
    if (shareBtn) {
      shareBtn.addEventListener(TC.Consts.event.CLICK, function () {
        if (_this.caller) {
          _this.caller.showShareDialog();
        }
      }, { passive: true });
    }
  };

  // ===========================================================================
  // Funciones publicas sobreescritas
  // ===========================================================================

  ctlProto.fitToView = function(delayed) {
    const _this = this;

    // --- Start Silme
    // if (delayed) {
    //   setTimeout(function () {
    //     _this.wrap.fitToView();
    //   }, 1000);
    // } else {
    //   _this.wrap.fitToView();
    // }
    _this.fitToViewOL();
    _this.setDragged(true);
    // --- End Silme
  };


  ctlProto.hide = function() {
    const _this = this;
    if (_this.map) {
      const data = {
        control: _this,
        feature: _this.currentFeature
      };

      _this.setDragged(false);
      _this.map.wrap.hidePopup(_this);
      _this.getContainerElement().innerHTML = '';
      _this.map.trigger(TC.Consts.event.POPUPHIDE, data);
    }
  };


  ctlProto.getContainerElement = function() {
    const _this = this;
    return _this.contentDiv || null;
  };


  ctlProto.getMenuElement = function() {
    const _this = this;
    return _this.menuDiv || null;
  };


  ctlProto.setDragged = function(dragged) {
    const _this = this;
    _this.dragged = dragged;
    if (_this.popupDiv) {
      _this.popupDiv.classList.toggle(TC.Consts.classes.DRAGGED, !!dragged);
    }

    _this.wrap.setDragged(dragged);
  };


  ctlProto.setDragging = function(dragging) {
    const _this = this;
    if (dragging) {
      _this.setDragged(true);
      _this.popupDiv.classList.add(TC.Consts.classes.DRAG);
    } else {
      _this.popupDiv.classList.remove(TC.Consts.classes.DRAG);
    }
  };


  ctlProto.isVisible = function() {
    const _this = this;
    return _this.popupDiv && _this.popupDiv.classList.contains(TC.Consts.classes.VISIBLE);
  };


  // --- Start Silme
  ctlProto.fitToViewOL = function() {
    const _this = this;
    const map = _this.map;
    const olMap = _this.map.wrap.map;

    const popupBoundingRect = _this.popupDiv.getBoundingClientRect();
    const mapBoundingRect = map.div.getBoundingClientRect();

    const topLeft = olMap.getCoordinateFromPixel([popupBoundingRect.left - mapBoundingRect.left, popupBoundingRect.top - mapBoundingRect.top]);
    const bottomRight = olMap.getCoordinateFromPixel([popupBoundingRect.right - mapBoundingRect.left, popupBoundingRect.bottom - mapBoundingRect.top]);

    const west = topLeft[0];
    const north = topLeft[1];
    const east = bottomRight[0];
    const south = bottomRight[1];

    const popupExt = [west, south, east, north];
    const mapExt = map.getExtent();
    mapExt[2] = (map.getExtent()[2]) - ((map.getExtent()[2] - map.getExtent()[0]) * (map.div.querySelector('.panel-content').clientWidth / map.div.clientWidth));

    const newPos = _this.wrap.popup.getPosition();
    newPos[0] = document.querySelector('.left-collapsed')
      ? mapExt[0] + ((mapExt[2] - mapExt[0]) / 100 * 12)
      : mapExt[0] + ((mapExt[2] - mapExt[0]) / 100 * 35);
    newPos[1] = mapExt[1] + ((mapExt[3] - mapExt[1]) / 100 * 88) - (popupExt[3] - popupExt[1]);

    const newPixelPos = olMap.getPixelFromCoordinate(newPos);
    newPixelPos[1] = olMap.getSize()[1] - newPixelPos[1];
    _this._previousContainerPosition = newPixelPos;
    (_this.wrap.popup._oldUpdatePixelPosition || _this.wrap.popup.updatePixelPosition).call(_this.wrap.popup, newPos);
  };
  // --- End Silme

})();

const Popup = TC.control.Popup;
