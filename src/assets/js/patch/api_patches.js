const originalFnc = TC.UI.autocomplete;

// =============================================================================
// Funciones UI
// =============================================================================

TC.UI.autocomplete = function(method) {
  if (typeof method === 'object' && method.target.classList.contains('tc-ctl-wfsquery-list')) {
    method.minLength = 1;
  }
  originalFnc.call(this, method);
};

// =============================================================================
// Capas y Rasters
// =============================================================================

TC.layer.Raster.prototype.searchSubLayers = function(text) {
  if (!this.patternFn) {
    this.patternFn = function(t) {
      //SILME
      t = t.replace(/[^a-z\dáàéèíóòúüñ]/gi, '\\' + '$&');
      t = t.replace(/[aáà]/gi, '[aáà]');
      t = t.replace(/[eéè]/gi, '[eéè]');
      t = t.replace(/[ií]/gi, '[ií]');
      t = t.replace(/[oóò]/gi, '[oóò]');
      t = t.replace(/[uúü]/gi, '[uúü]');
      t = t.replace(/n/gi, '[nñ]');

      t = '.*?(' + t + ').*?';
      t = t.replace(/\\ /gi, ').*?(');
      //END SILME

      return t;
    };
  }
  if (text && text.length && text.length >= 3) {
    var self = this;
    var layers = null;
    /*URI:Si la cadena a buscar contiene a la búsqueda anterior, por ejemplo, antes he buscado "cat" y ahora busco "cata" porque esto escribiendo "catastro" ...
    en vez de buscar en todas las capas del servicio busco en los resultados encontrados en la búsqueda anterior */
    if (this.lastPattern && text.indexOf(this.lastPattern) >= 0) {
      layers = this.lastMatches;
    } else {
      /*si se ha definido el parámetro layers de esta capa en configuraci\u00f3n filtro las capas del capability para que busque solo en las capas que est\u00e9n en
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
      } else {
        layers = self.wrap.getAllLayerNodes();
      }
    }

    var filter = this.patternFn(text);
    var re = new RegExp(filter, 'i');

    var matches = layers.map(function(ly, ix) {
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
        } else
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
      .filter(function(elto) {
        return elto != null;
      })
      .sort(function(a, b) {
        if (b.tcScore === a.tcScore) {
          //si la puntuación es la misma reordenamos por título
          var titleA = TC.Util.replaceSpecialCharacters(a.Title);
          var titleB = TC.Util.replaceSpecialCharacters(b.Title);
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
          return 0;
        } else
          return b.tcScore - a.tcScore;
      });

    this.lastPattern = text;
    this.lastMatches = matches;

    return matches;
  } else {
    return [];
  }
};


TC.wrap.layer.Raster.prototype.getInfo = function(name) {
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
            if (l.Name.includes(':'))
              result['name'] = l.Name.substr(l.Name.indexOf(':') + 1);
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
                src: legend.src, title: value.Title
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
                format: md.Format, type: md.type, url: md.OnlineResource
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
    } else if (capabilities.Contents) { // WMTS
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

// =============================================================================
// Control de Dibujo y Medición
// =============================================================================

/**
 * Desde la versión 4.0, ya no podemos acceder al _textBtn porque ahora es un
 * atributo privado, por lo que se implementa este método para hacer un 'by-pass'.
 * @param active Valor booleano que indica si el botón de añadir texto sobre una
 *               feature debería estar activo o no.
 */
TC.control.Modify.prototype.setLabelableState = function(active) {
  const self = this;
  const textBtn = self.querySelector('.' + self.CLASS + '-btn-text');
  textBtn.disabled = !active;
};

// =============================================================================
// Utils
// =============================================================================

TC.Util.mergeCanvases = function(canvases) {
  const rects = canvases.map(c => c.getBoundingClientRect());
  const bbox = rects.reduce(function(prev, rect) {

    return [
      Math.min(prev[0], rect.left),
      Math.min(prev[1], rect.top),
      Math.max(prev[2], rect.right),
      Math.max(prev[3], rect.bottom)
    ];

  }, [
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY
  ]);

  const left = bbox[0];
  const top = bbox[1];

  //create a new canvas
  const newCanvas = document.createElement('canvas');
  const context = newCanvas.getContext('2d');


  // Set dimensions
  newCanvas.width = bbox[2] - left;
  newCanvas.height = bbox[3] - top;

  //apply the old canvases to the new one
  canvases.forEach(function(canvas, idx) {
    const rect = rects[idx];
    const opacity = parseFloat(getComputedStyle(canvas.parentElement).opacity);
    const translucent = opacity < 1;
    if (translucent) {
      context.globalAlpha = opacity;
    }

    context.drawImage(canvas, rect.left - left, rect.top - top, rect.right - rect.left, rect.bottom - rect.top);

    if (translucent) {
      context.globalAlpha = 1;
    }
  });

  // Return the new canvas
  return newCanvas;
};


TC.Util.isPlainObject = function(obj) {
  // Not plain objects:
  // - Any object or value whose internal [[Class]] property is not "[object Object]"
  // - DOM nodes
  // - window
  try {//Silme
    if (typeof obj !== 'object' || obj.nodeType || obj.window === obj) {
      return false;
    }

    const hasOwn = {}.hasOwnProperty;

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
