const originalFnc = TC.UI.autocomplete

TC.UI.autocomplete = function (method) {

  if (typeof method === 'object' && method.target.classList.contains("tc-ctl-wfsquery-list")) {

    method.minLength = 1;

  }

  originalFnc.call(this, method);

};

//Devuelve un array de subLayers cuyo nombre o descripción contenga el texto indicado
//case insensitive
TC.layer.Raster.prototype.searchSubLayers = function (text) {
  if (!this.patternFn) {
    this.patternFn = function (t) {
      //SILME
      t = t.replace(/[^a-z\dáàéèíóòúüñ]/gi, '\\' + '$&');
      t = t.replace(/[aáà]/gi, "[aáà]");
      t = t.replace(/[eéè]/gi, "[eéè]");
      t = t.replace(/[ií]/gi, "[ií]");
      t = t.replace(/[oóò]/gi, "[oóò]");
      t = t.replace(/[uúü]/gi, "[uúü]");
      t = t.replace(/n/gi, "[nñ]");

      t = ".*?(" + t + ").*?";
      t = t.replace(/\\ /gi, ").*?(");
      //END SILME

      return t;
    };
  }
  if (text && text.length && text.length >= 3) {
    var self = this;
    var layers = null;
    /*URI:Si la cadena a buscar contiene a la busqueda anterior, por ejemplo, antes he buscado "cat" y ahora busco "cata" porque esto escribiendo "catastro" ...
    en vez de buscar en todas las capas del servicio busco en los resultados encotrados en la búsqueda anterior */
    if (this.lastPattern && text.indexOf(this.lastPattern) >= 0) {
      layers = this.lastMatches;
    }
    else {
      /*si se ha definido el parametro layers de esta capa en configuraci\u00f3n filtro las capas del capability para que busque solo en las capas que est\u00e9n en
      configuraci\u00f3n y sus hijas*/
      if (self.availableNames && self.availableNames.length > 0) {
        layers = [];
        for (var i = 0; i < self.availableNames.length; i++) {
          var layer = self.getLayerNodeByName(self.availableNames[i]);
          if (layer) {
            layers.push(layer);
            layers = layers.concat(self.getChildrenLayers(layer));
          }
        }
      }
      else {
        layers = self.wrap.getAllLayerNodes();
      }
    }

    var filter = this.patternFn(text);
    var re = new RegExp(filter, "i");

    var matches = layers.map(function (ly, ix) {
      delete ly.tcScore;

      ly.tcPosition = ix;

      self.wrap.normalizeLayerNode(ly);

      //Silme
      var nameIx = -1;
      if (ly.Name) {
        var idx = ly.Name.indexOf(':');
        if (idx != -1) {
          var name = ly.Name.substring(idx + 1);
          name = name.trim();
        }
        else
          var name = ly.Name.trim();

        var res3 = re.exec(name);
        nameIx = res3 ? res3.index : -1;
        if (nameIx >= 0) nameIx = 0;
      }//End Silme
      //Silme
      var keywordIx = -1;
      if (ly.KeywordList && ly.KeywordList.Keyword) {
        var keywords = [];
        keyword:
          for (var i = 0; i < ly.KeywordList.Keyword.length; i++) {
            keywords[i] = ly.KeywordList.Keyword[i].trim();
            var res3 = re.exec(keywords[i]);
            keywordIx = res3 ? res3.index : -1;
            if (keywordIx >= 0) {
              keywordIx = 0;
              break keyword;
            }
          }
      }//End Silme

      var title = ly.Title.trim();
      var res = re.exec(title);
      var titleIx = res ? res.index : -1;
      var abstractIx = -1;
      if (ly.Abstract) {
        var abs = ly.Abstract.trim();
        //var res2 = re.exec(abs);
        var res2 = re.exec(abs.substring(0, 1000));//SILME
        abstractIx = res2 ? res2.index : -1;
      }

      /*silme*/
      if (nameIx == 0)
        ly.tcScore = 25;
      else if (keywordIx == 0)
        ly.tcScore = 22;
      else /*end silme*/if (res && title == res[0])
        ly.tcScore = 20;
      else if (titleIx == 0)
        ly.tcScore = 15;
      else if (titleIx > -1)
        ly.tcScore = 10;
      else if (abstractIx == 0)
        ly.tcScore = 5;
      else if (abstractIx > -1)
        ly.tcScore = 1;

      if (ly.tcScore)
        return ly;
      else
        return null;
    })
      .filter(function (elto) {
        return elto != null;
      })
      .sort(function (a, b) {
        if (b.tcScore === a.tcScore) {
          //si la puntuación es la misma reordenamos por título
          var titleA = TC.Util.replaceSpecialCharacters(a.Title);
          var titleB = TC.Util.replaceSpecialCharacters(b.Title);
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        }
        else
          return b.tcScore - a.tcScore;
      });

    this.lastPattern = text;
    this.lastMatches = matches;

    return matches;
  }
  else {
    return [];
  }
};

