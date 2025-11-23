if (!TC.control.StreetView) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/StreetView');
}

// =============================================================================
// Constructor
// =============================================================================

TC.control.StreetViewSilme = function () {
  const _ctl = this;
  TC.control.StreetView.apply(_ctl, arguments);
};

TC.inherit(TC.control.StreetViewSilme, TC.control.StreetView);

// =============================================================================
// Definición de métodos para esta clase
// =============================================================================

(function () {
  const ctlProto = TC.control.StreetViewSilme.prototype;

  TC.Consts.url.GOOGLEMAPS = '//maps.googleapis.com/maps/api/js?v=3';
  TC.Cfg.proxyExceptions = TC.Cfg.proxyExceptions || [];
  TC.Cfg.proxyExceptions.push(TC.Consts.url.GOOGLEMAPS);

  let gMapsUrl = TC.Consts.url.GOOGLEMAPS;
  let waitId = 0;

  // Atributos
  ctlProto.CLASS = 'tc-ctl-sv';

  // ===========================================================================
  // Función de renderizado
  // ===========================================================================

  ctlProto.render = async function () {
    const _this = this;
    const result = await TC.control.StreetView.prototype.render.call(_this, function(){});
    return result;
  };


  ctlProto.loadTemplates = async function () {
    const _this = this;
    await TC.control.StreetView.prototype.loadTemplates.call(_this);
    // Do nothing
  };

  // ===========================================================================
  // Función de registro del componente
  // ===========================================================================

  ctlProto.register = async function (map) {
    const _this = this;
    const result = await TC.control.StreetView.prototype.register.call(_this, map);
    return result;
  };

  // ===========================================================================
  // Callback para ejecutar después del renderizado
  // ===========================================================================

  ctlProto.callback = function (coords) {
    const _this = this;
    const geogCrs = 'EPSG:4326';

    const ondrop = function (feature) {
      if (_this._sv) {
        const bounds = feature.getBounds();
        const lonLat = TC.Util.reproject([(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2], _this.map.getCrs(), geogCrs);
        _this._sv.setPosition({ lng: lonLat[0], lat: lonLat[1] });
      }
    };

    const ondrag = function (feature) {
      if (_this._sv) {
        const bounds = feature.getBounds();
        _this._startLonLat = TC.Util.reproject([(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2], _this.map.getCrs(), geogCrs);
      }
    };

    const li = _this.map.getLoadingIndicator();
    if (li) {
      waitId = li.addWait(waitId);
    }

    const mapDiv = _this.mapDiv;

    const setMarker = function (sv, center) {
      _this.layer.clearFeatures();

      let xy;
      let heading;

      if (sv) {
        const latLon = sv.getPosition();
        xy = TC.Util.reproject([latLon.lng(), latLon.lat()], geogCrs, _this.map.getCrs());
        heading = sv.getPov().heading;

      } else {
        xy = coords;
        heading = 0;
      }

      if (_this.map.on3DView) {
        _this.ThreeDMarker = _this.map.view3D.setMarker(xy,
          TC.Util.getBackgroundUrlFromCss('tc-marker-sv-' + (Math.round(16.0 * heading / 360) + 16) % 16),
          _this.ThreeDMarker);

      } else {
        _this.map.addMarker(xy, {
          cssClass: 'tc-marker-sv-' + (Math.round(16.0 * heading / 360) + 16) % 16,
          width: 48,
          height: 48,
          anchor: [0.4791666666666667, 0.7083333333333333],
          layer: _this.layer,
          showsPopup: false
        });

        // Para poder arrastrar a pegman
        Promise.all(_this.map._markerPromises).then(function () {
          _this.layer.wrap.setDraggable(true, ondrop, ondrag);
        });
      }

      if (center) {
        const setCenter = function () {
          if (!_this.map.on3DView) {
            _this.map.setCenter(xy);

          } else {
            _this.map.view3D.setCenter(xy);
          }
        };

        // Esperamos a que el mapa esté colapsado para centrarnos: ahorramos ancho de banda
        if (mapDiv.classList.contains(TC.Consts.classes.COLLAPSED)) {
          setCenter();

        } else {
          setTimeout(setCenter, 1200);
        }
      }
    };

    const changeMarker = function (cssClass) {
      if (!_this.map.on3DView) {
        if (_this.layer.features && _this.layer.features.length > 0) {
          const pegmanMarker = _this.layer.features[0];
          delete pegmanMarker.options.url;
          pegmanMarker.options.cssClass = cssClass
          pegmanMarker.setStyle(pegmanMarker.options);
        }

      } else {
        _this.ThreeDMarker?.setImage(Math.random() * 1000, TC.Util.getBackgroundUrlFromCss(cssClass));
      }
    }

    TC.loadJS(!window.google || !google.maps, gMapsUrl, function () {

        if (window.google) {
          setMarker();
          const view = _this.viewDiv;
          const lonLat = TC.Util.reproject(coords, _this.map.getCrs(), geogCrs);
          const mapsLonLat = new google.maps.LatLng(lonLat[1], lonLat[0]);

          // Comprobamos si hay datos de SV en el sitio elegido.
          const svService = new google.maps.StreetViewService();
          svService.getPanorama({
            location: mapsLonLat,
            preference: google.maps.StreetViewPreference.BEST
          }, function (svPanoramaData, svStatus) {
            if (svStatus !== google.maps.StreetViewStatus.OK) {
              if (li) {
                li.removeWait(waitId);
              }

              setTimeout(function () { // Timeout para dar tiempo a ocultarse a LoadingIndicator
                TC.alert(svStatus === google.maps.StreetViewStatus.ZERO_RESULTS ? _this.getLocaleString('noStreetView') : _this.getLocaleString('streetViewUnknownError'));
                _this.layer.wrap.setDraggable(false);
                reset(_this);
              }, 100);

            } else {
              const onTransitionend = function (e) {
                if (!_this._transitioning) {
                  return;
                }

                if (e.propertyName === 'width' || e.propertyName === 'height') {
                  _this._transitioning = false;

                  if (li) {
                    li.removeWait(waitId);
                  }

                  const resizeEvent = document.createEvent('HTMLEvents');
                  resizeEvent.initEvent('resize', false, false);
                  mapDiv.dispatchEvent(resizeEvent);

                  dispatchCanvasResize.call(_this);
                  view.removeEventListener('transitionend', onTransitionend);

                  const svOptions = {
                    position: mapsLonLat,
                    pov: {
                      heading: 0,
                      pitch: 0
                    },
                    zoom: 1,
                    fullscreenControl: false,
                    zoomControlOptions: {
                      position: google.maps.ControlPosition.LEFT_TOP
                    },
                    panControlOptions: {
                      position: google.maps.ControlPosition.LEFT_TOP
                    },
                    imageDateControl: true
                  };

                  if (!_this._sv) {
                    _this._sv = new google.maps.StreetViewPanorama(view, svOptions);
                    google.maps.event.addListener(_this._sv, 'position_changed', function () {
                      setMarker(_this._sv, view.classList.contains(TC.Consts.classes.VISIBLE));
                    });

                    _this.managePOVChange = function () {
                      const heading = _this.map.on3DView
                        ? (_this._sv.getPov().heading || 360) - _this.map.view3D.getCameraData().heading
                        : _this._sv.getPov().heading;
                      changeMarker('tc-marker-sv-' + (Math.round(16.0 * heading / 360) + 16) % 16);
                    };

                    _this.map.on(TC.Consts.event.CAMERACHANGE, _this.managePOVChange);
                    google.maps.event.addListener(_this._sv, 'pov_changed', _this.managePOVChange);
                    google.maps.event.addListener(_this._sv, 'status_changed', function () {
                      const svStatus = _this._sv.getStatus();

                      if (svStatus !== google.maps.StreetViewStatus.OK) {
                        _this._sv.setVisible(false);
                        TC.alert(svStatus === google.maps.StreetViewStatus.ZERO_RESULTS ? _this.getLocaleString('noStreetView') : _this.getLocaleString('streetViewUnknownError'));
                        if (_this._startLonLat) {
                          _this._sv.setVisible(true);
                          _this._sv.setPosition({ lng: _this._startLonLat[0], lat: _this._startLonLat[1] });

                        } else {
                          _this.layer.wrap.setDraggable(false);
                          _this.closeView();
                        }
                      }
                    });

                  } else {
                    _this._sv.setOptions(svOptions);
                    _this._sv.setVisible(true);
                  }
                }
              };

              _this._transitioning = true;
              view.addEventListener('transitionend', onTransitionend);

              // No había definida una vista. Para hacer el control compatible con mapas incrustados,
              // en este caso a la vista nueva le asignamos el tamaño del mapa.
              if (!_this.options.viewDiv || !mapDiv.classList.contains(TC.Consts.classes.FULL_SCREEN)) {
                const mapRect = mapDiv.getBoundingClientRect();
                _this.viewDiv.style.height = mapRect.height + 'px';
                _this.viewDiv.style.width = mapRect.width + 'px';
              }

              const zIndexMap = parseInt(window.getComputedStyle(mapDiv).zIndex, 10);

              mapDiv.classList.add(TC.Consts.classes.COLLAPSED);
              mapDiv.style.width = _this.options.ovmapW || "25vh";
              mapDiv.style.height = _this.options.ovmapH || "25vh";
              if (_this.map.on3DView) // Si es en modo 3D, se oculta el mapa 2D para que no interfiera
                _this.map.div.style.display = "none"

              view.style.left = '';
              view.style.top = '';
              view.classList.remove(TC.Consts.classes.HIDDEN);
              view.classList.add(TC.Consts.classes.VISIBLE);

              const zIndexView = parseInt(window.getComputedStyle(view).zIndex, 10);
              if (zIndexMap <= zIndexView)
                mapDiv.style.zIndex = (zIndexView + 1)

              // Por si no salta transitionend
              setTimeout(function () {
                onTransitionend({ propertyName: 'width' });
              }, 1000);

              const header = document.body.querySelector('header');
              if (header) {
                header.style.display = 'none';
              }

              // Apagar lo que sea que esté encendido (probablemente featInfo).
              // Al cerrar con el aspa, volverá a detonarse StreetView.deactivate()
              // que, a su vez, restaurará el control anterior (FeatureInfo).
              if (_this.map.activeControl) {
                _this._previousActiveControl = _this.map.activeControl;
                _this.map.activeControl.deactivate(true);
              }

              setMarker(_this._sv);
            }
          });

        } else {
          reset(_this);
        }
      }, false, true);
  };

  // ===========================================================================
  // Funciones auxiliares
  // ===========================================================================

  const preset = function (ctl) {
    ctl.div.querySelector('.' + ctl.CLASS + '-btn').classList.add(TC.Consts.classes.CHECKED);
    ctl.map.div.classList.add(ctl.CLASS + '-active');
  };


  const reset = function (ctl) {
    const view = ctl.viewDiv;
    const transitionEvents = ['webkitTransitionEnd', 'msTransitionEnd', 'oTransitionEnd', 'transitionend'];
    const onTransitionend = function () {
      if (!TC.Util.detectSafari()) {
        transitionEvents.forEach(function (eventName) {
          view.removeEventListener(eventName, onTransitionend);
        });
      }

      dispatchCanvasResize.call(ctl);
    };

    // Safari no lanza transitionend
    if (TC.Util.detectSafari()) {
      setTimeout(function () {
        dispatchCanvasResize.call(ctl);
      }, 500);

    } else {
      transitionEvents.forEach(function (eventName) {
        view.addEventListener(eventName, onTransitionend);
      });
    }

    if (ctl.map.on3DView && ctl.ThreeDMarker) {
      ctl.ThreeDMarker.show = false;
      ctl.map.view3D.getScene().requestRender();

    } else {
      ctl.layer.clearFeatures();
    }

    ctl.div.querySelector('.' + ctl.CLASS + '-btn').classList.remove(TC.Consts.classes.CHECKED);
    ctl.div.querySelector('.' + ctl.CLASS + '-drag').classList.remove(TC.Consts.classes.HIDDEN);
    ctl.map.div.classList.remove(ctl.CLASS + '-active');
    ctl._startLonLat = null;
  };


  const resolve = function (ctl) {
    let result = false;
    const btn = ctl.div.querySelector('.' + ctl.CLASS + '-btn');
    const drag = ctl.div.querySelector('.' + ctl.CLASS + '-drag');

    const btnRect = btn.getBoundingClientRect();
    const dragRect = drag.getBoundingClientRect();
    drag.classList.add(TC.Consts.classes.HIDDEN);

    if (dragRect.top < btnRect.top || dragRect.top > btnRect.bottom ||
      dragRect.left < btnRect.left || dragRect.left > btnRect.right) {

      // Hemos soltado fuera del botón: activar StreetView
      result = true;

      // Precarga de marcadores
      const extent = ctl.map.getExtent();
      const xy = [extent[2], extent[3]];
      if (!ctl.map.on3DView) {
        for (let i = 0; i < 16; i++) {
          ctl.layer.addMarker(xy, {
            id: 'pegman',
            cssClass: 'tc-marker-sv-' + i,
            width: 48,
            height: 48,
            anchor: [0, 1]
          });
        }
      }

      // Activamos StreetView
      const mapRect = ctl.map.div.getBoundingClientRect();
      // const xpos = (((dragRect.left * window.devicePixelRatio) + (dragRect.right * window.devicePixelRatio)) / 2) - (mapRect.left * window.devicePixelRatio);
      // const ypos = (dragRect.bottom * window.devicePixelRatio) - (mapRect.top * window.devicePixelRatio);

      // --- Start Silme
      const xpos = (((dragRect.left) + (dragRect.right)) / 2) - (mapRect.left);
      const ypos = (dragRect.bottom) - (mapRect.top);
      // --- End Silme

      const coords = ctl.map.wrap.getCoordinateFromPixel([xpos, ypos]);
      ctl.callback(coords);

    } else {
      reset(ctl);
    }

    return result;
  };

  const dispatchCanvasResize = function () {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    const elm = this.map.div.querySelector('canvas') || window;
    elm.dispatchEvent(event);
  };

})();
