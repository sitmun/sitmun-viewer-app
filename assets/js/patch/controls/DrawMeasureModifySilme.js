TC.control = TC.control || {};

if (!TC.control.DrawMeasureModify) {
  TC.syncLoadJS(TC.apiLocation + 'TC/control/DrawMeasureModify');
}

TC.control.DrawMeasureModifySilme = function (options) {
  var _ctl = this;

  TC.control.DrawMeasureModify.apply(_ctl, arguments);
};

TC.inherit(TC.control.DrawMeasureModifySilme, TC.control.DrawMeasureModify);

(function () {
  var ctlProto = TC.control.DrawMeasureModifySilme.prototype;

  ctlProto.CLASS = 'tc-ctl-dmm';

  var _dataKeys = {
    VALUE: 'tcValue'
  };

  TC.Consts.event.RESULTSPANELCLOSE = TC.Consts.event.RESULTSPANELCLOSE || 'resultspanelclose.tc';
  TC.Consts.event.FEATURESSELECT = TC.Consts.event.FEATURESSELECT || "featuresselect.tc";

  //ctlProto.template = {};

  ctlProto.template = "assets/js/patch/templates/DrawMeasureModifySilme.hbs";

  ctlProto.render = function (callback) {
    const result = TC.control.DrawMeasureModify.prototype.render.call(this, callback);
  };

  ctlProto.register = function (map) {
    const self = this;

    const result = TC.control.DrawMeasureModify.prototype.register.call(self, map).then(function () {
      self._pointDrawControlPromise.then(function () {

        self.pointDrawControl
          .on(TC.Consts.event.DRAWCANCEL, function () {
            self.expandButtonsAndSearchbar();
          });

        self.lineDrawControl
          .on(TC.Consts.event.DRAWCANCEL, function () {
            self.expandButtonsAndSearchbar();
          });

        self.polygonDrawControl
          .on(TC.Consts.event.DRAWCANCEL, function () {
            self.expandButtonsAndSearchbar();
          });
      });
    });

    // return new Promise(function (resolve, reject) {
    //   TC.control.Measure.prototype.register.call(self, map).then(function () {
    //     const pointDrawControlId = self.getUID();
    //     const modifyId = self.getUID();
    //
    //     Promise.all([self.layerPromise, self.renderPromise(), self.getElevationTool()]).then(function (objects) {
    //       const layer = objects[0];
    //       self.elevationProfileActive = !!objects[2];
    //       layer.title = self.getLocaleString('sketch');
    //
    //       self._modifyPromise = map.addControl('modify', {
    //         id: modifyId,
    //         div: self.div.querySelector('.' + self.CLASS + '-mod'),
    //         layer: layer
    //       });
    //
    //       self._modifyPromise.then(function (modify) {
    //
    //         self.modify = modify;
    //         modify
    //           .on(TC.Consts.event.FEATURESSELECT, function (e) {
    //             self.getElevationControl().then(function (ctl) {
    //               if (ctl.resultsPanel && !e.features.some(function (feature) {
    //                 return ctl.resultsPanel.currentFeature === feature;
    //               })) {
    //                 ctl.resultsPanel.setCurrentFeature(null);
    //               }
    //               const feature = e.features[e.features.length - 1];
    //               if (feature) {
    //                 self.showMeasurements(self.getFeatureMeasureData(feature));
    //                 const style = feature._originalStyle || feature.getStyle();
    //                 switch (true) {
    //                   case TC.feature.Polygon && feature instanceof TC.feature.Polygon:
    //                     self.displayMode(TC.Consts.geom.POLYGON);
    //                     console.log(style.fillOpacity);
    //                     self.polygonDrawControl
    //                       .setStrokeColorWatch(style.strokeColor)
    //                       .setStrokeWidthWatch(style.strokeWidth)
    //                       .setFillColorWatch(style.fillColor)
    //                       .setFillOpacityWatch(style.fillOpacity * 100);
    //                     break;
    //                   case TC.feature.Polyline && feature instanceof TC.feature.Polyline:
    //                     self.displayMode(TC.Consts.geom.POLYLINE);
    //                     self.lineDrawControl
    //                       .setStrokeColorWatch(style.strokeColor)
    //                       .setStrokeWidthWatch(style.strokeWidth);
    //                     if (self.elevationProfileActive) {
    //                       ctl.displayElevationProfile(feature);
    //                     }
    //                     break;
    //                   case TC.feature.Point && feature instanceof TC.feature.Point:
    //                     self.displayMode(TC.Consts.geom.POINT);
    //                     self.pointDrawControl
    //                       .setStrokeColorWatch(style.strokeColor)
    //                       .setStrokeWidthWatch(style.strokeWidth)
    //                       .setFillColorWatch(style.fillColor)
    //                       .setFillOpacityWatch(style.fillOpacity * 100);
    //                     break;
    //                   default:
    //                     break;
    //                 }
    //                 self.modify
    //                   .setFontColorWatch(style.fontColor)
    //                   .setFontSizeWatch(style.fontSize);
    //               }
    //             });
    //           })
    //           .on(TC.Consts.event.FEATURESUNSELECT, function (_e) {
    //             const features = self.modify.getSelectedFeatures();
    //             if (!features.length) {
    //               self.resetDrawWatches();
    //             }
    //             self.getElevationControl().then(function (ctl) {
    //               ctl.resetElevationProfile();
    //               if (ctl.resultsPanel) {
    //                 ctl.resultsPanel.close();
    //               }
    //             });
    //           })
    //           .on(TC.Consts.event.FEATUREMODIFY, function (e) {
    //             if (e.layer === self.layer) {
    //               const setMeasures = function (feature) {
    //                 const measureData = self.getFeatureMeasureData(feature);
    //                 self.showMeasurements(measureData);
    //                 self.setFeatureMeasureData(feature);
    //               };
    //               setMeasures(e.feature);
    //
    //               // Si es un punto metemos la elevación en la geometría (porque la mostramos en las medidas)
    //               if (TC.feature.Point && e.feature instanceof TC.feature.Point) {
    //                 self.getElevationTool().then(function (tool) {
    //                   if (tool) {
    //                     tool
    //                       .setGeometry({
    //                         features: [e.feature],
    //                         crs: self.map.crs
    //                       })
    //                       .then(
    //                         function (features) {
    //                           setMeasures(features[0]);
    //                         },
    //                         function (e) {
    //                           console.warn(e.message);
    //                         }
    //                       );
    //                   }
    //                 });
    //               }
    //
    //               const popups = self.map.getControlsByClass('TC.control.Popup');
    //               popups.forEach(function (pu) {
    //                 if (pu.currentFeature === e.feature && pu.isVisible()) {
    //                   pu.hide();
    //                 }
    //               });
    //             }
    //           });
    //
    //         map
    //           .on(TC.Consts.event.CONTROLDEACTIVATE, function (e) {
    //             const control = e.control;
    //             if (control === self.modify || control === self.lineDrawControl) {
    //               self.resetDrawWatches();
    //               self.getElevationControl().then(function (ctl) {
    //                 ctl.resetElevationProfile();
    //                 if (ctl.resultsPanel) {
    //                   if (control === self.modify) {
    //                     ctl.resultsPanel.setCurrentFeature(null);
    //                   }
    //                   ctl.resultsPanel.close();
    //                 }
    //               });
    //             }
    //           })
    //           .on(TC.Consts.event.POPUP, function (e) {
    //             // En líneas queremos mostrar el perfil en vez del popup
    //             const feature = e.control.currentFeature;
    //             if (TC.feature.Polyline && feature instanceof TC.feature.Polyline && self.layer.features.indexOf(feature) >= 0) {
    //               if (self.elevationProfileActive) {
    //                 e.control.hide();
    //                 self.getElevationControl().then(function (ctl) {
    //                   if (ctl.resultsPanel) {
    //                     ctl.resultsPanel.setCurrentFeature(feature);
    //                     if (ctl.resultsPanel.isMinimized()) {
    //                       ctl.resultsPanel.maximize();
    //                     }
    //                   }
    //                   ctl.displayElevationProfile(feature);
    //                 });
    //               }
    //             }
    //           })
    //           .on(TC.Consts.event.PROJECTIONCHANGE, function (e) {
    //             if (self.elevationChartData) {
    //               self.elevationChartData.coords = TC.Util.reproject(self.elevationChartData.coords, e.oldCrs, e.newCrs);
    //             }
    //           });
    //
    //       });
    //
    //       self._lineDrawControlPromise.then(function (lineDrawControl) {
    //         lineDrawControl
    //           .on(TC.Consts.event.DRAWSTART, function () {
    //             //self.resetElevationProfile();
    //             self.getElevationControl().then(function (ctl) {
    //               if (ctl.resultsPanel && ctl.resultsPanel.currentFeature) {
    //                 ctl.resultsPanel.setCurrentFeature(null);
    //               }
    //               self.resetValues();
    //             });
    //             //beginDraw.apply(self);
    //           })
    //           .on(TC.Consts.event.DRAWUNDO + ' ' + TC.Consts.event.DRAWREDO, function () {
    //             const lineDrawControl = this;
    //             self.getElevationControl().then(function (ctl) {
    //               if (self.elevationProfileActive) {
    //                 if (lineDrawControl.historyIndex) {
    //                   ctl.displayElevationProfile(lineDrawControl.history.slice(0, lineDrawControl.historyIndex));
    //                 }
    //                 else {
    //                   ctl.closeElevationProfile();
    //                 }
    //               }
    //             });
    //             cancelDraw.apply(self);
    //           })
    //           .on(TC.Consts.event.DRAWEND, function (e) {
    //             self.getElevationControl().then(function (ctl) {
    //               if (ctl.resultsPanel) {
    //                 ctl.resultsPanel.currentFeature = e.feature;
    //               }
    //             });
    //           })
    //           .on(TC.Consts.event.POINT, function (e) {
    //             const lineDrawControl = this;
    //             const coords = lineDrawControl.history.slice(0, lineDrawControl.historyIndex);
    //             const lastCoord = coords[coords.length - 1];
    //             if (lastCoord[0] !== e.point[0] || lastCoord[1] !== e.point[1]) {
    //               coords.push(e.point);
    //
    //             }
    //             self.getElevationControl().then(function (ctl) {
    //               //if (self.elevationProfileActive) {//SILME MV 20210927 (v2.1)
    //               if (self.elevationProfileActive && coords.length > 1) {
    //                 if (navigator.onLine) {
    //                   ctl.displayElevationProfile(coords);
    //                 }
    //                 else {
    //                   ctl.closeElevationProfile();
    //                 }
    //               }
    //             });
    //             if (e.target.historyIndex === 1)
    //               beginDraw.apply(self);
    //           })
    //           .on(TC.Consts.event.STYLECHANGE, function (e) {
    //             self.onStyleChange(e);
    //           }).on(TC.Consts.event.DRAWCANCEL, function () {
    //           cancelDraw.apply(self);
    //         });
    //       });
    //
    //       self._polygonDrawControlPromise.then(function (polygonDrawControl) {
    //         polygonDrawControl
    //           .on(TC.Consts.event.DRAWSTART, function () {
    //             self.resetValues();
    //             //beginDraw.apply(self);
    //           })
    //           .on(TC.Consts.event.POINT, function (e) {
    //             if (e.target.historyIndex === 1)
    //               beginDraw.apply(self);
    //           })
    //           //.on(TC.Consts.event.DRAWEND, function (e) {
    //           //    self.getElevationTool().then(function (tool) {
    //           //        if (tool) {
    //           //            tool.setGeometry({
    //           //                features: [e.feature],
    //           //                crs: self.map.crs
    //           //            });
    //           //        }
    //           //    }
    //           //})
    //           .on(TC.Consts.event.STYLECHANGE, function (e) {
    //             self.onStyleChange(e);
    //           })
    //           .on(TC.Consts.event.DRAWCANCEL + ' ' + TC.Consts.event.DRAWUNDO, function () {
    //             cancelDraw.apply(self);
    //           });
    //       });
    //       self._pointDrawControlPromise = map.addControl('draw', {
    //         id: pointDrawControlId,
    //         div: self.div.querySelector('.' + TC.control.Measure.prototype.CLASS + '-point'),
    //         mode: TC.Consts.geom.POINT,
    //         persistent: self.persistentDrawControls,
    //         styling: true,
    //         layer: self.layer
    //       });
    //
    //       self._pointDrawControlPromise.then(function (pointDrawControl) {
    //
    //         pointDrawControl.containerControl = self;
    //         self.drawControls.push(pointDrawControl);
    //         self.pointDrawControl = pointDrawControl;
    //
    //         self.resetValues();
    //
    //         pointDrawControl
    //           .on(TC.Consts.event.DRAWEND, function (e) {
    //             const updateChanges = function (feat) {
    //               self.showMeasurements({ coords: feat.geometry, units: map.wrap.isGeo() ? 'degrees' : 'm' });
    //               self.setFeatureMeasureData(feat);
    //             };
    //             updateChanges(e.feature);
    //             self.getElevationTool().then(function (tool) {
    //               if (tool) {
    //                 tool.setGeometry({
    //                   features: [e.feature],
    //                   crs: self.map.crs
    //                 }).then(function (features) {
    //                   updateChanges(features[0]);
    //                 }, function (e) {
    //                   console.log(e.message);
    //                 });
    //               }
    //             });
    //             beginDraw.apply(self);
    //           })
    //           .on(TC.Consts.event.DRAWCANCEL, function (_e) {
    //             // Alerta de condición de carrera si no ponemos un timeout:
    //             // 1- Se llama a cancel de un control Draw.
    //             // 2- Se llama a deactivate (como es mediante cancel, no se se corta la cadena de activación controles).
    //             // 3- Si el control activo anterior era otro de los modos de dibujo de Measure, se activa.
    //             // 4- Se llama a cancel desde aquí.
    //             // 5- Se llama a deactivate del control que acabamos de activar en 3.
    //             // El activate de 3 y el deactivate de 5 sobre el mismo control entran en condición de carrera al crear/destruir la interaction
    //             // por tanto se puede quedar en un estado inconsistente. Para evitar eso, separamos 3 de 5 por el siguiente timeout.
    //             self.expandButtonsAndSearchbar();//Silme
    //             setTimeout(function () {
    //               self.cancel();
    //             }, 100);
    //             cancelDraw.apply(self);
    //           })
    //           .on(TC.Consts.event.STYLECHANGE, function (e) {
    //             self.onStyleChange(e);
    //           });
    //         // Desactivamos el método exportState que ya se encarga el control padre de ello
    //         pointDrawControl.exportsState = false;
    //       });
    //
    //       self._elevationControlPromise = map.addControl('elevation', self.options.displayElevation);
    //
    //       self.setMode(self.options.mode);
    //
    //       map
    //         .on(TC.Consts.event.FEATUREADD, function (e) {
    //           const layer = e.layer;
    //           const feature = e.feature;
    //           if (layer === self.layer) {
    //             self.setFeatureMeasureData(feature);
    //
    //             self._modifyPromise.then(function (modify) {
    //               modify.displayLabelText(feature.getStyle().label);
    //             });
    //             self._clearBtn.disabled = false;
    //             self._downloadBtn.disabled = false;
    //           }
    //         })
    //         .on(TC.Consts.event.FEATUREREMOVE + ' ' + TC.Consts.event.FEATURESCLEAR, function (e) {
    //           const layer = e.layer;
    //           if (layer === self.layer) {
    //             if (self.layer.features.length === 0) {
    //               self._clearBtn.disabled = true;
    //               self._downloadBtn.disabled = true;
    //               self.resetValues();
    //               cancelDraw.apply(self);
    //             }
    //           }
    //         })
    //         .on(TC.Consts.event.RESULTSPANELCLOSE, function (e) {
    //           self.getElevationControl().then(function (ctl) {
    //             if (ctl === e.control) {
    //               ctl.setCurrentFeature(null);
    //             }
    //           });
    //         });
    //
    //       resolve(self);
    //     });
    //
    //   }).catch(function (error) {
    //     reject(error);
    //   });
    // });
  };

  ctlProto.setMode = function (mode) {
    const self = this;
    if (mode === TC.Consts.geom.POINT) {
      //self.drawPoints.activate();
      self.pointDrawControl.activate();
      //Silme
      self.div.querySelector('.tc-ctl-meas-pt').classList.add('silme-control-flotant');
      self.collapseButtonsAndSearchbar();
    } else if (mode == TC.Consts.geom.POLYLINE) {
      self.div.querySelector('.tc-ctl-meas-len').classList.add('silme-control-flotant');
      self.collapseButtonsAndSearchbar();
    } else if (mode == TC.Consts.geom.POLYGON) {
      self.div.querySelector('.tc-ctl-meas-area').classList.add('silme-control-flotant');
      self.collapseButtonsAndSearchbar();
    }
    //End Silme

    return TC.control.Measure.prototype.setMode.call(self, mode);
  };

  ctlProto.getFeatureMeasureData = function (feature) {
    const self = this;
    const result = {
      units: 'm'
    };
    const measureOptions = {};
    measureOptions.crs = SITNA.Cfg.utmCrs;//Silme
    if (self.map.wrap.isGeo()) {
      measureOptions.crs = SITNA.Cfg.utmCrs;
    }
    switch (true) {
      case TC.feature.Polygon && feature instanceof TC.feature.Polygon:
        result.area = feature.getArea(measureOptions);
        result.perimeter = feature.getLength(measureOptions);
        break;
      case TC.feature.Polyline && feature instanceof TC.feature.Polyline:
        //result.length = feature.getLength(measureOptions);
        //const profile = getElevationProfileFromCache(feature);
        //if (profile) {
        //    self.renderElevationChart(profile.data);
        //}
        //else {
        //    self.displayElevationProfile(feature.geometry);
        //}
        //break;
        result.length = feature.getLength(measureOptions);
        self.getElevationControl().then(ctl => {
          if (self.elevationProfileActive) {
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

  ctlProto.collapseButtonsAndSearchbar = function () {//Silme
    const self = this;
    document.querySelector('.tc-ctl-cctr-right').style.left = '';
    document.querySelector('.tc-ctl-cctr-left').style.left = '';
    if (document.querySelector('.silme-control-flotant') != null) {
      document.querySelectorAll('.silme-control-flotant').forEach(item => {
        item.style.left = '';
      });
    }
    self.map.div.querySelector('#silme-panel').classList.remove('left-collapsed-silme');
    self.map.div.querySelector('#silme-panel').classList.add('left-collapsed');
    self.map.div.querySelector('#silme-panel').classList.add('silme-control-visible');
    self.map.div.querySelector('.tc-ctl-nav-home').classList.remove('tc-ctl-nav-home-exp');
    self.map.div.querySelector('.tc-ctl-nav-home').classList.add('tc-ctl-nav-home-coll');
    self.map.div.querySelector('.tc-ctl-sv').classList.remove('tc-ctl-sv-exp');
    self.map.div.querySelector('.tc-ctl-sv').classList.add('tc-ctl-sv-coll');
    self.map.div.querySelector('.tc-ctl-search').classList.remove('search-left-collapsed');
    self.map.div.querySelector('.tc-ctl-sv').style.left = self.map.div.querySelector('#nav').style.left;
    self.map.div.querySelector('.tc-ctl-nav-home').style.left = self.map.div.querySelector('#nav').style.left;
    if (window.innerWidth < 760) {
      self.map.div.querySelector('#silme-tab').style.visibility = 'collapse';
      self.map.div.querySelector('.tc-ctl-sv').style.visibility = 'collapse';
      self.map.div.querySelector('.tc-ctl-nav-home').style.visibility = 'collapse';
    }
  }

  ctlProto.expandButtonsAndSearchbar = function () {//Silme
    const self = this;
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
    self.map.div.querySelector('#silme-panel').classList.remove('left-collapsed');
    self.map.div.querySelector('#silme-panel').classList.remove('silme-control-visible');
    self.map.div.querySelector('#silme-panel').classList.add('left-collapsed-silme');
    self.map.div.querySelector('.tc-ctl-nav-home').classList.remove('tc-ctl-nav-home-coll');
    self.map.div.querySelector('.tc-ctl-nav-home').classList.add('tc-ctl-nav-home-exp');
    self.map.div.querySelector('.tc-ctl-sv').classList.remove('tc-ctl-sv-coll');
    self.map.div.querySelector('.tc-ctl-sv').classList.add('tc-ctl-sv-exp');
    self.map.div.querySelector('.tc-ctl-search').classList.add('search-left-collapsed');
    self.map.div.querySelector('.tc-ctl-sv').style.left = self.map.div.querySelector('#nav').style.left;
    self.map.div.querySelector('.tc-ctl-nav-home').style.left = self.map.div.querySelector('#nav').style.left;
    if (window.innerWidth < 760) {
      self.map.div.querySelector('#silme-tab').style.visibility = 'unset';
      self.map.div.querySelector('.tc-ctl-sv').style.visibility = 'unset';
      self.map.div.querySelector('.tc-ctl-nav-home').style.visibility = 'unset';
    }
  }
  const beginDraw = function () {
    const self = this;
    const showHideBtn = self.div.querySelector('.tc-ctl-dmm-cmd button.tc-ctl-dmm-btn-hide');
    if(showHideBtn)showHideBtn.disabled = false;
  }
  const cancelDraw = function () {
    const self = this;
    const showHideBtn = self.div.querySelector('.tc-ctl-dmm-cmd button.tc-ctl-dmm-btn-hide');
    if (showHideBtn) {
      const layerPromises = this.drawControls.reduce(function (i, a) { return i.concat([a.getLayer()]) }, []);
      Promise.all(layerPromises).then(function () {
        showHideBtn.disabled = !self.drawControls.some(dc => dc.layer.features.length || (dc.isActive && dc.historyIndex > 0));
        showHideBtn.classList.add(TC.Consts.classes.ACTIVE);
        showHideBtn.title = self.getLocaleString("hideSketch");
      });
    }
  }
})();