TC.wrap.layer.Raster.prototype.getInfo = function (name) {
  var self = this;
  var result = {};
  var capabilities = self.parent.capabilities;
  var url = self.parent.url;//silme
  if (capabilities) {
    if (capabilities.Capability) { // WMS
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

          var _process = function (value) {
            var legend = this.getLegend(value);

            if (legend.src)
              result.legend.push({
                src: legend.src, title: value.Title
              });
          };

          var _traverse = function (o, func) {
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
                format: md.Format, type: md.type, url: md.OnlineResource
              });
            }
          }
          //Silme
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
          //End silme
          result.queryable = l.queryable;
          break;
        }
      }
    }
    else if (capabilities.Contents) { // WMTS
      const layerName = self.parent.names[0];
      for (var i = 0, ii = capabilities.Contents.Layer.length; i < ii; i++) {
        const layer = capabilities.Contents.Layer[i];
        if (layer.Identifier === layerName) {
          result.abstract = layer.Abstract;
          let metadata = layer.Metadata;
          if (metadata) {
            if (!Array.isArray(metadata)) {
              metadata = [metadata];
            }
            result.metadata = [];
            for (var j = 0, jj = metadata.length; j < jj; j++) {
              const md = metadata[j];
              result.metadata.push({
                format: md.format,
                url: md.href
              });
            }
          }
          break;
        }
      }
    }
  }

  return result;
};

