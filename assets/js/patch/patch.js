// Parche para cambiar el comportamiento del editor de etiquetas de DrawMeasureModify de 3.0.0 a 4.1.0
(function () {
  // Parche para que el estilo de etiqueta aparezca solamente en las entidades deseadas
  const stylePropertyNames = new Set([
    'strokeColor',
    'strokeWidth',
    'fillColor',
    'strokeOpacity',
    'fillOpacity',
    'url',
    'radius',
    'anchor',
    'width',
    'height',
    'label',
    'labelKey',
    'labelOutlineWidth',
    'labelOutlineColor',
    'labelOffset',
    'fontColor',
    'fontSize'
  ]);

  const isStyleOption = function (name) {
    return stylePropertyNames.has(name);
  };

  const getRGBA = function (color, opacity) {
    var result;
    if (color) {
      result = ol.color.asArray(color);
      result = result.slice();
    }
    else {
      result = [0, 0, 0, 1];
    }
    if (opacity !== undefined) {
      result[3] = opacity;
    }
    return result;
  };

  const getStyleValue = function (property, feature) {
    var result = property;
    var olFeat = feature && feature.wrap && feature.wrap.feature;
    if (typeof property === 'string') {
      var match = property.match(/^\$\{(.+)\}$/);
      if (match) {
        result = '';
        if (olFeat) {
          // Permitimos el formato ${prop.subprop.subsubprop}
          var m = match[1].split('.');
          var r = olFeat.getProperties();
          for (var i = 0; i < m.length && r !== undefined; i++) {
            r = r[m[i]];
          }
          result = r ?? '';
        }
      }
    }
    else if (TC.Util.isFunction(property)) {
      result = property(feature);
    }
    return result;
  };

  const isParamStyle = function (options) {
    if (options) {
      for (var key in options) {
        if (key == 'point' || key == 'line' || key == 'polygon' || key == 'marker' || key == 'cluster' || isStyleOption(key)) {
          const value = options[key];
          if (typeof value === 'string') {
            if (/^\$\{(.+)\}$/.test(value)) {
              return true;
            }
          }
          else if (typeof value === 'object') {
            if (isParamStyle(value)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };


  const createNativeTextStyle = function (styleObj, feature) {
    if (!(styleObj?.label || styleObj?.labelKey)) {
      return;
    }

    const textOptions = {
      text: '' + getStyleValue(styleObj.labelKey || styleObj.label, feature),
      overflow: true
    };
    //const olGeom = feature.wrap.feature.getGeometry();
    //if (olGeom instanceof ol.geom.LineString || olGeom instanceof ol.geom.MultiLineString) {
    //    textOptions.placement = ol.style.TextPlacement.LINE;
    //}
    if (styleObj.fontSize) {
      textOptions.font = getStyleValue(styleObj.fontSize, feature) + 'pt sans-serif';
    }
    else if (styleObj.font) {
      textOptions.font = styleObj.font;
    }
    if (styleObj.labelRotationKey) {
      textOptions.rotation = -Math.PI * getStyleValue(styleObj.labelRotationKey, feature) / 180;
    }
    if (styleObj.fontColor) {
      const fontColor = getStyleValue(styleObj.fontColor, feature);
      textOptions.fill = new ol.style.Fill({
        //09/11/2021 URI:Se estaba forzando la opacidad a 1 incluso si esta está definida en el 4 elemento del color
        color: getRGBA(fontColor, (Array.isArray(fontColor) ? fontColor[3] : 1) || 1)
        //color: getRGBA(getStyleValue(styleObj.fontColor, feature), 1)
      });
    }
    if (styleObj.labelOutlineColor) {
      const outlineColor = getStyleValue(styleObj.labelOutlineColor, feature);
      textOptions.stroke = new ol.style.Stroke({
        //09/11/2021 URI:Se estaba forzando la opacidad a 1 incluso si esta está definida en el 4 elemento del color
        color: getRGBA(outlineColor, (Array.isArray(outlineColor) ? outlineColor[3] : 1) || 1),
        //color: getRGBA(getStyleValue(styleObj.labelOutlineColor, feature), 1),
        width: getStyleValue(styleObj.labelOutlineWidth, feature)
      });
    }
    if (styleObj.labelOffset) {
      textOptions.offsetX = styleObj.labelOffset[0];
      textOptions.offsetY = styleObj.labelOffset[1];
    }
    //09/11/2021 URI: Antes no se le podía especificar la escala de la fuente de los labels
    if (styleObj.textScale) {
      textOptions.scale = styleObj.textScale;
    }
    //09/11/2021 URI: Antes no se le podía especificar la alineación de la fuente de los labels
    if (styleObj.textAlign) {
      textOptions.textAlign = styleObj.textAlign;
    }
    //
    return new ol.style.Text(textOptions);
  };

  const createNativeStyle = function (options, olFeat) {
    if (TC.Util.isFunction(options)) {
      return function (f) {
        return createNativeStyle(options(f._wrap.parent));
      }
    }

    const isDynamicStyle = isParamStyle(options.styles);

    const styleFunction = function (olFeat) {

      const nativeStyleOptions = [];

      var feature;
      var isPoint, isLine, isPolygon;
      if (olFeat) {
        const olGeom = olFeat.getGeometry();
        switch (olGeom && olGeom.getType()) {
          case 'Point':
          case 'MultiPoint':
            isPoint = true;
            break;
          case 'LineString':
          case 'MultiLineString':
            isLine = true;
            break;
          case 'Polygon':
          case 'MultiPolygon':
            isPolygon = true;
            break;
        }
        if (olFeat._wrap) {
          feature = olFeat._wrap.parent;
        }
        else {
          // Si la API SITNA no ha completado su feature, creamos un mock-up para que no fallen las funciones de estilo
          feature = {
            id: TC.wrap.Feature.prototype.getId.call({
              feature: olFeat
            }), // GLS añado el id de la feature para poder filtrar por la capa a la cual pertenece
            features: olFeat.get('features'),
            getData: function () {
              return TC.wrap.Feature.prototype.getData.call({
                feature: olFeat
              });
            }
          };
        }
      }
      const styles = options.styles || {};
      let styleOptions = {};
      if (styles.line && (isLine || !olFeat)) {
        styleOptions = styles.line;
        (styleOptions instanceof Array ? styleOptions : [styleOptions]).forEach(function (currentStyle, index) {
          nativeStyleOptions[index] = Object.assign(nativeStyleOptions[index] || {},
            {
              "stroke": new ol.style.Stroke({
                color: getStyleValue(currentStyle.strokeColor, feature),
                width: getStyleValue(currentStyle.strokeWidth, feature),
                lineDash: currentStyle.lineDash
              })
            });
        });
      }

      if (styles.polygon && (isPolygon || !olFeat)) {
        styleOptions = styles.polygon;
        (styleOptions instanceof Array ? styleOptions : [styleOptions]).forEach(function (currentStyle, index) {
          const newStyleOptions = {
            stroke: new ol.style.Stroke({
              color: getStyleValue(currentStyle.strokeColor, feature),
              width: getStyleValue(currentStyle.strokeWidth, feature),
              lineDash: currentStyle.lineDash
            })
          };
          if (currentStyle.fillColor) {
            newStyleOptions.fill = new ol.style.Fill({
              color: getRGBA(getStyleValue(currentStyle.fillColor, feature), getStyleValue(currentStyle.fillOpacity, feature))
            });
          }
          nativeStyleOptions[index] = Object.assign(nativeStyleOptions[index] || {}, newStyleOptions);
        });
      }

      if (styles.point && (isPoint || !olFeat)) {
        styleOptions = styles.point;
        (styleOptions instanceof Array ? styleOptions : [styleOptions]).forEach(function (currentStyle, index) {
          var circleOptions = {
            radius: getStyleValue(currentStyle.radius, feature) ||
              (getStyleValue(currentStyle.height, feature) + getStyleValue(currentStyle.width, feature)) / 4
          };
          if (currentStyle.fillColor) {
            circleOptions.fill = new ol.style.Fill({
              color: getRGBA(getStyleValue(currentStyle.fillColor, feature), getStyleValue(currentStyle.fillOpacity, feature))
            });
          }
          if (currentStyle.strokeColor) {
            circleOptions.stroke = new ol.style.Stroke({
              color: getStyleValue(currentStyle.strokeColor, feature),
              width: getStyleValue(currentStyle.strokeWidth, feature),
              lineDash: currentStyle.lineDash
            });
          }

          if (!Number.isNaN(circleOptions.radius))
            nativeStyleOptions[index] = Object.assign(nativeStyleOptions[index] || {}, { "image": new ol.style.Circle(circleOptions) });
        });

      }

      if (styleOptions.label || styleOptions.labelKey) {
        nativeStyleOptions[nativeStyleOptions.length] = { "text": createNativeTextStyle(styleOptions, feature) };
      }

      if (styles.marker && (isPoint || !olFeat)) {
        styleOptions = styles.marker;
        (styleOptions instanceof Array ? styleOptions : [styleOptions]).forEach(function (currentStyle, index) {

          const cssStyle = TC.Util.getFeatureStyleFromCss(currentStyle.cssClass);
          const iconUrl = currentStyle.url || cssStyle?.url;

          var ANCHOR_DEFAULT_UNITS = 'fraction';
          if (iconUrl) {
            let iconSize;
            if (cssStyle?.width) {
              iconSize = [cssStyle.width, cssStyle.height];
            }
            else if (currentStyle.width && currentStyle.height) {
              iconSize = [getStyleValue(currentStyle.width, feature), getStyleValue(currentStyle.height, feature)];
            }
            nativeStyleOptions[index] = Object.assign(nativeStyleOptions[index] || {}, {
              "image": new ol.style.Icon({
                crossOrigin: 'anonymous',
                anchor: currentStyle.anchor || styles.marker.anchor || [0.5, 1],
                anchorXUnits: currentStyle.anchorXUnits || ANCHOR_DEFAULT_UNITS,
                anchorYUnits: currentStyle.anchorYUnits || ANCHOR_DEFAULT_UNITS,
                src: iconUrl,
                width: iconSize?.[0],
                height: iconSize?.[1],
                //10/11/2021 URI: Recuperamos la rotación de los iconos que viene en grados y lo pasamos a radianes
                rotation: currentStyle.rotation ? currentStyle.rotation / 180 * Math.PI : undefined
              }),
              "text": createNativeTextStyle(currentStyle, feature)
            });
          }
        });
      }
      //10/11/2021 URI:Si entre la opciones de estilos trae un globo (balloon), seguramente se trate de la importación de un KML. Creamos un atributo nuevo llamado _balloon que posteriormente
      //será leido en el método getTemplate de la feature para pintar el bocadillo tipado
      //if (styleOptions.balloon)
      //    (styleOptions.balloon instanceof Array ? styleOptions.balloon : [styleOptions.balloon]).forEach(function (currentStyle, index) {
      //        nativeStyleOptions[index] = Object.assign(nativeStyleOptions[index] || {}, {
      //            "_balloon": new ol.style.Text({ text: currentStyle })
      //        });
      //    });
      var nativeStyle = nativeStyleOptions.map((currentStyle) => {
        var style = new ol.style.Style(currentStyle)
        if (styleOptions.balloon) style._balloon = new ol.style.Text({ text: styleOptions.balloon });
        return style;
      });
      return nativeStyle;
    }

    return isDynamicStyle ? styleFunction : styleFunction(olFeat);
  };

  const setOlStyle = function (options) {
    const self = this;
    const olFeat = self.feature;
    if (options === null) {
      olFeat.setStyle(null);
      return;
    }
    const feature = self.parent;
    const featureStyleOptions = {
      styles: {}
    };
    featureStyleOptions.styles[feature.STYLETYPE] = options;
    let newStyle = createNativeStyle(featureStyleOptions, olFeat);

    olFeat.setStyle(newStyle);
    //estilos de features 3D
    if (feature.layer && self.feature3D) {

      let currentStyle = olFeat._originalStyle || newStyle;
      if (TC.Util.isFunction(currentStyle))
        currentStyle = currentStyle();
      //const textStyle = currentStyle.find((s) => s.getText());
      feature.layer.map.view3D.setStyle(self.feature3D, options);
      feature.layer.map.view3D.setLabel(self.feature3D, options.label ? {
        outlineColor: "#FFFFFF",
        fontColor: options.fontColor,
        outlineWidth: 2,
        font: options.font || (options.fontSize + "pt sans-serif"),
        text: options.label,
      } : null);
    }

    if (olFeat._originalStyle) {
      delete olFeat._originalStyle;
      self.toggleSelectedStyle(true);
    }

    olFeat.changed();
  };

  // Parche para aplicar estilos a una entidad
  const mergeStyles = function () {
    const styles = Array.from(arguments);
    if (styles.some(s => TC.Util.isFunction(s))) {
      return function (f) {
        return Object.assign({}, ...styles.map(s => TC.Util.isFunction(s) ? s(f) : s));
      };
    }
    return Object.assign({}, ...styles);
  };


  TC.Feature.prototype.setStyle = function (style) {
    let newStyle;
    if (style === null) {
      newStyle = null;
    }
    else {
      const mergedStyles = [this.getStyle(), style];
      if (this.layer?.styles?.[this.STYLETYPE]) {
        mergedStyles.unshift(this.layer.styles[this.STYLETYPE]);
      }
      if (this.layer?.map.options.styles?.[this.STYLETYPE]) {
        mergedStyles.unshift(this.layer.map.options.styles[this.STYLETYPE]);
      }
      if (TC.Cfg?.styles?.[this.STYLETYPE]) {
        mergedStyles.unshift(TC.Cfg.styles[this.STYLETYPE]);
      }
      newStyle = mergeStyles(...mergedStyles);
    }
    setOlStyle.call(this.wrap, newStyle);
    return this;
  };

  // Parche para que se pueda aplicar etiqueta a la entidad que está siendo dibujada
  TC.wrap.control.Draw.prototype.getSketch = function () {
    const self = this;
    if (self.sketch) {
      return createFeature(self.sketch);
    }
    return null;
  };


  TC.control.Draw.prototype.getSketch = function () {
    return this.wrap.getSketch();
  };

  TC.control.Modify.prototype.getActiveFeatures = function () {
    const result = this.getSelectedFeatures();
    if (!result.length) {
      if (this.map?.activeControl?.getSketch) {
        const sketch = this.map.activeControl.getSketch();
        if (sketch) {
          result.push(sketch);
        }
      }
      if (!result.length && this.layer?.features.length) {
        result.push(this.layer.features[this.layer?.features.length - 1]);
      }
    }
    return result;
  };

  const createFeature = function (olFeat, options = {}) {
    if (!olFeat._sitnaFeature) {
      var olGeometry = olFeat.getGeometry();
      options.id = olFeat.getId();
      let olStyle = olFeat.getStyle();
      if (olStyle) {
        TC.Util.extend(options, getStyleFromNative(olStyle, olFeat));
      }
      // geometría
      let geomStr;
      switch (true) {
        case olGeometry instanceof ol.geom.Point:
        case olGeometry instanceof ol.geom.MultiPoint:
          if (TC.Util.isFunction(olStyle)) {
            olStyle = olStyle(olFeat);
          }
          var olStyles = olStyle ?
            Array.isArray(olStyle) ? olStyle : [olStyle] :
            [];
          for (var i = 0, len = olStyles.length; i < len; i++) {
            olStyle = olStyles[i];
            if (olStyle.getImage() instanceof ol.style.Icon) {
              geomStr = 'Marker';
              break;
            }
          }
          geomStr = geomStr || 'Point';
          if (olGeometry instanceof ol.geom.MultiPoint) {
            if (geomStr === 'Point') {
              geomStr = 'MultiPoint';
            }
            if (geomStr === 'Marker') {
              geomStr = 'MultiMarker';
            }
          }
          break;
        case olGeometry instanceof ol.geom.LineString:
          geomStr = 'Polyline';
          break;
        case olGeometry instanceof ol.geom.Polygon:
          geomStr = 'Polygon';
          break;
        case olGeometry instanceof ol.geom.MultiLineString:
          geomStr = 'MultiPolyline';
          break;
        case olGeometry instanceof ol.geom.MultiPolygon:
          geomStr = 'MultiPolygon';
          break;
        default:
          break;
      }
      let feat;
      if (geomStr) {
        feat = new TC.feature[geomStr](olFeat, options);
      }
      else {
        feat = new TC.Feature(olFeat, options);
      }
      feat.data = feat.wrap.getData();
      olFeat._sitnaFeature = feat;
    }
    return olFeat._sitnaFeature;
  };

  // Parche para cambiar el comportamiento de UI
  const setLabelableState = function (active) {
    this._textBtn.disabled = !active;
  };

  const oldRegister = TC.control.DrawMeasureModify.prototype.register;
  TC.control.DrawMeasureModify.prototype.register = async function (map) {
    const self = this;
    const result = await oldRegister.call(self, map);

    self.lineDrawControl
      .on(TC.Consts.event.DRAWSTART, function () {
        setLabelableState.call(self.modify, true);
        self.modify.displayLabelText();
      })
      .on(TC.Consts.event.DRAWEND, function () {
        self.modify.displayLabelText();
      })
      .on(TC.Consts.event.DRAWCANCEL, function () {
        setLabelableState.call(self.modify, self.layer.features.length > 0);
        self.modify.displayLabelText();
      });

    self.polygonDrawControl
      .on(TC.Consts.event.DRAWSTART, function () {
        setLabelableState.call(self.modify, true);
        self.modify.displayLabelText();
      })
      .on(TC.Consts.event.DRAWEND, function (_e) {
        self.modify.displayLabelText();
      })
      .on(TC.Consts.event.DRAWCANCEL + ' ' + TC.Consts.event.DRAWUNDO, function () {
        setLabelableState.call(self.modify, self.layer.features.length > 0);
        self.modify.displayLabelText();
      });
    return result;
  };
})();
