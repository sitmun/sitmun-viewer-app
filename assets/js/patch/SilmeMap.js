var silmeMap;
var silmeLayerCatalog;
var silmeSearch;
var pendingLayer;

function setExtent(extent) {
  silmeMap.map.getView().fit(extent, { maxZoom: 14 });
}

function silmeAddLayer(layerName) {
  //SILME
  //Busquem la capa en cas que no la trobi:
  var layer

  if (!layer) {
    for (var k = 0; k < treeLayers.length; k++) {
      var rama = treeLayers[k].tree;
      cercaNodePerNom(rama, layerName);
      if (ret) {
        layer = treeLayers[k];
        ret = false;
        break;
      }
    }
  }

  var leaf = cercaLayersPerLayerName(layer, layerName);
  layer.uid = leaf.uid;


  if (layer && layerName) {
    var redrawTime = 1;

    if (/iPad/i.test(navigator.userAgent))
      redrawTime = 10;
    else if (TC.Util.detectFirefox())
      redrawTime = 250;

    if (!layer.title) {
      layer.title = layer.getTree().title;
    }

    //$li.addClass(TC.Consts.classes.LOADING).find('span').attr(TOOLTIP_DATA_ATTR, '');

    var reDraw = function ($element) {
      var deferred = new $.Deferred();
      setTimeout(function () {
        $element[0].offsetHeight = $element[0].offsetHeight;
        $element[0].offsetWidth = $element[0].offsetWidth;

        deferred.resolve();
      }, redrawTime);
      return deferred.promise();
    };

    //reDraw($li).then(function () {
    var laCapaExisteix = false;
    for (var i = 0; i < silmeMap.map.getLayers().array_.length; i++)
    {
      if (silmeMap.map.getLayers().array_[i].values_.source.params_ != undefined)
      {
        if (silmeMap.map.getLayers().array_[i].values_.source.params_.LAYERS == layerName) {
          laCapaExisteix = true;
        }
      }
    }
    if (!laCapaExisteix)
      silmeLayerCatalog.addLayerToMap(layer, layerName);
    //});
    //}
  }
}