//Second base map - basemapSelectorSilme
var basemapSelectorSilme = true;
if (basemapSelectorSilme) {
  /*
   *  insertLayer: inserts OpenLayers layer at index
   *  Parameters: OpenLayers.Layer, number
   */
  TC.wrap.Map.prototype.insertLayer = function (olLayer, idx) {
    var self = this;
    var layers = self.map.getLayers();
    var alreadyExists = false;
    for (var i = 0; i < layers.getLength(); i++) {
      if (layers.item(i) === olLayer) {
        alreadyExists = true;
        break;
      }
    }

    //Silme: secondBaseLayer
    //Incrementen idx en 1 per a tenir en compte la segona capa de fons;
    if (secondBaseLayer == true) {
      try {
        //if (olLayer.type != "TILE") {
        //if (!olLayer._wrap.parent.isRaster()) {
        if (olLayer._wrap.parent.type != "WMTS") {
          idx = idx + 1;
        }
      } catch (err) {
      }
    }

    const wrap = olLayer._wrap;
    if (!wrap.parent.isBase && wrap.parent.type === TC.Consts.layerType.WMS) {
      const layerExtent = wrap.parent.getExtent();
      if (layerExtent) {
        olLayer.setExtent(bufferExtent(layerExtent, self.getResolution(), 100)); // 100 pixels de buffer
      }
    }

    if (alreadyExists) {
      layers.remove(olLayer);
      layers.insertAt(idx, olLayer);
    } else {
      if (idx < 0) {
        layers.push(olLayer);
      } else {
        layers.insertAt(idx, olLayer);
      }
      // Solo se limitan las resoluciones cuando estamos en un CRS por defecto, donde no se repixelan teselas
      var view = self.map.getView();
      if (self.parent.crs === self.parent.options.crs) {
        if (olLayer instanceof ol.layer.Tile) {
          var resolutions = olLayer.getSource().getResolutions();
          view.maxResolution_ = resolutions[0];
          view.minResolution_ = resolutions[resolutions.length - 1];
        }
      } else {
        // Cambiamos los límites de resolución de la capa a los de la vista. Esto lo hacemos porque su resolución está en otro CRS.
        if (olLayer instanceof ol.layer.Tile) {
          olLayer.setMaxResolution(view.getMaxResolution());
          olLayer.setMinResolution(view.getMinResolution());
        }
      }

      var loadingTileCount = 0;

      var beforeTileLoadHandler = function (_e) {
        wrap.parent.state = TC.Layer.state.LOADING;
        if (loadingTileCount <= 0) {
          loadingTileCount = 0;
          self.parent.trigger(TC.Consts.event.BEFORELAYERUPDATE, {layer: wrap.parent});
        }
        olLayer._loadingTileCount = olLayer._loadingTileCount + 1;
      };
      if (wrap.parent.state === TC.Layer.state.LOADING && wrap.parent.isRaster()) {
        beforeTileLoadHandler();
      }
      wrap.$events.on(TC.Consts.event.BEFORETILELOAD, beforeTileLoadHandler);

      wrap.$events.on(TC.Consts.event.TILELOAD + ' ' + TC.Consts.event.TILELOADERROR, function (_e) {
        loadingTileCount = loadingTileCount - 1;
        if (loadingTileCount <= 0) {
          loadingTileCount = 0;
          wrap.parent.state = TC.Layer.state.IDLE;
          self.parent.trigger(TC.Consts.event.LAYERUPDATE, {layer: wrap.parent});
        }
      });
    }
  };

  const bufferExtent = function (extent, resolution, width) {
    const extentBuffer = width * (resolution || 1);
    return extent.map((v, i) => i < 2 ? v - extentBuffer : v + extentBuffer);
  };

  TC.wrap.Map.prototype.setBaseLayer = function (olLayer) {
    var self = this;
    return new Promise(function (resolve, _reject) {
      var setLayer = function (curBl) {
        // GLS: si se llega después de una animación el valor de self.parent.getBaseLayer() ya es el definitivo y no el actual lo que provoca efectos indeseados.
        // ir a línea 1313: paso como parámetro el baseLayer actual en el caso de animación.
        curBl = curBl || self.parent.getBaseLayer();
        if (curBl) {
          //self.map.removeLayer(curBl.wrap.layer); //Silme: secondBaseLayer
          if (olLayer instanceof ol.layer.Image) { // Si es imagen no teselada
            olLayer._wrap.setProjection({
              crs: self.parent.crs
            });
          }

          if (olLayer._wrap.parent.type === TC.Consts.layerType.WMTS) {
            var layerProjectionOptions = {crs: self.parent.crs, oldCrs: olLayer.getSource().getProjection().getCode()};

            if (layerProjectionOptions.oldCrs !== layerProjectionOptions.crs) {
              olLayer._wrap.parent.setProjection(layerProjectionOptions);
            }
          }

          //if (olLayer instanceof ol.layer.Tile) { // Si es imagen teselada
          //    const view = self.map.getView();
          //    const resolutions = olLayer.getSource().getResolutions();
          //    if (resolutions) {
          //        view.options_.resolutions = resolutions;
          //        view.applyOptions_(view.options_);
          //    }
          //}
        }

        //Silme: secondBaseLayer
        if (secondBaseLayer) {
          if (activeBaseLayer == 0) {
            try {
              self.removeLayer(self.map.getLayers().array_[0]);
            } catch (err) {
              console.log(err);
            }
            try {
              self.insertLayer(olLayer, 0);
            } catch (Err) {
            }

            if (silmeMap.map.getLayers().array_[0]._wrap.parent.isRaster() && silmeMap.map.getLayers().array_[1]._wrap.parent.isRaster()) {
              setSpan1();
            }
          } else {
            try {
              self.removeLayer(self.map.getLayers().array_[1]);
            } catch (err) {
              console.log(err);
            }
            try {
              self.insertLayer(olLayer, 1);
            } catch (Err) {
            }
            setSpan2();
          }
        } else {
          self.insertLayer(olLayer, 0);
        }

        self.map.getControls().forEach(function (ctl) {
          if (ctl instanceof ol.control.ZoomSlider) {
            ctl.initSlider_();
          }
        });
        resolve();
      };

      // Toda esta lógica antes de llamar a setLayer() es para hacer un zoom a la nueva resolución
      // cuando la nueva capa no llega a la resolución actual
      var viewOptions = getResolutionOptions(self, olLayer._wrap.parent);
      var view = self.map.getView();
      var currentResolution = view.getResolution();
      if (!viewOptions.resolutions && (viewOptions.minResolution || viewOptions.maxResolution)) {
        const resolutions = view.getResolutions();
        if (resolutions) {
          const newResolutions = resolutions
            .filter(r => {
              if (viewOptions.minResolution && r < viewOptions.minResolution) {
                return false;
              }
              if (viewOptions.maxResolution && r > viewOptions.maxResolution) {
                return false;
              }
              return true;
            });
          if (newResolutions.length < resolutions.length) {
            viewOptions.resolutions = newResolutions;
          }
        }
      }
      if (viewOptions.resolutions) {
        const newView = new ol.View(viewOptions);
        // buscamos la nueva resolución según las nuevas restricciones de la capa
        var newRes = constrainResolution(currentResolution, viewOptions.resolutions, self.parent.options.maxResolutionError);
        if (newRes !== currentResolution && self.parent.isLoaded) {
          view.animate({resolution: newRes, duration: TC.Consts.ZOOM_ANIMATION_DURATION}, function () {
            self.map.setView(newView);
            setLayer(self.parent.getBaseLayer());
          });
        } else {
          self.map.setView(newView);
          newView.setResolution(newRes);
          setLayer();
        }
      } else {
        setLayer();
      }
    });
  };

  TC.wrap.layer.Raster.prototype.getAttribution = function () {
    const self = this;
    const result = {};
    const capabilities = TC.capabilities[self.parent.url];

    try {//SILME
      if (capabilities) {
        if (capabilities.ServiceProvider) {
          result.name = capabilities.ServiceProvider.ProviderName.trim();
          result.site = capabilities.ServiceProvider.ProviderSite;
          if (result.site && result.site.href && result.site.href.trim().length > 0) {
            result.site = result.site.href;
          } else {
            delete result.site;
          }
        } else if (capabilities.ServiceIdentification) {
          result.name = capabilities.ServiceIdentification.Title.trim();
        } else {
          result.name = capabilities.Service.Title.trim();
        }
      }
    } catch (ex) {

    }//END SILME
    return result;
  };

  TC.wrap.layer.Raster.prototype.getCompatibleCRS = function () {
    var self = this;
    var result = [];
    var layer = self.parent;
    switch (self.getServiceType()) {
      case TC.Consts.layerType.WMS:
        if (layer.capabilities && layer.capabilities.Capability && layer.capabilities.Capability.Layer) {
          if (layer.names.length > 0) {
            const crsLists = layer.names
              .map(function (name) {
                return layer
                  .getNodePath(name) // array de nodos
                  .map(function (node) {
                    const itemCRS = node.CRS || node.SRS || [];
                    const crsList = Array.isArray(itemCRS) ? itemCRS : [itemCRS];
                    return Array.isArray(crsList) ? crsList : [crsList];
                  }) // array de arrays de crs
                  .reduce(function (prev, cur) {
                    if (prev.length === 0) {
                      return cur;
                    }
                    cur.forEach(function (elm) {
                      if (prev.indexOf(elm) < 0) {
                        prev[prev.length - 1] = elm;
                      }
                    });// array con todos los crs
                    return prev;
                  }, []);
              });

            if (crsLists.length === 1) {
              result = crsLists[0];
            } else {
              const otherCrsLists = crsLists.slice(1);
              result = crsLists[0].filter(function (elm) {
                return otherCrsLists.every(function (crsList) {
                  return crsList.indexOf(elm) >= 0;
                });
              });
            }
          }
        }
        break;
      case TC.Consts.layerType.WMTS:
        if (layer.capabilities && layer.capabilities.Contents) {
          layer.capabilities.Contents.Layer
            .filter(function (l) {
              return l.Identifier === layer.layerNames;
            })  // La capa de interés
            .forEach(function (l) {
              const tileMatrixSets = l.TileMatrixSetLink
                .map(function (tmsl) {
                  return tmsl.TileMatrixSet;
                });
              result = layer.capabilities.Contents.TileMatrixSet
                .filter(function (tms) {
                  return tileMatrixSets.indexOf(tms.Identifier) >= 0;
                }) // TileMatrixSets asociados a la capa de interés
                .map(function (tms) {
                  return tms.SupportedCRS;
                });
            });
        }
        break;
      default:
        break;
    }

    if (result.length == 0) result.push("EPSG:3857")//Silme

    return result;
  };

  /*
   * Obtiene el objeto de opciones de una vista que restringe los niveles de zoom activos sobre el mapa dependiendo de las opciones definidas sobre
   * el mapa base activo.
   */
  const getResolutionOptions = function (mapWrap, layer, options) {
    var view = mapWrap.map.getView();
    var prevRes = view.getResolution();
    // Si es móvil mantenemos un pixelRatio de 1. Solución a bug 32575.
    // En desktop se tiene en cuenta pixelRatio para que el mapa no salga con zoom
    // cuando el navegador lo tiene
    const pixelRatio = TC.Util.detectMobile() ? 1 : mapWrap.map.pixelRatio_;

    var pms = {
      projection: view.getProjection(),
      center: view.getCenter(),
      resolution: prevRes,
      enableRotation: false,
      constrainResolution: true,
      showFullExtent: true,
      smoothExtentConstraint: true
    };

    if (mapWrap.parent.maxExtent) {
      pms.extent = mapWrap.parent.maxExtent;
    }

    // GLS 06/03/2019 Corregimos bug 24832, si el mapa de fondo es el mapa en blanco, asignamos las resoluciones del mapa de fondo actual
    var layerForResolutions = layer;
    if (layer.type === TC.Consts.layerType.VECTOR && mapWrap.parent.getBaseLayer()) {
      layerForResolutions = mapWrap.parent.getBaseLayer();
    }

    var res = layerForResolutions.getResolutions ? layerForResolutions.getResolutions() : [];
    var maxRes;
    var minRes;

    if (res && res.length) {
      maxRes = layerForResolutions.maxResolution || options?.maxResolution || res[0];
      minRes = layerForResolutions.minResolution || options?.minResolution || res[res.length - 1];

      var minResIx = res.indexOf(minRes);
      var maxResIx = res.indexOf(maxRes);

      pms.resolutions = res.slice(maxResIx, minResIx + 1);

      if (pixelRatio !== 1) {
        pms.resolutions = pms.resolutions.map(r => r * pixelRatio);
      }
    } else {
      maxRes = layerForResolutions.maxResolution;
      minRes = layerForResolutions.minResolution;
    }
    if (minRes) {
      minRes = minRes * pixelRatio;
      pms.minResolution = minRes;
      if (prevRes < minRes) {
        pms.resolution = minRes;
      }
    }
    if (maxRes) {
      maxRes = maxRes * pixelRatio;
      pms.maxResolution = maxRes;
      if (prevRes > maxRes) {
        pms.resolution = maxRes;
      }
    }

    return pms;
  };

  const constrainResolution = function (resolution, resolutions, maxResolutionError) {
    if (!resolutions) {
      return resolution;
    }
    return resolutions
      .slice()
      .sort(function (a, b) {
        return a - b
      })
      .reduce(function (prev, elm) {
        if (prev === 0 &&
          (elm > resolution || Math.abs(1 - resolution / elm) < maxResolutionError)) {
          return elm;
        }
        return prev;
      }, 0);
  };

  const oldRenderLayerCat = TC.control.LayerCatalogSilmeFolders.prototype.render;
  TC.control.LayerCatalogSilmeFolders.prototype.render = function (callback) {
    const self = this;
    const result = oldRenderLayerCat.call(self, callback);

    //2 Capes de fons
    var secondBaseLayerControl = true;
    if (TC.Cfg.baseLayers.filter(x => x.id != null).length == 1) var secondBaseLayerControl = false;
    if (secondBaseLayerControl) {
      if (treeLayers.length > 0) {
        if (typeof secondBaseLayer != 'undefined') {
          if (secondBaseLayer == false) {
            addSecondBaseLayer();
            setSpan1();
            setSpan2();
            selectB1();
            document.querySelector('#rangeTransparency').addEventListener('input', function () {
              silmeMap.map.getLayers().array_[1].setOpacity(this.value / 100);
              silmeMap.map.render();
            });
          }
        }
      }
    }
  }
}
// END Second base map

const hasOwn = {}.hasOwnProperty;

TC.Util.isPlainObject = function (obj) {
  // Not plain objects:
  // - Any object or value whose internal [[Class]] property is not "[object Object]"
  // - DOM nodes
  // - window
  try {//Silme
    if (typeof obj !== 'object' || obj.nodeType || obj.window === obj) {
      return false;
    }

    if (obj.constructor &&
      !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
      return false;
    }

    // If the function hasn't returned already, we're confident that
    // |obj| is a plain object, created by {} or constructed with new Object
    return true;
  } catch (ex)//Silme
  {
    return false;
  }//Silme
};
